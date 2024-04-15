import STATUS_CODE from "../constants/statusCode.js";
import Meal from "../models/mealsModel.js";
import User from "../models/userModel.js";

// @des      creats a new meal
// @route    POST /api/v1/coach/meals
// @access   Public
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

// @des      Get a client with id
// @route    GET /api/v1/coach/meals/:type
// @access   public
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
    const meals = await Meal.find({ type: mealType });
    res.status(STATUS_CODE.OK).send(meals);
  } catch (error) {
    next(error);
  }
};
