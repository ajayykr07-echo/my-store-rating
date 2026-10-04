import pool from "../db.js";

class UserModel {
  async findByEmail(email) {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0] || null;
  }

  async findById(id) {
    const result = await pool.query(
      "SELECT id, name, email, address, role, created_at FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  }

  async findPasswordById(id) {
    const result = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  }

  async findOwnerById(id) {
    const result = await pool.query(
      "SELECT id FROM users WHERE id = $1 AND role = 'owner'",
      [id]
    );
    return result.rows[0] || null;
  }

  async createUser({ name, email, password, address, role = "user" }) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role, created_at`,
      [name, email, password, address, role]
    );
    return result.rows[0];
  }

  async updatePassword(id, hashedPassword) {
    const result = await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2 RETURNING id",
      [hashedPassword, id]
    );
    return result.rows[0];
  }

  async getUsersWithFilters({ name, email, address, role } = {}) {
    let query = `
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
      WHERE 1 = 1
    `;

    const values = [];

    if (name) {
      values.push(`%${name}%`);
      query += ` AND u.name ILIKE $${values.length}`;
    }

    if (email) {
      values.push(`%${email}%`);
      query += ` AND u.email ILIKE $${values.length}`;
    }

    if (address) {
      values.push(`%${address}%`);
      query += ` AND u.address ILIKE $${values.length}`;
    }

    if (role) {
      values.push(role);
      query += ` AND u.role = $${values.length}`;
    }

    query += `
      GROUP BY u.id
      ORDER BY u.name ASC
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  async countUsers() {
    const result = await pool.query("SELECT COUNT(*) AS total_users FROM users");
    return Number(result.rows[0].total_users);
  }
}

export default new UserModel();
