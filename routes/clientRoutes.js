import express from "express";
import {
  addDailyMeal,
  addDailyTracking,
  addPayment,
  addWeightTracking,
  assignPackage,
  consumeDailyMeal,
  createClient,
  getAllClients,
  getClientById,
  getDailyTracking,
  getWeightTracking,
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

// Route to add a payment to client with id
// router.put("/payment/:id", protect, addPayment);
router.put("/payment/:id", addPayment);

// // Route to add a weeklyTracking to client with id
// router.put("/addWeeklyTracking/:id", addWeeklyTracking);

// // Rout to delete a client
// router.delete("/:id", deleteClient);


// Route to add a weightTracking to client with id
router.put("/weightTracking/:id", protect, addWeightTracking);

// Route to get a weightTracking of a client with id .
router.get("/weightTracking/:id", protect, getWeightTracking);

router.post("/dailyMeals/:clientId",protect, addDailyMeal);

router.post("/consumeDailyMeals/:clientId",protect, consumeDailyMeal);

export default router;
