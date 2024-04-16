/*
 *  - Initialize Passport.js
 */



// Passport.js & bcrypt.js
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
// Databases
const dbNames = require('../../databases/definitions/db_names.json')
const dbUsers = require(`../../databases/${dbNames.users}`)
// User utils
const userUtils = require('./users_utils')



function initialize(passport) {

	const authenticateUser = async (email, password, done) => {

		const user = userUtils.getUserByEmail(email, dbUsers)

		if (user == null) {    // If the user doesn't exist
			return done(null, false, { message: "No user with that email!" })
		}

		if (user.activated_account == false) {   // If the account is activated yet

			if (user.activation_token != "") {   // And it's not activated yet
				return done(null, false, { message: "Please verify your email before logging in!" })
			}
		}

		try {   // Check password
			if (await bcrypt.compare(password, user.password)) {
				return done(null, user)
			} else {
				return done(null, false, { message: "Incorrect password!" })
			}
		} catch (err) {
			return done(err)
		}
	}

	passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
	passport.serializeUser((user, done) => done(null, user.id))
	passport.deserializeUser((id, done) => {
		return done(null, userUtils.getUserById(id, dbUsers))
	})
}



module.exports = initialize
