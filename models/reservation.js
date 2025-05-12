// Importation de mongoose pour permettre la définition et la manipulation des schémas MongoDB
const mongoose = require('mongoose');

// Définition du schéma Mongoose pour une réservation
const ReservationSchema = new mongoose.Schema({
  // Champ "catwayNumber" : numéro du catway réservé
  catwayNumber: {
    type: Number, // Le numéro est de type numérique
    required: [true, 'Le numéro du catway est obligatoire.'], // Ce champ est obligatoire et affichera le message spécifié si absent
  },
  // Champ "clientName" : nom du client faisant la réservation
  clientName: {
    type: String, // Le nom du client est une chaîne de caractères
    required: [true, 'Le nom du client est obligatoire.'], // Ce champ est obligatoire avec un message d'erreur personnalisé
  },
  // Champ "boatName" : nom du bateau amarré lors de la réservation
  boatName: {
    type: String, // Le nom du bateau est une chaîne de caractères
    required: [true, 'Le nom du bateau est obligatoire.'], // Ce champ est obligatoire avec un message d'erreur personnalisé
  },
  // Champ "startDate" : date de début de la réservation
  startDate: {
    type: Date, // La date de début est de type Date
    required: [true, 'La date de début est obligatoire.'], // Ce champ est obligatoire avec un message d'erreur personnalisé
  },
  // Champ "endDate" : date de fin de la réservation
  endDate: {
    type: Date, // La date de fin est de type Date
    required: [true, 'La date de fin est obligatoire.'], // Ce champ est obligatoire avec un message d'erreur personnalisé
  },
});

// Création du modèle "Reservation" à partir du schéma défini ci-dessus
const Reservation = mongoose.model('Reservation', ReservationSchema);

// Exportation du modèle pour qu'il soit accessible dans d'autres parties de l'application
module.exports = Reservation;
