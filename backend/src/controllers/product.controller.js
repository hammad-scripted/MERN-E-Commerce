import { Product } from '../models/product.model.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import { StatusCodes } from 'http-status-codes';
import client from '../lib/redis.js';
import cloudinary from './../lib/cloudinary.js';
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
  let featuredProducts = await redis.get('featured-products');

  if (featuredProducts) {
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          featuredProducts,
          'Featured products fetched successfully',
        ),
      );
  }

  // ?if not in redis, fetch from mongodb

  //! .lean() returns a plain javascript object instead of a mongoose document, which is more efficient for read operations

  featuredProducts = await Product.find({ isFeatured: true }).lean();

  // ? update in the redis
  await redis.set('featured-products', JSON.stringify(featuredProducts));
  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        featuredProducts,
        'Featured products fetched successfully',
      ),
    );
};

export const createProducts = async (req, res, next) => {
  const { name, description, price, image, category } = req.body;

  let cloudinaryResponse = null;

  if (image) {
    cloudinaryResponse = await cloudinary.uploader.upload(image, {
      folder: 'products',
    });
  }

  const product = await Product.create({
    name,
    description,
    price,
    image: cloudinaryResponse?.secure_url || '',
    category,
  });

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(
        StatusCodes.CREATED,
        product,
        'Product created successfully',
      ),
    );
};

export const deleteProduct = async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return next(new ApiError(StatusCodes.NOT_FOUND, null, 'Product not found'));
  }

  if (product.image) {
    const publicId = product.image.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`products/${publicId}`);

    await Product.findByIdAndDelete(id);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          product,
          'Product deleted successfully',
        ),
      );
  }
};

export const getRecommendedProducts = async (req, res, next) => {};
