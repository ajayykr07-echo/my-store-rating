import storeModel from "../models/storeModel.js";
import ratingModel from "../models/ratingModel.js";

class OwnerController {
  // STORE OWNER DASHBOARD
  async getDashboard(req, res) {
    try {
      const store = await storeModel.findByOwnerId(req.user.id);

      if (!store) {
        return res.status(404).json({
          message: "No store assigned to this owner",
        });
      }

      const [ratings, averageRating] = await Promise.all([
        ratingModel.getRatingsByStoreId(store.id),
        ratingModel.getAverageRatingByStoreId(store.id),
      ]);

      return res.json({
        store,
        average_rating: averageRating,
        users: ratings,
      });
    } catch (error) {
      console.error("OWNER DASHBOARD ERROR:", error);
      return res.status(500).json({
        message: "Server error",
      });
    }
  }

  // STORE OWNER ADD STORE
  async addStore(req, res) {
    try {
      const { name, email, address } = req.body;

      if (!name || !email || !address) {
        return res.status(400).json({
          message: "Name, email and address are required",
        });
      }

      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      const trimmedAddress = address.trim();

      if (trimmedName.length < 1 || trimmedName.length > 50) {
        return res.status(400).json({
          message: "Name must be between 1 and 50 characters",
        });
      }

      if (trimmedAddress.length > 400) {
        return res.status(400).json({
          message: "Address cannot exceed 400 characters",
        });
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(trimmedEmail)) {
        return res.status(400).json({
          message: "Invalid email format",
        });
      }

      const newStore = await storeModel.createStore({
        name: trimmedName,
        email: trimmedEmail,
        address: trimmedAddress,
        owner_id: req.user.id,
      });

      return res.status(201).json({
        message: "Store added successfully",
        store: newStore,
      });
    } catch (error) {
      console.error("OWNER ADD STORE ERROR:", error);
      if (error.code === "23505") {
        return res.status(400).json({
          message: "A store with this email already exists",
        });
      }
      return res.status(500).json({
        message: "Server error",
      });
    }
  }
}

export default new OwnerController();
