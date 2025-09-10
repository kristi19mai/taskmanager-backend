import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/index.js";
import path from "path";
const __dirname = path.resolve();
import * as fs from "fs";

const deleteFile = async (req, res) => {
  const { fileToDelete } = req.body;
  if (!fileToDelete) {
    throw new BadRequestError("Der Dateipfad ist nicht angegeben.");
  }
  const absoluteFilePath = path.join(
    __dirname,
    "./public/uploads/" + `${fileToDelete}`
  );
  if (
    !absoluteFilePath.startsWith(path.resolve(__dirname, "./public/uploads/"))
  ) {
    throw new UnauthorizedError("Zugriff verweigert.");
  }

  fs.unlink(absoluteFilePath, (err) => {
    if (err) {
      if (err.code === "ENOENT") {
        throw new NotFoundError("Datei nicht gefunden.");
      }
      console.error("Fehler beim Löschen der Datei:", err);
      return res.status(500).json({
        message: "Serverfehler beim Löschen der Datei.",
        error: err.message,
      });
    }
    res
      .status(200)
      .json({ message: `Die Datei ${fileToDelete} wurde erfolgreich gelöscht.` });
  });
};

export default deleteFile;
