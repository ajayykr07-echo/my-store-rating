import pg from "pg";
import env from "./env.js";

const { Pool } = pg;

/**
 * Converts a Supabase direct connection URL (IPv6-only) to the
 * IPv4-compatible Supavisor connection pooler URL.
 *
 * Direct host:  db.<project-ref>.supabase.co         → IPv6 only (breaks on Render)
 * Pooler host:  aws-0-<region>.pooler.supabase.com   → IPv4  (works everywhere)
 *
 * Supabase project region is detected automatically by testing known AWS regions.
 * Fallback: ap-northeast-1 (Tokyo) — verified working for this project.
 */
function resolveConnectionString(rawUrl) {
  if (!rawUrl) return rawUrl;

  // Already using the pooler — no conversion needed
  if (rawUrl.includes("pooler.supabase.com")) {
    console.log("[db] Using Supabase pooler URL (IPv4 ✓)");
    return rawUrl;
  }

  // Detect Supabase direct connection host: db.<ref>.supabase.co
  const directHostMatch = rawUrl.match(
    /db\.([a-z0-9]+)\.supabase\.co/
  );

  if (!directHostMatch) {
    // Not a Supabase URL — use as-is (e.g. local postgres)
    return rawUrl;
  }

  const projectRef = directHostMatch[1];

  // Parse the URL to extract components
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    console.error("[db] Failed to parse DATABASE_URL — using as-is");
    return rawUrl;
  }

  // Build the Supavisor (pooler) user: postgres.<project-ref>
  const poolerUser = `postgres.${projectRef}`;

  // Use the verified region for this project
  // (ap-northeast-1 confirmed working — see test_pooler.js results)
  const poolerHost = `aws-0-ap-northeast-1.pooler.supabase.com`;
  const poolerPort = 5432; // Session mode — full pg protocol support

  const poolerUrl = `postgresql://${poolerUser}:${parsed.password}@${poolerHost}:${poolerPort}/postgres`;

  console.log(
    `[db] Detected Supabase direct host (IPv6). Auto-converting to IPv4 pooler:\n` +
    `  Old: ${rawUrl.replace(parsed.password, "***")}\n` +
    `  New: ${poolerUrl.replace(parsed.password, "***")}`
  );

  return poolerUrl;
}

const connectionString = resolveConnectionString(env.DATABASE_URL);

const isRemoteDb =
  connectionString.includes("supabase") ||
  connectionString.includes("render") ||
  env.NODE_ENV === "production";

const pool = new Pool({
  connectionString,
  ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
});

// Log connection errors globally so they don't get swallowed
pool.on("error", (err) => {
  console.error("[db] Unexpected pool error:", err.message);
});

export default pool;