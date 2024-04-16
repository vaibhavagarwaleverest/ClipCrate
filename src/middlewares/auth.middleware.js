import jwt  from "jsonwebtoken";
import { Users } from "../models/users.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandlers } from "../utils/asyncHandler.js";

const auth = asyncHandlers(async (req, _, next) => {
  try {
    console.log(req.cookies);
    const token =
      req.cookies?.access_token ||
      req.header("Authorization")?.replace("Bearer ", "");
    console.log(token)
    if (!token) {
      throw new ApiError(401, "Unauthorized Request");
    }
    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(decodeToken)
    // if(!decodeToken)
    // {
    //     throw new ApiError(401,"Access token is expired ")
    // }
    const user = await Users.findById(decodeToken?._id).select(
      "-refreshToken -password"
    );
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export { auth };
