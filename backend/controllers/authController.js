import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../env.js";
import userModel from "../models/userModel.js";

class AuthController {
  // NORMAL USER SIGNUP
  async signup(req, res) {
    try {
      const { name, email, address, password } = req.body;

      if (!name || !email || !address || !password) {
        return res.status(400).json({
          message: "All fields are required",
        });
      }

      if (name.length < 20 || name.length > 60) {
        return res.status(400).json({
          message: "Name must be between 20 and 60 characters",
        });
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        return res.status(400).json({
          message: "Invalid email format",
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
        role: "user",
      });

      return res.status(201).json({
        message: "User registered successfully",
        user: newUser,
      });
    } catch (error) {
      console.error("SIGNUP ERROR:", error);
      return res.status(500).json({
        message: "Server error",
      });
    }
  }

  // LOGIN (ALL ROLES)
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required",
        });
      }

      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
        },
        env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      return res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          address: user.address,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      return res.status(500).json({
        message: "Login failed",
        error: error.message,
      });
    }
  }

  // UPDATE PASSWORD
  async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          message: "Current password and new password are required",
        });
      }

      if (newPassword.length < 8 || newPassword.length > 16) {
        return res.status(400).json({
          message: "Password must be between 8 and 16 characters",
        });
      }

      if (!/[A-Z]/.test(newPassword)) {
        return res.status(400).json({
          message: "Password must contain at least one uppercase letter",
        });
      }

      if (!/[^A-Za-z0-9]/.test(newPassword)) {
        return res.status(400).json({
          message: "Password must contain at least one special character",
        });
      }

      const userRecord = await userModel.findPasswordById(req.user.id);
      if (!userRecord) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const validPassword = await bcrypt.compare(
        currentPassword,
        userRecord.password
      );

      if (!validPassword) {
        return res.status(400).json({
          message: "Current password is incorrect",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await userModel.updatePassword(req.user.id, hashedPassword);

      return res.json({
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error("UPDATE PASSWORD ERROR:", error);
      return res.status(500).json({
        message: "Server error",
      });
    }
  }
}

export default new AuthController();
