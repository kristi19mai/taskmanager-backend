import { BadRequestError, UnauthenticatedError } from "../errors/index.js";
import User from "../models/User.js";
import Token from "../models/Token.js";
import {
  attachCookie,
  createUserPayload,
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash,
} from "../utils/index.js";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";

const register = async (req, res) => {
  const { email, name, password } = req.body;
  // check if email already exists
  const isEmailExists = await User.findOne({ email });
  if (isEmailExists) {
    throw new BadRequestError("E-Mail existiert bereits");
  }
  // first registered user is admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";
  const verificationToken = crypto.randomBytes(40).toString("hex");

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  });
  

  const origin = req.get("origin");

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin,
  });

  res.status(StatusCodes.CREATED).json({
    msg: "Erfolg! Bitte überprüfen Sie Ihre E-Mail, um Ihr Konto zu bestätigen",
    // only for postman verification
    // token: verificationToken,
  });
};

const verifyEmail = async (req, res) => {
  const { email, verificationToken } = req.body;
  console.log(email, verificationToken);

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Überprüfung fehlgeschlagen");
  }
  if (user.verificationToken !== verificationToken) {
    throw new UnauthenticatedError("Überprüfung fehlgeschlagen");
  }
  user.isVerified = true;
  user.verified = Date.now();
  user.verificationToken = "";
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "E-Mail verifiziert" });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Geben Sie Ihre Email und Ihres Kennwort");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Ungültige Anmeldedaten");
  }
  const passwordIsValid = await user.comparePassword(password);
  if (!passwordIsValid) {
    throw new UnauthenticatedError("Ungültige Anmeldedaten");
  }
  if (!user.isVerified) {
    throw new UnauthenticatedError("Bitte bestätigen Sie Ihre E-Mail");
  }
  // token
  const payloadUser = createUserPayload(user);

  // create refresh token
  let refreshTokenCrypto = "";

  //check for existing token
  const existingToken = await Token.findOne({ user: user._id });
  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new UnauthenticatedError("Ungültige Anmeldedaten");
    }
    refreshTokenCrypto = existingToken.refreshToken;
    attachCookie({ res, user: payloadUser, refreshTokenCrypto });

    res.status(200).json({ user: payloadUser });
    return;
  }

  refreshTokenCrypto = crypto.randomBytes(40).toString("hex");
  const refreshTokenObj = {
    refreshToken: refreshTokenCrypto,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
    user: user._id,
  };
  await Token.create(refreshTokenObj);

  attachCookie({ res, user: payloadUser, refreshTokenCrypto });

  res.status(200).json({ user: payloadUser });
};

const logout = async (req, res) => {
  const { userId } = req.user;
  await Token.findOneAndDelete({ user: userId });
  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "Benutzer abgemeldet" });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError("Bitte geben Sie eine gültige E-Mail-Adresse an");
  }
  const user = await User.findOne({ email: email });
  if (user) {
    const passToken = crypto.randomBytes(70).toString("hex");
    //send email
    const origin = req.get("origin");
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      origin: origin,
      token: passToken,
    });
    // save user
    const tenMinutes = 1000 * 60 * 10;
    const passTokenExpirationDate = new Date(Date.now() + tenMinutes);
    user.passwordToken = createHash(passToken);
    user.passwordTokenExpirationDate = passTokenExpirationDate;
    await user.save();
  }
  res.status(StatusCodes.OK).json({
    msg: "Bitte überprüfen Sie Ihre E-Mail, um Ihr Passwort zurückzusetzen",
  });
};
const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password) {
    throw new BadRequestError("Bitte alle Werte angeben");
  }
  const user = await User.findOne({ email: email });
  if (user) {
    const currentDate = new Date();
    if (
      user.passwordToken === createHash(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    }
  }
  res.status(StatusCodes.OK).json({
    msg: "Erfolgreich! Weiterleitung zur Anmeldeseite erfolgt in Kürze.",
  });
};

export { register, login, logout, verifyEmail, forgotPassword, resetPassword };
