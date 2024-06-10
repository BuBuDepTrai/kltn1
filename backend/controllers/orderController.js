const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// Create New Order
exports.newOrder = asyncErrorHandler(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        totalPrice,
    } = req.body;

    const orderSignature = hashOrderDetails(orderItems, req.user._id);

    const recentOrder = await Order.findOne({
        user: req.user._id,
        orderSignature,
        createdAt: {
            $gt: new Date(Date.now() - 10 * 60 * 1000) // Adjust time range as necessary
        }
    });

    if (recentOrder) {
        console.log("Duplicate order detected:", recentOrder);
        return next(new ErrorHandler("Order Already Placed", 400));
    }

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
        orderSignature
    });

     const emailContent = `
     <h1>Order Confirmation</h1>
     <p>Thank you for your order, ${req.user.name}!</p>
     <h2>Order Details:</h2>
     <p><strong>Order ID:</strong> ${order._id}</p>
     <p><strong>Total Price:</strong> $${totalPrice}</p>
     <h3>Items Ordered:</h3>
     <ul>
         ${orderItems.map(item => `<li>${item.product} - Quantity: ${item.quantity}</li>`).join('')}
     </ul>
     <h3>Shipping Information:</h3>
     <p>${shippingInfo.name}</p>
     <p>${shippingInfo.address}</p>
     <p>${shippingInfo.city}, ${shippingInfo.zipCode}</p>
     <p>${shippingInfo.country}</p>
 `;

 try {
     await sendEmail({
         email: req.user.email,
         subject: "Your Order Confirmation",
         message: emailContent
     });
     res.status(201).json({
         success: true,
         order
     });
 } catch (error) {
     console.error("Failed to send confirmation email", error);
     next(new ErrorHandler("Email could not be sent", 500));
 }
});

function hashOrderDetails(orderItems, userId) {
 const orderDetails = orderItems.map(item => `${item.product}-${item.quantity}`).join('|');
 return crypto.createHash('md5').update(orderDetails + userId).digest('hex');
}

// Get Single Order Details
exports.getSingleOrderDetails = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    res.status(200).json({
        success: true,
        order,
    });
});

// Get Logged In User Orders
exports.myOrders = asyncErrorHandler(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id });

    if (!orders) {
        return next(new ErrorHandler("No Orders Found", 404));
    }

    res.status(200).json({
        success: true,
        orders,
    });
});

// Get All Orders ---ADMIN
exports.getAllOrders = asyncErrorHandler(async (req, res, next) => {
    const orders = await Order.find();

    if (!orders) {
        return next(new ErrorHandler("No Orders Found", 404));
    }

    let totalAmount = 0;
    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        orders,
        totalAmount,
    });
});

// Update Order Status ---ADMIN
exports.updateOrder = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("Already Delivered", 400));
    }

    if (req.body.status === "Shipped") {
        order.shippedAt = Date.now();
        order.orderItems.forEach(async (i) => {
            await updateStock(i.product, i.quantity);
        });
    }

    order.orderStatus = req.body.status;
    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });
});

async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    product.stock -= quantity;
    await product.save({ validateBeforeSave: false });
}

// Delete Order ---ADMIN
exports.deleteOrder = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    await order.remove();

    res.status(200).json({
        success: true,
    });
});
