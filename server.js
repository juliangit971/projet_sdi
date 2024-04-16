// Express.js
const express = require('express')
const app = express()
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const initExpress = require('./src/express/utils/initExpress')
// Passport.js & encryption
const passport = require('passport')
const initPassport = require("./src/utils/init_passport")
const bcrypt = require('bcrypt')
// Databases
const initDatabases = require('./src/utils/init_databases')
initDatabases()
const dbNames = require('./databases/definitions/db_names.json')
const dbUsers = require(`./databases/${dbNames.users}`)
const dbPosts = require(`./databases/${dbNames.posts}`)
const dbUserType = require('./databases/definitions/db_user_type.json')
const dbPath = "./database/"
// Utilities
const utils = require('./src/utils/utilities')
const userUtils = require('./src/utils/users_utils')
// Misc.
const eventLogger = require('./src/misc/event_logger');
const saveJson = require('./src/utils/save_json')



// If dev mode enabled, use ".env" file for environment variables
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
    eventLogger("SERVER", "WARNING !", "Dev Mode enabled!", "~");
    eventLogger("SERVER", "Dev # i", "Server running on http://localhost:3000", "~")
}



// Init Passport.js
initPassport(passport)

// Init Express.js
initExpress(app, flash, session, methodOverride)



/* Home page */
app.get('/', checkUserBlocked, (req, res) => {

    let username
    let logginStatus
    
    try {
        username = req.user.nickname
        logginStatus = true
    } catch (error) {
        username = "Guest"
        logginStatus = false
    }


    res.render('home.ejs', { name: username, loggedin: logginStatus } )
})



/*  Register / Login / Logout */

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {   // Login an user
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))


app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs', { error: false })
})

app.post('/register', checkNotAuthenticated, async (req, res) => {   // Register an user

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        for (i in dbUsers) {   // Vérifier si le mail n'existe pas déjà
            if (dbUsers[i]["email"] == req.body.email) {
                res.render('register.ejs', { error: "Email already in use!" });
                return
            }
        }

        const userID = Date.now().toString()

        dbUsers[userID] = {}
        dbUsers[userID]["nickname"] = req.body.name
        dbUsers[userID]["email"] = req.body.email
        dbUsers[userID]["password"] = hashedPassword
        dbUsers[userID]["profile_picture"] = null
        dbUsers[userID]["grade"] = dbUserType.user
        dbUsers[userID]["activated_account"] = false
        dbUsers[userID]["activation_token"] = utils.generateRandomString(60)
        dbUsers[userID]["followed_users"] = [] 
        dbUsers[userID]["liked_posts"] = [] 
        dbUsers[userID]["saved_posts"] = []
        dbUsers[userID]["created_posts"] = []

        saveJson(dbUsers, dbNames.users, dbPath)

        res.render('activate_your_account.ejs', { mail: req.body.email });

    } catch {
       res.render('register.ejs', { error: "Unexpected error happened!" });
    }
})


app.delete('/logout', checkAuthenticated, (req, res, next) => {  // Logout an user
    req.logOut(err => {
        if (err) { return next(err) }
    });
    res.redirect('/login');
})


app.get('/account_blocked', checkAuthenticated, (req, res) => {
    res.render('account_blocked.ejs');
})


/** Validate Email **/

app.get('/validate/:userID/:validateID', (req, res) => {    // Vérifier l'email d'un utilisateur 
    // Set user's "active" state to "true" in DB

    const userToValidate = userUtils.getUserById(req.params.userID, dbUsers)

    if (userToValidate == null) {    // If user doesn't exist
        return res.redirect('/error_404')
    }

    if (userToValidate.activation_token == "") {    // If user is already activated
        res.render('already_active_account.ejs')
        return;
    }

    if (req.params.validateID != userToValidate.activation_token) {   // If activation token doesn't match recieved token
        return res.redirect('/error_404')
    }

    // User activation
    dbUsers[req.params.userID]["activation_token"] = ""
    dbUsers[req.params.userID]["activated_account"] = true
    saveJson(dbUsers, dbNames.users, dbPath);

    res.render('account_activated_successfully.ejs')
})



/* Erro 404 handler */
app.get('/error_404', (req, res) => {
    res.status(404)
    res.render('error_404.ejs');
    return
})

app.use((req, res) => {
    res.status(404);
    res.render('error_404.ejs');
    return;
})




function checkAuthenticated(req, res, next) {   // Check if an user is logged in and not blocked
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
}


function checkUserBlocked(req, res, next) {   // Check if an user is logged
    if (req.isAuthenticated() && req.user.activated_account == false) {   // Si le compte est désactivé alors que l'utilisateur a déjà validé son compte avant
        return res.redirect('/account_blocked')
    }

    next();
}


function checkAuthenticatedAndNotBlocked (req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.activated_account == false) {
            return res.redirect('/account_blocked')
        }

        return next();
    }
    
    res.redirect('/login');
}


function checkNotAuthenticated(req, res, next) {  // Check if an user isn't logged
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }

    next();
}



app.listen(3000);
