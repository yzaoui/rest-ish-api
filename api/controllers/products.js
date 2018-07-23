const mongoose = require("mongoose");

const Product = require("../models/product");

exports.productsGetAll = (req, res, next) => {
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
};

exports.productsCreateProduct = (req, res, next) => {
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
};

exports.productsGetProduct = (req, res, next) => {
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
};

exports.productsUpdateProduct = (req, res, next) => {
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
};

exports.productsDeleteProduct = (req, res, next) => {
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
};
