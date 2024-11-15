import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema({
  clientName:{ type: String },
  exercise: { type: String },
  date: { type: Date },
  duration: { type: Number },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
  },
});

const Workout = mongoose.model("Workout", workoutSchema);

export default Workout;

