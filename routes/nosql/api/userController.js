const express = require('express');
const router = express.Router();
const Users = schemas.Users; // Assurer que tu utilises la bonne définition du modèle pour les utilisateurs
const Groups = schemas.Groups;

// Middleware pour parser les requêtes URL encodées
router.use(express.urlencoded({ extended: true }));
router.use(express.json()); // Important pour traiter les requêtes JSON

// Route pour mettre à jour un utilisateur via API
router.post("/:uuid/update", async (req, res) => {
    try {
        const body = req.body;

        // Mise à jour de l'utilisateur
        const result = await Users.updateOne(
            { uuid: req.params.uuid },  // Filtrer par UUID
            {
                lastName: body.lastName,
                firstName: body.firstName,
                username: body.username,
                email: body.email,
                phone: body.phone,
                roles: body['roles[]'] || []
            }
        );

        if (result.nModified === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé ou pas de modifications." });
        }

        res.status(200).json({ success: "Utilisateur mis à jour avec succès." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur." });
    }
});

// Route pour créer un nouvel utilisateur via API
router.post("/new", async (req, res) => {
    try {
        const body = req.body;

        // Création d'un nouvel utilisateur
        const user = new Users({
            lastName: body.lastName,
            firstName: body.firstName,
            username: body.username,
            email: body.email,
            phone: body.phone,
            roles: body['roles[]'] || []
        });

        await user.save();
        res.status(201).json({ success: "Utilisateur créé avec succès", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la création de l'utilisateur." });
    }
});

// Route pour obtenir un utilisateur par UUID
router.get('/:id', async (req, res) => {
    try {
        const user = await Users.findOne({ uuid: req.params.uuid });

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        const allRoles = await Groups.find({});
        res.status(200).json({ user, allRoles });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur." });
    }
});


module.exports = router;
