import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} from "../errors/index.js";
import createUserPayload from "../utils/createUserPayload.js";

const getAllUsers = async (req, res) => {
  console.log(req.user);

  const users = await User.find({ role: "user" }).select("-password");

  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findOne({ _id: userId }).select("-password");
  if (!user) {
    throw new NotFoundError(`Kein Benutzer mit ID ${userId}`);
  }
  res.status(StatusCodes.OK).json({ user });
};

const getCurrentUser = async (req, res) => {
  const user = req.user;
  res.status(StatusCodes.OK).json({ user });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  console.log(oldPassword, newPassword);

  if (!oldPassword || !newPassword) {
    throw new BadRequestError("Bitte geben Sie beide Werte an.");
  }
  const user = await User.findOne({ _id: req.user.userId });
  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Ungültige Anmeldedaten");
  }
  user.password = newPassword;
  user.save();
  res.status(StatusCodes.OK).json({ msg: "Erfolg! Passwort aktualisiert." });
};

const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    throw new BadRequestError("Bitte geben Sie alle Werte an");
  }
  const user = await User.findOne({ _id: req.user.userId });
  user.name = name;
  user.email = email;

  await user.save();
  // token
  const payloadUser = createUserPayload(user);
  attachCookie({ res, user: payloadUser });

    res.status(StatusCodes.OK)
    .json({ user: { name: user.name, email: user.email }, token });
};

export {
  getAllUsers,
  getCurrentUser,
  getSingleUser,
  updateUser,
  updateUserPassword,
};
