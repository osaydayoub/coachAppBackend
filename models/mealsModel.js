import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({});

const Meal = mongoose.model("Meal", mealSchema);

export default Meal;
