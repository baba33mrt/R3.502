const express = require('express');
const router = express.Router();
const Group = schemas.Groups

router.use(express.json());

// Route pour créer un groupe vierge
router.post('/', async (req, res) => {
    try {
        const { name, color } = req.body;

        if (!name || !color) {
            return res.status(400).send({ error: 'Les champs "name" et "color" sont requis.' });
        }

        const group = new Group({
            name,
            color,
            permission: 0, // Aucune permission activée par défaut
        });

        await group.save();
        res.status(201).send({ success: 'Groupe créé avec succès.', group });
    } catch (err) {
        console.error('Erreur lors de la création du groupe:', err);
        res.status(500).send({ error: 'Erreur lors de la création du groupe.' });
    }
});

// Route pour modifier les permissions d’un groupe par UUID
router.put('/', async (req, res) => {
    try {
        const { permissionBit, enable, uuid } = req.body;

        if (permissionBit === undefined || enable === undefined || uuid === undefined) {
            return res.status(400).send({ error: 'Les champs "permissionBit" et "enable" sont requis.' });
        }

        const group = await Group.findOne({ uuid });
        if (!group) {
            return res.status(404).send({ error: 'Groupe non trouvé.' });
        }

        // Activer ou désactiver le bit de permission
        if (enable) {
            group.permission |= (1 << permissionBit); // Activer le bit
        } else {
            group.permission &= ~(1 << permissionBit); // Désactiver le bit
        }

        await group.save();
        res.send({ success: 'Permissions mises à jour avec succès.', group });
    } catch (err) {
        console.error('Erreur lors de la mise à jour des permissions:', err);
        res.status(500).send({ error: 'Erreur lors de la mise à jour des permissions.' });
    }
});

// Route pour supprimer un groupe par UUID
router.delete('/:id', async (req, res) => {
    try {
        const { uuid } = req.body;

        const result = await Group.findOneAndDelete({ uuid });
        if (!result) {
            return res.status(404).send({ error: 'Groupe non trouvé.' });
        }

        res.send({ success: 'Groupe supprimé avec succès.' });
    } catch (err) {
        console.error('Erreur lors de la suppression du groupe:', err);
        res.status(500).send({ error: 'Erreur lors de la suppression du groupe.' });
    }
});

module.exports = router;
