import express from "express";
import {
    addDailyTracking,
  assignPackage,
  createClient,
  getAllClients,
  getClientById,
} from "../controllers/clientController.js";
const router = express.Router();

// Route to get all clients
router.get("/", getAllClients);

//Route to get a single client by ID
router.get("/:id", getClientById);

// Route to create a new client
router.post("/", createClient);

// // Route to update an existing client
// router.put("/:id", updateClient);

// Route to Assign a package to a client with id
router.put("/assignPackage/:id", assignPackage);


// Route to get all workouts for the client with id
// router.put("/getWorkout/:id", getAllWorkouts);

// Route to add a dailyTracking to client with id
router.put("/addDailyTracking/:id", addDailyTracking);

// // Route to add a weeklyTracking to client with id
// router.put("/addWeeklyTracking/:id", addWeeklyTracking);

// // Rout to delete a client
// router.delete("/:id", deleteClient);

export default router;
