import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
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
  weight:{
    type: Number,
    default: 0,
    // required: [true, "Must provide an weight"],
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
  weeklyTracking: [{ date: { type: Date } }],
});

const Client = mongoose.model("Client", clientSchema);

export default Client;
