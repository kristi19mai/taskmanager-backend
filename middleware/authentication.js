import { UnauthenticatedError, UnauthorizedError } from "../errors/index.js";
import Token from "../models/Token.js";
import { attachCookie, isTokenValid } from "../utils/index.js";

const authentication = async (req, res, next) => {
  const { accessToken, refreshToken } = req.signedCookies;
 
  try {
    if (accessToken) {
      const payload = isTokenValid(accessToken);
      req.user = payload.user;
      console.log(req.user);
      
      console.log("access token:" + payload.user);

      return next();
    }
    const payload = isTokenValid(refreshToken);

    console.log(payload.user, payload.refreshTokenCrypto);

    const existingToken = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshTokenCrypto,
    });
    if (!existingToken || !existingToken?.isValid) {
      throw new UnauthenticatedError("Authentifizierung ungültig");
    }
    req.user = payload.user;
    attachCookie({
      res,
      user: payload.user,
      refreshTokenCrypto: existingToken.refreshToken,
    });
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentifizierung ungültig");
  }
};

const authorizePermissions = (...rest) => {
  return async function (req, res, next) {
    if (!rest.includes(req.user.role)) {
      throw new UnauthorizedError(
        "Der Zugriff auf diese Route ist nicht autorisiert"
      );
    }
    next();
  };
};
export { authentication, authorizePermissions };
