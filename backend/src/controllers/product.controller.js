import {Product} from '../models/product.model.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js'
import {StatusCodes} from 'http-status-codes'
export const getAllProducts=async(req,res,next)=>{

    const products=await Product.find({});
    return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, products, "Products fetched successfully"));
}