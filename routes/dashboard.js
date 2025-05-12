const express = require('express'); // Importation du module Express
const router = express.Router(); // Création d'un routeur Express pour définir des routes spécifiques
const Reservation = require('../models/reservation'); // Importation du modèle Reservation

// Route pour afficher le tableau de bord
router.get('/dashboard', async (req, res) => {
  // Vérifier si l'utilisateur est connecté : si req.user n'existe pas, rediriger vers la page de connexion
  if (!req.user) {
    return res.redirect('/auth/login'); // Redirection vers la page de connexion si l'utilisateur n'est pas authentifié
  }

  try {
    // Récupérer les réservations appartenant à l'utilisateur connecté.
    // On suppose que l'attribut clientName dans Reservation correspond à req.user.username
    const reservations = await Reservation.find({ clientName: req.user.username });
    
    // Rendre la vue "dashboard" en passant l'utilisateur connecté et la liste de ses réservations
    res.render('dashboard', { user: req.user, reservations });
  } catch (err) {
    // En cas d'erreur lors de la récupération des réservations, renvoyer un message d'erreur avec le code HTTP 500
    res.status(500).send('Erreur lors de la récupération des réservations.');
  }
});

// Exporter le routeur pour qu'il puisse être utilisé dans d'autres parties de l'application
module.exports = router;
