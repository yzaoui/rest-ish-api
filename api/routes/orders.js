const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = require("../models/order");
const Product = require("../models/product");

router.get("/", (req, res, next) => {
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
});

router.post("/", (req, res, next) => {
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
});

router.get("/:orderId", (req, res, next) => {
    res.status(200).json({
        message: "Order details",
        orderId: req.params.orderId
    });
});

router.delete("/:orderId", (req, res, next) => {
    res.status(200).json({
        message: "Order deleted",
        orderId: req.params.orderId
    });
});

module.exports = router;
