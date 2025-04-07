const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Middleware pour vérifier l'authentification via JWT
const protect = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé, token manquant' });
  }

  try {
    // Vérification du token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attacher l'utilisateur décodé à la requête
    next(); // Passer à la prochaine étape (route)
  } catch (err) {
    res.status(401).json({ message: 'Non autorisé, token invalide' });
  }
};

// Middleware pour vérifier si l'utilisateur est authentifié
const isAuthenticated = (req, res, next) => {
  if (req.user) {  // Si l'utilisateur est authentifié
    return next();  // Autorise l'accès à la suite
  }
  res.redirect('/auth/login');  // Sinon, redirige vers la page de connexion
};

module.exports = { protect, isAuthenticated };
