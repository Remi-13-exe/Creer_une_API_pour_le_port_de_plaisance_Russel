const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');


dotenv.config();

const router = express.Router();

// Inscription d'un utilisateur
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Vérification si l'utilisateur existe déjà
  const userExists = await User.findOne({ email });5
  if (userExists) {
    return res.status(400).json({ message: 'Utilisateur déjà existant' });
  }

  const user = new User({
    username,
    email,
    password,
  });

  try {
    await user.save();
    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Connexion de l'utilisateur
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Vérification si l'utilisateur existe
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  // Vérification du mot de passe
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Mot de passe incorrect' });
  }

  // Création du token JWT
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Déconnexion de l'utilisateur (ici, juste une suppression du token côté client)
router.get('/logout', (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
});

module.exports = router;
