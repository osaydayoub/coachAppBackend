import STATUS_CODE from "../constants/statusCode.js";
import Client from "../models/clientModel.js";
import User from "../models/userModel.js";
import Workout from "../models/workoutModel.js";

// @des      Get all the Workouts
// @route    GET /api/v1/coach/workouts
// @access    Private
export const getAllWorkouts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      res.status(STATUS_CODE.UNAUTHORIZED);
      throw new Error("Not authorized");
    }
    const workouts = await Workout.find({});
    // const workouts = await Workout.find({}).populate('client');
    res.status(STATUS_CODE.OK).send(workouts);
  } catch (error) {
    next(error);
  }
};

// @desc      Get workouts by client ID
// @route     GET /api/v1/coach/workouts/:id
// @access    Private
export const getWorkoutsByClientId = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin && user.client.toString() !== req.params.id) {
      res.status(STATUS_CODE.UNAUTHORIZED);
      throw new Error("Not authorized");
    }
    const workouts = await Workout.find({ client: id });
    res.status(STATUS_CODE.OK).send(workouts);
  } catch (error) {
    next(error);
  }
};

// @desc     addWorkout to an existing client
// @route    POST /api/v1/coach/workouts
// @access    Private
export const addWorkout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      res.status(STATUS_CODE.UNAUTHORIZED);
      throw new Error("Not authorized");
    }
    const { exercise, date, duration, clientID } = req.body;
    const clientExists = await Client.findById(clientID);
    if (!clientExists) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("No such client in the db");
    }

    const workoutStartTime = new Date(date);
    const workoutEndTime = new Date(
      workoutStartTime.getTime() + duration * 60000
    );

    const conflictingWorkout = await Workout.findOne({
      $and: [
        {
          // Existing workout starts before the new workout ends
          date: { $lt: workoutEndTime },
        },
        {
          // Existing workout ends after the new workout starts
          $expr: {
            $gt: [
              { $add: ["$date", { $multiply: ["$duration", 60000] }] }, // End time of the existing workout
              workoutStartTime,
            ],
          },
        },
      ], 
    });

    if (conflictingWorkout) {
      res.status(STATUS_CODE.CONFLICT);
      throw new Error("Time conflict with another workout");
    }

    const newWorkout = await Workout.create({
      clientName: clientExists.name,
      exercise,
      date,
      duration,
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

// @desc      Delete workouts by workout ID
// @route     DELETE /api/v1/coach/workouts/:id
// @access    Private
export const deleteWorkoutById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin && user.client.toString() !== req.params.id) {
      res.status(STATUS_CODE.UNAUTHORIZED);
      throw new Error("Not authorized");
    }
    const deletedWorkout = await Workout.findByIdAndDelete(id);
    if (!deletedWorkout) {
      res.status(STATUS_CODE.NOT_FOUND).send({ error: "Workout not found" });
      return;
    }
    res.status(STATUS_CODE.OK).send("Workout deleted successfully");
  } catch (error) {
    next(error);
  }
};
