import express from "express";
import { addWorkout, getAllWorkouts } from "../controllers/workoutController.js";
const router = express.Router();

// Route to get all workouts
router.get("/", getAllWorkouts);

//Route to get a single workout by ID
// router.get("/:id", getWorkoutById);

// Route to add a new workout
router.post("/", addWorkout);

export default router;

