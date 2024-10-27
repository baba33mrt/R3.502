const express = require('express');
const router = express.Router();
const Tickets = schemas.Tickets;

// Route pour rechercher les tickets
router.post('/', async (req, res) => {
    try {
        const {
            uuid,
            author,
            state,
            createdBefore,
            createdAfter,
            closedBefore,
            closedAfter,
            origin,
            project,
            subject,
            priority
        } = req.body;

        // Construire l'objet de filtrage pour MongoDB
        const query = {};

        // Filtre par UUID
        if (uuid) {
            query.uuid = uuid;
        }

        // Filtre par auteur (créé par)
        if (author) {
            query.$or = [
                { 'author.firstName': new RegExp(author, 'i') },
                { 'author.lastName': new RegExp(author, 'i') },
                { 'author.email': new RegExp(author, 'i') }
            ];
        }

        // Filtre par état du ticket
        if (state) {
            query.state = state;
        }

        // Filtre par date de création
        if (createdBefore || createdAfter) {
            query.createdAt = {};
            if (createdBefore) {
                query.createdAt.$lte = new Date(createdBefore);
            }
            if (createdAfter) {
                query.createdAt.$gte = new Date(createdAfter);
            }
        }

        // Filtre par date de clôture
        if (closedBefore || closedAfter) {
            query.closedAt = {};
            if (closedBefore) {
                query.closedAt.$lte = new Date(closedBefore);
            }
            if (closedAfter) {
                query.closedAt.$gte = new Date(closedAfter);
            }
        }

        // Filtre par origine
        if (origin) {
            query.origin = new RegExp(origin, 'i'); // Recherche insensible à la casse
        }

        // Filtre par projet
        if (project) {
            query['project.uuid'] = project;
        }

        // Filtre par sujet
        if (subject) {
            query.subject = new RegExp(subject, 'i'); // Recherche insensible à la casse
        }

        // Filtre par priorité
        if (priority) {
            query.priority = parseInt(priority, 10);
        }

        // Exécution de la requête pour récupérer les tickets filtrés
        const tickets = await Tickets.find(query)
            .populate('project') // Charger les détails du projet associé
            .populate('author') // Charger les détails de l'auteur du ticket
            .lean();

        // Réponse avec les tickets trouvés
        res.status(200).json({ success: true, tickets });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erreur lors de la recherche des tickets.' });
    }
});

module.exports = router;
