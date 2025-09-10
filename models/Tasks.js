import mongoose from "mongoose";
import moment from "moment";
import "moment/locale/de.js";

const { Schema } = mongoose;

const TaskSchema = new Schema(
  {
    task: {
      type: String,
      required: [true, "Bitte geben Sie den Namen des Todos ein"],
      minLength: 1,
      maxLength: [
        150,
        "Die Länge des Todonamens darf 150 Zeichen nicht überschreiten.",
      ],
      trim: [true, "Bitte geben Sie den Namen des Todos ein"],
    },
    description: {
      type: String,
      maxLength: [
        210,
        "Die Länge der Notizen darf 210 Zeichen nicht überschreiten.",
      ],
      trim: true,
      default: "",
    },
    important: { type: Boolean, default: false },
    status: {
      type: String,
      default: "in bearbeitung",
      enum: ["in bearbeitung", "erledigt"],
    },
    storedFilename: { type: String, default: "" },
    originalFilename: { type: String, default: "" },
    dueDate: { type: Date },

    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "bitte geben Sie Benutzer ID ein"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Task", TaskSchema);
