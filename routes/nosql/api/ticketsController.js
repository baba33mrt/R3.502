const Ticket = global.schemas['Ticket'];

exports.createTicket = async(req, res) => {
    try {
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

        const ticket = new Ticket(ticketData);
        await ticket.save();
        res.redirect('/dashboard/tickets'); // Redirige vers la liste des tickets
    } catch (err) {
        res.status(400).render('error', { message: err.message });
    }
};

exports.listTickets = async(req, res) => {
    try {
        const tickets = await Ticket.find().populate('client').populate('projet').populate('author');
        res.render('ticketList', { title: res.locals.title, tickets });
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
};

exports.getTicketById = async(req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id).populate('client').populate('projet').populate('author');
        if (!ticket) {
            return res.status(404).render('error', { message: 'Ticket introuvable' });
        }
        res.render('ticketDetail', { title: res.locals.title, ticket });
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
};