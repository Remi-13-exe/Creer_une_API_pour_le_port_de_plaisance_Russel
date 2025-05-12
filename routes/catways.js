// Importation du module Express pour créer l'application web
const express = require('express');

// Importation du module Mongoose pour interagir avec MongoDB
const mongoose = require('mongoose');

// Création de l'application Express
const app = express();

// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());
// Middleware pour parser les données URL-encodées (par exemple pour les formulaires)
app.use(express.urlencoded({ extended: true }));

// Connexion à la base de données MongoDB (ici, sur le localhost et la base "test")
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });

// Définition d'un schéma Mongoose pour les catways
// Le schéma définit deux champs : "number" et "catwayState"
const CatwaySchema = new mongoose.Schema({ number: String, catwayState: String });

// Création du modèle "Catway" basé sur le schéma défini ci-dessus
const Catway = mongoose.model('Catway', CatwaySchema);

// Recherche de tous les documents "Catway" dans la collection et affichage dans la console
// Note : L'utilisation de "await" ici nécessite un contexte async, ce qui peut poser problème en dehors d'une fonction async.
const catways = await Catway.find();
console.log(catways);

// Définition d'une route HTTP DELETE pour la suppression d'un catway par son ID
app.delete('/catways/:id', async (req, res) => {
  // Journalisation de l'ID reçu pour suppression
  console.log('Requête reçue pour suppression:', req.params.id);
  try {
    // Suppression du catway correspondant à l'ID fourni
    const deletedCatway = await Catway.findByIdAndDelete(req.params.id);
    // Envoi de la réponse en JSON avec le catway supprimé
    res.json(deletedCatway);
  } catch (err) {
    // En cas d'erreur, journalise l'erreur et renvoie une réponse 500 "Erreur serveur"
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// Démarrage de l'application sur le port 5000 et affichage d'un message de confirmation dans la console
app.listen(5000, () => console.log('Serveur en écoute sur le port 5000'));
