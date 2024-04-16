/*
    - Save content in a .JSON file after writing
*/

const fs = require('fs');


module.exports = async (db, dbName, dbPath) => {
    
    const dbLocation = "./databases/" + dbName + ".json"

    fs.writeFile(dbLocation, JSON.stringify(db, null, 4), (err) => {
        if (err) {
            console.error(err);
        }
    });
}