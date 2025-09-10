import { createJWT } from "./index.js";

const attachCookie = ({ res, user, refreshTokenCrypto }) => {
  const accessTokenJWT = createJWT({ payload: { user } });
  const refreshTokenJWT = createJWT({ payload: { user, refreshTokenCrypto } });

  const oneDay = 1000 * 60 * 60 * 24;
  const twoMonths = oneDay * 60;
  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    signed: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + oneDay),
  });
  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    expires: new Date(Date.now() + twoMonths),
    signed: true,
    secure: process.env.NODE_ENV === "production",
  });
};

export default attachCookie;
