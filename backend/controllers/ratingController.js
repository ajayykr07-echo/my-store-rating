import storeModel from "../models/storeModel.js";
import ratingModel from "../models/ratingModel.js";

class RatingController {
  // SUBMIT RATING
  async submitRating(req, res) {
    try {
      const { store_id, rating } = req.body;

      if (!store_id || !rating) {
        return res.status(400).json({
          message: "Store ID and rating are required",
        });
      }

      const store = await storeModel.findById(store_id);
      if (!store) {
        return res.status(404).json({
          message: "Store not found",
        });
      }

      const numRating = Number(rating);
      if (numRating < 1 || numRating > 5 || !Number.isInteger(numRating)) {
        return res.status(400).json({
          message: "Rating must be an integer between 1 and 5",
        });
      }

      const existingRating = await ratingModel.findByUserAndStore(
        req.user.id,
        store_id
      );

      if (existingRating) {
        return res.status(400).json({
          message: "Rating already submitted. Use update instead.",
        });
      }

      const newRating = await ratingModel.createRating(
        req.user.id,
        store_id,
        numRating
      );

      return res.status(201).json({
        message: "Rating submitted successfully",
        rating: newRating,
      });
    } catch (error) {
      console.error("SUBMIT RATING ERROR:", error);
      return res.status(500).json({
        message: "Server error",
      });
    }
  }

  // MODIFY RATING
  async updateRating(req, res) {
    try {
      const { rating } = req.body;
      const { storeId } = req.params;

      if (!rating) {
        return res.status(400).json({
          message: "Rating is required",
        });
      }

      const numRating = Number(rating);
      if (numRating < 1 || numRating > 5 || !Number.isInteger(numRating)) {
        return res.status(400).json({
          message: "Rating must be an integer between 1 and 5",
        });
      }

      const updated = await ratingModel.updateRating(
        req.user.id,
        storeId,
        numRating
      );

      if (!updated) {
        return res.status(404).json({
          message: "Rating not found",
        });
      }

      return res.json({
        message: "Rating updated successfully",
        rating: updated,
      });
    } catch (error) {
      console.error("UPDATE RATING ERROR:", error);
      return res.status(500).json({
        message: "Server error",
      });
    }
  }

  // LIST STORES FOR NORMAL USER
  async getStoresForUser(req, res) {
    try {
      const stores = await storeModel.getStoresForNormalUser(
        req.user.id,
        req.query
      );
      return res.json({ stores });
    } catch (error) {
      console.error("LIST USER STORES ERROR:", error);
      return res.status(500).json({
        message: "Server error",
      });
    }
  }
}

export default new RatingController();
