import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
  ingredients: [
    {
      name: String,
      amount: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ["kg", "g", "ml", "units"],
        default: "units",
      },
    },
  ],
  type: {
    type: String,
    enum: ["breakfast", "lunch", "dinner", "snack"],
    required: true,
  },
  totalCalories: {
    type: Number,
    required: true,
  },
});

const Meal = mongoose.model("Meal", mealSchema);

export default Meal;
