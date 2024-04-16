const fs = require('fs')
const path = require('path')
const eventLogger = require('../misc/event_logger');
const dbNames = require("../../databases/definitions/db_names.json")


module.exports = () => {

    const dbLocation = "../../databases/"

    for (dbn in dbNames) {

        dbDir = path.join('databases', `${dbNames[dbn]}.json`)

        if (!fs.existsSync(dbDir)) {

            eventLogger("SERVER", "WARNING !", `Database "${dbDir}", doesn't exist! Creating the file...`, "~")

            fs.writeFileSync(dbDir, '{}');
            eventLogger("SERVER", "INFO", `Database "${dbDir}" created successfully `, "~")

        } else {
            eventLogger("SERVER", "INFO", `Database "${dbDir}" exist`, "~")
        }
    }
}