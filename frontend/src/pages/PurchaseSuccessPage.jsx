import { ArrowRight, CheckCircle, HandHeart, LoaderCircle, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import axiosInstance from "../lib/axios";
import Confetti from "react-confetti";

const PurchaseSuccessPage = () => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    const [isProcessing, setIsProcessing] = useState(Boolean(sessionId));
    const [checkoutError, setCheckoutError] = useState(null);
    const processedSessionId = useRef(null);
    const { clearCart } = useCartStore();
    const error = sessionId ? null : "No session ID found in the URL";

    useEffect(() => {
        const handleCheckoutSuccess = async (sessionId) => {
            try {
                await axiosInstance.post("/payment/checkout-success", {
                    sessionId,
                });
                const wasCartCleared = await clearCart();
                if (!wasCartCleared) {
                    setCheckoutError("Payment succeeded, but we could not clear your cart. Please refresh this page.");
                }
            } catch (error) {
                console.error("Failed to complete checkout:", error);
                setCheckoutError("We could not confirm your payment. Please refresh the page or contact support.");
            } finally {
                setIsProcessing(false);
            }
        };

        // React Strict Mode runs effects twice in development. Only complete a
        // Stripe session once so the order-creation request is not duplicated.
        if (sessionId && processedSessionId.current !== sessionId) {
            processedSessionId.current = sessionId;
            handleCheckoutSuccess(sessionId);
        }
    }, [clearCart, sessionId]);

    if (isProcessing) {
        return (
            <div className='min-h-screen flex items-center justify-center px-4'>
                <div className='w-full max-w-md rounded-lg border border-emerald-500/30 bg-gray-800 p-8 text-center shadow-xl'>
                    <LoaderCircle className='mx-auto mb-4 h-12 w-12 animate-spin text-emerald-400' />
                    <h1 className='text-2xl font-bold text-white'>Confirming your payment</h1>
                    <p className='mt-2 text-gray-300'>Please do not close this page.</p>
                </div>
            </div>
        );
    }

    if (error || checkoutError) {
        return (
            <div className='min-h-screen flex items-center justify-center px-4'>
                <div className='w-full max-w-md rounded-lg border border-red-500/30 bg-gray-800 p-8 text-center shadow-xl'>
                    <AlertCircle className='mx-auto mb-4 h-12 w-12 text-red-400' />
                    <h1 className='text-2xl font-bold text-white'>Checkout needs attention</h1>
                    <p className='mt-2 text-gray-300'>{checkoutError || error}</p>
                    <Link to='/' className='mt-6 inline-flex items-center text-emerald-400 hover:text-emerald-300'>
                        Return home <ArrowRight className='ml-2' size={18} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className='h-screen flex items-center justify-center px-4'>
            <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                gravity={0.1}
                style={{ zIndex: 99 }}
                numberOfPieces={700}
                recycle={false}
            />

            <div className='max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10'>
                <div className='p-6 sm:p-8'>
                    <div className='flex justify-center'>
                        <CheckCircle className='text-emerald-400 w-16 h-16 mb-4' />
                    </div>
                    <h1 className='text-2xl sm:text-3xl font-bold text-center text-emerald-400 mb-2'>
                        Purchase Successful!
                    </h1>

                    <p className='text-gray-300 text-center mb-2'>
                        Thank you for your order. {"We're"} processing it now.
                    </p>
                    <p className='text-emerald-400 text-center text-sm mb-6'>
                        Check your email for order details and updates.
                    </p>
                    <div className='bg-gray-700 rounded-lg p-4 mb-6'>
                        <div className='flex items-center justify-between mb-2'>
                            <span className='text-sm text-gray-400'>Order number</span>
                            <span className='text-sm font-semibold text-emerald-400'>#{sessionId.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className='flex items-center justify-between'>
                            <span className='text-sm text-gray-400'>Estimated delivery</span>
                            <span className='text-sm font-semibold text-emerald-400'>3-5 business days</span>
                        </div>
                    </div>

                    <div className='space-y-4'>
                        <button
                            className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4
             rounded-lg transition duration-300 flex items-center justify-center'
                        >
                            <HandHeart className='mr-2' size={18} />
                            Thanks for trusting us!
                        </button>
                        <Link
                            to={"/"}
                            className='w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4 
            rounded-lg transition duration-300 flex items-center justify-center'
                        >
                            Continue Shopping
                            <ArrowRight className='ml-2' size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default PurchaseSuccessPage;
