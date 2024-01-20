import STATUS_CODE from "../constants/statusCode.js";
import Client from "../models/clientModel.js";
import Workout from "../models/workoutModel.js";

// @des      Get all the Workouts
// @route    GET /api/v1/coach/workouts
// @access   Public
export const getAllWorkouts = async (req, res, next) => {
  try {
    const workouts = await Workout.find({});
    // const workouts = await Workout.find({}).populate('client');
    res.status(STATUS_CODE.OK).send(workouts);
  } catch (error) {
    next(error);
  }
};

// @desc     addWorkout to an existing client
// @route    POST /api/v1/coach/workouts
// @access   Public
export const addWorkout = async (req, res, next) => {
  try {
    const { exercise, date, clientID } = req.body;
    const clientExists = await Client.findById(clientID);
    if (!clientExists) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("No such client in the db");
    }

    const newWorkout = await Workout.create({
      clientName: clientExists.name,
      exercise,
      date,
      client: clientID,
    });
    // console.log(`time=>${newWorkout.date.getHours()}:${newWorkout.date.getMinutes()}`)
    const workoutID = newWorkout._id;
    const updatedUser = await Client.findByIdAndUpdate(
      clientID,
      { $push: { workouts: workoutID } },
      {
        new: true,
      }
    ).populate("workouts");
    res.status(STATUS_CODE.CREATED);
    res.send(newWorkout);
    // res.send(updatedUser);
  } catch (error) {
    next(error);
  }
};
