import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema({
  exercise: { type: String },
  date: { type: Date, default: Date.now },
//   duration: { type: Number },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
  },
});

const Workout = mongoose.model("Workout", workoutSchema);

export default Workout;

