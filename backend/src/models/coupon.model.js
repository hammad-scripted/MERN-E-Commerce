import {Schema,model} from 'mongoose';
const couponSchema=new Schema({


    code:{
        type:String,
        required:true,
        unique:true
    }
    ,
    discountPercentage:{
        type:Number,
        required:true,
        min:0,
        max:100
    },
    expirationDate:{
        type:Date,
        required:true   
    },
    isActive:{
        type:Boolean,
        default:true        
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},{timestamps:true});

export const Coupon=model('Coupon',couponSchema);