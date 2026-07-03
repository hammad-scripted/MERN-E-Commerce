import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    cartItems: [
      {
        quantity: {
          type: Number,
          default: 0,
        },
      },
    ],
    product: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
  },
  {
    timestamps: true,
  },
);

export const User = model('User', userSchema);
