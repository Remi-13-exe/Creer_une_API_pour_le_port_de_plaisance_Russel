const jwt = require('jsonwebtoken');

// Middleware pour vérifier l'authentification via JWT
const protect = (req, res, next) => {
  try {
    // Récupérer le token de l'en-tête Authorization
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Non autorisé, token manquant ou mal formaté' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Vérification du token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ajouter l'utilisateur décodé à la requête pour l'utiliser dans les routes suivantes
    req.user = decoded;

    // Log pour vérifier que l'utilisateur est bien décodé et attaché
    console.log("Utilisateur décodé :", decoded);

    // Passer à la prochaine étape (la route)
    next();
  } catch (err) {
    // Gestion des erreurs de validation du token
    console.error("Erreur de vérification du token :", err);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré, veuillez vous reconnecter' });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide' });
    }

    // Gestion des autres erreurs
    return res.status(500).json({ message: 'Erreur du serveur lors de la vérification du token' });
  }
};

module.exports = protect;
