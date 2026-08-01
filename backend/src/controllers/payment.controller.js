import { config } from 'dotenv';
config();

import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import { Coupon } from '../models/coupon.model.js';
import { stripe } from '../lib/stripe.js';
import {Order} from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { isValidObjectId } from 'mongoose';
export const createCheckoutSession = async (req, res, next) => {
  const { products, couponCode } = req.body;
  const frontendOrigin =
    req.headers.origin || process.env.CLIENT_URL || 'https://mern-e-commerce-xrw8.onrender.com';

  if (!Array.isArray(products) || products.length === 0) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid products'));
  }

  const requestedProducts = products.map(({ _id, quantity }) => ({
    productId: _id,
    quantity: Number(quantity),
  }));

  const hasInvalidProduct = requestedProducts.some(
    ({ productId, quantity }) =>
      !isValidObjectId(productId) || !Number.isInteger(quantity) || quantity < 1,
  );

  if (hasInvalidProduct) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid products'));
  }

  const productIds = requestedProducts.map(({ productId }) => productId);
  const databaseProducts = await Product.find({ _id: { $in: productIds } }).lean();
  const productsById = new Map(
    databaseProducts.map((product) => [product._id.toString(), product]),
  );

  if (productsById.size !== new Set(productIds.map(String)).size) {
    return next(new ApiError(StatusCodes.NOT_FOUND, 'One or more products no longer exist'));
  }

  // Prices, names, and images come from the database—not from editable
  // browser data—so checkout amounts cannot be tampered with.
  const orderProducts = requestedProducts.map(({ productId, quantity }) => {
    const product = productsById.get(productId.toString());
    return { product, quantity };
  });

  let originalAmount = 0;
  const lineItems = orderProducts.map(({ product, quantity }) => {
    const amount = Math.round(product.price * 100);

    originalAmount += amount * quantity;

    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name,
          images: [product.image],
        },
        unit_amount: amount,
      },
      quantity,
    };
  });

  let coupon = null;

  if (couponCode) {
    coupon = await Coupon.findOne({
      code: couponCode,
      userId: req.user._id,
      isActive: true,
    });

    if (!coupon) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid coupon code'));
    }

    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();

      return next(new ApiError(StatusCodes.BAD_REQUEST, 'Coupon Code expired'));
    }
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems,
    success_url: `${frontendOrigin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendOrigin}/cancel`,
    discounts: coupon
      ? [
          {
            coupon: await createStripeCoupon(coupon.discountPercentage),
          },
        ]
      : [],
    metadata: {
      userId: req.user._id.toString(),
      couponCode: couponCode || '',
      products: JSON.stringify(
        orderProducts.map(({ product, quantity }) => ({
          quantity,
          price: product.price,
          id: product._id.toString(),
        })),
      ),
    },
  });

  if (originalAmount >= 20000) {
    await createNewCoupon(req.user._id);
  }

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        id: session.id,
        url: session.url,
        totalAmount: session.amount_total / 100,
      },
      'Checkout session created successfully',
    ),
  );
};

async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    duration: 'once',
    percent_off: discountPercentage,
  });

  return coupon.id;
}

async function createNewCoupon(userId) {

  await Coupon.findOneAndDelete({ userId});
  const newCoupon = await Coupon.create({
    userId,
    code: 'GIFT' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
  });
}

export const createSuccessSession = async (req, res, next) => {
  const { sessionId } = req.body;

  if (!sessionId || typeof sessionId !== 'string') {
    return next(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid checkout session'));
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session) {
    return next(
      new ApiError(StatusCodes.NOT_FOUND, 'Checkout session not found')
    );
  }

  if (session.payment_status !== 'paid') {
    return next(
      new ApiError(StatusCodes.BAD_REQUEST, 'Payment not completed')
    );
  }

  if (session.metadata.userId !== req.user._id.toString()) {
    return next(new ApiError(StatusCodes.FORBIDDEN, 'Checkout session belongs to another user'));
  }

  let purchasedProducts;
  try {
    purchasedProducts = JSON.parse(session.metadata.products);
  } catch {
    return next(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid checkout session products'));
  }

  if (!Array.isArray(purchasedProducts)) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid checkout session products'));
  }

  const existingOrder = await Order.findOne({
    stripeSessionId: session.id,
  });

  if (existingOrder) {
    return res.status(StatusCodes.OK).json(
      new ApiResponse(
        StatusCodes.OK,
        existingOrder,
        'Order already exists'
      )
    );
  }

  if (session.metadata.couponCode) {
    await Coupon.findOneAndUpdate(
      {
        code: session.metadata.couponCode,
        userId: session.metadata.userId,
      },
      {
        isActive: false,
      }
    );
  }

  // This makes completion safe if the browser retries a successful payment.
  const newOrder = await Order.findOneAndUpdate(
    { stripeSessionId: session.id },
    {
      $setOnInsert: {
        user: session.metadata.userId,
        products: purchasedProducts.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalAmount: session.amount_total / 100,
        stripeSessionId: session.id,
      },
    },
    { new: true, upsert: true },
  );

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      newOrder,
      'Payment successful, order created and coupon deactivated if any'
    )
  );
};
