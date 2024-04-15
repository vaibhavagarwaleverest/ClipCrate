import { Jwt } from "jsonwebtoken";
import { Users } from "../models/users.model";
import ApiError from "../utils/ApiError";
import { asyncHandlers } from "../utils/asyncHandler";

const auth = asyncHandlers(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized Request");
    }
    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

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
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export { auth };
