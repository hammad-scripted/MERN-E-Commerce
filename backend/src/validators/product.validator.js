import { body } from 'express-validator';

export const productValidationRules = () => {
  return [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Product name is required'),

    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required'),

    body('price')
      .notEmpty()
      .withMessage('Price is required')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),

    body('image')
      .trim()
      .notEmpty()
      .withMessage('Image is required')
      .isURL()
      .withMessage('Image must be a valid URL'),

    body('isFeatured')
      .optional()
      .isBoolean()
      .withMessage('isFeatured must be true or false'),
  ];
};