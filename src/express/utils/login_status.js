/*
    - Fonctions pour savoir si quelqu'un est connecté, déconnecté, bloqué, etc...
*/



function checkAuthenticated(req, res, next) {   // Check if an user is logged in and not blocked
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
}


function checkUserBlocked(req, res, next) {   // Check if an user is logged
    if (req.isAuthenticated() && req.user.activated_account == false) {   // Si le compte est désactivé alors que l'utilisateur a déjà validé son compte avant
        return res.redirect('/account_blocked')
    }

    next();
}


function checkAuthenticatedAndNotBlocked (req, res, next) {    // Check if a user is logged in and not blocked
    if (req.isAuthenticated()) {
        if (req.user.activated_account == false) {
            return res.redirect('/account_blocked')
        }

        return next();
    }
    
    res.redirect('/login');
}


function checkNotAuthenticated(req, res, next) {  // Check if an user isn't logged in
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }

    next();
}



module.exports = {
    checkAuthenticated,
    checkUserBlocked,
    checkAuthenticatedAndNotBlocked,
    checkNotAuthenticated
}
