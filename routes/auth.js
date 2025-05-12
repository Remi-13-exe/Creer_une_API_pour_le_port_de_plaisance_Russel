// Importation du module Express pour créer un router
const express = require('express');
// Création d'un objet router via express.Router() pour définir des routes dans ce module
const router = express.Router();

// Importation du module jsonwebtoken pour générer et vérifier des tokens JWT
const jwt = require('jsonwebtoken');

// Importation du module bcryptjs pour hasher et comparer les mots de passe
const bcrypt = require('bcryptjs');

// Importation du module dotenv pour charger les variables d'environnement depuis un fichier .env
const dotenv = require('dotenv');

// Importation du middleware de protection (vérification de l'authentification via JWT)
const protect = require('../middleware/authMiddleware');

// Importation du modèle User pour interagir avec la collection des utilisateurs dans MongoDB
const User = require('../models/User'); // Importation du modèle User

// Chargement des variables d'environnement depuis le fichier .env
dotenv.config();

// ------------------------------
// Inscription d'un utilisateur
// ------------------------------

// Route POST pour l'inscription d'un nouvel utilisateur
router.post('/register', async (req, res) => {
  // Extraction des champs username, email et password depuis le corps de la requête
  const { username, email, password } = req.body;

  try {
    // Vérification si un utilisateur existe déjà pour l'email donné
    const userExists = await User.findOne({ email });
    if (userExists) {
      // Si l'utilisateur existe déjà, retourner une réponse avec code 400 et message d'erreur
      return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }

    // Création du nouvel utilisateur
    // Hash du mot de passe avec bcrypt, en utilisant 10 tours de salage
    const hashedPassword = await bcrypt.hash(password, 10);
    // Création d'une instance du modèle User avec les informations fournies et le mot de passe hashé
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Sauvegarde du nouvel utilisateur dans la base de données
    await user.save();

    // Une fois l'utilisateur créé, rediriger vers la page indiquée (ici "/reservation")
    // tu peux adapter cette redirection en fonction de ton application
    res.redirect('/reservation');  // Ici, tu peux remplacer '/reservation' par la route que tu veux
  } catch (err) {
    // En cas d'erreur, afficher l'erreur dans la console et retourner une réponse 500
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ------------------------------
// Connexion de l'utilisateur
// ------------------------------

// Route POST pour connecter un utilisateur existant
router.post('/login', async (req, res) => {
  // Extraction de l'email et du password depuis le corps de la requête
  const { email, password } = req.body;

  try {
    // Vérification que l'utilisateur existe en cherchant par email
    const user = await User.findOne({ email });
    if (!user) {
      // Si aucun utilisateur n'est trouvé, retourner une réponse 404 avec un message d'erreur
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Comparaison du mot de passe fourni avec celui stocké (hashé) dans la base de données
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Si le mot de passe est incorrect, retourner une réponse 400 avec un message d'erreur
      return res.status(400).json({ message: 'Mot de passe incorrect' });
    }

    // Création d'un token JWT pour l'utilisateur.
    // Le token contient l'identifiant de l'utilisateur (user._id) et expire après 1 heure
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Une fois connecté, rediriger l'utilisateur vers la page de réservation ou tableau de bord
    res.redirect('/dashboard');  // Redirige vers la page réservation (tableau de bord)
  } catch (err) {
    // Gestion des erreurs en cas d'exception : affiche l'erreur dans la console et retourne une réponse 500
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route GET pour afficher le formulaire d'inscription (page register)
// Rendu de la vue "register" avec une variable "error" initialisée à null
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Route GET pour la déconnexion de l'utilisateur
// Ici, on retourne simplement un message JSON indiquant que la déconnexion a réussi
router.get('/logout', (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
});

// Exemple de route protégée (accessible uniquement si le token JWT est valide)
// Le middleware "protect" est utilisé pour vérifier l'authentification
router.get('/protected', protect, (req, res) => {
  // Répond avec un message indiquant que l'accès est autorisé
  res.send('Accès autorisé avec un token valide');
});

// Route GET pour afficher la page de connexion
// Rendu de la vue "index" avec une variable "error" initialisée à null
router.get('/login', (req, res) => {
  res.render('index', { error: null });
});

// Exportation du router pour qu'il puisse être utilisé dans l'application principale
module.exports = router;
