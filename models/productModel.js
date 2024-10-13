import mongoose from "mongoose";

const productSchema = new mongoose.Schema({

    barcodeNumber: {
    type: String,
    unique: [true, "This barcode number is already in use"],
    required: true,
  },
  caloriesIn100g: {
    type: Number,
    required: [true, "Calories per 100g is required"],
    min: [0, "Calories per 100g cannot be negative"],
  },
});
// Ensure uniqueness is properly enforced by MongoDB
productSchema.index({ barcodeNumber: 1 }, { unique: true });

const Product = mongoose.model("Product", productSchema);

export default Product;
