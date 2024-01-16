import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema({
  exercise: { type: String },
  date: { type: Date, default: Date.now },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client"
  }
});
// , date: { type: Date, default: Date.now } },

const Workout = mongoose.model("Workout", workoutSchema);

export default Workout;

Workout;
// workoutModel
