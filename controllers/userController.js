import STATUS_CODE from "../constants/statusCode.js";
import User from "../models/userModel.js";
import Client from "../models/clientModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res, next) => {
  try {
    const { name, age, weight, email, password } = req.body;
    if (!name || isNaN(age) || !email || !password) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error("Please add all fields");
    }
    const userExists = await User.findOne({
      $or: [{ name: name }, { email: email }],
    });
    // const userExists = await User.find({ name: name });

    if (userExists) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error(
        "A user with the provided name or email address already exists in the system."
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await Client.create({
      name,
      email,
      age,
      weight,
    });

    const user = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
      client: client._id,
    });

    await Client.findByIdAndUpdate(client._id, { user: user._id });
    
    res.status(STATUS_CODE.CREATED).send({
      name: user.name,
      email: user.email,
      client: user.client,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error("Please add email and password");
    }
    const user = await User.findOne({ email }).populate({
      path: "client",
      populate: {
        path: "workouts",
      },
    });
    if (user) {
      // Check if the user is active
      if (!user.isActive) {
        res.status(STATUS_CODE.FORBIDDEN);
        throw new Error("Your account is not active. Please contact support.");
      }
      const correctPassword = await bcrypt.compare(password, user.password);
      if (correctPassword) {
        res.status(STATUS_CODE.OK).send({
          name: user.name,
          email: user.email,
          client: user.client,
          isAdmin: user.isAdmin,
          token: generateToken(user._id),
        });
      } else {
        res.status(STATUS_CODE.BAD_REQUEST);
        throw new Error("invalid credentials");
      }
    } else {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error("invalid credentials");
    }
  } catch (error) {
    next(error);
  }
};

//Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export const updateUserActiveStatus = async (req, res, next) => {
  const { userId, status } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      res.status(STATUS_CODE.UNAUTHORIZED);
      throw new Error("Not authorized");
    }
    // Find the user by ID and update the activeStatus field
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: status },
      { new: true, runValidators: true }
    );
    // console.log("activeStatus",status);
    // console.log("userId",userId);
    if (!updatedUser) {
      console.log("No user updated");
    } else {
      console.log("Updated User:", updatedUser);
    }

    if (!updatedUser) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("User not found");
    }

    const message = status ? "User activated" : "User deactivated";
    res.status(STATUS_CODE.OK).send({
      message: message,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
