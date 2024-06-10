const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/paymentModel');
const ErrorHandler = require('../utils/errorHandler');

// Process Stripe Payment
exports.processStripePayment = asyncErrorHandler(async (req, res, next) => {
    // Ensure the amount is in Vietnamese dong, not multiplied by 100
    const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,  // Amount directly in Vietnamese dong
        currency: "vnd",
        metadata: {
            company: "YourCompanyName",
        },
    });

    res.status(200).json({
        success: true,
        client_secret: myPayment.client_secret,
    });
});

exports.getStripeApiKey = asyncErrorHandler(async (req, res, next) => {
    res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
});
