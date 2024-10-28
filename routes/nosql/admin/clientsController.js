const express = require('express');
const router = express.Router();

router.use(express.urlencoded({ extended: true }));

router.get('/:uuid', async (req, res) => {
    try {
        const client = await schemas.Clients.findOne({uuid: req.params.uuid});

        if (!client) {
            return res.render('404');
        }

        const allProjects = await schemas.Projects.find({isActive: true})


        res.render('admin/clientsEdit', { title: res.locals.title, client ,allProjects});
    } catch (err) {
        console.error(err);
        return res.status(404).render('admin/clientsEdit', { error: 1, origin: req.originalUrl });
    }
});

router.get('/', async (req, res) => {
    try {
        const clients = await schemas.Clients.find({isActive: true});
        res.render('admin/clients', { title: res.locals.title, clients, error: 0 });
    } catch (err) {
        console.error(err);
        return res.status(404).render('admin/clients', { error: 1, origin: req.originalUrl });
    }
});

module.exports = router;
