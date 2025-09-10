import { StatusCodes } from "http-status-codes";
import path from "path";
const __dirname = path.resolve();
import { BadRequestError } from "../errors/index.js";
import { v2 as cloudinary } from "cloudinary";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";
import sanitize from "sanitize-filename";

const uploadFileLocal = async (req, res) => {
  if (!req.files.file) {
    throw new BadRequestError("Keine Datei hochgeladen");
  }
  const file = req.files.file;
  if (!file.mimetype.endsWith("pdf")) {
    throw new BadRequestError("Bitte laden Sie eine PDF-Datei hoch");
  }
  const maxSize = 1024 * 1024;
  if (file.size > maxSize) {
    throw new BadRequestError(
      "Bitte laden Sie eine Datei hoch, die kleiner als 1MB ist."
    );
  }

  const uniqueSuffix = uuidv4();
  const fileExtension = path.extname(file.name);
  const storedFilename = `${uniqueSuffix}${fileExtension}`;

  const filePath = path.join(
    __dirname,
    "./public/uploads/" + `${storedFilename}`
  );

  await file.mv(filePath);

  return res.status(StatusCodes.OK).json({
    originalFilename: sanitize(file.name),
    storedFilename: storedFilename,
    filePath: `/uploads/${storedFilename}`,
  });
};

const uploadFile = async (req, res) => {
  const result = await cloudinary.uploader.upload(req.files.file.tempFilePath, {
    use_filename: true,
  });
  fs.unlinkSync(req.files.file.tempFilePath);
  return res.status(StatusCodes.OK).json({ file: { src: result.secure_url } });
};

export { uploadFileLocal, uploadFile };
