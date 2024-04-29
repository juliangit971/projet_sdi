/*
    - Sauvegarde du contenu d'un fichier .JSON après écriture à l'itérieur
    - Déplacer un fichier dans un nouveau répertoir
*/



// File Handler
const fs = require('fs');
const eventLogger = require('../misc/event_logger');



function saveJSON (db, dbName) {
    const dbLocation = "./databases/" + dbName + ".json"
    fs.writeFileSync(dbLocation, JSON.stringify(db, null, 4));
    eventLogger("file_manager", "INFO", `JSON file "${dbName}.json" updated successfully!`)
}


function moveFile (oldPath, newPath) {
    try {
    	fs.renameSync(oldPath, newPath);  // Déplacer le fichier dans un nouveau répertoire ("rename" et aussi égal à "move")
    } catch (err) {
    	// Handle the error
        eventLogger("file_manager", "ERREUR !", `Unable to move "${oldPath}" to "${newPath}"`)
        console.error(err);
    }
}


module.exports = {
    saveJSON,
    moveFile
}
