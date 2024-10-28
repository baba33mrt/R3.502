const express = require('express');
const router = express.Router();

router.use(express.urlencoded({ extended: true }));

router.get('/:uuid', async (req, res) => {
    try {
        // Correction ici : on passe req.params.id et non req.params
        const group = await schemas.Groups.findOne({uuid: req.params.uuid});

        if (!group) return res.render('404'); // Si l'utilisateur n'est pas trouvé}

        const permissions = await schemas.Permissions.find({})

        if (!permissions) return res.render('404'); // Si l'utilisateur n'est pas trouvé}

        res.render('admin/groupsEdit', { title: res.locals.title, group, permissions });
    } catch (err) {
        console.error(err);
        return res.status(404).render('404', { error: 1, origin: req.originalUrl });
    }
});

router.get('/', async (req, res) => {
    try {
        const groups = await schemas.Groups.find({});


        res.render('admin/groups', { title: res.locals.title, groups, error: 0 });
    } catch (err) {
        console.error(err);
        return res.status(404).render('404', { error: 1, origin: req.originalUrl });
    }
});

module.exports = router;
