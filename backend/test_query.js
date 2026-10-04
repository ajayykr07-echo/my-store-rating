
import pool from './db.js';
(async () => {
  const query = \
      SELECT
        u.id,
        u.name,
        u.email,
        u.address,
        u.role,
        u.created_at,
        STRING_AGG(DISTINCT s.name, ', ') AS store_name,
        COALESCE(ROUND(AVG(r.rating), 2), 0) AS owner_rating
      FROM users u
      LEFT JOIN stores s ON u.id = s.owner_id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE u.role = 'owner'
      GROUP BY u.id
  \;
  const res = await pool.query(query);
  console.log(res.rows);
  process.exit(0);
})();

