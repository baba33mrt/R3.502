const express = require("express");
const router = express.Router();
let appContext;
// const url = require("url");
const fs = require('fs');
const createError = require("http-errors");

function dynamicRouter(app) {
    //-- Context applicatif
    appContext = app;
    // -- Perform Automate action
    router.use(manageAction);
    // -- routeur global
    appContext.use(router);
}

/* Fonction qui permet d'aguiller les requêtes HTTP
vers le bon contrôleur en fonction de l'action du pathname  */
function manageAction(req, res, next) {
    req.message = {};
    // console.log(req.originalUrl)

    const pathObj = splitQueryParams(req)
    console.log(pathObj) // --debug--

    // On défini la clé de l'annuaire config_actions.json dans une variable "action"
    req.message.action = pathObj.action

    /*chargement de la configuration JSON des paramètres possibles */
    global.params_json = JSON.parse(fs.readFileSync("./config_params.json", "utf8"));

    /***************************************************************************************************** */
    /** AJOUT DE L'ENSEMBLE DES PARAMETRES DU FICHIERS "CONFIG_ACTIONS.JSON" DANS LE MESSAGE ASSOCIE A REQ */
    /***************************************************************************************************** */
    /* Boucle de récupération des paramètres de l'action du fichier config_actions.json */
    const data = searchRoute(pathObj, req)
    console.log(req.params)


    // const data = global.actions_json[req.message.action]

    for (let param in data) {
        // console.log(data[param], param)
        req.message[param] = data[param]
    }

    // console.log('req.message dans dynamicRouteur : ', req.message);

    // Récupération des noms de champs pour un upload de fichiers passé dans le config_actions.json
    if (req.message.fieldUpload) global.fieldUpload = req.message.fieldUpload;

    // (...) Il est donc possible d'ajouter des variables à l'annuaire config_actions.json
    // en fonction des besoins du développeur, elles seront automatiquemnt récupérées dans
    // l'objet "req.message" dans les contrôleurs (routes/).

    // Si l'action n'est pas définie dans l'annuaire, on log l'erreur

    let instanceModule;
    // console.log(typeof global.actions_json[req.message.action])
    if (typeof global.actions_json[req.message.action] === Object) {
        console.warn("Erreur: Pas d'action dans l'annuaire config_actions.json : " + pathObj.path);
        next();
    } else {
        try {
            instanceModule = require('./routes/' + req.message.controller);
            router.use(pathObj.path, instanceModule);
            next();
        } catch (e) {
            res.render('404', createError(404));
        }
    }
}

function splitQueryParams(req) {
    const splited = req.originalUrl.split("?")
    return {
        origin: req.originalUrl,
        method: req.method,
        path: splited[0],
        pathArr: splited[0].split("/").filter(Boolean),
        queryParams: {text: splited[1]},
        action: req.method + splited[0]
    }
}

function searchRoute(pathObj, req, action = global.actions_json) {
    // console.log("path", pathObj.action)
    // console.log("action", action)

    // static
    if (action[pathObj.action]) {
        return action[pathObj.action]
    }

    // dyn
    for (let key in action) {
        const keyArr = key.split("/").filter(Boolean);
        const pathArr = pathObj.action.split('/').filter(Boolean);
        const params = {}
        if (keyArr[0] === pathArr[0] && keyArr.length === pathArr.length) {
            let shouldContinue = false;  // Variable de contrôle pour déterminer si on doit continuer à la prochaine clé

            for (let index = 1; index < pathArr.length; index++) {
                const regex = /^:[a-zA-Z]/;

                // Si la partie ne correspond pas et que ce n'est pas une partie dynamique (regex), on passe à la prochaine clé
                if (pathArr[index] !== keyArr[index] && !regex.test(keyArr[index])) {
                    shouldContinue = true;
                    break;
                }
                if(regex.test(keyArr[index])){
                    // console.log(pathArr[index]) // vdebug
                    const paramName = keyArr[index].substring(1);
                    //console.log(paramName) // debug
                    params[paramName] = pathArr[index];}
            }

            if (shouldContinue) {
                continue;
            }

            // Sinon, c'est une correspondance valide, on peut exécuter le code correspondant
            req.params = params;
            // console.log(params);  // debug
            return action[key];
        }
    }

    // none
    return null
}

module.exports = dynamicRouter;
