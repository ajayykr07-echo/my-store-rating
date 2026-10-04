import pool from "../db.js";

class RatingModel {
  async findByUserAndStore(userId, storeId) {
    const result = await pool.query(
      `SELECT id, user_id, store_id, rating, created_at, updated_at
       FROM ratings
       WHERE user_id = $1 AND store_id = $2`,
      [userId, storeId]
    );
    return result.rows[0] || null;
  }

  async createRating(userId, storeId, rating) {
    const result = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, storeId, rating]
    );
    return result.rows[0];
  }

  async updateRating(userId, storeId, rating) {
    const result = await pool.query(
      `UPDATE ratings
       SET rating = $1, updated_at = NOW()
       WHERE user_id = $2 AND store_id = $3
       RETURNING *`,
      [rating, userId, storeId]
    );
    return result.rows[0] || null;
  }

  async getRatingsByStoreId(storeId) {
    const result = await pool.query(
      `SELECT
        u.name AS user_name,
        u.email AS user_email,
        r.rating,
        r.created_at
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [storeId]
    );
    return result.rows;
  }

  async getAverageRatingByStoreId(storeId) {
    const result = await pool.query(
      `SELECT COALESCE(ROUND(AVG(rating), 2), 0) AS average_rating
       FROM ratings
       WHERE store_id = $1`,
      [storeId]
    );
    return result.rows[0]?.average_rating || 0;
  }

  async countRatings() {
    const result = await pool.query("SELECT COUNT(*) AS total_ratings FROM ratings");
    return Number(result.rows[0].total_ratings);
  }
}

export default new RatingModel();
