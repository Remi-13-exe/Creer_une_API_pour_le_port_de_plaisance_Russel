const jwt = require('jsonwebtoken'); // Importation du module jsonwebtoken pour manipuler et vérifier les tokens JWT

// Middleware pour vérifier l'authentification via JWT
const protect = (req, res, next) => {
  try {
    // Récupérer le token de l'en-tête Authorization
    const authHeader = req.header('Authorization'); // Extraction de l'en-tête Authorization de la requête HTTP
    if (!authHeader || !authHeader.startsWith('Bearer ')) { 
      // Vérifie si l'en-tête est absent ou ne commence pas par "Bearer "
      return res.status(401).json({ message: 'Non autorisé, token manquant ou mal formaté' });
      // Retourne une réponse 401 Unauthorized en cas d'absence ou de format incorrect du token
    }

    const token = authHeader.replace('Bearer ', ''); // Extraction du token en supprimant le préfixe "Bearer "

    // Vérification du token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    // Vérifie le token en utilisant la clé secrète spécifiée dans les variables d'environnement et décode le payload

    // Ajouter l'utilisateur décodé à la requête pour l'utiliser dans les routes suivantes
    req.user = decoded; // Attache le contenu décrypté du token (les informations de l'utilisateur) à l'objet req

    // Log pour vérifier que l'utilisateur est bien décodé et attaché
    console.log("Utilisateur décodé :", decoded); // Affiche dans la console le payload décodé pour vérifier la bonne récupération du token

    // Passer à la prochaine étape (la route)
    next(); // Appelle la fonction next() pour transférer le contrôle au middleware ou à la route suivante
  } catch (err) { // Bloc catch pour intercepter les erreurs potentielles lors de la vérification du token
    // Gestion des erreurs de validation du token
    console.error("Erreur de vérification du token :", err); // Affiche l'erreur dans la console pour le debugging

    if (err.name === 'TokenExpiredError') { 
      // Vérifie si l'erreur est due à un token expiré
      return res.status(401).json({ message: 'Token expiré, veuillez vous reconnecter' });
      // Retourne une réponse 401 Unauthorized avec un message spécifique pour un token expiré
    }

    if (err.name === 'JsonWebTokenError') {
      // Vérifie si l'erreur est due à un token invalide
      return res.status(401).json({ message: 'Token invalide' });
      // Retourne une réponse 401 Unauthorized avec un message spécifique pour un token invalide
    }

    // Gestion des autres erreurs
    return res.status(500).json({ message: 'Erreur du serveur lors de la vérification du token' });
    // Retourne une réponse 500 Internal Server Error pour toute autre erreur inconnue
  }
};

module.exports = protect; // Exporte le middleware "protect" pour qu'il puisse être utilisé dans d'autres fichiers du projet
