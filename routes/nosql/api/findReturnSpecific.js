const express = require('express');
const router = express.Router();

/* GET users.hbs listing. */
router.get('/', function (req, res, next) {

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
});

module.exports = router;
