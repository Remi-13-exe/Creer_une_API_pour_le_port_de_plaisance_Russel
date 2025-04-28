const jwt = require('jsonwebtoken');

// Middleware pour vérifier l'authentification via JWT
const protect = (req, res, next) => {
  // Récupérer le token de l'en-tête Authorization
  const token = req.header('Authorization')?.replace('Bearer ', '');
require('./path/to/User')
  // Si aucun token n'est présent, renvoyer une erreur
  if (!token) {
    return res.status(401).json({ message: 'Non autorisé, token manquant' });
  }

  try {
    // Vérification du token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ajouter l'utilisateur décodé à la requête pour l'utiliser dans les routes suivantes
    req.user = decoded;

    // Log pour vérifier que l'utilisateur est bien décodé et attaché
    console.log("Utilisateur décodé : ", decoded);

    // Passer à la prochaine étape (la route)
    next();
  } catch (err) {
    // Si le token est invalide ou expiré, renvoyer une erreur
    console.error("Erreur de vérification du token : ", err);
    return res.status(401).json({ message: 'Non autorisé, token invalide' });
  }
};

module.exports = protect;
