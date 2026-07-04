import { Product } from '../models/product.model.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import { StatusCodes } from 'http-status-codes';
import client from '../lib/redis.js';
export const getAllProducts = async (req, res, next) => {
  const products = await Product.find({});
  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        products,
        'Products fetched successfully',
      ),
    );
};

export const getFeaturedProducts = async (req, res, next) => {


    // ? check in redis first
    let featuredProducts=await redis.get("featured-products");

    if(featuredProducts){
        return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, featuredProducts, 'Featured products fetched successfully'));    
    }

    // ?if not in redis, fetch from mongodb

    //! .lean() returns a plain javascript object instead of a mongoose document, which is more efficient for read operations

    featuredProducts=await Product.find({isFeatured:true}).lean();


    // ? update in the redis
    await redis.set("featured-products",JSON.stringify(featuredProducts));
    return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, featuredProducts, 'Featured products fetched successfully'));        


};
