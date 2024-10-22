var express = require('express');
var router = express.Router();

/* set logout action and redirect to login page. */
router.get('/', async function (req, res, next) {
    if ((req?.session?.passport) && (req?.session?.passport?.user !== null)) {
        req.logout(function(err) {
            if (err) { return next(err); }
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});

module.exports = router;
