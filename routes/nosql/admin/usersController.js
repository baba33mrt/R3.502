const express = require('express');
const router = express.Router();

router.use(express.urlencoded({ extended: true }));

router.get('/:uuid', async (req, res) => {
    try {
        // Correction ici : on passe req.params.id et non req.params
        const user = await schemas.Users.findOne({uuid: req.params.uuid});

        if (!user) {
            return res.render('404'); // Si l'utilisateur n'est pas trouvé
        }

        const allRoles = await schemas.Groups.find({})

        res.render('admin/usersEdit', { title: res.locals.title, user, allRoles });
    } catch (err) {
        console.error(err);
        return res.status(404).render('admin/usersEdit', { error: 1, origin: req.originalUrl });
    }
});

router.get('/', async (req, res) => {
    try {
        const users = await schemas.Users.find({isActive: true});
        const allRoles = await schemas.Groups.find({})


        res.render('admin/users', { title: res.locals.title, users, allRoles, error: 0 });
    } catch (err) {
        console.error(err);
        return res.status(404).render('admin/users', { error: 1, origin: req.originalUrl });
    }
});

module.exports = router;
