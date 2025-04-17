const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  catwayNumber: {
    type: Number,
    required: [true, 'Le numéro du catway est obligatoire.'],
  },
  clientName: {
    type: String,
    required: [true, 'Le nom du client est obligatoire.'],
  },
  boatName: {
    type: String,
    required: [true, 'Le nom du bateau est obligatoire.'],
  },
  startDate: {
    type: Date,
    required: [true, 'La date de début est obligatoire.'],
  },
  endDate: {
    type: Date,
    required: [true, 'La date de fin est obligatoire.'],
  },
});

const Reservation = mongoose.model('Reservation', ReservationSchema);

module.exports = Reservation;
