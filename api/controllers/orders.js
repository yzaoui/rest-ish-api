const mongoose = require("mongoose");

const Order = require("../models/order");
const Product = require("../models/product");

exports.ordersGetAll = (req, res, next) => {
    Order.find()
        .select("_id productId quantity")
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => ({
                    _id: doc._id,
                    productId: doc.productId,
                    quantity: doc.quantity,
                    request: {
                        type: "GET",
                        url: `http://localhost:3000/orders/${doc._id}`
                    }
                })),
            });
        })
        .catch(err => {
            res.status(500).json({ error: err })
        })
};

exports.ordersCreateOrder = (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {
            if (!product) return res.status(404).json({ message: "Product not found" });
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                productId: req.body.productId
            });
            return order.save();
        })
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Order created",
                order: {
                    _id: result._id,
                    productId: result.productId,
                    quantity: result.quantity
                },
                request: {
                    type: "GET",
                    url: `http://localhost:3000/orders/${result._id}`
                }
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err })
        });
};

exports.ordersGetOrder = (req, res, next) => {
    Order.findById(req.params.orderId)
        .then(order => {
            if (!order) return res.status(404).json({ message: "Order not found" });

            res.status(200).json({
                order: order,
                request: {
                    type: "GET",
                    url: "http://localhost:3000/orders"
                }
            })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err })
        });
};

exports.ordersDeleteOrder = (req, res, next) => {
    Order.remove({ _id: req.params.orderId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Order deleted",
                request: {
                    type: "POST",
                    url: "http://localhost:3000/orders",
                    body: {
                        productId: "ObjectId",
                        quantity: "Number"
                    }
                }
            })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err })
        })
};
