/*
    - Méthodes d'upload pour Multer
    - Sert à enregistre les fichiers d'une certaine façon en créant des fonctions 
*/



// Multer
const multer = require('multer');
// Utilities
const path = require('path');



// # Single file Uploader || Upload de l'image de présentation de la recette
const postStorage = multer.diskStorage({
    destination: (req, file, cb) => {

        const destPath = path.join('.', 'medias', 'users', 'draft_posts_pictures');

        cb(null, destPath);
    },

    filename: (req, file, cb) => {

        const postID = Date.now();
        const fileNames = req.user.id + "_" + postID + "_0" + path.extname(file.originalname);
        
        cb(null, fileNames);
    }
});

const postMediaUpload = multer({ storage: postStorage })

// # Multiple file Uploader || Upload des des images des étapes de la recette
const multiStepImagesStorage = multer.diskStorage({
    destination: (req, file, cb) => {

        const destPath = path.join('.', 'medias', 'users', 'draft_posts_pictures');

        cb(null, destPath);
    },

    filename: (req, file, cb) => {

        const postID = req.body.postID;
        const stepID = file.fieldname.split("_")[1];
        const fileName = postID + "_" + stepID + path.extname(file.originalname);
        
        cb(null, fileName)
    }
});

const postMultiStepImagesUpload = multer({storage: multiStepImagesStorage}).any();



module.exports = {
    postMediaUpload,
    postMultiStepImagesUpload
}