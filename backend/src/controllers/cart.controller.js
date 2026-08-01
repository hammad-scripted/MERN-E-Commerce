import { Product } from '../models/product.model.js';
import { User } from '../models/user.model.js';
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
      StatusCodes.OK,
      user.cartItems,
      'Product added to cart'
    )
  );
};

export const removeAllFromCart = async (req, res, next) => {
  const { productId } = req.body || {};

  const user = req.user;

  if (!productId) {
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: { cartItems: [] } },
      { new: true },
    );

    if (!updatedUser) {
      return next(new ApiError(StatusCodes.NOT_FOUND, 'User not found'));
    }

    return res.status(StatusCodes.OK).json(
      new ApiResponse(
        StatusCodes.OK,
        updatedUser.cartItems,
        'Cart cleared successfully',
      ),
    );
  }

  user.cartItems = user.cartItems.filter(
    (item) => item.product.toString() !== productId
  );

  await user.save();

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      user.cartItems,
      'Product removed from cart'
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
        StatusCodes.OK,
        user.cartItems,
        'Product removed from cart'
      )
    );
  }

  existingItem.quantity = quantity;

  await user.save();

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      user.cartItems,
      'Product quantity updated'
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
      StatusCodes.OK,
      cartItems,
      'Cart fetched successfully'
    )
  );
};
