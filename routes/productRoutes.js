import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createProduct, getProductByBarcodeNumber } from "../controllers/productController.js";
const router = express.Router();

router.use(protect);
router.get("/:number",getProductByBarcodeNumber);
router.post("/", createProduct);

export default router;
