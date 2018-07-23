const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.userSignup = (req, res, next) => {
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
};

exports.userLogin = (req, res, next) => {
    User.find({ username: req.body.username })
        .exec()
        .then(users => {
            if (users.length === 0) return res.status(401).json({ message: "Auth failed" });

            bcrypt.compare(req.body.password, users[0].password, (err, result) => {
                if (!err && result) {
                    const token = jwt.sign(
                        {
                            username: users[0].username,
                            userId: users[0]._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1h"
                        },

                    );
                    return res.status(200).json({
                        message: "Auth successful",
                        token: token
                    });
                }

                return res.status(401).json({ message: "Auth failed" });
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err });
        });
};

exports.userDelete = (req, res, next) => {
    User.remove({ _id: res.params.userId })
        .exec()
        .then(result => res.status(200).json({ message: "User deleted" }))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err })
        });
};
