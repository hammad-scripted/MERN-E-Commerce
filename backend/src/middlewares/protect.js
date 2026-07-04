import { verifyAccessToken,verifyRefreshToken } from "../utils/token.js";
import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import {User} from '../models/user.model.js';
export const protectRoute=async(req,res,next)=>{
   const refreshToken=req.cookies.refreshToken;
   const accessToken=req.cookies.accessToken;


   if(!refreshToken || !accessToken){
    return res.status(StatusCodes.UNAUTHORIZED).json(new ApiError(StatusCodes.UNAUTHORIZED,null,'Unauthorized: No token provided'));
   }

    const decodeAccessToken= verifyAccessToken(accessToken);
    const decodeRefreshToken= verifyRefreshToken(refreshToken);
    if(!decodeAccessToken || !decodeRefreshToken){
        return res.status(StatusCodes.UNAUTHORIZED).json(new ApiError(StatusCodes.UNAUTHORIZED,null,'Unauthorized:Token is not valid'));
    }
    const user = await User.findById(decodeAccessToken.userId).select('-password');
    if(!user){
        return res.status(StatusCodes.UNAUTHORIZED).json(new ApiError(StatusCodes.UNAUTHORIZED,null,'Unauthorized:User not found'));    
    }
    console.log(user);
    req.user=user;
    next();
}

export const adminRoute=async(req,res,next)=>{

    if(req.user && req.user.role!=='admin'){
        return res.status(StatusCodes.FORBIDDEN).json(new ApiError(StatusCodes.FORBIDDEN,null,'Access Denied , user is not admin!!'));
    }
    next();
}