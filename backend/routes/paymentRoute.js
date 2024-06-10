const express = require('express');
const { processStripePayment, getStripeApiKey } = require('../controllers/paymentController');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

router.route('/payment/processStripe').post(isAuthenticatedUser, processStripePayment);
router.route('/stripeapikey').get(isAuthenticatedUser, getStripeApiKey);

module.exports = router;
