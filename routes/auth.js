const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const protect = require('../middleware/authMiddleware');
const User = require('../models/User'); // Importation du modèle User

dotenv.config();

// Inscription d'un utilisateur
// Inscription d'un utilisateur
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Vérification si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }

    // Création du nouvel utilisateur
    const hashedPassword = await bcrypt.hash(password, 10); // Hash du mot de passe
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Une fois l'utilisateur créé, tu peux rediriger vers la page de réservation ou tableau de bord
    // Assure-toi d'envoyer un message de succès si tu veux l'afficher dans le frontend.
    res.redirect('/reservation');  // Ici, tu peux remplacer '/reservation' par la route que tu veux
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Connexion de l'utilisateur
// Connexion de l'utilisateur
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérification si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe incorrect' });
    }

    // Création du token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Redirection vers la page de réservation après connexion
    res.redirect('/dashboard');  // Redirige vers la page réservation

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/register', (req, res) => {
  res.render('register', { error: null });
});


// Déconnexion de l'utilisateur
router.get('/logout', (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
});

// Exemple de route protégée
router.get('/protected', protect, (req, res) => {
  res.send('Accès autorisé avec un token valide');
});

// Route de la page de connexion
router.get('/login', (req, res) => {
  res.render('index', { error: null });
  
});





module.exports = router;
