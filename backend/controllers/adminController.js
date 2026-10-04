import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import storeModel from "../models/storeModel.js";
import ratingModel from "../models/ratingModel.js";

class AdminController {
  async deleteStore(req, res) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: "Store ID required" });
      const deleted = await storeModel.deleteStore(id);
      if (!deleted) return res.status(404).json({ message: "Store not found" });
      return res.json({ message: "Store deleted successfully" });
    } catch (error) {
      console.error("DELETE STORE ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  // ADMIN DASHBOARD STATS
  async getDashboard(req, res) {
    try {
      const [totalUsers, totalStores, totalRatings] = await Promise.all([
        userModel.countUsers(),
        storeModel.countStores(),
        ratingModel.countRatings(),
      ]);

      return res.json({
        total_users: totalUsers,
        total_stores: totalStores,
        total_ratings: totalRatings,
      });
    } catch (error) {
      console.error("ADMIN DASHBOARD ERROR:", error);
      return res.status(500).json({
        message: "Server error",
      });
    }
  }

  // ADD STORE
  async addStore(req, res) {
    try {
      const { name, email, address, owner_id } = req.body;

      if (!name || !email || !address) {
        return res.status(400).json({
          message: "Name, email and address are required",
        });
      }

      if (name.length < 1 || name.length > 50) {
        return res.status(400).json({
          message: "Name must be between 1 and 50 characters",
        });
      }

      if (address.length > 400) {
        return res.status(400).json({
          message: "Address cannot exceed 400 characters",
        });
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        return res.status(400).json({
          message: "Invalid email format",
        });
      }

      if (owner_id) {
        const owner = await userModel.findOwnerById(owner_id);
        if (!owner) {
          return res.status(400).json({
            message: "Invalid store owner",
          });
        }
      }

      const newStore = await storeModel.createStore({
        name,
        email,
        address,
        owner_id: owner_id || null,
      });

      return res.status(201).json({
        message: "Store added successfully",
        store: newStore,
      });
    } catch (error) {
      console.error("ADD STORE ERROR:", error);
      return res.status(500).json({
        message: "Server error",
      });
    }
  }

  // LIST STORES WITH FILTERS
  async getStores(req, res) {
    try {
      const stores = await storeModel.getStoresWithRatings(req.query);
      return res.json({ stores });
    } catch (error) {
      console.error("LIST STORES ERROR:", error);
      return res.status(500).json({
        message: "Server error",
      });
    }
  }

  // ADD USER (ADMIN, OWNER, USER)
  async addUser(req, res) {
    try {
      const { name, email, password, address, role } = req.body;

      if (!name || !email || !password || !address || !role) {
        return res.status(400).json({
          message: "Name, email, password, address and role are required",
        });
      }

      if (name.length < 20 || name.length > 60) {
        return res.status(400).json({
          message: "Name must be between 20 and 60 characters",
        });
      }

      if (address.length > 400) {
        return res.status(400).json({
          message: "Address cannot exceed 400 characters",
        });
      }

      if (password.length < 8 || password.length > 16) {
        return res.status(400).json({
          message: "Password must be between 8 and 16 characters",
        });
      }

      if (!/[A-Z]/.test(password)) {
        return res.status(400).json({
          message: "Password must contain at least one uppercase letter",
        });
      }

      if (!/[^A-Za-z0-9]/.test(password)) {
        return res.status(400).json({
          message: "Password must contain at least one special character",
        });
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        return res.status(400).json({
          message: "Invalid email format",
        });
      }

      if (!["admin", "user", "owner"].includes(role)) {
        return res.status(400).json({
          message: "Invalid role",
        });
      }

      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          message: "Email already registered",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await userModel.createUser({
        name,
        email,
        password: hashedPassword,
        address,
        role,
      });

      return res.status(201).json({
        message: "User added successfully",
        user: newUser,
      });
    } catch (error) {
      console.error("ADD USER ERROR:", error);
      return res.status(500).json({
        message: "Server error",
      });
    }
  }

  // LIST USERS WITH FILTERS AND OWNER RATING
  async getUsers(req, res) {
    try {
      const users = await userModel.getUsersWithFilters(req.query);
      return res.json({ users });
    } catch (error) {
      console.error("LIST USERS ERROR:", error);
      return res.status(500).json({
        message: "Server error",
      });
    }
  }
}

export default new AdminController();
