import jwt from "jsonwebtoken";

const createJWT = ({payload}) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return token;
};

export default createJWT;
