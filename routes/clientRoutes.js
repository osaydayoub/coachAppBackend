import express from "express";
import {
  addDailyTracking,
  assignPackage,
  createClient,
  getAllClients,
  getClientById,
  getDailyTracking,
} from "../controllers/clientController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route to get all clients
router.get("/", protect, getAllClients);

//Route to get a single client by ID
router.get("/:id", protect, getClientById);

// Route to create a new client
router.post("/", createClient);

// // Route to update an existing client
// router.put("/:id", updateClient);

// Route to Assign a package to a client with id
router.put("/assignPackage/:id", protect, assignPackage);

// Route to add a dailyTracking to client with id
router.put("/dailyTracking/:id", protect, addDailyTracking);

// Route to get a dailyTracking of a client with id on a specific date.
router.get("/dailyTracking/:id", protect, getDailyTracking);

// // Route to add a weeklyTracking to client with id
// router.put("/addWeeklyTracking/:id", addWeeklyTracking);

// // Rout to delete a client
// router.delete("/:id", deleteClient);

export default router;
