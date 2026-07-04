import { verifyAccessToken,verifyRefreshToken } from "../utils/token.js";
import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
export const protect=async(req,res,next)=>{
   const refreshToken=req.cookies.refreshToken;
   const accessToken=req.cookies.accessToken;


   if(!refreshToken || !accessToken){
    return res.status(StatusCodes.UNAUTHORIZED).json(new ApiError(StatusCodes.UNAUTHORIZED,null,'Unauthorized'));
   }

    const decodeAccessToken= verifyAccessToken(accessToken);
    console.log(decodeAccessToken);
    const decodeRefreshToken= verifyRefreshToken(refreshToken);
    if(!decodeAccessToken || !decodeRefreshToken){
        return res.status(StatusCodes.UNAUTHORIZED).json(new ApiError(StatusCodes.UNAUTHORIZED,null,'Unauthorized'));
    }
    req.user=decodeAccessToken;
    next();
}