/*
 *  - Initialize Express.js
 */


require('dotenv').config();
const express = require('express');
const passport = require('passport');

function initialize (app, flash, session, methodOverride) {

    app.set('view-engine', 'ejs');
    app.use(express.urlencoded({ extended: true }));
    app.use("/jQuery", express.static("./src/jQuery"));
    app.use("/css", express.static('css'));
    app.use("/medias", express.static('medias'));
    app.use(flash());
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    }))
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(methodOverride('_method'));
}


module.exports = initialize
