const express = require("express");
const router = express.Router();
let appContext;

function dynamicRouter(app) {
    //-- Context applicatif
    // console.debug("Initialisation du contexte de l'application");
    appContext = app;
    // -- Perform Automate action
    // console.debug("Ajout du middleware manageAction au routeur");
    router.use(manageAction);
    // -- routeur global
    // console.debug("Ajout du routeur global au contexte de l'application");
    appContext.use(router);
}

/* Fonction qui permet d'aiguiller les requêtes HTTP vers le bon contrôleur en fonction de l'action du pathname */
async function manageAction(req, res, next) {
    // console.debug("manageAction - Requête reçue :", req.originalUrl);
    req.message = {};

    const pathObj = splitQueryParams(req);
    // console.debug("manageAction - Objet chemin extrait :", pathObj);
    req.message.action = pathObj.action;

    /* Chargement de la configuration JSON des paramètres possibles */
    // console.debug("manageAction - Chargement de config_params.json");
    // global.params_json = JSON.parse(fs.readFileSync("./config_params.json", "utf8"));

    /*****************************************************************************************************
     * AJOUT DE L'ENSEMBLE DES PARAMÈTRES DU FICHIER "CONFIG_ACTIONS.JSON" DANS LE MESSAGE ASSOCIÉ À REQ
     *****************************************************************************************************/
    /* Boucle de récupération des paramètres de l'action du fichier config_actions.json */
    console.debug("manageAction - Recherche de la route correspondante dans config_actions.json");
    const data = searchRoute(pathObj, req);
    if (!data) {
        console.debug("manageAction - Aucune route trouvée, renvoi de l'erreur 404");
        return next();
    }

    console.debug("manageAction - Paramètres trouvés :", data);
    for (let param in data) {
        req.message[param] = data[param];
    }

    // Récupération des noms de champs pour un upload de fichiers passé dans le config_actions.json
    if (req.message.fieldUpload) {
        // console.debug("manageAction - Définition de fieldUpload global");
        global.fieldUpload = req.message.fieldUpload;
    }

    let instanceModule;
    // console.warn('===========')
    // console.log(req.message.action, actions_json[req.message.action])
    // console.warn('===========')

    console.log(req.params)

    try {
        // Charger le contrôleur seulement si nécessaire
        // console.debug("manageAction - Chargement du contrôleur :", req.message.controller);
        instanceModule = require('./routes/' + req.message.controller);

        if (typeof instanceModule === 'function' || instanceModule instanceof express.Router) {
            // Utiliser le contrôleur comme middleware uniquement s'il est valide
            // console.debug("manageAction - Utilisation du contrôleur comme middleware");
            router.use(pathObj.path, instanceModule);
            return next();
        } else {
            throw new Error('Le module chargé n\'est pas un middleware valide');
        }
    } catch (e) {
        console.log("Erreur :", e);
        return next();
    }
}

function splitQueryParams(req) {
    // console.debug("splitQueryParams - Analyse des paramètres de la requête");
    const splited = req.originalUrl.split("?");
    const pathObj = {
        origin: req.originalUrl,
        method: req.method,
        path: splited[0],
        pathArr: splited[0].split("/").filter(Boolean),
        queryParams: { text: splited[1] },
        action: req.method + splited[0]
    };
    // console.debug("splitQueryParams - Objet chemin créé :", pathObj);
    return pathObj;
}

function searchRoute(pathObj, req, action = global.actions_json) {
    console.debug("searchRoute - Recherche de la route :", pathObj.action);
    // static
    if (action[pathObj.action]) {
        console.debug("searchRoute - Route statique trouvée");
        return action[pathObj.action];
    }

    // dyn
    for (let key in action) {
        // console.debug("searchRoute - Vérification de la route dynamique :", key);
        const keyArr = key.split("/").filter(Boolean);
        const pathArr = pathObj.action.split('/').filter(Boolean);
        const params = {};
        if (keyArr[0] === pathArr[0] && keyArr.length === pathArr.length) {
            let shouldContinue = false;

            for (let index = 1; index < pathArr.length; index++) {
                const regex = /^:[a-zA-Z]/;

                if (pathArr[index] !== keyArr[index] && !regex.test(keyArr[index])) {
                    shouldContinue = true;
                    break;
                }
                if (regex.test(keyArr[index])) {
                    const paramName = keyArr[index].substring(1);
                    params[paramName] = pathArr[index];
                }
            }

            if (shouldContinue) {
                continue;
            }

            req.params = { ...req.params, ...params };
            console.debug("searchRoute - Route dynamique trouvée avec paramètres :", req.params);
            return action[key];
        }
    }

    // none
    console.debug("searchRoute - Aucune route trouvée");
    return null;
}

module.exports = dynamicRouter;
