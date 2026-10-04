import pool from "../db.js";

class StoreModel {
  async deleteStore(storeId) {
    await pool.query("DELETE FROM ratings WHERE store_id = $1", [storeId]);
    const result = await pool.query("DELETE FROM stores WHERE id = $1 RETURNING id", [storeId]);
    return result.rowCount > 0;
  }

  async findById(id) {
    const result = await pool.query(
      "SELECT id, name, email, address, owner_id, created_at FROM stores WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  }

  async findByOwnerId(ownerId) {
    const result = await pool.query(
      `SELECT id, name, email, address, owner_id, created_at
       FROM stores
       WHERE owner_id = $1
       ORDER BY id DESC`,
      [ownerId]
    );
    return result.rows[0] || null;
  }

  async findAllByOwnerId(ownerId) {
    const result = await pool.query(
      `SELECT id, name, email, address, owner_id, created_at
       FROM stores
       WHERE owner_id = $1
       ORDER BY id DESC`,
      [ownerId]
    );
    return result.rows;
  }

  async findByIdAndOwnerId(id, ownerId) {
    const result = await pool.query(
      `SELECT id, name, email, address, owner_id, created_at
       FROM stores
       WHERE id = $1 AND owner_id = $2`,
      [id, ownerId]
    );
    return result.rows[0] || null;
  }

  async findByEmail(email) {
    const result = await pool.query(
      `SELECT id, name, email, address, owner_id, created_at
       FROM stores
       WHERE LOWER(email) = LOWER($1)`,
      [email]
    );
    return result.rows[0] || null;
  }

  async createStore({ name, email, address, owner_id = null }) {
    const result = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, address, owner_id]
    );
    return result.rows[0];
  }

  async getStoresWithRatings({ name, email, address } = {}) {
    let query = `
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        COALESCE(ROUND(AVG(r.rating), 2), 0) AS rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1 = 1
    `;

    const values = [];

    if (name) {
      values.push(`%${name}%`);
      query += ` AND s.name ILIKE $${values.length}`;
    }

    if (email) {
      values.push(`%${email}%`);
      query += ` AND s.email ILIKE $${values.length}`;
    }

    if (address) {
      values.push(`%${address}%`);
      query += ` AND s.address ILIKE $${values.length}`;
    }

    query += `
      GROUP BY s.id
      ORDER BY s.name ASC
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  async getStoresForNormalUser(userId, { name, address } = {}) {
    let query = `
      SELECT
        s.id,
        s.name,
        s.address,
        COALESCE(ROUND(AVG(all_ratings.rating), 2), 0) AS overall_rating,
        user_rating.rating AS user_rating
      FROM stores s
      LEFT JOIN ratings all_ratings
        ON s.id = all_ratings.store_id
      LEFT JOIN ratings user_rating
        ON s.id = user_rating.store_id
        AND user_rating.user_id = $1
      WHERE 1 = 1
    `;

    const values = [userId];

    if (name) {
      values.push(`%${name}%`);
      query += ` AND s.name ILIKE $${values.length}`;
    }

    if (address) {
      values.push(`%${address}%`);
      query += ` AND s.address ILIKE $${values.length}`;
    }

    query += `
      GROUP BY s.id, user_rating.rating
      ORDER BY s.name ASC
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  async countStores() {
    const result = await pool.query("SELECT COUNT(*) AS total_stores FROM stores");
    return Number(result.rows[0].total_stores);
  }
}

export default new StoreModel();
