require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
//console.log(process.env.SECRET);
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect("mongodb://localhost:27017/secretDB", { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res) {
    res.render('home');
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res) {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        const newUser = new User({
            email: req.body.username,
            password: hash
        })
        newUser.save(function(err) {
            if (!err) {
                res.render("secrets");
            } else {
                res.send(err);
            }
        });
    });

})

app.post("/login", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }, function(err, foundUser) {
        if (err) {
            res.render("login");
        } else {
            bcrypt.compare(password, foundUser.password, function(err, result) {
                // result == true
                if (result) {
                    res.render("secrets");
                } else {
                    res.send("User not found");
                }
            });

        }
    })
})

let port = 4000;

app.listen(port, function() {
    console.log("Server started at port " + port);
})