import getOpenAiInstance from "../config/openai.js";
import STATUS_CODE from "../constants/statusCode.js";
import Meal from "../models/mealsModel.js";
import User from "../models/userModel.js";


// @des      creats a new meal
// @route    POST /api/v1/coach/meals
// @access   Private
export const createMeal = async (req, res, next) => {
  const { ingredients, type, totalCalories } = req.body;
  console.log("ingredients=",ingredients);
  console.log("type=",type);
  console.log("totalCalories=",totalCalories);
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

// @desc      Updates specific fields of an existing meal without changing the meal type
// @route     PUT /api/v1/coach/meals/:id
// @access    Private
export const updateMeal = async (req, res, next) => {
  const { ingredients, totalCalories } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      res.status(STATUS_CODE.UNAUTHORIZED);
      throw new Error("Not authorized");
    }

    // Validate input
    if (!ingredients || !totalCalories || isNaN(totalCalories)) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error(
        "Please provide both ingredients and a valid totalCalories"
      );
    }

    const updateData = { ingredients, totalCalories };

    const updatedMeal = await Meal.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedMeal) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("Meal not found");
    }

    res.status(STATUS_CODE.OK).send(updatedMeal);
  } catch (error) {
    next(error);
  }
};

// @desc      Delete a meal by ID
// @route     DELETE /api/v1/coach/meals/:id
// @access    Private
export const deleteMeal = async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      res.status(STATUS_CODE.UNAUTHORIZED);
      throw new Error("Not authorized");
    }

    // Find the meal by ID and delete it
    const deletedMeal = await Meal.findByIdAndDelete(id);

    // If the meal is not found, return a 404 error
    if (!deletedMeal) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("Meal not found");
    }

    res.status(STATUS_CODE.OK).json({ message: "Meal deleted successfully" });
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

export const addMealRating = async (req, res, next) => {
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

    const updatedRatings = { ...meal.ratings, [clientId]: rating };

    const ratings = Object.values(updatedRatings);
    const averageRating =
      ratings.reduce((sum, current) => sum + current, 0) / ratings.length;

    const updatedMeal = await Meal.findOneAndUpdate(
      { _id: mealId },
      { ratings: updatedRatings, averageRating },
      { new: true }
    );

    res.status(STATUS_CODE.OK).send(updatedMeal);
  } catch (error) {
    next(error);
  }
};

export async function generateByType(req, res, next) {
  const openAI = getOpenAiInstance();
  const mealType = req.params.type;
  const calorieLimit = req.query.calorieLimit || 700;

  if (!["breakfast", "lunch", "dinner", "snack"].includes(mealType)) {
    res.status(STATUS_CODE.BAD_REQUEST);
    throw new Error("Invalid meal type.");
  }

  const prompt = `
    Create a meal of type "${mealType}" in JSON format with a calorie limit of ${calorieLimit} calories:
    {
      "ingredients": [
        {
          "name": "Ingredient name",
          "amount": amount (integer),
          "unit": "appropriate unit (e.g., g, ml for liquids, or units for items like eggs)"
        }
      ],
      "type": "${mealType}",
      "totalCalories": total calories (integer, no more than ${calorieLimit})
    }
    Only respond with the JSON object and nothing else.
  `;

  try {
    const response = await openAI.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const meal = response.choices[0].message.content;
    res.json(JSON.parse(meal)); 
  } catch (error) {
    console.error("Error generating meal:", error);
    next(error);
  }
}
