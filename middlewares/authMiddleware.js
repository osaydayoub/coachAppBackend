import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import STATUS_CODE from "../constants/statusCode.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      console.log(error);
      res.status(STATUS_CODE.UNAUTHORIZED);
      throw new Error("Not authorized");
    }
  }
  if (!token) {
    res.status(STATUS_CODE.UNAUTHORIZED);
    throw new Error("Not authorized, no token");
  }
});
