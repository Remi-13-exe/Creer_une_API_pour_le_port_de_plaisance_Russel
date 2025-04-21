const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const methodOverride = require('method-override');

// Initialisation de l'application
const app = express();

// Configuration de dotenv pour utiliser les variables d'environnement
dotenv.config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error('Erreur MongoDB:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // Pour gérer PUT et DELETE via des formulaires HTML
app.use(express.static(path.join(__dirname, 'public'))); // Fichiers statiques

// Configuration du moteur de vues
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Modèles
const CatwaySchema = new mongoose.Schema({
  catwayNumber: {
    type: String,
    unique: true,
    required: [true, 'Le numéro du catway est obligatoire.']
  },
  catwayType: {
    type: String,
    required: [true, 'Le type du catway est obligatoire.'],
    enum: ['long', 'short'], // Limite les valeurs possibles
  },
  catwayState: {
    type: String,
    required: [true, 'L’état du catway est obligatoire.'],
    maxlength: [200, 'La description de l’état ne peut pas dépasser 200 caractères.'],
  },
});

const ReservationSchema = new mongoose.Schema({
  catwayNumber: String,
  clientName: String,
  boatName: String,
  startDate: Date,
  endDate: Date,
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
});

const Catway = mongoose.model('Catway', CatwaySchema);
const Reservation = mongoose.model('Reservation', ReservationSchema);
const User = mongoose.model('User', UserSchema);

// Routes Catways
app.get('/catways', async (req, res) => {
  try {
    const catways = await Catway.find();
    res.render('catways', { catways });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la récupération des catways');
  }
});

app.post('/catways', async (req, res) => {
  try {
    const { catwayNumber, catwayType, catwayState } = req.body;
    const newCatway = new Catway({ catwayNumber, catwayType, catwayState });
    await newCatway.save();
    res.redirect('/catways');
  } catch (err) {
    console.error(err);
    res.status(400).send(`Erreur lors de la création du catway: ${err.message}`);
  }
});

app.put('/catways/:id', async (req, res) => {
  try {
    const { catwayNumber, catwayType, catwayState } = req.body;
    const updatedCatway = await Catway.findByIdAndUpdate(
      req.params.id,
      { catwayNumber, catwayType, catwayState },
      { new: true, runValidators: true },
    );
    if (!updatedCatway) return res.status(404).send('Catway non trouvé');
    res.redirect('/catways');
  } catch (err) {
    console.error(err);
    res.status(500).send(`Erreur lors de la mise à jour du catway: ${err.message}`);
  }
});

app.delete('/catways/:id', async (req, res) => {
  try {
    const deletedCatway = await Catway.findByIdAndDelete(req.params.id);
    if (!deletedCatway) return res.status(404).send('Catway non trouvé');
    res.redirect('/catways');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la suppression du catway');
  }
});

// Routes Reservations
app.get('/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.render('reservations', { reservations });
  } catch (err) {
    console.error('Erreur lors de la récupération des réservations:', err);
    res.status(500).send('Erreur lors de la récupération des réservations');
  }
});

app.post('/reservations', async (req, res) => {
  try {
    const { catwayNumber, clientName, boatName, startDate, endDate } = req.body;
    const newReservation = new Reservation({ catwayNumber, clientName, boatName, startDate, endDate });
    await newReservation.save();
    res.redirect('/reservations');
  } catch (err) {
    console.error(err);
    res.status(400).send(`Erreur lors de la création de la réservation: ${err.message}`);
  }
});

// Routes Users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.render('users', { users });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la récupération des utilisateurs');
  }
});

// Serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
