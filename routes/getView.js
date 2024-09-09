const express = require('express');
const router = express.Router();

/*  GET view page without to access to the database */
router.get('/', function(req, res, next) {
    console.log("from getView ");
    let params_render = {};
    for (let param in global.actions_json[req.message.action]) {
        params_render[param] = (global.actions_json[req.message.action])[param];
    }
    //console.log("params_render :", params_render);
    res.render(req.message.view, params_render);
});

module.exports = router;
