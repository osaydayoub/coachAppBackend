import STATUS_CODE from "../constants/statusCode.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
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
    const user = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
    });
    res.status(STATUS_CODE.CREATED).send({
      name: user.name,
      email: user.email,
      client: user.client,
      isAdmin: user.isAdmin,
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
    const user = await User.findOne({ email });
    // console.log(user);
    if (user) {
      user.populate("client");
      const correctPassword = await bcrypt.compare(password, user.password);
      if (correctPassword) {
        res.status(STATUS_CODE.OK).send({
          name: user.name,
          email: user.email,
          client: user.client,
          isAdmin: user.isAdmin,
        });
      } else {
        res.status(STATUS_CODE.BAD_REQUEST);
        throw new Error("invalid credentials");
      }
    }else{
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error("invalid credentials");
    }
  } catch (error) {
    next(error);
  }
};
