import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  user: { // Reference to the User schema
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null, // Use null instead of 0
  },
  name: {
    type: String,
    required: [true, "Must provide a name"],
    unique: [true, "This name is already in use"],
  },
  age: {
    type: Number,
    default: 0,
    // required: [true, "Must provide an age"],
  },
  weight: {
    type: Number,
    default: 0,
    // required: [true, "Must provide an weight"],
  },
  phoneNumber: { 
    type: String, 
    // required: [true, "Must provide a phone number"],
    match: [/^\d{10}$/, "Please provide a valid 10-digit phone number"], 
  },
  email: {
    type: String,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  // package
  numberOfWorkouts: {
    type: Number,
    default: 0,
  },
  totalCost: {
    type: Number,
    default: 0,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  paymentHistory: [
    {
      amount: { type: Number },
      date: { type: Date, default: Date.now },
    },
  ],
  caloricIntake: {
    type: Number,
    default: 2500,
  },
  // package
  workouts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workout",
    },
  ],

  dailyTracking: [
    {
      date: { type: Date },
      calories: { type: Number },
      waterAmount: { type: Number },
      sleepHours: { type: Number },
      // stepsNumber: { type: Number },
    },
  ],
  // Weight tracking array with required fields
  weightTracking: [
    {
      weight: { type: Number, required: true }, // The weight value in kg (required)
      date: { type: Date, required: true }, // Date when the weight was logged (required)
    },
  ],
  dailyMeals: [
    {
      date: { type: Date, required: true },
      breakfast: {
        meal: { type: mongoose.Schema.Types.ObjectId, ref: "Meal" },
        consumed: { type: Boolean, default: false }
      },
      lunch: {
        meal: { type: mongoose.Schema.Types.ObjectId, ref: "Meal" },
        consumed: { type: Boolean, default: false }
      },
      dinner: {
        meal: { type: mongoose.Schema.Types.ObjectId, ref: "Meal" },
        consumed: { type: Boolean, default: false }
      },
      snacks: [
        {
          meal: { type: mongoose.Schema.Types.ObjectId, ref: "Meal" },
          consumed: { type: Boolean, default: false }
        }, // Snack 1
        {
          meal: { type: mongoose.Schema.Types.ObjectId, ref: "Meal" },
          consumed: { type: Boolean, default: false }
        } // Snack 2
      ],
    },
  ],
  weeklyTracking: [{ date: { type: Date } }],
});

const Client = mongoose.model("Client", clientSchema);

export default Client;
