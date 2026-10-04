import express from "express";
import cors from "cors";
import env from "./env.js";
import pool from "./db.js";
import authRoutes from "./routes/auth.js";
import authMiddleware from "./middleware/authMiddleware.js";
import roleMiddleware from "./middleware/roleMiddleware.js";
import ratingRoutes from "./routes/ratings.js";
import adminRoutes from "./routes/admin.js";
import ownerRoutes from "./routes/owner.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/owner", ownerRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Store Rating Platform API is running",
  });
});

app.get("/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    console.log("DB connection check: connected");

    res.json({
      message: "Database connected successfully",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.log("DB connection check: failed");
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

app.get(
  "/api/admin-test",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    res.json({
      message: "Admin access granted",
      user: req.user,
    });
  }
);

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});