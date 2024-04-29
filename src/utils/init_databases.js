/*
    - Initialisation des bases de données .JSON
*/



// File handlers
const fs = require('fs');
const path = require('path');
// Databases
const dbNames = require("../../databases/definitions/db_structure/db_names.json");
// Misc.
const eventLogger = require('../misc/event_logger');



module.exports = () => {

    const dbLocation = "../../databases/"

    for (dbn in dbNames.jsons) {

        dbDir = path.join('databases', `${dbNames.jsons[dbn]}.json`)

        if (!fs.existsSync(dbDir)) {

            eventLogger("SERVER", "WARNING !", `Database "${dbDir}", doesn't exist ! Creating the file...`, "~")

            fs.writeFileSync(dbDir, '{}');
            eventLogger("SERVER", "INFO", `Database "${dbDir}" created successfully !`, "~")

        } else {
            eventLogger("SERVER", "INFO", `Database "${dbDir}" exist`, "~")
        }
    }
}