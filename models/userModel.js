import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Must provide a name"],
    unique: [true, "This name is already in use"],
    minlength: [2, "too short"],
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, "Must provide an email"],
    match: [/^\S+@\S+\.\S+$/, "Please add a valid email"],
    unique: [true, "This email is already in use"],
  },
  password: {
    type: String,
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    default: null,
  },
  isAdmin: {
    type: Boolean,
    default: false,
    required: true,
  },
  // admin: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Admin",
  //   default: null,
  // },
});

const User = mongoose.model("User", userSchema);

export default User;
