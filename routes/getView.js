const express = require('express');
const {create} = require("hbs");
const createError = require("http-errors");
const router = express.Router();

/*  GET view page without to access to the database */
router.get('/', function (req, res, next) {
    try {

        // console.log("from getView ");
        let params_render = {};
        for (let param in global.actions_json[req.message.action]) {
            params_render[param] = (global.actions_json[req.message.action])[param];
        }
        //console.log("params_render :", params_render);
        res.render(req.message.view, params_render);

    } catch (e) {
        res.render("error", createError(500))
    }
});

module.exports = router;
