var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    // if ((req.session.passport) && (req.session.passport.user != null)) {

        const projection = req.message.return_data.reduce((acc, field) => {
            acc[field] = 1;
            return acc;
        }, {});
        global.schemas[req.message.modelName].find({}, projection).then(result => {

            // console.log("connexion depuis Finder : ", result);
            res.setHeader('content-type', 'application/json');
            res.send(result);

        }).catch(err => {
            throw err
        })
    // } else {
    //     res.redirect('/');  // affichage boîte de login si pas authentifié
    // }
});

module.exports = router;
