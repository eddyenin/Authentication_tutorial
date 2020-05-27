require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");

const app = express();
//console.log(process.env.SECRET);
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
        // cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/secretDB", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.get("/", function(req, res) {
    res.render('home');
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/secrets", function(req, res) {
    if (req.isAuthenticated) {
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res) {
    User.register({ username: req.body.username }, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate('local')(req, res, function() {
                res.redirect('/secrets');
            })
        }
    })
})

app.post("/login", function(req, res) {
    const newUser = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(newUser, function(err) {
        if (err) {
            console.log(err);
            res.redirect("/login");
        } else {
            passport.authenticate('local')(req, res, function() {
                res.redirect('/secrets');
            })
        }
    })
});

let port = 4000;

app.listen(port, function() {
    console.log("Server started at port " + port);
})