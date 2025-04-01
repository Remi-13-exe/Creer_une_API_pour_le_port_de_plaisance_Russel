const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express(); // ✅ Déclare `app` avant de l'utiliser
app.use(express.json());

// Utilisation des routes d'authentification (après la déclaration de `app`)
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5000;

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connecté');
})
.catch(err => console.log('Erreur MongoDB:', err));

// Route de base
app.get('/', (req, res) => {
  res.send('Bienvenue sur l’API du Port de Plaisance Russell');
});

// Lancement du serveur
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));

