//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");

const app = express();



app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

const userschema = new mongoose.Schema({
    email: String,
    password: String
});



const User = new mongoose.model("User", userschema);

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
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
    });

    await newUser.save();
    res.render("secrets");



    // async function saveUser(newUser) {
    //     try {
    //         await newUser.save();
    //         res.render("secrets");
    //     } catch (err) {
    //         console.log(err);
    //     }

    // }
    // saveUser(newUser)
    //     .then((viewName) => res.render(viewName))
    //     .catch((err) => console.log(err));






    // newUser.save(async function(err) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         res.render("secrets");
    //     }
    // });
});
app.post("/login", async function(req, res) {
    const username = req.body.username;
    const password = md5(req.body.password);
    try {
        const foundUser = await User.findOne({ email: username });
        if (foundUser && foundUser.password === password) {
            res.render("secrets");
        }
    } catch (err) {
        console.log(err);
    }

})






app.listen(3000, function() {
    console.log("Server started on port 3000");
});