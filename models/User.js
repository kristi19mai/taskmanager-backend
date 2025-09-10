import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Bitte geben Sie Ihren Namen ein"],
    maxlength: [40, "Der Name darf 40 Zeichen nicht überschreiten."],
  },
  email: {
    type: String,
    required: [true, "Bitte geben Sie Ihre Email Adresse ein"],
    match:
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Bitte geben Sie Ihr Passwort ein"],
    minLength: [6, "Das Passwort soll mindestens 6 Zeichen lang sein"],
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  verificationToken: {
    type: String,
    default: "",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Date,
  },
  passwordToken: { type: String },
  passwordTokenExpirationDate: { type: Date },
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
};

export default mongoose.model("User", UserSchema);
