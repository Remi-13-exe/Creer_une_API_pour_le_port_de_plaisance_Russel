const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const protect = require('../middleware/authMiddleware');

dotenv.config();

// Inscription d'un utilisateur
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Vérification si l'utilisateur existe déjà
  const userExists = await User.findOne({ email });
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

// Déconnexion de l'utilisateur
router.get('/logout', (req, res) => {
  // On ne gère pas directement les sessions ici, car on utilise JWT.
  // Il suffira de supprimer le token côté client.
  res.json({ message: 'Déconnexion réussie' });
});

// Exemple de route protégée (requiert un token valide)
router.get('/protected', protect, (req, res) => {
  res.send('Accès autorisé avec un token valide');
});

// Route de la page de connexion (page de formulaire)
router.get('/login', (req, res) => {
  res.render('index', { error: null });
});

module.exports = router;

console.log('Tentative d’accès à la route protégée');
