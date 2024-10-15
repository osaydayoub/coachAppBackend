import STATUS_CODE from "../constants/statusCode.js";
import Meal from "../models/mealsModel.js";
import User from "../models/userModel.js";

// @des      creats a new meal
// @route    POST /api/v1/coach/meals
// @access   Private
export const createMeal = async (req, res, next) => {
  const { ingredients, type, totalCalories } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      res.status(STATUS_CODE.UNAUTHORIZED);
      throw new Error("Not authorized");
    }
    if (!ingredients || !type || isNaN(totalCalories)) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error("Please add all fields");
    }
    const meal = await Meal.create({
      ingredients,
      type,
      totalCalories,
    });

    res.status(STATUS_CODE.CREATED).send(meal);
  } catch (error) {
    next(error);
  }
};

// @des      Get Meals By Type 
// @route    GET /api/v1/coach/meals/:type
// @access   Private
export const getAllMealsByType = async (req, res, next) => {
  const mealType = req.params.type;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(STATUS_CODE.UNAUTHORIZED);
      throw new Error("Not authorized");
    }
    if (!mealType) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error("Meal type query parameter is required");
    }
    if (!["breakfast", "lunch", "dinner", "snack"].includes(mealType)) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error("Invalid meal type.");
    }
    //Solutions to Prevent Exposing Client IDs so return only the rating of current Client
    // const mealsWithUserRating = meals.map(meal => {
    //   const userRating = meal.ratings[req.user.client] || null; // Get user's rating based on client ID
    
    //   const { ratings, ...mealWithoutRatings } = meal.toObject(); // Exclude ratings
    //   return {
    //     ...mealWithoutRatings,
    //     ['user.client']: userRating, // Attach user's rating with a dot in the key
    //   };
    // });
    const meals = await Meal.find({ type: mealType });
    res.status(STATUS_CODE.OK).send(meals);
  } catch (error) {
    next(error);
  }
};


export const addMealRating = async (req, res,next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(STATUS_CODE.UNAUTHORIZED);
    throw new Error("Not authorized");
  }
  const mealId = req.params.id; 
  const { clientId, rating } = req.body; 

  try {
    // Find the meal by ID
    const meal = await Meal.findById(mealId);

    if (!meal) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("Meal not found");
    }

    const updatedMeal = await Meal.findOneAndUpdate(
      { _id: mealId }, // Find the meal by ID
      { 
        $set: { [`ratings.${clientId}`]: rating } // Dynamically update the ratings field with the clientId as the key
      },
      { new: true, upsert: true } // Return the updated document and create it if it doesn't exist
    );
    res.status(STATUS_CODE.OK).send(updatedMeal);
  } catch (error) {
    next(error);
  }
};
