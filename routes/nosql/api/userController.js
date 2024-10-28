const express = require('express');
const router = express.Router();
const {hashPassword} = require("../../../utils/CryptoManager")

router.use(express.json());

// Route pour récupérer un utilisateur par UUID
router.get('/:uuid', async (req, res) => {
    try {
        const user = await schemas.Users.findOne({ uuid: req.params.uuid });

        if (!user) {
            return res.status(404).send({ error: 'Utilisateur non trouvé.' });
        }

        res.send({ success: true, user });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: 'Erreur lors de la récupération de l\'utilisateur.' });
    }
});

// Route pour récupérer tous les utilisateurs
router.get('/', async (req, res) => {
    try {
        const users = await schemas.Users.find({});
        res.send({ success: true, users });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: 'Erreur lors de la récupération des utilisateurs.' });
    }
});

// Route pour créer un nouvel utilisateur
router.post('/', async (req, res) => {
    try {
        const { username, firstName, lastName, email, phone, password, roles, isActive } = req.body;

        if (!username || !firstName || !lastName || !email || !password || !roles) {
            return res.status(400).send({ error: 'Les champs nom d\'utilisateur, prénom, nom, email, mot de passe et rôles sont requis.' });
        }

        let hPassword = hashPassword(password);
        const user = new schemas.Users({
            username,
            firstName,
            lastName,
            email,
            phone,
            password: hPassword,
            roles,
            isActive: isActive || true
        });

        await user.save();
        res.status(201).send({ success: 'Utilisateur créé avec succès.', user });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Erreur lors de la création de l\'utilisateur.' });
    }
});

// Route pour mettre à jour un utilisateur
router.put('/', async (req, res) => {
    try {


        const { uuid, username, firstName, lastName, email, phone, roles } = req.body;
        const user = await schemas.Users.findOneAndUpdate(
            { uuid: uuid },
            { username, firstName, lastName, email, phone, roles },
            { new: true }
        );

        if (!user) {
            return res.status(404).send({ error: 'Utilisateur non trouvé.' });
        }

        res.send({ success: 'Utilisateur mis à jour avec succès.', user });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Erreur lors de la mise à jour de l\'utilisateur.' });
    }
});

// Route pour supprimer un utilisateur
router.delete('/', async (req, res) => {
    try {
        const user = await schemas.Users.findOneAndUpdate(
            { uuid: req.body.uuid },
            { isActive: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).send({ error: 'Utilisateur non trouvé.' });
        }

        res.send({ success: 'Utilisateur désactivé avec succès.', user });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Erreur lors de la désactivation de l\'utilisateur.' });
    }
});

module.exports = router;
