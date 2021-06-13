//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
 const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret: "our little secret",
    resave: false,
    saveUninitialized: false
}));

    app.use(passport.initialize());
    app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"]});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/" , function (request,response) {
    response.render("home");
});

app.get("/login", function (request,response) {
    response.render("login");
});

app.get("/register", function (request,response) {
    response.render("register");
});

app.get("/secrets" , function(request,response){
    if (request.isAuthenticated()) {
        response.render("secrets");
    }else{
        response.redirect("/login");
    }
});

app.post("/register" , function(request,response) {

    User.register({username: request.body.username}, request.body.username, function(err, user){
        if (err) {
          console.log(err);
          response.redirect("/register");  
        }else{
            passport.authenticate("local")(request,response, function(){
                response.redirect("/secrets");
            });
        }
    });

    // const newUser = new User({
    //     email: request.body.username,
    //     password: request.body.password
    // });

    // newUser.save(function (err) {
    //     if (err) {
    //         console.log(err);
    //     }else{
    //         response.render("secrets");
    //     }
    // });
});

app.post("/login", function (request,response) {
    // const username = request.body.username;
    // const password = md5(request.body.password);

    // User.findOne({email: username}, function (err,foundUser) {
    //     if (err) {
    //         console.log(err);
    //     }else {
    //         if (foundUser) {
    //             if (foundUser.password === password) {
    //                 response.render("secrets");
    //             }
    //         }
    //     }
    // });
});


app.listen(3000, function(){
    console.log("server has started running");
});