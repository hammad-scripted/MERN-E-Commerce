import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import ApiError from '../utils/apiError.js';
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

// ? password hashing using bcrypt and mongoose prehook

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return 

  try{

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(this.password, salt);
      this.password = password;
  }
  catch(error){
    console.log(error);

    throw new ApiError(500, 'Password hashing failed', [], error);
  }

});

// ? compare password using bcrypt and mongoose instance method

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
export const User = model('User', userSchema);
