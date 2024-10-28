const express = require('express');
const mongoose = require("mongoose");
const {tr} = require("@faker-js/faker");
const router = express.Router();
const Projects = schemas.Projects;

// Route pour créer un projet
router.post('/', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        // Validation des champs
        if (!req.body.name || !req.body.description) {
            return res.status(400).send({ message: 'Le nom et la description sont obligatoires.' });
        }

        // Création du projet
        const project = new Projects({
            name: req.body.name,
            description: req.body.description,
        });

        await project.save();

        res.status(201).send({ success: "Projet créé avec succès", uuid: project.uuid });
    } catch (err) {
        res.status(500).send({ message: "Erreur lors de la création du projet : " + err.message });
    }
});

// Route pour mettre à jour un projet
router.put('/', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        // Validation de l'UUID
        if (!req.body.uuid) {
            return res.status(400).send({ message: 'UUID du projet est requis.' });
        }

        // Récupération du projet à mettre à jour
        const project = await Projects.findOne({ uuid: req.body.uuid });

        if (!project) {
            return res.status(404).send({ message: 'Projet non trouvé.' });
        }

        // Mise à jour des informations
        project.name = req.body.name;
        project.description = req.body.description;

        // Sauvegarde des modifications
        await project.save();

        res.status(200).send({ success: "Projet mis à jour avec succès", project });
    } catch (err) {
        res.status(500).send({ message: "Erreur lors de la mise à jour du projet : " + err.message });
    }
});

// Route pour supprimer un projet
router.delete('/', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        // Validation de l'UUID
        if (!req.body.uuid) {
            return res.status(400).send({ message: 'UUID du projet est requis.' });
        }

        // Suppression du projet
        const result = await schemas.Projects.findOneAndUpdate(
            { uuid: req.body.uuid },
            { isActive: false },
            { new: true }
        );

        if (result.deletedCount === 0) {
            return res.status(404).send({ message: 'Projet non trouvé.' });
        }

        res.send({ success: "Projet supprimé avec succès" });
    } catch (err) {
        res.status(500).send({ message: "Erreur lors de la suppression du projet : " + err.message });
    }
});


// Route pour lister tous les projets
router.get('/', async (req, res) => {
    try {
        if (!req.session?.passport?.user) {
            return res.redirect('/'); // rediriger vers la page de login si l'utilisateur n'est pas authentifié
        }

        // Récupération des projets
        const projects = await Projects.find({isActive: true});
        res.setHeader('Content-Type', 'application/json');
        res.send(projects);
    } catch (err) {
        res.status(500).send({ message: "Erreur lors de la récupération des projets : " + err.message });
    }
});

module.exports = router;
