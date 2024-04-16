function getUserByEmail (email, userDB) {

	for (i in userDB) {
		if (userDB[i]["email"] == email) {

			let foundUser = JSON.parse(JSON.stringify(userDB[i]))  // Permet de créer un clone de l'objet JSON sans modification dans la base de donnée si on modifie l'objet copié 
			foundUser.id = i
			return foundUser
		}
	}

}

function getUserById (id, userDB) {

	for (i in userDB) {
		if (i == id) {

			let foundUser = JSON.parse(JSON.stringify(userDB[i]))
			foundUser.id = i
			return foundUser
		}
	}
}


module.exports = {
	getUserByEmail,
	getUserById
}