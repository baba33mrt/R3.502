const express = require('express');
const router = express.Router();

router.use(express.urlencoded({ extended: true }));

router.post("/:id/update", async (req, res) => {
    try {
        console.log("success");

        // Transformer req.body en objet exploitable
        const body = Object.assign({}, req.body);
        console.log(body);

        const project = await schemas.Projects.updateOne(
            { uuid: body.uuid },  // Filtrer par UUID
            {
                name: body.name,  // Utiliser "body" après conversion
                description: body.description,
            }
        );

        console.log(project);
        res.redirect("/admin/projects");
    } catch (err) {
        console.error(err);
        return res.status(404).render('admin/projectsEdit', { error: 1, origin: req.originalUrl });
    }
})

router.post("/new", async (req, res) => {
    try {
        // Transformer req.body en objet exploitable
        const body = Object.assign({}, req.body);
        console.log(body);

        const project = new schemas.Users(
            {
                lastName: body.lastName,  // Utiliser "body" après conversion
                firstName: body.firstName,
                username: body.username,
                email: body.email,
                phone: body.phone,
                roles: body['roles[]'] || [] // Vérifie que roles est bien un tableau
            }
        );

        await project.save()

        console.log(project);
        res.redirect("/admin/projects");
    } catch (err) {
        console.error(err);
        return res.status(404).render('admin/projectsEdit', { error: 1, origin: req.originalUrl });
    }
});

router.get('/:uuid', async (req, res) => {
    try {
        console.log("project UUID")

        // Correction ici : on passe req.params.id et non req.params
        const project = await schemas.Projects.findOne({uuid: req.params.uuid});

        if (!project) {
            return res.render('404'); // Si l'utilisateur n'est pas trouvé
        }

        res.render('admin/projectsEdit', { title: res.locals.title, project });
    } catch (err) {
        console.error(err);
        return res.status(404).render('admin/projectsEdit', { error: 1, origin: req.originalUrl });
    }
});

router.get('/', async (req, res) => {
    try {
        const projects = await schemas.Projects.find({}); // Récupération de tous les utilisateurs
        res.render('admin/projects', { title: res.locals.title, projects, error: 0 });
    } catch (err) {
        console.error(err);
        return res.status(404).render('admin/projects', { error: 1, origin: req.originalUrl });
    }
});

module.exports = router;
