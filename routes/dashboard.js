const express = require('express');
const router = express.Router();
const Reservation = require('../models/reservation'); // Assurez-vous que le modèle Reservation est bien importé

// Route pour afficher le tableau de bord
router.get('/dashboard', async (req, res) => {
  if (!req.user) {
    return res.redirect('/auth/login'); // Si l'utilisateur n'est pas connecté, on le redirige vers la page de connexion
  }

  try {
    // Récupérer les réservations de l'utilisateur connecté (on suppose qu'on a une info comme 'clientName' qui est le même que 'username')
    const reservations = await Reservation.find({ clientName: req.user.username }); 
    res.render('dashboard', { user: req.user, reservations }); // On passe l'utilisateur et les réservations à la vue
  } catch (err) {
    res.status(500).send('Erreur lors de la récupération des réservations.');
  }
});

module.exports = router;

