import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import MetaData from '../Layouts/MetaData';
import PriceSidebar from './PriceSidebar';
import Stepper from './Stepper';
import { clearErrors, newOrder } from '../../actions/orderAction';
import { emptyCart } from '../../actions/cartAction';

const Payment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const [payDisable, setPayDisable] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('stripe');

    const { shippingInfo, cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.user);
    const { error } = useSelector((state) => state.newOrder);

    // Calculate base total price from cart items
    const baseTotalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Calculate shipping cost
    const shippingCost = baseTotalPrice > 3000000 ? 0 : 15000;

    // Total price including shipping
    const totalPrice = baseTotalPrice + shippingCost;

    const paymentData = {
        amount: Math.round(totalPrice),
        email: user.email,
        phoneNo: shippingInfo.phoneNo,
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setPayDisable(true);

        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };

            if (paymentMethod === 'stripe') {
                const { data } = await axios.post(
                    '/api/v1/payment/processStripe',
                    paymentData,
                    config
                );
                // Handle Stripe payment
            } else if (paymentMethod === 'cod') {
                // Handle COD payment
                dispatch(newOrder({
                    shippingInfo,
                    orderItems: cartItems,
                    totalPrice,
                    paymentInfo: {
                        id: 'COD',
                        status: 'pending'
                    }
                }));
                dispatch(emptyCart());
                navigate("/order/success");
            }

        } catch (error) {
            setPayDisable(false);
            enqueueSnackbar(error.message, { variant: "error" });
        }
    };

    useEffect(() => {
        if (error) {
            dispatch(clearErrors());
            enqueueSnackbar(error, { variant: "error" });
        }
    }, [dispatch, error, enqueueSnackbar]);

    return (
        <>
            <MetaData title="Secure Payment" />

            <main className="w-full mt-20">
                <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-11/12 mt-0 sm:mt-4 m-auto sm:mb-7">
                    <div className="flex-1">
                        <Stepper activeStep={3}>
                            <div className="w-full bg-white">
                                <form onSubmit={submitHandler} autoComplete="off" className="flex flex-col justify-start gap-2 w-full mx-8 my-4 overflow-hidden">
                                    <FormControl>
                                        <RadioGroup
                                            aria-labelledby="payment-radio-group"
                                            defaultValue="stripe"
                                            name="payment-radio-button"
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        >
                                            <FormControlLabel
                                                value="stripe"
                                                control={<Radio />}
                                                label={<div className="flex items-center gap-4">Stripe</div>}
                                            />
                                            <FormControlLabel
                                                value="cod"
                                                control={<Radio />}
                                                label={<div className="flex items-center gap-4">Cash on Delivery</div>}
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                    <input type="submit" value={`Pay ${totalPrice.toLocaleString()}đ`} disabled={payDisable} className={`${payDisable ? "bg-primary-grey cursor-not-allowed" : "bg-primary-orange cursor-pointer"} w-1/2 sm:w-1/4 my-2 py-3 font-medium text-white shadow hover:shadow-lg rounded-sm uppercase outline-none`} />
                                </form>
                            </div>
                        </Stepper>
                    </div>
                    <PriceSidebar cartItems={cartItems} totalPrice={totalPrice} />
                </div>
            </main>
        </>
    );
};

export default Payment;
