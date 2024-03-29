import STATUS_CODE from "../constants/statusCode.js";
import Client from "../models/clientModel.js";

// @des      Get all the clients
// @route    GET /api/v1/coach/clients
// @access   Public
export const getAllClients = async (req, res, next) => {
  try {
    const clients = await Client.find({}).populate("workouts");
    res.status(STATUS_CODE.OK).send(clients);
  } catch (error) {
    next(error);
  }
};

// @des      Get a client with id
// @route    GET /api/v1/coach/clients/:id
// @access   Public
export const getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id).populate("workouts");
    if (!client) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("There is no client with this id");
    }
    res.status(STATUS_CODE.OK).send(client);
  } catch (error) {
    next(error);
  }
};

// @des      creats a new client
// @route    POST /api/v1/coach/clients
// @access   Public
export const createClient = async (req, res, next) => {
  const { name, email, age } = req.body;
  try {
    if (!name || !email || isNaN(age)) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error("Please add all fields");
    }
    const client = await Client.create({
      name,
      email,
      age,
    });

    res.status(STATUS_CODE.CREATED).send(client);
  } catch (error) {
    next(error);
  }
};

// @desc     update an existing client
// @route    PUT /api/v1/coach/clients/:id
// @access   Public
// export const updateClient = async (req, res) => {
//   try {
//     console.log("updateUser");
//     const { id } = req.params;

//     const updatedUser = await Client.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });
//     if (!updatedUser) {
//       res.status(STATUS_CODE.NOT_FOUND);
//       throw new Error("No such user in the db");
//     }

//     res.send(updatedUser);
//   } catch (error) {
//     next(error);
//   }
// };

// @desc     Assign a package to a client with id
// @route    PUT /api/v1/coach/clients/assignPackage/:id
// @access   Public
export const assignPackage = async (req, res, next) => {
  const { numberOfWorkouts, totalCost, paidAmount, caloricIntake } = req.body;
  const { id } = req.params;
  try {
    if (
      isNaN(numberOfWorkouts) ||
      isNaN(totalCost) ||
      isNaN(paidAmount) ||
      isNaN(caloricIntake)
    ) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error(
        "Please include all fields, ensuring that each of them is a numeric value"
      );
    }
    const updatedUser = await Client.findByIdAndUpdate(
      id,
      { numberOfWorkouts, totalCost, paidAmount, caloricIntake },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("No such client in the db");
    }
    res.send(updatedUser);
  } catch (error) {
    next(error);
  }
};

const isSameDay = (date1, date2) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

// @desc     add Daily Tracking to a client with id
// @route    PUT /api/v1/coach/clients/dailyTracking/:id
// @access   Public
export const addDailyTracking = async (req, res, next) => {
  const { date, calories, waterAmount, sleepHours } = req.body;
  const { id } = req.params;

  try {
    if (
      isNaN(new Date(date)) ||
      isNaN(calories) ||
      isNaN(waterAmount) ||
      isNaN(sleepHours)
    ) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error("Please include all fields");
    }

    const user = await Client.findById(id);

    let index = -1;
    let updatedUser;
    if (user) {
      index = user.dailyTracking.findIndex((track) => {
        return isSameDay(new Date(track.date), new Date(date));
      });

      if (index != -1) {
        //update
        updatedUser = await Client.findByIdAndUpdate(
          id,
          {
            $set: {
              [`dailyTracking.${index}`]: {
                date,
                calories,
                waterAmount,
                sleepHours,
              },
            },
          },
          {
            new: true,
          }
        );
      } else {
        //push
        updatedUser = await Client.findByIdAndUpdate(
          id,
          {
            $push: {
              dailyTracking: {
                date,
                calories,
                waterAmount,
                sleepHours,
              },
            },
          },
          {
            new: true,
          }
        );
      }
    } else {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("No such client in the db");
    }

    res.send(updatedUser);
    // updatedUser
  } catch (error) {
    next(error);
  }
};

// @desc     get a Daily Tracking of a client with id
// @route    GET /api/v1/coach/clients/dailyTracking/:id
// @access   Public

export const getDailyTracking = async (req, res, next) => {
  const { date } = req.body;
  const { id } = req.params;
  try {
    if (isNaN(new Date(date))) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error("Please include date");
    }
    const user = await Client.findById(id);
    let track;
    if (user) {
      track = user.dailyTracking.find((track) => {
        return isSameDay(new Date(track.date), new Date(date));
      });
    } else {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("No such client in the db");
    }
    if (!track) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("No such client in the db");
    }
    res.send(track);
  } catch (error) {
    next(error);
  }
};
