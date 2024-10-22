const express = require('express');
const router = express.Router();

router.use(express.urlencoded({ extended: true }));

router.post("/:uuid/update", async (req, res) => {
    try {
        console.log("success");

        // Transformer req.body en objet exploitable
        const body = Object.assign({}, req.body);
        console.log(body);

        const user = await schemas.Users.updateOne(
            { uuid: body.uuid },  // Filtrer par UUID
            {
                lastName: body.lastName,  // Utiliser "body" après conversion
                firstName: body.firstName,
                username: body.username,
                email: body.email,
                phone: body.phone,
                roles: body['roles[]'] || [] // Vérifie que roles est bien un tableau
            }
        );

        console.log(user);
        res.redirect("/admin/users");
    } catch (err) {
        console.error(err);
        return res.status(404).render('admin/usersEdit', { error: 1, origin: req.originalUrl });
    }
})

router.post("/new", async (req, res) => {
    try {
        // Transformer req.body en objet exploitable
        const body = Object.assign({}, req.body);
        console.log(body);

        const user = new schemas.Users(
            {
                lastName: body.lastName,  // Utiliser "body" après conversion
                firstName: body.firstName,
                username: body.username,
                email: body.email,
                phone: body.phone,
                roles: body['roles[]'] || [] // Vérifie que roles est bien un tableau
            }
        );

        await user.save()

        console.log(user);
        res.redirect("/admin/users");
    } catch (err) {
        console.error(err);
        return res.status(404).render('admin/usersEdit', { error: 1, origin: req.originalUrl });
    }
});

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
        const users = await schemas.Users.find({}); // Récupération de tous les utilisateurs
        res.render('admin/users', { title: res.locals.title, users, error: 0 });
    } catch (err) {
        console.error(err);
        return res.status(404).render('admin/users', { error: 1, origin: req.originalUrl });
    }
});

module.exports = router;
