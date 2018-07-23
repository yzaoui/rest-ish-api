const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./uploads/");
    },
    filename: (req, file, callback) => {
        callback(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB
    },
    filterFilter: (req, file, callback) => {
        // reject a file
        if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
            callback(null, true);
        } else {
            callback(null, false); // silently ignore storage of file
        }
    }
});

const Product = require("../models/product");

router.get("/", (req, res, next) => {
    Product.find()
        .select("_id name price productImage")
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => ({
                    _id: doc._id,
                    name: doc.name,
                    price: doc.price,
                    productImage: doc.productImage,
                    request: {
                        type: "GET",
                        url: `http://localhost:3000/products/${doc._id}`
                    }
                }))
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.post("/", checkAuth, upload.single("productImage"), (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product
        .save()
        .then(result => {
            res.status(201).json({
                message: "Product created",
                product: {
                    _id: result._id,
                    name: result.name,
                    price: result.price,
                    productImage: result.productImage,
                    request: {
                        type: "GET",
                        url: `http://localhost:3000/products/${result._id}`
                    }
                }
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err });
        });
});

router.get("/:productId", (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select("_id name price productImage")
        .exec()
        .then(doc => {
            console.log(doc);
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: "GET",
                        description: "Get all products",
                        url: `http://localhost:3000/products/${doc._id}`
                    }
                });
            } else {
                res.status(404).json({ message: "No valid entry found for provided ID" })
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err });
        });
});

router.patch("/:productId", checkAuth, (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Product updated",
                request: {
                    type: "GET",
                    url: `http://localhost:3000/products/${result._id}`
                }
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err });
        });
});

router.delete("/:productId", checkAuth,(req, res, next) => {
    const id = req.params.productId;
    Product.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Product deleted",
                request: {
                    type: "POST",
                    url: `http://localhost:3000/products`,
                    body: {
                        name: "String",
                        price: "Number"
                    }
                }
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err });
        });
});

module.exports = router;
