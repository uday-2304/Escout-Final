import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyToken = asyncHandler((req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check if the header exists and is formatted correctly
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Access denied. No token provided");
  }

  // 2. Extract the actual token string
  const token = authHeader.split(" ")[1];

  try {
    // 3. Verify the token against your secret
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    // 4. Attach the user ID to the request object
    // This allows the controller to access `req.user._id`
    req.user = { _id: decoded.id || decoded._id };
    
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }
});