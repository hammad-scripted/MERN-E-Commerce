import { config } from 'dotenv';
config();

import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import { Coupon } from '../models/coupon.model.js';
import { stripe } from '../lib/stripe.js';
import {Order} from '../models/order.model.js';
export const createCheckoutSession = async (req, res, next) => {
  const { products, couponCode } = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid products'));
  }

  let totalAmount = 0;

  const lineItems = products.map((product) => {
    const amount = Math.round(product.price * 100);

    totalAmount += amount * product.quantity;

    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name,
          images: [product.image],
        },
        unit_amount: amount,
      },
      quantity: product.quantity,
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

    totalAmount = Math.round(
      totalAmount * (1 - coupon.discountPercentage / 100),
    );
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems,
    success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/cancel`,
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
        products.map((product) => ({
          name: product.name,
          quantity: product.quantity,
          price: product.price,
          id: product._id.toString(),
         
        })),
      ),
    },
  });

  if (totalAmount >= 20000) {
    await createNewCoupon(req.user._id);
  }

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      true,
      {
        id: session.id,
        totalAmount: totalAmount / 100,
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
  await Coupon.create({
    userId,
    code: 'GIFT' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
  });
}

export const createSuccessSession = async (req, res, next) => {
  const { sessionId } = req.body;

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

  const existingOrder = await Order.findOne({
    stripeSessionId: session.id,
  });

  if (existingOrder) {
    return res.status(StatusCodes.OK).json(
      new ApiResponse(
        true,
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

  const products = JSON.parse(session.metadata.products);

  const newOrder = await Order.create({
    user: session.metadata.userId,
    products: products.map((product) => ({
      product: product.id,
      quantity: product.quantity,
      price: product.price,
    })),
    totalAmount: session.amount_total / 100,
    stripeSessionId: session.id,
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      true,
      newOrder,
      'Payment successful, order created and coupon deactivated if any'
    )
  );
};