import STATUS_CODE from "../constants/statusCode.js";
import Client from "../models/clientModel.js";
import User from "../models/userModel.js";

// export const isToday=(date)=>{
//   const inputDate = new Date(date);
//   inputDate.setHours(0, 0, 0, 0);
//   const Today= new Date();
//   Today.setHours(0, 0, 0, 0);
//   return Today.getTime() === inputDate.getTime()
// }

const isSameDay = (date1, date2) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

const isExactSameDate = (date1, date2) => {
  return date1.getTime()===date2.getTime();
};

// const normalizeDate = (date) => {
//   return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
// };

// const isSameDay = (date1, date2) => {
//   const d1 = normalizeDate(date1);
//   const d2 = normalizeDate(date2);
//   return d1.getTime() === d2.getTime();
// };

// @des      Get all the clients
// @route    GET /api/v1/coach/clients
// @access   Private
export const getAllClients = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      res.status(STATUS_CODE.UNAUTHORIZED);
      throw new Error("Not authorized");
    }
    // const clients = await Client.find({}).populate("workouts");
        // Retrieve all clients with the user and workouts populated
        const clients = await Client.find({})
        .populate("workouts") // Populate workouts
        .populate("user");    // Populate user to access isActive
  
      // Map over clients to include isActive field from the User
      const clientsWithActiveStatus = clients.map(client => ({
        ...client.toObject(),
        isActive: client.user ? client.user.isActive : null, // Add isActive from user
      }));
    res.status(STATUS_CODE.OK).send(clientsWithActiveStatus);
  } catch (error) {
    next(error);
  }
};

// @des      Get a client with id
// @route    GET /api/v1/coach/clients/:id
// @access   Private
export const getClientById = async (req, res, next) => {
  const { date } = req.query;
  const clientDate = new Date(date);


  if ( !date) {
    res.status(STATUS_CODE.BAD_REQUEST);
    throw new Error("Please add date");
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin && user.client.toString() !== req.params.id) {
      res.status(STATUS_CODE.UNAUTHORIZED);
      throw new Error("Not authorized");
    }
    const client = await Client.findById(req.params.id).populate("workouts");
    if (!client) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("There is no client with this id");
    }

        // Find today's meal entry from dailyMeals
        const todayMealEntry = client.dailyMeals.find((meal) =>
          isExactSameDate(new Date(meal.date), clientDate)
        );
        

    if (todayMealEntry) {
      try {
        // Only populate meals if they exist
        if (todayMealEntry.breakfast) {
          await Client.populate(todayMealEntry, { path: "breakfast.meal", model: "Meal" });
        }
        if (todayMealEntry.lunch) {
          await Client.populate(todayMealEntry, { path: "lunch.meal", model: "Meal" });
        }
        if (todayMealEntry.dinner) {
          await Client.populate(todayMealEntry, { path: "dinner.meal", model: "Meal" });
        }
        if (todayMealEntry.snacks) {

          let nullIndex=-1;
          if(todayMealEntry.snacks[0]==null){
            nullIndex=0;
          }else if(todayMealEntry.snacks[1]==null){
            nullIndex=1;
          }
          // Populate the snacks array
          await Client.populate(todayMealEntry, { path: "snacks.meal", model: "Meal" });
        
          // Map over the original snacks array to retain the null entries
          todayMealEntry.snacks = todayMealEntry.snacks.map((snack) => {
            return snack ? snack : null; // Keep nulls in the array
          });
          if(todayMealEntry.snacks.length<2){
            if(nullIndex==1){
              todayMealEntry.snacks.push(null);
            }
            if(nullIndex==0){
              todayMealEntry.snacks.unshift(null);
            }
          }
          
        }
      } catch (error) {
        console.error("Error populating meals:", error);
      }
    }
    res.status(STATUS_CODE.OK).send({
      ...client.toObject(),
      dailyMeals: todayMealEntry ? [todayMealEntry] : [], // Only return today's meal in dailyMeals array
    });
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
// @access   Private
export const assignPackage = async (req, res, next) => {
  const { numberOfWorkouts, totalCost, paidAmount, caloricIntake } = req.body;
  const { id } = req.params;
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      res.status(STATUS_CODE.UNAUTHORIZED);
      throw new Error("Not authorized");
    }
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



// @desc     add Daily Tracking to a client with id
// @route    PUT /api/v1/coach/clients/dailyTracking/:id
// @access   Private
export const addDailyTracking = async (req, res, next) => {
  const { date, calories, waterAmount, sleepHours } = req.body;
  const { id } = req.params;

  try {
    const user = await User.findById(req.user.id);
    if (user.client.toString() !== req.params.id) {
      res.status(STATUS_CODE.UNAUTHORIZED);
      throw new Error("Not authorized");
    }
    if (
      isNaN(new Date(date)) ||
      isNaN(calories) ||
      isNaN(waterAmount) ||
      isNaN(sleepHours)
    ) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error("Please include all fields");
    }

    const client = await Client.findById(id);

    let index = -1;
    let updatedClient;
    if (client) {
      index = client.dailyTracking.findIndex((track) => {
        return isSameDay(new Date(track.date), new Date(date));
      });

      if (index != -1) {
        //update
        updatedClient = await Client.findByIdAndUpdate(
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
        updatedClient = await Client.findByIdAndUpdate(
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

    res.send(updatedClient);
    // updatedUser
  } catch (error) {
    next(error);
  }
};

// @desc     get a Daily Tracking of a client with id
// @route    GET /api/v1/coach/clients/dailyTracking/:id
// @access   Private

export const getDailyTracking = async (req, res, next) => {
  const { date } = req.body;
  const { id } = req.params;
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin && user.client.toString() !== req.params.id) {
      res.status(STATUS_CODE.UNAUTHORIZED);
      throw new Error("Not authorized");
    }
    if (isNaN(new Date(date))) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error("Please include date");
    }
    const client = await Client.findById(id);
    let track;
    if (client) {
      track = client.dailyTracking.find((track) => {
        return isSameDay(new Date(track.date), new Date(date));
      });
    } else {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("No such client in the db");
    }
    if (!track) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("No available track for this day in the database");
    }
    res.send(track);
  } catch (error) {
    next(error);
  }
};

// @desc     Add a payment to client with id
// @route    PUT /api/v1/coach/clients/payment/:id
// @access   Private
export const addPayment = async (req, res, next) => {
  const { amount, date } = req.body;
  const { id } = req.params;
  try {
    // const user = await User.findById(req.user.id);
    // if (!user.isAdmin) {
    //   res.status(STATUS_CODE.UNAUTHORIZED);
    //   throw new Error("Not authorized");
    // }
    if (!amount || !date) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error("Please add all fields");
    }
    const updatedClient = await Client.findByIdAndUpdate(
      id,
      {
        $inc: { paidAmount: amount },
        $push: { paymentHistory: { amount, date } },
      },
      {
        new: true,
      }
    );
    if (!updatedClient) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("No such client in the db");
    }
    res.send(updatedClient);
  } catch (error) {
    next(error);
  }
};

// @desc     Add a WeightTracking to client with id
// @route    PUT /api/v1/coach/clients/weightTracking/:id
// @access   Private

export const addWeightTracking = async (req, res) => {
  const { id } = req.params; // Client's ID
  const { weight, date } = req.body;

  if (!weight || !date) {
    res.status(STATUS_CODE.BAD_REQUEST);
    throw new Error("Weight and date are required");
  }

  try {
    const client = await Client.findById(id);

    if (!client) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("No such client in the db");
    }
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          weightTracking: {
            weight: weight,
            date: date,
          },
        },
      },
      { new: true } // Return the updated document
    );
    if (!updatedClient) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("No such client in the db");
    }
    res.send(updatedClient);
  } catch (error) {
    next(error);
  }
};

// @desc     get a weightTracking of a client with id
// @route    GET /api/v1/coach/clients/weightTracking/:id
// @access   Private
export const getWeightTracking = async (req, res, next) => {
  const { id } = req.params; // Client's ID

  try {
    const client = await Client.findById(id);

    if (!client) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("No such client in the db");
    }

    res.send(client.weightTracking);
  } catch (error) {
    next(error);
  }
};

// export const addDailyMeal = async (req, res, next) => {
//   const { clientId } = req.params;
//   const { mealId, mealType } = req.body;
//   const allowedMealTypes = [
//     "breakfast",
//     "lunch",
//     "dinner",
//     "snack-1",
//     "snack-2",
//   ];
//   if (!allowedMealTypes.includes(mealType)) {
//     res.status(STATUS_CODE.BAD_REQUEST);
//     throw new Error(`Invalid meal type: ${mealType}.`);
//   }
//   try {
//     const client = await Client.findById(clientId);
//     if (!client) {
//       res.status(STATUS_CODE.NOT_FOUND);
//       throw new Error("No such client in the db");
//     }

//     const today = new Date().toISOString().split("T")[0];
//     let mealEntry = client.dailyMeals.find((meal) => meal.date === today);

//     if (!mealEntry) {
//       mealEntry = { 
//         date: today, 
//         breakfast: null, 
//         lunch: null, 
//         dinner: null, 
//         snacks: [null, null] 
//       };
//       client.dailyMeals.push(mealEntry);
//     }


//     if (mealType.startsWith("snack")) {
//       if (mealType === "snack-1") {
//         mealEntry.snacks[0] = mealId;  // Add or replace snack-1 at position 0
//       } else if (mealType === "snack-2") {
//         mealEntry.snacks[1] = mealId;  // Add or replace snack-2 at position 1
//       }
//     } else {
//       // For breakfast, lunch, and dinner
//       mealEntry[mealType] = mealId;
//       console.log("console.log(mealType);");
//       console.log(mealType);
//     }
    
//     await client.save(); 
//     res.send(client);
//   } catch (error) {
//     next(error);
//   }
// };

// export const addDailyMeal = async (req, res, next) => {
//   const { clientId } = req.params;
//   const { mealId, mealType } = req.body;
//   const allowedMealTypes = [
//     "breakfast",
//     "lunch",
//     "dinner",
//     "snack-1",
//     "snack-2",
//   ];

//   if (!allowedMealTypes.includes(mealType)) {
//     res.status(STATUS_CODE.BAD_REQUEST);
//     throw new Error(`Invalid meal type: ${mealType}.`);
//   }

//   try {

//     // Find the client
//     const client = await Client.findById(clientId);
//     if (!client) {
//       res.status(STATUS_CODE.NOT_FOUND);
//       throw new Error("No such client in the db");
//     }

//     // Check if a meal entry for today exists
//     let mealEntry = client.dailyMeals.find((meal) => isSameDay(meal.date, new Date()));
//     console.log("Current daily meals:", client.dailyMeals);
//     console.log("mealEntry--->", mealEntry);

//     if (!mealEntry) {
//       // Create new meal entry if it doesn't exist
//       mealEntry = { date: new Date(), breakfast: null, lunch: null, dinner: null, snacks: [null, null] };
//       client.dailyMeals.push(mealEntry); // Push only if it's a new entry
//     }
//     console.log("mealEntry--->", mealEntry);
//     // Update the specific meal type
//     if (mealType.startsWith("snack")) {
//       if (mealType === "snack-1") {
//         mealEntry.snacks[0] = mealId;  // Add or replace snack-1 at position 0
//       } else if (mealType === "snack-2") {
//         mealEntry.snacks[1] = mealId;  // Add or replace snack-2 at position 1
//       }
//     } else {
//       mealEntry[mealType] = mealId; // Set the corresponding meal type
//     }
//     console.log("mealEntry--->", mealEntry);
//     // Save the updated client
//     await client.save(); 
//     res.send(client);
//   } catch (error) {
//     next(error);
//   }
// };


export const addDailyMeal = async (req, res, next) => {
  const { clientId } = req.params;
  const { mealId, mealType,date } = req.body;
  const clientDate = new Date(date);
  const allowedMealTypes = [
    "breakfast",
    "lunch",
    "dinner",
    "snack-1",
    "snack-2",
  ];

  if (!mealId || !mealType||!date) {
    res.status(STATUS_CODE.BAD_REQUEST);
    throw new Error("Please add all fields");
  }

  if (!allowedMealTypes.includes(mealType)) {
    res.status(STATUS_CODE.BAD_REQUEST);
    throw new Error(`Invalid meal type: ${mealType}.`);
  }

  try {
   
    // Find the client
    const client = await Client.findById(clientId);
    if (!client) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("No such client in the db");
    }

    let mealEntry = client.dailyMeals.find((meal) => isExactSameDate(meal.date,clientDate));
   
    if (!mealEntry) {
      const newMealEntry = { date: clientDate, breakfast: null, lunch: null, dinner: null, snacks: [null, null] };
      client.dailyMeals.push(newMealEntry); // Push the new entry
      mealEntry = client.dailyMeals[client.dailyMeals.length - 1];
    }
    
    // Update the specific meal type
    if (mealType.startsWith("snack")) {
      if (mealType === "snack-1") {
        if(!mealEntry.snacks[0]?.consumed){
          mealEntry.snacks[0] = { meal: mealId, consumed: false };
          // mealEntry.snacks[0].meal = mealId;  // Add or replace snack-1 at position 0
          // mealEntry.snacks[0].consumed = false;
        }else{
          res.status(STATUS_CODE.BAD_REQUEST);
          throw new Error(`already consumed!`);
        }
        
      } else if (mealType === "snack-2") {
        if(!mealEntry.snacks[1]?.consumed){
          mealEntry.snacks[1] = { meal: mealId, consumed: false };// Add or replace snack-2 at position 1
        }else{
          res.status(STATUS_CODE.BAD_REQUEST);
          throw new Error(`already consumed!`);
        }
      }
    } else {
      if(!mealEntry[mealType].consumed){
        mealEntry[mealType].meal = mealId; 
        mealEntry[mealType].consumed = false;
      }else{
        res.status(STATUS_CODE.BAD_REQUEST);
        throw new Error(`already consumed!`);
      }
      
    }
    
    // Save the updated client
    await client.save(); 
    res.send(client);
  } catch (error) {
    next(error);
  }
};
 

//consumeDailyMeal

export const consumeDailyMeal = async (req, res, next) => {
  const { clientId } = req.params;
  //do i need to check also mealId? const { mealId, mealType } = req.body;
  const {mealType ,date} = req.body;
  const clientDate = new Date(date);
  const allowedMealTypes = [
    "breakfast",
    "lunch",
    "dinner",
    "snack-1",
    "snack-2",
  ];

  if (!mealType || !date) {
    res.status(STATUS_CODE.BAD_REQUEST);
    throw new Error("Please add all fields");
  }

  if (!allowedMealTypes.includes(mealType)) {
    res.status(STATUS_CODE.BAD_REQUEST);
    throw new Error(`Invalid meal type: ${mealType}.`);
  }

  try {
   
    // Find the client
    const client = await Client.findById(clientId);
    if (!client) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("No such client in the db");
    }

    // Check if a meal entry for today exists
    let mealEntry = client.dailyMeals.find((meal) => isExactSameDate(meal.date,clientDate));
 
    if (!mealEntry) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error(`no dailyMeals picked for today!`);
    }
    
    // Update the specific meal type
    if (mealType.startsWith("snack")) {
      if (mealType === "snack-1") {
        mealEntry.snacks[0].consumed=true;        
      } else if (mealType === "snack-2") {
        mealEntry.snacks[1].consumed=true;   
      }
    } else {
      mealEntry[mealType].consumed=true;
    }
    // Save the updated client
    await client.save(); 
    res.send(client);
  } catch (error) {
    next(error);
  }
};
 