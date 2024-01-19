import STATUS_CODE from "../constants/statusCode.js";
import Client from "../models/clientModel.js";
import Workout from "../models/workoutModel.js";
// @desc     addWorkout to an existing client
// @route    POST /api/v1/coach/workouts
// @access   Public
export const addWorkout = async (req, res, next) => {
  try {
    console.log("addWorkout");
    const { exercise, date, clientID } = req.body;
    const clientExists = await Client.findById(clientID);
    if (!clientExists) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("The client with the given id does not exist in the db");
    }

    const newWorkout = await Workout.create({
      clientName: clientExists.name,
      exercise,
      date,
      client: clientID,
    });
    // const client = await Client.findById(clientID)
    // if(client.workouts){
    //     res.status(STATUS_CODE.CONFLICT)
    //     throw new Error("Car already has an owner")
    // }
    //CREAT A WORKOUT
    const workoutID = "";

    const client = await Client.findByIdAndUpdate(
      clientID,
      { $push: { workouts: workoutID } },
      { new: true }
    ).populate("cars");

    if (!user) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("No such user in the db");
    }
    const updatedUser = await Client.findByIdAndUpdate(
      client,
      {},
      {
        new: true,
      }
    ).populate("workouts");
    if (!updatedUser) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("No such user in the db");
    }
    res.send(updatedUser);
  } catch (error) {
    next(error);
  }
};
