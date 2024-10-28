const express = require('express');
const router = express.Router();

router.use(express.json());

// Route pour récupérer un client par UUID
router.get('/:uuid', async (req, res) => {
    try {
        const client = await schemas.Clients.findOne({ uuid: req.params.uuid }).populate('projects');

        if (!client) {
            return res.status(404).send({ error: 'Client non trouvé.' });
        }

        res.send({ success: true, projects: client.projects });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: 'Erreur lors de la récupération du client.' });
    }
});


// Route pour récupérer tous les clients
router.get('/', async (req, res) => {
    try {
        const clients = await schemas.Clients.find({isActive: true});
        res.send({ success: true, clients });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: 'Erreur lors de la récupération des clients.' });
    }
});

// Route pour créer un nouveau client
router.post('/', async (req, res) => {
    try {
        const { entrepriseName, technicalPhone, email, projects } = req.body;
        if (!entrepriseName || !technicalPhone || !email) {
            return res.status(400).send({ error: 'Nom de l\'entreprise, téléphone et email sont requis.' });
        }

        const client = new schemas.Clients({
            entrepriseName,
            technicalPhone,
            email,
            projects: projects || []
        });

        await client.save();
        res.status(201).send({ success: 'Client créé avec succès.', client });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Erreur lors de la création du client.' });
    }
});

// Route pour mettre à jour un client
router.put('/', async (req, res) => {
    try {
        const { entrepriseName, technicalPhone, email, projects } = req.body;
        const client = await schemas.Clients.findOneAndUpdate(
            { uuid: req.params.uuid },
            { entrepriseName, technicalPhone, email, projects },
            { new: true }
        );

        if (!client) {
            return res.status(404).send({ error: 'Client non trouvé.' });
        }

        res.send({ success: 'Client mis à jour avec succès.', client });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Erreur lors de la mise à jour du client.' });
    }
});

// Route pour supprimer un client
router.delete('/', async (req, res) => {
    try {
        const result = await schemas.Clients.findOneAndUpdate(
            { uuid: req.body.uuid },
            { isActive: false },
            { new: true }
        );

        if (result.deletedCount === 0) {
            return res.status(404).send({ error: 'Client non trouvé.' });
        }

        res.send({ success: 'Client supprimé avec succès.' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Erreur lors de la suppression du client.' });
    }
});

module.exports = router;
