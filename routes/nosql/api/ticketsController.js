const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const Ticket = schemas.Tickets;
const User = schemas.Users;

// Route pour créer un ticket
router.post('/', async (req, res) => {

    try {

        console.log(req.body)

        const {origin, level, type, subject, content } = req.body;

        const client = await schemas.Clients.findOne({uuid: req.body.clientUUID})
        if (!client) return res.status(404).json({ error: "Client not found" });


        const project = await schemas.Projects.findOne({uuid: req.body.projectUUID})
        if (!project) return res.status(404).json({ error: "Project not found" });

        const author = await schemas.Users.findOne({uuid: req.session.passport.user})
        if (!author) return res.status(404).json({ error: "author not found" });


        const ticketData = {
            client,
            origin,
            project,
            level,
            type,
            subject,
            author,
            content
        };
        const ticket = new Ticket(ticketData);
        await ticket.save();
        res.status(201).json({ success: 'Ticket created successfully', ticket });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Route pour mettre à jour un ticket
router.put('/', async (req, res) => {
    if (!req.session?.passport?.user) {
        return res.redirect('/');
    }

    const { id, type, userId, priority, reason } = req.body;
    const error403 = { error: "bad request or unauthorized", request: req.body };

    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(403).send(error403);

    try {
        const ticket = await Ticket.findById(id);
        if (!ticket) return res.status(404).send({ error: "Ticket not found" });

        // Récupération de l'utilisateur actuel
        let currentUser = req.session.passport.user;
        if (!mongoose.Types.ObjectId.isValid(currentUser)) {
            const user = await User.findOne({ uuid: currentUser });
            if (!user) return res.status(404).send({ error: "User not found" });
            currentUser = user._id;
        } else {
            currentUser = mongoose.Types.ObjectId(currentUser);
        }

        switch (type) {
            case 1: // affecter
                const assignedUser = await findUserByIdOrUUID(userId);
                if (!assignedUser) return res.status(404).send({ error: "User not found" });

                ticket.affected = assignedUser._id;
                await ticket.save();
                return res.status(200).send({ success: 'Ticket updated successfully' });

            case 2: // priorité
                ticket.priority = priority;
                ticket.history.push({
                    user: currentUser,
                    date: new Date(),
                    action: `change priority to ${priority}`,
                });
                await ticket.save();
                return res.status(200).send({ success: 'Ticket updated successfully' });

            case 3: // clore le ticket
                ticket.state = 0;
                ticket.open = false;
                ticket.comments.push({
                    author: currentUser,
                    content: `<p><strong><span style="color: #e03e2d;">-- Ticket clôturé --</span></strong></p><p>${reason}</p>`
                });
                ticket.history.push({ user: currentUser, date: new Date(), action: 'close' });
                await ticket.save();
                return res.status(200).send({ success: 'Ticket closed successfully', ticket });

            case 4: // réouvrir le ticket
                ticket.state = 1;
                ticket.open = true;
                ticket.comments.push({
                    author: currentUser,
                    content: `<p><strong><span style="color: #45e02d;">-- Ticket réouvert --</span></strong></p><p>${reason}</p>`
                });
                ticket.history.push({ user: currentUser, date: new Date(), action: 'reopen' });
                await ticket.save();
                return res.status(200).send({ success: 'Ticket reopened successfully', ticket });

            default:
                return res.status(400).send({ error: "Invalid update type" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
});

router.get('/', async (req, res) => {
    if (!req.session?.passport?.user) {
        return res.redirect('/');
    }

    try {
        const projection = req.message.return_data.reduce((acc, field) => {
            acc[field] = 1;
            return acc;
        }, {});

        const tickets = await Ticket.find({ open: true }, projection)
            .populate('client')
            .populate('project')
            .populate({ path: "author", select: 'username firstName lastName email phone uuid -_id' });

        res.setHeader('content-type', 'application/json');
        res.send(tickets);
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
});

// Route pour lister tous les tickets
router.get('/', async (req, res) => {
    if (!req.session?.passport?.user) {
        return res.redirect('/');
    }

    try {
        const projection = req.message.return_data.reduce((acc, field) => {
            acc[field] = 1;
            return acc;
        }, {});

        const tickets = await Ticket.find({ open: true }, projection)
            .populate('client')
            .populate('project')
            .populate({ path: "author", select: 'username firstName lastName email phone uuid -_id' });

        res.setHeader('content-type', 'application/json');
        res.send(tickets);
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
});

async function findUserByIdOrUUID(userId) {
    if (mongoose.Types.ObjectId.isValid(userId)) {
        return await User.findById(userId);
    }
    return await User.findOne({ uuid: userId });
}

module.exports = router;
