const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('MongoDB connecté');
  }).catch(err => console.log(err));
  

app.get('/', (req, res) => {
  res.send('Bienvenue sur l’API du Port de Plaisance Russell');
});

app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
