const express = require('express');
const { body, validationResult } = require('express-validator');
const Ticket = require('../../utils/models/ticket');
const router = express.Router();

// Route pour créer un ticket
router.post('/create', [
    body('client').isMongoId().withMessage('Client invalide'),
    body('origine.type').isIn(['telephone', 'mail']).withMessage('Type d\'origine  invalide'),
    body('origine.data').notEmpty().withMessage('Données d\'origine requises'),
    body('projet').isMongoId().withMessage('Projet invalide'),
    body('etat').isIn(['En attente', 'Affecté', 'Annulé', 'Résolu']).withMessage('État invalide'),
    body('level').isInt({ min: 1, max: 5 }).withMessage('Niveau doit être entre 1 et 5'),
    body('domaine').isIn(['demande d’ajout', 'bug report', 'Type']).withMessage('Domaine invalide'),
    body('type').isIn(['Support technique', 'réclamation', 'demande d’information', 'demande de service']).withMessage('Type invalide'),
    body('sujet').notEmpty().withMessage('Sujet requis'),
    body('message').notEmpty().withMessage('Message requis'),
    body('author').isMongoId().withMessage('Auteur invalide')
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { client, origine, projet, etat, level, domaine, type, sujet, message, author } = req.body;

    try {
        const ticket = new Ticket({
            client,
            origine: {
                type: origine.type,
                data: origine.data
            },
            projet,
            etat,
            level,
            domaine,
            type,
            sujet,
            message,
            author
        });

        await ticket.save();
        res.status(201).json(ticket); // Retourne le ticket créé
    } catch (error) {
        console.log('Erreur lors de la création du ticket :', error);
        res.status(500).json({ message: 'Erreur lors de la création du ticket', error });
    }
});

// Route pour afficher tous les tickets
router.get('/', async(req, res) => {
    try {
        const tickets = await Ticket.find().populate('client projet author');
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la récupération des tickets',
            error
        });
    }
});

// Route pour afficher un ticket par ID
router.get('/:id', async(req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id).populate('client projet author');
        if (!ticket) return res.status(404).json({ message: 'Ticket non trouvé' });
        res.status(200).json(ticket);
    } catch (error) {
        console.log('Erreur lors de la récupération du ticket :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du ticket', error });
    }
});

module.exports = router;