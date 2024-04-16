# # Projet Tastebuds
Voici le projet de base avec l'API permettant de faire pas mal de chose assez basique <br/>
Voici la liste des choses qu'il est capable de faire :

- Enregistrer un utilisateur
- Connecter un utilisateur
- Déconnecter un utilisateur
- Créer un token pour pouvoir valider un compte
- Valider le compte d'un utilisateur grace à un lien de validation (il faut entre le lien à la main)
- Empêcher un utilisateur non connecté d'accéder à certaines pages et vice versa
- Détecter et rediriger l'utilisateur si une page recherché n'existe pas (Erreur 404)
- (BONUS) Détecter si un compte est bloqué (banni) ou non

# CREEZ VOTRE BRANCHE AVANT DE MODIFIER QUOIQUE CE SOIT!!!

## Comment lancer le projet ?

### ~ 1ère Méthode 

Créez d'abord un fichier s'appellant `.env` dans la racine du projet et écrivez la ligne suivante dedans : `SESSION_SECRET=secret`.
Lancer le fichier `start_project.bat` si vous êtes sur Windows. Faites attention à le lancer dans le dossier racine du projet. Vous pouver aussi le lancer dans une console, mais pensez à être dans la racine du projet d'abord.

### ~ 2ème Méthode 

Créez d'abord un fichier s'appellant `.env` dans la racine du projet et écrivez la ligne suivante dedans : `SESSION_SECRET=secret`.
En étant dans la racine du projet, faites d'abord dans une console `npm install --dev`. <br/>
Faites ensuite `npm run devStart` pour lancer `nodemon`, ce qui permet ede lancer le projet.


### ~~ Pour les 2 méthodes

Ouvrez ensuite dans le navigateur le lien suivant : `http://localhost:3000` pour pouvoir tester le site.

## Comment rajouter/modifier des pages ?

Il faut mettre toutes vos pages dans le dossier `./views/` et changer l'extension de toutes vos pages HTML en `.ejs` pour que tout puisse fonctionner. Vous n'aurez pas à changer le cotenu de vos pages après ça. <br/>

## Où sont stocké les utilisateur ?

Les utilisateur sont stocké dans `./databases/db_users.json`.

## Comment valider un compte ?

Tapez dans la barre de recherche du navigateur `http://localhost:3000/validate/<user_id>/<validation_token>`. <br/>
Remplacez `<user_id>` par l'ID de l'utilisateur et `validation_token` par le token de validation qui se trouvent tous dans la base de donnée. La clé du token s'appelle `"activation_token"` dans la base de donnée.

## Pour toutes question en plus 

Demander moi, je vous expliquerais tout.