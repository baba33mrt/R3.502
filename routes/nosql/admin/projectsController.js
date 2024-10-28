const express = require('express');
const router = express.Router();

router.use(express.urlencoded({ extended: true }));

router.get('/:uuid', async (req, res) => {
    try {
        console.log("project UUID")

        const project = await schemas.Projects.findOne({uuid: req.params.uuid});

        if (!project) {
            return res.render('404');
        }

        res.render('admin/projectsEdit', { title: res.locals.title, project });
    } catch (err) {
        console.error(err);
        return res.status(404).render('admin/projectsEdit', { error: 1, origin: req.originalUrl });
    }
});

router.get('/', async (req, res) => {
    try {
        const projects = await schemas.Projects.find({isActive: true});
        res.render('admin/projects', { title: res.locals.title, projects, error: 0 });
    } catch (err) {
        console.error(err);
        return res.status(404).render('admin/projects', { error: 1, origin: req.originalUrl });
    }
});

module.exports = router;
