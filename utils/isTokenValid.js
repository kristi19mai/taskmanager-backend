import jwt from "jsonwebtoken";

const isTokenValid = ( token ) => jwt.verify(token, process.env.JWT_SECRET);

export default isTokenValid;
