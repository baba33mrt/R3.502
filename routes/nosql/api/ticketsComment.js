const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const Ticket = schemas.Tickets;

// Middleware pour analyser les données des formulaires
router.use(express.urlencoded({ extended: true }));

// Route pour ajouter un commentaire à un ticket
router.post('/', async (req, res) => {
    try {
        if (!req.session?.passport?.user) {
            return res.redirect('/'); // affichage boîte de login si pas authentifié
        }

        if (!req.body || !req.body.comment || !req.body.ticketId) {
            return res.status(404).send({ error: "bad request or unauthorized 1", request: req.body });
        }

        if (!mongoose.Types.ObjectId.isValid(req.body.ticketId)) {
            return res.status(404).send({ error: "bad request or unauthorized", request: req.body });
        }

        const ticket = await Ticket.findById(req.body.ticketId).catch(e => {
            return res.status(403).send({ error: "bad request or unauthorized", request: req.body });
        });

        if (!ticket) return res.status(404).send({ error: "Ticket not found" });

        let userId = req.session.passport.user;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            // Si l'ID utilisateur n'est pas un ObjectId valide, rechercher l'utilisateur dans la base de données par UUID
            const user = await schemas.Users.findOne({ uuid: userId });
            if (!user) {
                return res.status(404).send({ error: "User not found" });
            }
            userId = user._id; // Utiliser l'ObjectId de l'utilisateur trouvé
        } else {
            // Convertir en ObjectId si c'est déjà une chaîne qui représente un ObjectId
            userId = mongoose.Types.ObjectId(userId);
        }

        ticket.comments.push({
            author: userId,
            content: req.body.comment
        });

        ticket.history.push({ user: userId, date: new Date(), action: `close` });
        await ticket.save().catch(e => console.error(e));

        res.status(200).send({ success: 'Ticket updated successfully', ticket });

    } catch (err) {
        res.status(400).render('error', { message: err.message });
    }
});

module.exports = router;
