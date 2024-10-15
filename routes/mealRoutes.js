import express from "express";
import { addMealRating, createMeal, getAllMealsByType } from "../controllers/mealController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.use(protect);
router.get("/:type", getAllMealsByType);
router.post("/", createMeal);
router.post("/mealsRating/:id", addMealRating);

export default router;
