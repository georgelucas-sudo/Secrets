//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');


const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();



app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
//we initialize the session here and passport here


app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

const userschema = new mongoose.Schema({
    email: String,
    password: String
});

userschema.plugin(passportLocalMongoose);

//we create a new local strategy using the passportLocalMongoose
//we serialize and deserialize the user using passportLocalMongoose





const User = new mongoose.model("User", userschema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

console.log("Your API key is: " + process.env.API_KEY);

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {


    res.render("register");
});
app.get("/submit", function(req, res) {
    res.render("submit");
});

app.get("/secrets", function(req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets")

    } else {
        res.redirect("/login")
    }
})
app.get("/logout", function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// app.post("/register", async function(req, res) {})

app.post("/register", async(req, res) => {
    User.register({ username: req.body.username }, req.body.password, function(err, user) {
        if (err) {
            console.log(err)
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            })
        }
    })
});


app.post("/login", async function(req, res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    })
    req.login(user, function(err) {

        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("secrets");
            })
        }
    })

})







app.listen(3000, function() {
    console.log("Server started on port 3000");
});