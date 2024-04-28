// Express.js
const express = require('express');
const app = express();
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const initExpress = require('./src/express/utils/init_express');
// Express.js Utils
const expressUserUtils = require('./src/express/utils/login_status');
// Passport.js & Encryption
const passport = require('passport');
const initPassport = require("./src/utils/init_passport");
const bcrypt = require('bcrypt');
// Multer (File upload manager)
//const multer = require('multer');
const fileUploadMethods = require('./src/utils/multer_upload_methods');
// Databases
const initDatabases = require('./src/utils/init_databases');
initDatabases()
const dbNames = require('./databases/definitions/db_structure/db_names.json');
const dbUsers = require(`./databases/${dbNames.jsons.users}`);
const dbPosts = require(`./databases/${dbNames.jsons.posts}`);
const dbDraftPosts = require(`./databases/${dbNames.jsons.draftPosts}`);
const dbUserType = require('./databases/definitions/db_user_type.json');
const dbPostSettings = require('./databases/definitions/db_post_settings.json');
const dbPath = "./database/"
// Utilities
const utils = require('./src/utils/utilities');
const userUtils = require('./src/utils/user_utils');
//const path = require('path');
// Misc.
const eventLogger = require('./src/misc/event_logger');
const fm = require('./src/utils/file_manager');



// If dev mode enabled, use ".env" file for environment variables
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
    eventLogger("SERVER", "WARNING !", "Dev Mode enabled!", "~");
    eventLogger("SERVER", "Dev # i", `Server running on http://localhost:${process.env.PORT}`, "~");
}



// Init Passport.js
initPassport(passport);

// Init Express.js
initExpress(app, flash, session, methodOverride);

/* Init Multer
    - Toutes le fonctions Multer sont dans "./src/utils/multer_upload_methods"
*/




/* Home page */
app.get('/', expressUserUtils.checkUserBlocked, (req, res) => {

    let username;
    let logginStatus;
    
    try {
        username = req.user.nickname;
        logginStatus = true;
    } catch (error) {
        username = "Guest";
        logginStatus = false;
    }

    res.render('home.ejs', { name: username, loggedin: logginStatus, posts: dbPosts } );
})



/* Authentification */

app.get('/login', expressUserUtils.checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
})

app.post('/login', expressUserUtils.checkNotAuthenticated, passport.authenticate('local', {   // Login an user
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))


app.get('/register', expressUserUtils.checkNotAuthenticated, (req, res) => {
    res.render('register.ejs', { error: false });
})

app.post('/register', expressUserUtils.checkNotAuthenticated, async (req, res) => {   // Register an user

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
        dbUsers[userID]["createdDraftPost"] = []
        dbUsers[userID]["created_posts"] = []

        fm.saveJSON(dbUsers, dbNames.jsons.users)

        eventLogger("SERVER", "INFO", `User "${req.body.name}" (${req.body.email}) registered successfully!\nActivation link for the account: http://localhost:3000/validate/${userID}/${dbUsers[userID]["activation_token"]}`)

        res.render('activate_your_account.ejs', { mail: req.body.email });

    } catch {
       res.render('register.ejs', { error: "Unexpected error happened!" });
    }
})


app.delete('/logout', expressUserUtils.checkAuthenticated, (req, res, next) => {  // Logout an user

    const loggedOutUser = req.user  // Permet de ne pas perdre l'identité de l'utilisateur après sa déconnection

    req.logOut(err => {
        if (err) { return next(err) }
    });
    
    eventLogger("SERVER", "INFO", `User "${loggedOutUser.id}" (${loggedOutUser.email}) logged out successfully`)

    res.redirect('/login');
})


app.get('/account_blocked', expressUserUtils.checkAuthenticated, (req, res) => {
    res.render('account_blocked.ejs');
})


/** Validate Email **/
app.get('/validate/:userID/:validateID', (req, res) => {    // Vérifier l'email d'un utilisateur 
    // Set user's "active" state to "true" in DB

    const userToValidate = userUtils.getUserById(req.params.userID, dbUsers);

    if (userToValidate == null) {    // If user doesn't exist
        return res.redirect('/error-404');
    }

    if (userToValidate.activation_token == "") {    // If user is already activated
        res.render('already_active_account.ejs');
        return;
    }

    if (req.params.validateID != userToValidate.activation_token) {   // If activation token doesn't match recieved token
        return res.redirect('/error-404');
    }

    // User activation
    dbUsers[req.params.userID]["activation_token"] = "";
    dbUsers[req.params.userID]["activated_account"] = true;
    fm.saveJSON(dbUsers, dbNames.jsons.users, dbPath);

    eventLogger("SERVER", "INFO", `Account "${req.params.userID}" activated successfully!`);

    res.render('account_activated_successfully.ejs');
})

/** Forgotten Password **/

app.get('/forgot-password', expressUserUtils.checkNotAuthenticated, (req, res) => {
    res.render('forgot_password.ejs', { error: false });
})

app.post('/forgot-password', expressUserUtils.checkNotAuthenticated, async (req, res) => {   // Register an user

    try {

        const user = userUtils.getUserByEmail(req.body.email, dbUsers);

        if (!user) {
            res.render('forgot_password.ejs', { error: "No user with that email!" });
            return;
        }

        if (user.activated_account == false) {
            res.render('forgot_password.ejs', { error: "Acivate your account first!" });
            return;
        }

        const randPassword = utils.generateRandomString(15);

        const hashedPassword = await bcrypt.hash(randPassword, 10);  // Generate random hashed password (15 caracters)
        dbUsers[user.id]["password"] = hashedPassword;
        fm.saveJSON(dbUsers, dbNames.jsons.users);

        eventLogger("SERVER", "INFO", `Random password for "${req.body.email}": ${randPassword}`, "~")

        res.render('change_your_password.ejs', { mail: req.body.email });

    } catch {
       res.render('forgot_password.ejs', { error: "Unexpected error happened!" });
    }
})

/* Main website */

/** Create a post **/

app.get('/create-post', expressUserUtils.checkAuthenticatedAndNotBlocked, (req, res) => {
    res.render('create_post.ejs');
})

app.get('/api/create-post/:requestedElement', expressUserUtils.checkAuthenticatedAndNotBlocked, (req, res) => {

    switch (req.params.requestedElement) {
        case "part1" :   // Envoyer la 1ère partie du formulaire
            res.render('fragments/create_post/create_post_0.ejs', { postSettings: dbPostSettings });
            return;
        case "part2":    // Envoyer la 2ème partie du formulaire
            res.render('fragments/create_post/create_post_1.ejs');
            return;
        case "part3":    // Envoyer la 3ème partie du formulaire
            res.render('fragments/create_post/create_post_2.ejs', { postSettings: dbPostSettings });
            return;
        case "tags":    // Envoyer les tags disponibles pour les posts
            res.json({ tags: dbPostSettings.tags });
            return;
    }

    return res.status(404);
})

app.post('/api/create-post/part1', expressUserUtils.checkAuthenticatedAndNotBlocked, fileUploadMethods.postMediaUpload.single("inputFile"), (req, res) => {

    try {
        const postID = req.file.filename.split('_').slice(0, 2).join('_');

        dbDraftPosts[postID] = {};
        dbDraftPosts[postID]["name"] = req.body.recipeName;
        dbDraftPosts[postID]["presentationImage"] = req.file.filename;
        dbDraftPosts[postID]["category"] = dbPostSettings.recipeCategories[req.body.category];
        dbDraftPosts[postID]["difficulty"] = dbPostSettings.recipeDifficulties[req.body.difficulty];
        dbDraftPosts[postID]["description"] = req.body.description;
        fm.saveJSON(dbDraftPosts, dbNames.jsons.draftPosts);

        dbUsers[req.user.id]["createdDraftPost"].push(postID);  // Enregistrer le post de la liste des posts brouillons de l'utilisateur
        fm.saveJSON(dbUsers, dbNames.jsons.users);

        res.json({ postID: postID });

    } catch (err) {
        return res.send('CRITICAL ERROR');
    }
});


app.post('/api/create-post/part2', expressUserUtils.checkAuthenticatedAndNotBlocked, (req, res) => {

    try {

        fileUploadMethods.postMultiStepImagesUpload(req, res, function (err, fileData) {
            if (err) {
                console.error("Erreur de sauvegarde multiple!");
            } else {

                const postID = req.body.postID;

                dbDraftPosts[postID]["ingredientSections"] = [];
                dbDraftPosts[postID]["stepSections"] = [];

                for (i = 0; i < req.body.ingredientSections; i++) {      // Sauvegarde des ingrédients
                    dbDraftPosts[postID]["ingredientSections"].push({
                        ingredient: req.body[`ingredient_${i+1}`],
                        quantity: req.body[`quantity_${i+1}`],
                        unit: req.body[`unit_${i+1}`]
                    });
                }


                for (i = 0; i < req.body.stepSections; i++) {           // Sauvegarde des étapes
                    dbDraftPosts[postID]["stepSections"].push({
                        description: req.body[`step_${i+1}`]
                    });

                    // Sauvegarde de l'image de l'étape
                    function searchFieldName(fieldName, files){       // Rechercher si une image est associée à l'étape en cours de traitement
                        for (let i=0; i < files.length; i++) {
                            if (files[i].fieldname === fieldName) {
                                return files[i];
                            }
                        }

                        return null;
                    }

                    const stepImage = searchFieldName(`stepInputFile_${i+1}`, req.files);
                    dbDraftPosts[postID]["stepSections"][i].image = ( stepImage ? stepImage.filename : null );
                }

                fm.saveJSON(dbDraftPosts, dbNames.jsons.draftPosts);
                res.json({});
            }
        });

    } catch (err) {
        return res.redirect('/error-404');
    }
});


app.post('/api/create-post/part3', expressUserUtils.checkAuthenticatedAndNotBlocked, (req, res) => {

    try {

        const parsedBody = JSON.parse(req.body.formData);

        
        // Rechercher la section des tags et séparer chaque tags en enlevant les espaces inutiles
        function searchTagField(formFields){
            for (let i=0; i < formFields.length; i++) {
                if (formFields[i].name == "tags") {

                    if (formFields[i].value == "") {
                        return null
                    } else {
                        const cleanedTags = formFields[i].value.replace(/\s+/g, " ");  // retirer tous les caractères vides (Espaces, Tab, Retours à la ligne) et les remplacer par un simple espace
                        return cleanedTags.split(' ');
                    }
                }
            }
            return null;
        }

        const tags = searchTagField(parsedBody) 
        let isTagListWrong = 0;
        let tagError;


        // Vérification de la légalité des tags
        if (tags != null) {   // S'il y a bien des tags
            for (const tag of tags) {   // Vérifier les tags
                
                if (!tag.startsWith("#")) {   // Si le tag ne commence pas par "#"
                    isTagListWrong = 1;
                    tagError = `Tags incorrects! "${tag}" n'est pas un tag!\nTout les tags doivent commencer par une dièse (#).`
                    break;
                } else if (tag.substring(1) == "") {
                    isTagListWrong = 1;
                    tagError = `Tags incorrects! Tag vide non autorisé!`
                    break;
                } else if (!tag.substring(1).match(/^[a-z0-9]+$/g)) {   // Vérifier les caractères du tags sans "#" (Autorisé: a-z [minuscules], 0-9)
                    isTagListWrong = 1;
                    tagError = `Tags incorrects! Le tag "${tag}" n'est pas valide!\nLes tags ne peuvent prendre que les caractères suivant: a-z (minuscule), 0-9.`
                    break;
                } else if (tag.length > 32) {   // Si le tag fait plus de 32 caractères
                    isTagListWrong = 1;
                    tagError = `Tags incorrects! Le tag "${tag}" est trop long!\nLa longueur maximale d'un tag est de 32 caractères.`
                    break;
                }
            }
        }

        // S'il y a une erreur dans les tags
        if (isTagListWrong) {
            return res.json({ error: tagError });
        }


        const postID = req.body.postID;

        // Enregistrement des autres valeurs saisies
        let finalTime = "";     // Permet de recomposer les heures et les minutes 

        for (const section of parsedBody) {

            switch(section.name) {
                case "preparationTime_h":
                        finalTime = section.value + ",";
                        break;
                case "preparationTime_m":
                        finalTime = finalTime + section.value;
                        dbDraftPosts[postID]["preparationTime"] = finalTime;
                        finalTime = "";
                        break;

                case "cookingType":
                    dbDraftPosts[postID]["cookingType"] = section.value;
                    break;

                case "cookingTime_h":
                        finalTime = (section.value == '' ? "0" : section.value) + ",";
                        break;
                case "cookingTime_m":
                        finalTime = finalTime + (section.value == '' ? "0" : section.value);
                        dbDraftPosts[postID]["cookingTime"] = finalTime;
                        finalTime = "";
                        break;

                case "restTime_h":
                        finalTime = (section.value == '' ? "0" : section.value) + ",";
                        break;
                case "restTime_m":
                        finalTime = finalTime + (section.value == '' ? "0" : section.value);
                        dbDraftPosts[postID]["restTime"] = finalTime;
                        finalTime = "";
                        break;
            }
        }
        
        dbDraftPosts[postID]["tags"] = tags;


        // Déplacement des images
        const oldPath = dbNames.paths.draftPostImagesPath;
        const newPath = dbNames.paths.postImagesPath;

        // # Image de présentation
        fm.moveFile(`${oldPath}/${dbDraftPosts[postID]["presentationImage"]}`, `${newPath}/${dbDraftPosts[postID]["presentationImage"]}`);
        // # Images des étapes
        for (i = 0; i < dbDraftPosts[postID]["stepSections"].length; i++) {
            if (dbDraftPosts[postID]["stepSections"][i].image != null) {
                fm.moveFile(`${oldPath}/${dbDraftPosts[postID]["stepSections"][i].image}`, `${newPath}/${dbDraftPosts[postID]["stepSections"][i].image}`)
            }
        }
    


        // Sauvegarde du post dans la base de donnée des posts finis
        fm.saveJSON(dbDraftPosts, dbNames.jsons.draftPosts);
        dbPosts[postID] = dbDraftPosts[postID];   // Enregistrer le post dans la BD de posts finis
        delete dbDraftPosts[postID];              // Supprimer le posts de la BD des posts brouillonsq

        fm.saveJSON(dbPosts, dbNames.jsons.posts);

        // Finition de la créations des variables crutiales au posts
        dbPosts[postID]["timestamp"] = Date.now().toString();
        dbPosts[postID]["likedBy"] = [];
        dbPosts[postID]["savedBy"] = [];

        fm.saveJSON(dbDraftPosts, dbNames.jsons.draftPosts);   // Sauvegarder pour enlever le posts des brouillons
        fm.saveJSON(dbPosts, dbNames.jsons.posts);             // Sauvegarder le post dans la BD des posts terminés
        
        // MAJ de la liste des postes de l'utilisateur
        dbUsers[req.user.id]["createdDraftPost"].splice(postID, 1);  // Enlever le post de la liste des posts brouillons de l'utilisateur
        dbUsers[req.user.id]["created_posts"].push(postID);          // Enregistrer le post dans la liste des posts définitifs fait par l'utilisateur
        fm.saveJSON(dbUsers, dbNames.jsons.users);

        
        eventLogger("SERVER", "INFO", `Post "${dbPosts[postID]["name"]}" (${postID}) de l'utilisateur "${req.user.nickname}" (${req.user.email}) enregistré avec succès!`)

        return res.json({ redirect: '/' });
  

    } catch (err) {
        return res.json({ error: "Unable to save post to DB!" });
    }
});




/* Erro 404 handler */
app.get('/error-404', (req, res) => {
    res.status(404);
    res.render('error_404.ejs');
    return
})

app.use((req, res) => {
    res.status(404);
    res.render('error_404.ejs');
    return;
})



app.listen(process.env.PORT);
