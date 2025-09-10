import { StatusCodes } from "http-status-codes";
const notFound = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).send("<h1>Seite nicht gefunden</h1>");
};

export default notFound;
