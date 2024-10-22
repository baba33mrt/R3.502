const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const Ticket = schemas.Tickets;


// Route pour créer un ticket
router.post('/', async (req, res) => {
    try {
        if (!req.session?.passport?.user) {
            res.redirect('/'); // affichage boîte de login si pas authentifié
        } else {

            const ticketData = {
                client: req.body.client,
                origine: req.body.origine,
                projet: req.body.projet,
                etat: req.body.etat || 'En attente',
                level: req.body.level,
                domaine: req.body.domaine,
                type: req.body.type,
                sujet: req.body.sujet,
                message: req.body.message,
                author: req.user._id // Assurez-vous que l'utilisateur est connecté
            };
        }
        const ticket = new Ticket(ticketData);
        await ticket.save();
        res.redirect('/dashboard/tickets'); // Redirige vers la liste des tickets
    } catch (err) {
        res.status(400).render('error', {message: err.message});
    }
});

router.put('/', async (req, res) => {
    res.setHeader('content-type', 'application/json');
    const error403 = { error: "bad request or unauthorized", request: req.body };

    try {
        if (!req.session?.passport?.user) {
            return res.redirect('/'); // affichage boîte de login si pas authentifié
        }

        if (!req.body) return res.status(403).send(error403);
        if (!mongoose.Types.ObjectId.isValid(req.body.id)) return res.status(403).send(error403);

        const body = req.body;

        const ticket = await Ticket.findById(body.id).catch(e => {
            return res.status(403).send(error403);
        });
        if (!ticket) return res.status(404).send({ error: "Ticket not found" });

        // Récupérer l'ID de l'utilisateur
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

        switch (body?.type) {
            case 1: // affect
                console.log(1);

                let affectUserId;
                if (!mongoose.Types.ObjectId.isValid(body.userId)) {
                    // Si l'ID utilisateur n'est pas un ObjectId valide, rechercher l'utilisateur dans la base de données par UUID
                    const user = await schemas.Users.findOne({uuid: body.userId});
                    if (!user) {
                        return res.status(404).send({error: "User not found"});
                    }
                    affectUserId = user._id; // Utiliser l'ObjectId de l'utilisateur trouvé
                } else {
                    // Convertir en ObjectId si c'est déjà une chaîne qui représente un ObjectId
                    affectUserId = mongoose.Types.ObjectId(body.userId);
                }

                ticket.affected = affectUserId

                await ticket.save().catch(e => console.error(e));

                res.status(200).send({ success: 'Ticket updated successfully'});
                break;

            case 2: // priority

                console.log(3);

                ticket.priority = body.priority
                ticket.history.push({ user: userId, date: new Date(),action: `change priority ${ticket.priority} --> ^${body.priority}` });

                await ticket.save().catch(e => console.error(e));

                res.status(200).send({ success: 'Ticket updated successfully'});
                break;

            case 3: // close
                console.log(4);

                ticket.state = 0;
                ticket.open = 0;

                ticket.comments.push({
                    author: userId,
                    content: `<p><strong><span style="color: #e03e2d;">-- Ticket cl&ocirc;tur&eacute; --</span></strong></p><p>${body.reason}</p>`
                });

                console.log(ticket.comments);

                ticket.history.push({ user: userId, date: new Date(),action: `close` });
                await ticket.save().catch(e => console.error(e));

                res.status(200).send({ success: 'Ticket updated successfully', ticket });
                break;

            case 4: // reopen
                console.log(5);

                ticket.state = 1;
                ticket.open = 1;

                ticket.comments.push({
                    author: userId,
                    content: `<p><strong><span style="color: #45e02d;">-- Ticket réouvert --</span></strong></p><p>${body.reason}</p>`
                });

                ticket.history.push({ user: userId, date: new Date(),action: `reopen` });
                await ticket.save().catch(e => console.error(e));

                res.status(200).send({ success: 'Ticket updated successfully', ticket });
                break;

            default:
                res.status(400).send({ error: "Invalid update type" });
        }
    } catch (err) {
        console.error(err);
        res.status(403).send(error403);
    }
});

// Route pour lister tous les tickets
router.get('/', async (req, res) => {
    try {
        if (!req.session?.passport?.user) {
            res.redirect('/'); // affichage boîte de login si pas authentifié
        } else {
            const projection = req.message.return_data.reduce((acc, field) => {
                acc[field] = 1;
                return acc;
            }, {});

            const tickets = await Ticket.find({}, projection)// .populate('client').populate('project').populate({path: "author", select: 'username firstName lastName email phone uuid -_id '})
            res.setHeader('content-type', 'application/json');
            res.send(tickets);
        }
    } catch (err) {
        res.status(500).render('error', {message: err.message});
    }
});


module.exports = router;

