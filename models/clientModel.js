import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Must provide a name"],
    unique: [true, "This name is already in use"],
  },
  age: {
    type: Number,
    required: [true, "Must provide an age"],
  },
  email: {
    type: String,
    required: [true, "Must provide an email"],
    match: [/^\S+@\S+\.\S+$/, "Please add a valid email"],
    unique: [true, "This email is already in use"],
  },
  startDate: {
    type: Date,
  },
  numberOfWorkouts: {
    type: Number,
  },
  workouts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workout",
    },
    { exercise: { type: String }, date: { type: Date, default: Date.now } },
  ],
  totalCost: {
    type: Number,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  caloricIntake: {
    type: Number,
  },
  dailyTracking: [
    {
      date: { type: Date },
      calories: { type: Number },
      waterAmount: { type: Number },
      sleepHours: { type: Number },
      stepsNumber: { type: Number },
    },
  ],
  weeklyTracking: [{ date: { type: Date } }],
});

// unique: [true, "This ID is already in use"],

const Client = mongoose.model("Client", clientSchema);

export default Client;
