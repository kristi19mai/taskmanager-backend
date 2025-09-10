import { StatusCodes } from "http-status-codes";

const errorHandlerMiddleware = (err, req, res, next) => {
  console.log(err);
  
  
  // error object
  const customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message:
      err.message ||
      "Etwas ist schiefgelaufen. Bitte versuchen Sie es später noch einmal.",
  };

  if (err.name === "ValidationError") {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.message = Object.values(err.errors)
      .map((item) => item.message)
      .join(",");
  }
  if (err.name === "CastError") {
    customError.statusCode = StatusCodes.NOT_FOUND;
    if (err.message.includes("Task")) {
      customError.message = `Keine Aufgabe mit der ID ${err.value} gefunden`;
    }
    if (err.message.includes("User")) {
      customError.message = `Kein Benutzer mit ID ${err.value} gefunden`;
    }
  }

  // Mongoose bad request error
  if (err.code && err.code === 11000) {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.message = `Doppelter Wert eingegeben für ${Object.keys(
      err.keyValue
    )}, bitte probieren Sie es erneut`;
  }
  return res.status(customError.statusCode).json(customError.message);
};

export default errorHandlerMiddleware;
