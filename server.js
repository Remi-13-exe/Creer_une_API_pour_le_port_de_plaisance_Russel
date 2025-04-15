const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const methodOverride = require('method-override');
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

// Définition du schéma et du modèle pour Catway
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
  }
});
const Catway = mongoose.model('Catway', CatwaySchema);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // Pour gérer PUT et DELETE via des formulaires HTML

// Configuration du moteur de vues
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes

// Route GET pour afficher tous les catways
app.get('/catways', async (req, res) => {
  try {
    const catways = await Catway.find();
    res.render('catways', { catways }); // Passe les données à la vue EJS
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la récupération des catways');
  }
});

// Route POST pour ajouter un nouveau catway
app.post('/catways', async (req, res) => {
  try {
    const { catwayNumber, catwayType, catwayState } = req.body;

    // Convertir catwayNumber en nombre si nécessaire
    const newCatway = new Catway({
      catwayNumber: parseInt(catwayNumber, 10), // Transformation explicite
      catwayType,
      catwayState,
    });

    await newCatway.save();
    res.redirect('/catways');
  } catch (err) {
    console.error(err);
    res.status(400).send(`Erreur lors de la création du catway: ${err.message}`);
  }
});


// Route PUT pour mettre à jour un catway
app.put('/catways/:id', async (req, res) => {
  try {
    const { catwayNumber, catwayType, catwayState } = req.body;
    const updatedCatway = await Catway.findByIdAndUpdate(
      req.params.id,
      { catwayNumber, catwayType, catwayState },
      { new: true, runValidators: true },
    );
    if (!updatedCatway) return res.status(404).send('Catway non trouvé');
    res.redirect('/catways'); // Redirection après mise à jour
  } catch (err) {
    console.error(err);
    res.status(500).send(`Erreur lors de la mise à jour du catway: ${err.message}`);
  }
});

// Route DELETE pour supprimer un catway
app.delete('/catways/:id', async (req, res) => {
  try {
    const deletedCatway = await Catway.findByIdAndDelete(req.params.id);
    if (!deletedCatway) return res.status(404).send('Catway non trouvé');
    res.redirect('/catways'); // Redirection après suppression
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la suppression du catway');
  }
});

app.get('/catways', async (req, res) => {
  try {
    const catways = await Catway.find(); // Récupère tous les catways
    console.log(catways);  // Ajoutez un log pour vérifier que les données sont récupérées
    res.render('catways', { catways });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la récupération des catways');
  }
});


// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
