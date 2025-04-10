const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Catway = require('./models/Catway'); // Assure-toi d'importer ton modèle Catway
const path = require('path');
const app = express();

// Configuration de dotenv pour utiliser les variables d'environnement
dotenv.config();

// Configuration de EJS comme moteur de vues
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  // S'assurer que Express sait où se trouve le dossier 'views'

// Middleware pour parser les données JSON
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.log('Erreur MongoDB:', err));

// Route pour afficher la liste des catways
app.get('/catways', async (req, res) => {
  try {
    const catways = await Catway.find();  // Récupère tous les catways depuis la base de données
    console.log(catways);  // Ajout du log ici pour voir les données récupérées
    res.render('catways', { catways });   // Rends la page catways.ejs et passe les données catways
  } catch (err) {
    console.error(err);  // Log de l'erreur si ça échoue
    res.status(500).send('Erreur lors de la récupération des catways');
  }
});

// Route de base pour tester
app.get('/', (req, res) => {
  res.send('Bienvenue sur l’API du Port de Plaisance Russell');
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
