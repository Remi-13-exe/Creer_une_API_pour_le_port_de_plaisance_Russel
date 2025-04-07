const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const catwaysRoutes = require('./routes/catways'); // Import des routes catways
const reservationRoutes = require("./routes/reservations");
const usersRoutes = require('./routes/users');
const dashboardRoutes = require("./routes/dashboard");  // Importer les routes du tableau de bord


dotenv.config();

const app = express(); // Déclare `app` avant de l'utiliser
app.use(express.json());

// Utilisation des routes d'authentification
app.use('/auth', authRoutes);

// Utilisation des routes catways
app.use('/catways', catwaysRoutes); // Ajout des nouvelles routes

app.use("/catways", reservationRoutes);

app.use('/users', usersRoutes);

app.use(express.static('public'));





app.set('view engine', 'ejs');
app.set('views', './views'); // ou le dossier où tu mets tes fichiers .ejs


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
