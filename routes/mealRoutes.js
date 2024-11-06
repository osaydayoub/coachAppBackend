import express from "express";
import { addMealRating, createMeal, deleteMeal, getAllMealsByType, updateMeal } from "../controllers/mealController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.use(protect);
router.get("/:type", getAllMealsByType);
router.post("/", createMeal);
router.put("/:id", updateMeal);
router.delete("/:id", deleteMeal);
router.post("/mealsRating/:id", addMealRating);


export default router;
