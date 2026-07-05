import { Product } from '../models/product.model.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import { StatusCodes } from 'http-status-codes';

export const addToCart = async (req, res, next) => {
  const { productId } = req.body;

  const user = req.user;

  // Check if product exists
  const product = await Product.findById(productId);

  if (!product) {
    return next(
      new ApiError(
        StatusCodes.NOT_FOUND,
        null,
        'Product not found'
      )
    );
  }

  const existingItem = user.cartItems.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    user.cartItems.push({
      product: productId,
      quantity: 1,
    });
  }

  await user.save();

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      true,
      StatusCodes.OK,
      'Product added to cart',
      user.cartItems
    )
  );
};

export const removeAllFromCart = async (req, res, next) => {
  const { productId } = req.body;

  const user = req.user;

  if (!productId) {
    user.cartItems = [];
  } else {
    user.cartItems = user.cartItems.filter(
      (item) => item.product.toString() !== productId
    );
  }

  await user.save();

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      true,
      StatusCodes.OK,
      'Product removed from cart',
      user.cartItems
    )
  );
};

export const updateQuantity = async (req, res, next) => {
  const { id: productId } = req.params;
  const { quantity } = req.body;

  const user = req.user;

  const existingItem = user.cartItems.find(
    (item) => item.product.toString() === productId
  );

  if (!existingItem) {
    return next(
      new ApiError(
        StatusCodes.NOT_FOUND,
        null,
        'Product not found in cart'
      )
    );
  }

  if (quantity <= 0) {
    user.cartItems = user.cartItems.filter(
      (item) => item.product.toString() !== productId
    );

    await user.save();

    return res.status(StatusCodes.OK).json(
      new ApiResponse(
        true,
        StatusCodes.OK,
        'Product removed from cart',
        user.cartItems
      )
    );
  }

  existingItem.quantity = quantity;

  await user.save();

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      true,
      StatusCodes.OK,
      'Product quantity updated',
      user.cartItems
    )
  );
};

export const getCartProducts = async (req, res, next) => {
  const user = req.user;

  const productIds = user.cartItems.map((item) => item.product);

  const products = await Product.find({
    _id: { $in: productIds },
  });

  const cartItems = products.map((product) => {
    const cartItem = user.cartItems.find(
      (item) => item.product.toString() === product._id.toString()
    );

    return {
      ...product.toObject(),
      quantity: cartItem.quantity,
    };
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      true,
      StatusCodes.OK,
      'Cart fetched successfully',
      cartItems
    )
  );
};