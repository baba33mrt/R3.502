const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Ticket = schemas.Tickets;
const User = schemas.Users; // Assurez-vous d'importer le modèle User

// Route pour obtenir un ticket par son ID
router.get('/:id', async (req, res) => {
    try {


        // Vérifier si l'ID utilisateur est un ObjectId valide
        let userId;
        if (mongoose.Types.ObjectId.isValid(req.session.passport.user)) {
            userId = mongoose.Types.ObjectId(req.session.passport.user);
        } else {
            // Rechercher l'utilisateur par un autre champ (par exemple, UUID) pour obtenir l'ObjectId
            const user = await User.findOne({ uuid: req.session.passport.user });
            if (!user) {
                return res.status(404).render('error', { messagte: "une erreur interne est survenue" });
            }
            userId = user._id;
        }

        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

        // Vérifier si l'utilisateur a déjà visualisé le ticket dans les 30 dernières minutes
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).render('ticketDetail', { error: 1, origin: req.originalUrl });
        }

        const hasViewedRecently = ticket.history.some(view => view.user && view.user.equals(userId) && view.date >= thirtyMinutesAgo);

        if (!hasViewedRecently) {
            // Ajouter une nouvelle vue si l'utilisateur n'a pas visualisé récemment
            ticket.history.push({ user: userId, date: new Date(),action: "view" });
            await ticket.save();
        }

        // Inverser l'ordre des vues avant d'afficher le ticket
        ticket.history.reverse();

        // Effectuer les populates nécessaires
        await ticket.populate({ path: "client", select: "entrepriseName technicalPhone email" })
            .populate({ path: "author", select: "username firstName lastName email phone" })
            .populate({ path: "project", select: "name" })
            .populate({ path: 'comments.author', select: 'username firstName lastName email phone' })
            .populate({ path: 'history.user', select: 'username firstName lastName email phone' })
            .populate({ path: 'affected', select: 'username firstName lastName email phone' })
            .execPopulate();

        console.log(ticket)
        res.render('ticketDetail', { title: res.locals.title, ticket, error: 0 });
    } catch (err) {
        console.error(err);
        return res.status(404).render('ticketDetail', { error: 1, origin: req.originalUrl });
    }
});

// Route pour lister tous les tickets
router.get('/', async (req, res) => {
    try {
        res.render(req.message.view);
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
});

module.exports = router;
