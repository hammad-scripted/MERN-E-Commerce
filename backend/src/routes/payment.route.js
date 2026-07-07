import express from 'express';
import { Router } from 'express';
import { protectRoute } from '../middlewares/protect.js';
import {createCheckoutSession} from '../controllers/payment.controller.js'
export const router = Router();

router.post('/create-checkout-session', protectRoute, createCheckoutSession);

router.post("/checkout-success", protectRoute, async(req,res,next)=>{

    const{sessionId}=req.body;
    const session=await stripe.checkout.sessions.retrieve(sessionId);

    if(session.payment_status==='paid'){
        if(session.metadata.couponCode){
            await Coupon.findOneAndUpdate({code:session.metadata.couponCode},{isActive:false});
        }


        const products=JSON.parse
       
    }
})


