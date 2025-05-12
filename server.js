// Importation des modules nécessaires pour l'application
const express = require('express'); // Framework pour construire l'application web
const mongoose = require('mongoose'); // Bibliothèque pour interagir avec MongoDB
const dotenv = require('dotenv'); // Pour charger les variables d'environnement depuis un fichier .env
const path = require('path'); // Module pour gérer les chemins de fichiers
const methodOverride = require('method-override'); // Permet d'utiliser des méthodes HTTP comme PUT et DELETE dans les formulaires HTML
const session = require('express-session'); // Pour gérer les sessions utilisateur
const flash = require('connect-flash'); // Pour les messages flash (succès/erreur) entre les requêtes
const authRoutes = require('./routes/auth'); // Importation des routes d'authentification définies dans ./routes/auth.js
const passport = require('passport'); // Bibliothèque pour gérer l'authentification

// Initialisation de l'application Express
const app = express();
dotenv.config(); // Charger les variables d'environnement depuis le fichier .env

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test', {
  useNewUrlParser: true, // Utilise le nouveau parser URL de MongoDB
  useUnifiedTopology: true, // Utilise le moteur de gestion unifiée
})
  .then(() => console.log('MongoDB connecté')) // Affiche un message dans la console en cas de connexion réussie
  .catch(err => console.error('Erreur MongoDB:', err)); // Affiche l'erreur en cas d'échec de la connexion

// Middleware pour parser les corps de requête en JSON et URL-encodés
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware pour utiliser les méthodes PUT et DELETE dans les formulaires via un paramètre de requête (_method)
app.use(methodOverride('_method'));

// Middleware pour servir les fichiers statiques se trouvant dans le dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Utilisation des routes d'authentification sous le préfixe '/auth'
app.use('/auth', authRoutes);

// Configuration du moteur de vues pour l'application (utilisation d'EJS)
app.set('view engine', 'ejs'); // Définir EJS comme moteur de rendu
app.set('views', path.join(__dirname, 'views')); // Définir le dossier 'views' comme emplacement des fichiers de vue

// Middleware pour gérer les sessions utilisateur et les messages flash
app.use(session({
  secret: 'secret-key',  // Clé secrète pour signer la session (à remplacer par une valeur plus sécurisée en production)
  resave: false, // Ne pas sauvegarder la session si elle n'a pas été modifiée
  saveUninitialized: true, // Sauvegarder une session non modifiée pour chaque requête
}));

// Middleware pour utiliser connect-flash afin de gérer les messages flash
app.use(flash());

// Middleware pour rendre les messages flash accessibles dans toutes les vues via res.locals
app.use((req, res, next) => {
  res.locals.success = req.flash('success'); // Stocke les messages de succès dans res.locals.success
  res.locals.error = req.flash('error');     // Stocke les messages d'erreur dans res.locals.error
  next();
});

// Middleware de débogage pour vérifier le type de req.flash (devrait être 'function')
app.use((req, res, next) => {
  console.log(typeof req.flash); // Devrait afficher "function"
  next();
});

// Initialisation de Passport pour la gestion de l'authentification
app.use(passport.initialize());
app.use(passport.session()); // Permet à Passport de gérer les sessions via express-session

// Définition des schémas Mongoose pour les ressources de l'application

// Schéma pour les Catways
const CatwaySchema = new mongoose.Schema({
  catwayNumber: { type: String, unique: true, required: [true, 'Le numéro du catway est obligatoire.'] },
  catwayType: { type: String, required: [true, 'Le type du catway est obligatoire.'], enum: ['long', 'short'] },
  catwayState: { type: String, required: [true, 'L’état du catway est obligatoire.'], maxlength: [200, 'La description de l’état ne peut pas dépasser 200 caractères.'] },
});

// Schéma pour les Réservations
const ReservationSchema = new mongoose.Schema({
  catwayNumber: String,
  clientName: String,
  boatName: String,
  startDate: Date,
  endDate: Date,
});

// Schéma pour les Utilisateurs
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
});

// Création des modèles Mongoose pour chaque schéma
const Catway = mongoose.model('Catway', CatwaySchema);
const Reservation = mongoose.model('Reservation', ReservationSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Routes pour la gestion des Catways

// Définition de la route "/catways" pour récupérer et créer des catways
app.route('/catways')
  .get(async (req, res) => {
    try {
      const catways = await Catway.find(); // Récupérer tous les catways depuis la base de données
      res.render('catways', { catways }); // Rendu de la vue "catways.ejs" avec les catways récupérés
    } catch (err) {
      console.error(err);
      res.status(500).send('Erreur lors de la récupération des catways');
    }
  })
  .post(async (req, res) => {
    try {
      // Extraction des informations de la requête pour créer un nouveau catway
      const { catwayNumber, catwayType, catwayState } = req.body;
      const newCatway = new Catway({ catwayNumber, catwayType, catwayState }); // Création d'un nouvel objet Catway
      await newCatway.save(); // Sauvegarde du nouveau catway dans la base de données
      req.flash('success', 'Catway créé avec succès'); // Définition d'un message flash de succès
      res.redirect('/catways'); // Redirige vers la page listant les catways
    } catch (err) {
      console.error(err);
      req.flash('error', `Erreur lors de la création du catway: ${err.message}`); // Message flash d'erreur
      res.redirect('/catways');
    }
  });

// Définition des routes pour manipuler un catway spécifique via son ID
app.route('/catways/:id')
  .put(async (req, res) => {
    try {
      // Extraction des données de la requête pour la mise à jour
      const { catwayNumber, catwayType, catwayState } = req.body;
      const updatedCatway = await Catway.findByIdAndUpdate(req.params.id, { catwayNumber, catwayType, catwayState }, { new: true, runValidators: true });
      // Met à jour le catway et retourne le document mis à jour avec validation
      if (!updatedCatway) return res.status(404).send('Catway non trouvé');
      req.flash('success', 'Catway mis à jour avec succès'); // Message flash de succès
      res.redirect('/catways'); // Redirige l'utilisateur vers la liste des catways
    } catch (err) {
      console.error(err);
      req.flash('error', `Erreur lors de la mise à jour du catway: ${err.message}`); // Message flash d'erreur
      res.redirect('/catways');
    }
  })
  .delete(async (req, res) => {
    try {
      const deletedCatway = await Catway.findByIdAndDelete(req.params.id); // Suppression du catway en fonction de l'ID fourni
      if (!deletedCatway) return res.status(404).send('Catway non trouvé'); // Si aucun catway n'est trouvé, renvoie une erreur 404
      req.flash('success', 'Catway supprimé avec succès'); // Message flash de succès pour la suppression
      res.redirect('/catways'); // Redirige vers la liste des catways
    } catch (err) {
      console.error(err);
      req.flash('error', 'Erreur lors de la suppression du catway'); // Message flash d'erreur en cas d'échec
      res.redirect('/catways');
    }
  });

// Route d'index (Page d'accueil)
app.get('/', (req, res) => {
  // Récupérer les messages flash d'erreur (si présents)
  const error = req.flash('error'); // Par exemple, pour afficher une erreur sur la page d'accueil
  res.render('index', { error: error || null }); // Rendu de la vue "index.ejs" avec le message d'erreur (ou null)
});

// Route pour afficher la page de connexion
app.get('/login', (req, res) => {
  res.render('login'); // Rendu de la vue "login.ejs". Assurez-vous que le fichier existe dans le dossier 'views'
});

// Route pour afficher les détails d'un catway spécifique
app.get('/catways/:id', async (req, res) => {
  try {
      const catway = await Catway.findById(req.params.id); // Recherche d'un catway par son ID
      if (!catway) return res.status(404).send('Catway introuvable'); // Si non trouvé, renvoie une erreur 404
      res.render('catwayDetails', { catway }); // Rendu de la vue "catwayDetails.ejs" avec le catway
  } catch (err) {
      res.status(500).send('Erreur serveur'); // En cas d'erreur, renvoie un message d'erreur 500
  }
});

// Route pour afficher le formulaire d'édition d'un catway
app.get('/catways/:id/edit', async (req, res) => {
  try {
      const catway = await Catway.findById(req.params.id); // Recherche du catway à éditer par son ID
      if (!catway) return res.status(404).send('Catway introuvable'); // Renvoie une erreur 404 si le catway n'est pas trouvé
      res.render('editCatway', { catway }); // Rendu de la vue "editCatway.ejs" avec les informations du catway
  } catch (err) {
      res.status(500).send('Erreur serveur'); // Renvoie un message d'erreur 500 en cas d'échec
  }
});

// Route PUT pour mettre à jour uniquement l'état d'un catway
app.put('/catways/:id', async (req, res) => {
  try {
      // Extraction de l'état du catway à partir du formulaire
      const { catwayState } = req.body;
      const updatedCatway = await Catway.findByIdAndUpdate(
          req.params.id,
          { catwayState },
          { new: true, runValidators: true }
      );
      if (!updatedCatway) return res.status(404).send('Catway introuvable');
      res.redirect('/catways'); // Redirige vers la liste des catways après mise à jour
  } catch (err) {
      res.status(500).send('Erreur serveur'); // En cas d'erreur, renvoie un message d'erreur 500
  }
});

// Route PUT pour mettre à jour un utilisateur par son ID
app.put('/users/:id', async (req, res) => {
  const { username, email } = req.body; // Extraction des données envoyées dans le formulaire
  try {
      const user = await User.findByIdAndUpdate(req.params.id, { username, email }, { new: true });
      if (!user) {
          return res.status(404).send('Utilisateur non trouvé'); // Renvoie une erreur 404 si aucun utilisateur n'est trouvé
      }
      res.redirect('/users'); // Redirige vers la liste des utilisateurs après la mise à jour
  } catch (error) {
      console.error(error);
      res.status(500).send('Erreur du serveur'); // En cas d'échec, renvoie un message d'erreur 500
  }
});

// Route GET pour afficher les détails d'un utilisateur par son ID
app.get('/users/:id', async (req, res) => {
  try {
      const user = await User.findById(req.params.id); // Recherche d'un utilisateur par son ID
      if (!user) {
          return res.status(404).send('Utilisateur non trouvé'); // Renvoie une erreur 404 si l'utilisateur n'existe pas
      }
      res.render('user-details', { user }); // Rendu de la vue "user-details.ejs" avec les informations de l'utilisateur
  } catch (error) {
      console.error(error);
      res.status(500).send('Erreur du serveur'); // Renvoie un message d'erreur 500 en cas d'échec
  }
});

// Route GET pour afficher le formulaire d'édition d'un utilisateur par son ID
app.get('/users/:id/edit', async (req, res) => {
  const user = await User.findById(req.params.id); // Recherche de l'utilisateur à éditer
  res.render('edit-user', { user }); // Rendu de la vue "edit-user.ejs" avec les données de l'utilisateur
});

// Route pour afficher le Tableau de Bord
app.get('/dashboard', (req, res) => {
  res.render('dashboard'); // Rendu de la vue "dashboard.ejs" (tableau de bord)
});

// Route pour la déconnexion de l'utilisateur
app.get('/logout', (req, res, next) => {
  req.logout(err => {
      if (err) {
          return next(err); // En cas d'erreur lors de la déconnexion, passe l'erreur au middleware suivant
      }
      res.redirect('/auth/login'); // Redirige vers la page de connexion après la déconnexion
  });
});

// Routes pour la gestion des Réservations

// Définition de la route "/reservations" pour récupérer et créer des réservations
app.route('/reservations')
  .get(async (req, res) => {
    try {
      const reservations = await Reservation.find(); // Récupère toutes les réservations depuis la base de données
      res.render('reservations', { reservations }); // Rendu de la vue "reservations.ejs" avec la liste des réservations
    } catch (err) {
      console.error('Erreur lors de la récupération des réservations:', err);
      res.status(500).send('Erreur lors de la récupération des réservations');
    }
  })
  .post(async (req, res) => {
    try {
      // Extraction des informations envoyées dans le formulaire de réservation
      const { catwayNumber, clientName, boatName, startDate, endDate } = req.body;
      const newReservation = new Reservation({ catwayNumber, clientName, boatName, startDate, endDate }); // Création d'une nouvelle réservation
      await newReservation.save(); // Sauvegarde de la réservation dans la base de données
      req.flash('success', 'Réservation effectuée avec succès'); // Message flash de succès
      res.redirect('/reservations'); // Redirige vers la liste des réservations
    } catch (err) {
      console.error(err);
      req.flash('error', `Erreur lors de la création de la réservation: ${err.message}`); // Message flash en cas d'erreur
      res.redirect('/reservations');
    }
  });

// Routes pour la gestion des Utilisateurs

// Définition de la route "/users" pour récupérer et créer des utilisateurs
app.route('/users')
  .get(async (req, res) => {
    try {
      const users = await User.find(); // Récupère tous les utilisateurs de la base de données
      res.render('users', { users }); // Rendu de la vue "users.ejs" avec la liste des utilisateurs
    } catch (err) {
      console.error(err);
      res.status(500).send('Erreur lors de la récupération des utilisateurs');
    }
  })
  .post(async (req, res) => {
    try {
      // Extraction des données du formulaire d'ajout d'utilisateur
      const { username, email, password } = req.body;
      if (!username || !email || !password) return res.status(400).send('Tous les champs sont obligatoires.');
      const newUser = new User({ username, email, password }); // Création d'un nouvel utilisateur
      await newUser.save(); // Sauvegarde de l'utilisateur dans la base de données
      req.flash('success', 'Utilisateur créé avec succès'); // Message flash de succès
      res.redirect('/users'); // Redirige vers la liste des utilisateurs
    } catch (err) {
      console.error('Erreur lors de la création de l’utilisateur:', err);
      req.flash('error', `Erreur: ${err.message}`); // Message flash en cas d'erreur
      res.redirect('/users');
    }
  });

// Route pour supprimer un utilisateur via son ID
app.delete('/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id); // Supprime l'utilisateur correspondant à l'ID fourni
    if (!deletedUser) return res.status(404).send('Utilisateur non trouvé'); // Si aucun utilisateur n'est trouvé, renvoie une erreur 404
    req.flash('success', 'Utilisateur supprimé avec succès'); // Message flash de succès
    res.redirect('/users'); // Redirige vers la liste des utilisateurs
  } catch (err) {
    console.error('Erreur lors de la suppression de l’utilisateur:', err);
    req.flash('error', `Erreur: ${err.message}`); // Message flash en cas d'erreur
    res.redirect('/users');
  }
});

// Serveur : démarrage de l'application
const PORT = process.env.PORT || 5000; // Définition du port à partir des variables d'environnement ou 5000 par défaut
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`); // Log indiquant que le serveur est opérationnel sur le port spécifié
});
