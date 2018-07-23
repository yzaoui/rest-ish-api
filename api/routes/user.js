const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/user");

router.post("/signup", (req, res, next) => {
    User.find({ username: req.body.username })
        .exec()
        .then(users => {
            if (users.length) return res.status(409).json({
                message: "Username is unavailable"
            });

            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) return res.status(500).json({ error: err });

                const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    username: req.body.username,
                    password: hash
                });
                user.save()
                    .then(result => res.status(201).json({
                        message: "User created"
                    }))
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({ error: err });
                    });
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err });
        });
});

router.delete("/:userId", (req, res, next) => {
    User.remove({ _id: res.params.userId })
        .exec()
        .then(result => res.status(200).json({ message: "User deleted" }))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err })
        });
});

module.exports = router;
