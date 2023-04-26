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


// app.post("/register", async function(req, res) {})

app.post("/register", async(req, res) => {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(req.body.password, saltRounds);
    const newUser = new User({
      email: req.body.username,
      password: hash
    });
    // save the new user to your database
    await newUser.save();
    res.render("secrets")
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/login", async function(req, res) {

    const username = req.body.username;
    const password = req.body.password;
    try {
        const foundUser = await User.findOne({ email: username });
        if (foundUser && await bcrypt.compare(password, foundUser.password)) {

            res.render("secrets");

        } else {
            res.status(401).send("Invalid login credentials");
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }

})






app.listen(3000, function() {
    console.log("Server started on port 3000");
});
