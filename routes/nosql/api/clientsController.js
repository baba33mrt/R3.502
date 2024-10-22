const express = require('express');
const router = express.Router();
const Clients = schemas.Users; // Assure-toi que le modèle de données est correct pour les clients

router.use(express.urlencoded({ extended: true }));
router.use(express.json()); // Important pour traiter les requêtes JSON

// Route pour mettre à jour un client
router.post("/:uuid/update", async (req, res) => {
    try {
        const body = req.body;

        // Mettre à jour le client en fonction de l'UUID
        const result = await Clients.updateOne(
            { uuid: req.params.uuid },  // Filtrer par UUID
            {
                lastName: body.lastName,
                firstName: body.firstName,
                username: body.username,
                email: body.email,
                phone: body.phone,
                roles: body['roles[]'] || [] // Vérifier que roles est bien un tableau
            }
        );

        if (result.nModified === 0) {
            return res.status(404).json({ message: "Client non trouvé ou pas de modifications apportées." });
        }

        res.status(200).json({ success: "Client mis à jour avec succès." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur lors de la mise à jour du client." });
    }
});

// Route pour créer un nouveau client
router.post("/new", async (req, res) => {
    try {
        const body = req.body;

        // Création d'un nouveau client
        const client = new Clients({
            lastName: body.lastName,
            firstName: body.firstName,
            username: body.username,
            email: body.email,
            phone: body.phone,
            roles: body['roles[]'] || [] // Vérifier que roles est bien un tableau
        });

        await client.save();

        res.status(201).json({ success: "Client créé avec succès", client });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur lors de la création du client." });
    }
});

// Route pour récupérer un client par UUID
router.get('/:uuid', async (req, res) => {
    try {
        // Recherche d'un client en fonction de l'UUID
        const client = await Clients.findOne({ uuid: req.params.uuid });

        if (!client) {
            return res.status(404).json({ message: "Client non trouvé." });
        }

        const allRoles = await schemas.Groups.find({});

        res.status(200).json({ client, allRoles });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur lors de la récupération du client." });
    }
});

// Route pour lister tous les clients
router.get('/', async (req, res) => {
    try {
        const clients = await Clients.find({}); // Récupération de tous les clients
        res.status(200).json(clients);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur lors de la récupération des clients." });
    }
});

module.exports = router;
