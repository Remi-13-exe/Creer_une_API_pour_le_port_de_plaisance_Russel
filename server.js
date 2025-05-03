const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const authRoutes = require('./routes/auth');



// Initialisation de l'application
const app = express();
dotenv.config(); // Charger les variables d'environnement

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
app.use(methodOverride('_method')); // Permet l'utilisation des méthodes PUT et DELETE via des formulaires
app.use(express.static(path.join(__dirname, 'public'))); // Servir les fichiers statiques
app.use('/auth', authRoutes);

// Configuration du moteur de vues
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware pour gérer les sessions et les messages flash
app.use(session({
  secret: 'secret-key',  // Remplace avec une clé secrète
  resave: false,
  saveUninitialized: true,
}));

// Middleware pour utiliser connect-flash
app.use(flash());

// Middleware pour rendre les messages flash accessibles dans toutes les vues
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use((req, res, next) => {
  console.log(typeof req.flash); // Devrait afficher "function"
  next();
});

// Modèles Mongoose
const CatwaySchema = new mongoose.Schema({
  catwayNumber: { type: String, unique: true, required: [true, 'Le numéro du catway est obligatoire.'] },
  catwayType: { type: String, required: [true, 'Le type du catway est obligatoire.'], enum: ['long', 'short'] },
  catwayState: { type: String, required: [true, 'L’état du catway est obligatoire.'], maxlength: [200, 'La description de l’état ne peut pas dépasser 200 caractères.'] },
});

const ReservationSchema = new mongoose.Schema({
  catwayNumber: String,
  clientName: String,
  boatName: String,
  startDate: Date,
  endDate: Date,
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
});

const Catway = mongoose.model('Catway', CatwaySchema);
const Reservation = mongoose.model('Reservation', ReservationSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Routes Catways
app.route('/catways')
  .get(async (req, res) => {
    try {
      const catways = await Catway.find();
      res.render('catways', { catways });
    } catch (err) {
      console.error(err);
      res.status(500).send('Erreur lors de la récupération des catways');
    }
  })
  .post(async (req, res) => {
    try {
      const { catwayNumber, catwayType, catwayState } = req.body;
      const newCatway = new Catway({ catwayNumber, catwayType, catwayState });
      await newCatway.save();
      req.flash('success', 'Catway créé avec succès');
      res.redirect('/catways');
    } catch (err) {
      console.error(err);
      req.flash('error', `Erreur lors de la création du catway: ${err.message}`);
      res.redirect('/catways');
    }
  });

app.route('/catways/:id')
  .put(async (req, res) => {
    try {
      const { catwayNumber, catwayType, catwayState } = req.body;
      const updatedCatway = await Catway.findByIdAndUpdate(req.params.id, { catwayNumber, catwayType, catwayState }, { new: true, runValidators: true });
      if (!updatedCatway) return res.status(404).send('Catway non trouvé');
      req.flash('success', 'Catway mis à jour avec succès');
      res.redirect('/catways');
    } catch (err) {
      console.error(err);
      req.flash('error', `Erreur lors de la mise à jour du catway: ${err.message}`);
      res.redirect('/catways');
    }
  })
  .delete(async (req, res) => {
    try {
      const deletedCatway = await Catway.findByIdAndDelete(req.params.id);
      if (!deletedCatway) return res.status(404).send('Catway non trouvé');
      req.flash('success', 'Catway supprimé avec succès');
      res.redirect('/catways');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Erreur lors de la suppression du catway');
      res.redirect('/catways');
    }
  });

// Route d'index (Page d'accueil)
app.get('/', (req, res) => {
  // Exemple pour passer une erreur (tu peux adapter selon tes besoins)
  const error = req.flash('error'); // Par exemple, si tu utilises `flash` pour les messages d'erreur
  res.render('index', { error: error || null });
});

// Afficher la page de connexion
app.get('/login', (req, res) => {
  res.render('login'); // Assure-toi d'avoir un fichier 'login.ejs' dans le dossier 'views'
});


app.get('/catways/:id', async (req, res) => {
  try {
      const catway = await Catway.findById(req.params.id);
      if (!catway) return res.status(404).send('Catway introuvable');
      res.render('catwayDetails', { catway }); // Assurez-vous de créer une vue "catwayDetails.ejs"
  } catch (err) {
      res.status(500).send('Erreur serveur');
  }
});

app.get('/catways/:id/edit', async (req, res) => {
  try {
      const catway = await Catway.findById(req.params.id);
      if (!catway) return res.status(404).send('Catway introuvable');
      res.render('editCatway', { catway }); // Assurez-vous de créer une vue "editCatway.ejs"
  } catch (err) {
      res.status(500).send('Erreur serveur');
  }
});

app.put('/catways/:id', async (req, res) => {
  try {
      const { catwayState } = req.body;
      const updatedCatway = await Catway.findByIdAndUpdate(
          req.params.id,
          { catwayState },
          { new: true, runValidators: true }
      );
      if (!updatedCatway) return res.status(404).send('Catway introuvable');
      res.redirect('/catways');
  } catch (err) {
      res.status(500).send('Erreur serveur');
  }
});

app.put('/users/:id', async (req, res) => {
  const { username, email } = req.body;
  try {
      const user = await User.findByIdAndUpdate(req.params.id, { username, email }, { new: true });
      if (!user) {
          return res.status(404).send('Utilisateur non trouvé');
      }
      res.redirect('/users'); // Redirige vers la liste des utilisateurs après la mise à jour
  } catch (error) {
      console.error(error);
      res.status(500).send('Erreur du serveur');
  }
});



app.get('/users/:id', async (req, res) => {
  try {
      const user = await User.findById(req.params.id);
      if (!user) {
          return res.status(404).send('Utilisateur non trouvé');
      }
      res.render('user-details', { user }); // Assurez-vous d'avoir la vue correspondante
  } catch (error) {
      console.error(error);
      res.status(500).send('Erreur du serveur');
  }
});


app.get('/users/:id/edit', async (req, res) => {
  const user = await User.findById(req.params.id); // Remplace par ton modèle et logique
  res.render('edit-user', { user });
});



// Routes Reservations
app.route('/reservations')
  .get(async (req, res) => {
    try {
      const reservations = await Reservation.find();
      res.render('reservations', { reservations });
    } catch (err) {
      console.error('Erreur lors de la récupération des réservations:', err);
      res.status(500).send('Erreur lors de la récupération des réservations');
    }
  })
  .post(async (req, res) => {
    try {
      const { catwayNumber, clientName, boatName, startDate, endDate } = req.body;
      const newReservation = new Reservation({ catwayNumber, clientName, boatName, startDate, endDate });
      await newReservation.save();
      req.flash('success', 'Réservation effectuée avec succès');
      res.redirect('/reservations');
    } catch (err) {
      console.error(err);
      req.flash('error', `Erreur lors de la création de la réservation: ${err.message}`);
      res.redirect('/reservations');
    }
  });

// Routes Users
app.route('/users')
  .get(async (req, res) => {
    try {
      const users = await User.find();
      res.render('users', { users });
    } catch (err) {
      console.error(err);
      res.status(500).send('Erreur lors de la récupération des utilisateurs');
    }
  })
  .post(async (req, res) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) return res.status(400).send('Tous les champs sont obligatoires.');
      const newUser = new User({ username, email, password });
      await newUser.save();
      req.flash('success', 'Utilisateur créé avec succès');
      res.redirect('/users');
    } catch (err) {
      console.error('Erreur lors de la création de l’utilisateur:', err);
      req.flash('error', `Erreur: ${err.message}`);
      res.redirect('/users');
    }
  });

app.delete('/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).send('Utilisateur non trouvé');
    req.flash('success', 'Utilisateur supprimé avec succès');
    res.redirect('/users');
  } catch (err) {
    console.error('Erreur lors de la suppression de l’utilisateur:', err);
    req.flash('error', `Erreur: ${err.message}`);
    res.redirect('/users');
  }
});




// Serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
