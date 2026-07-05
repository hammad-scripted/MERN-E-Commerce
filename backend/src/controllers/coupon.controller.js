import { Coupon } from '../models/coupon.model.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import { StatusCodes } from 'http-status-codes';

export const getCoupon = async (req, res) => {
  const coupon = await Coupon.findOne({
    userId: req.user._id,
    isActive: true,
  });
  if(!coupon){
   return next(
      new ApiError(
        StatusCodes.NOT_FOUND,
        null,
        'Coupon not found!'
      )
    );
  }

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        true,
        StatusCodes.OK,
        coupon,
        'Coupon fetched successfully',
      ),
    );
};

export const validateCoupon = async (req, res) => {
  const { code } = req.body;

  const coupon = await Coupon.findOne({
    code: code,
    userId: req.user._id,
    isActive: true,
  });

  if (coupon.expirationDate < new Date()) {
    coupon.isActive = false;
    await coupon.save();
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(false, StatusCodes.OK, null, 'Coupon Code expired'),
      );
  }

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        true,
        StatusCodes.OK,
        coupon,
        'Coupon fetched successfully',
      ),
    );
};
