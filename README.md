# # Projet Tastebuds

Voici le projet de base avec l'API permettant de faire pas mal de chose assez basique <br/>
Voici la liste des choses qu'il est capable de faire :

#### Authentification
- Enregistrer un utilisateur
- Connecter un utilisateur
- Déconnecter un utilisateur
- Créer un token pour pouvoir valider un compte
- Valider le compte d'un utilisateur grâce à un lien de validation (il faut entrer le lien à la main)
- Réinitialiser le mot de passe d'un utilisateur en le changeant
- Empêcher un utilisateur non connecté d'accéder à certaines pages et vice versa
- (BONUS) Détecter si un compte est bloqué (banni) ou non

#### Base du site
- Afficher les posts sur le menu principal
- Créer un post

#### Autres
- Détecter et rediriger l'utilisateur si une page recherché n'existe pas (Erreur 404)

# CREEZ VOTRE BRANCHE AVANT DE MODIFIER QUOIQUE CE SOIT!!!

## Comment lancer le projet ?

### Prérequis

Créez d'abord un fichier s'appelant `.env` dans la racine du projet (où se trouve le fichier `server.js`) et écrivez les ligne suivante dedans : 
```conf
NODE_ENV = dev
PORT = 3000
SESSION_SECRET=secret
```

### ~ 1ère Méthode 

Lancer le fichier `start_project.bat` si vous êtes sur Windows. Faites attention à le lancer dans le dossier racine du projet. Vous pouvez aussi le lancer dans une console, mais pensez à être dans la racine du projet d'abord.

### ~ 2ème Méthode 

En étant dans la racine du projet, faites d'abord dans une console `npm install --dev`. <br/>
Faites ensuite `npm run devStart` pour lancer `nodemon`, ce qui permet de lancer le projet.


### ~~ Pour les 2 méthodes

Ouvrez ensuite dans le navigateur le lien suivant : `http://localhost:3000` pour pouvoir tester le site.

## Comment rajouter/modifier des pages ?

Il faut mettre toutes vos pages dans le dossier `./views/` et changer l'extension de toutes vos pages HTML en `.ejs` pour que tout puisse fonctionner. Vous n'aurez pas à changer le contenu de vos pages après ça. <br/>

## Comment valider un compte ?

Le lien d'activation s'affichera dans la console. <br/>
Sinon, tapez dans la barre de recherche du navigateur `http://localhost:3000/validate/<user_id>/<validation_token>`. <br/>
Remplacez `<user_id>` par l'ID de l'utilisateur et `validation_token` par le token de validation qui se trouvent tous dans la base de donnée. La clé du token s'appelle `"activation_token"` dans la base de donnée.

## Où sont stocké les utilisateur ?

Les utilisateur sont stockés dans `./databases/db_users.json`.

## Où sont stocké les posts & posts brouillons ?

Les posts sont stockés dans `./databases/db_posts.json`.
Les posts brouillons sont stockés dans `./databases/db_draft_posts.json`.

## Infos en plus

Il existe déjà un compte test sur lequel vous pouvez vous connecter directement. <br/>
Mail: `w@w` <br/>
MDP: `w`

## Pour toutes question en plus 

Demander moi, je vous expliquerais tout.