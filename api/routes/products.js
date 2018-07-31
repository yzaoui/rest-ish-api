const express = require("express");
const router = express.Router();
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");

const ProductsController = require("../controllers/products");

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
    fileFilter: (req, file, callback) => {
        // reject a file
        if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
            callback(null, true);
        } else {
            callback(null, false); // silently ignore storage of file
        }
    }
});

const Product = require("../models/product");

router.get("/", ProductsController.productsGetAll);
router.post("/", checkAuth, upload.single("productImage"), ProductsController.productsCreateProduct);
router.get("/:productId", ProductsController.productsGetProduct);
router.patch("/:productId", checkAuth, ProductsController.productsUpdateProduct);
router.delete("/:productId", checkAuth,ProductsController.productsDeleteProduct);

module.exports = router;
