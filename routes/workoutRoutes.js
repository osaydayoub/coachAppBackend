import express from "express";
import {
  addWorkout,
  deleteWorkoutById,
  getAllWorkouts,
  getWorkoutsByClientId,
} from "../controllers/workoutController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
// Route to get all workouts
router.get("/", getAllWorkouts);

// Route to get a workouts by clientID
router.get("/:id", getWorkoutsByClientId);

// Route to add a new workout
router.post("/", addWorkout);

// Router to delete a workout by id
router.delete("/:id", deleteWorkoutById);

export default router;
