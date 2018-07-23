const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

const ProductsController = require("../controllers/user");

router.post("/signup", ProductsController.userSignup);
router.post("/login", ProductsController.userLogin);
router.delete("/:userId", checkAuth, ProductsController.userDelete);

module.exports = router;
