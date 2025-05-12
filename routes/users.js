const express = require('express'); // Importation du framework Express pour gérer les routes HTTP
const router = express.Router(); // Création d'un routeur pour définir des routes spécifiques aux utilisateurs
const bcrypt = require('bcrypt'); // Importation de bcrypt pour hasher et comparer les mots de passe
const jwt = require('jsonwebtoken'); // Importation du module jsonwebtoken pour créer et vérifier des tokens JWT

/**
 * @route GET /users
 * @desc Récupérer tous les utilisateurs
 */
router.get('/', async (req, res) => {
  try {
    // Récupération de tous les utilisateurs en excluant le champ "password"
    const users = await User.find().select('-password');
    res.json(users); // Envoi de la liste des utilisateurs au format JSON
  } catch (err) {
    // En cas d'erreur, renvoi d'une réponse avec le status 500 et le message d'erreur
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /users/:id
 * @desc Récupérer un utilisateur par ID
 */
router.get('/:id', async (req, res) => {
  try {
    // Recherche de l'utilisateur par son ID en excluant le champ "password"
    const user = await User.findById(req.params.id).select('-password');
    if (!user) 
      // Si l'utilisateur n'est pas trouvé, renvoi d'une réponse 404 avec un message d'erreur
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user); // Retourne l'utilisateur trouvé au format JSON
  } catch (err) {
    // En cas d'erreur, renvoi d'une réponse 500 avec le message d'erreur
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /users/:email
 * @desc Récupérer un utilisateur par email
 */
router.get('/:email', async (req, res) => {
  try {
    // Recherche de l'utilisateur par email, en excluant le mot de passe
    const user = await User.findOne({ email: req.params.email }).select('-password');
    if (!user) 
      // Si aucun utilisateur n'est trouvé, renvoi d'une réponse 404 avec un message d'erreur
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user); // Retourne l'utilisateur trouvé au format JSON
  } catch (err) {
    // En cas d'erreur, renvoi d'une réponse 500 avec le message d'erreur
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /users
 * @desc Créer un utilisateur
 */
router.post('/', async (req, res) => {
  try {
    // Extraction des données d'inscription depuis le corps de la requête
    const { username, email, password, role } = req.body;

    // Hash du mot de passe avant de le sauvegarder pour plus de sécurité
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Création d'un nouvel utilisateur avec le mot de passe hashé
    const user = new User({ username, email, password: hashedPassword, role });
    await user.save(); // Sauvegarde de l'utilisateur dans la base de données

    // Envoi d'une réponse 201 indiquant que l'utilisateur a été créé
    // Le mot de passe n'est pas renvoyé dans la réponse pour des raisons de sécurité
    res.status(201).json({ message: 'Utilisateur créé', user: { username, email, role } });
  } catch (err) {
    // En cas d'erreur (par exemple, violation des contraintes), renvoi d'une réponse 400 avec le message d'erreur
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route PUT /users/:id
 * @desc Mettre à jour un utilisateur
 */
router.put('/:id', async (req, res) => {
  try {
    // Mise à jour de l'utilisateur avec l'ID fourni dans les paramètres
    // { new: true } permet de retourner le document mis à jour
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) 
      // Si l'utilisateur n'est pas trouvé, renvoi d'une réponse 404 avec un message d'erreur
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    // Renvoi d'une réponse indiquant que l'utilisateur a été mis à jour, avec le document mis à jour
    res.json({ message: 'Utilisateur mis à jour', updated });
  } catch (err) {
    // En cas d'erreur, renvoi d'une réponse 500 avec le message d'erreur
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route DELETE /users/:id
 * @desc Supprimer un utilisateur
 */
router.delete('/:id', async (req, res) => {
  try {
    // Suppression de l'utilisateur identifié par l'ID dans les paramètres
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) 
      // Si l'utilisateur n'est pas trouvé, renvoi d'une réponse 404 avec un message d'erreur
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    // Renvoi d'une réponse indiquant que l'utilisateur a été supprimé
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    // En cas d'erreur, renvoi d'une réponse 500 avec le message d'erreur
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /login
 * @desc Authentifier un utilisateur
 */
router.post('/login', async (req, res) => {
  try {
    // Extraction de l'email et du mot de passe depuis le corps de la requête
    const { email, password } = req.body;

    // Recherche de l'utilisateur dont l'email correspond à celui fourni
    const user = await User.findOne({ email });
    if (!user) 
      // Si aucun utilisateur n'est trouvé, renvoi d'une réponse 404 avec un message d'erreur
      return res.status(404).json({ error: 'Utilisateur non trouvé' });

    // Comparaison du mot de passe fourni avec celui stocké (hashé) en base de données
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) 
      // Si le mot de passe ne correspond pas, renvoi d'une réponse 400 avec un message d'erreur
      return res.status(400).json({ error: 'Mot de passe incorrect' });

    // Création d'un token JWT pour l'utilisateur, incluant l'ID de l'utilisateur
    // Le token expirera après 1 heure
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Renvoi d'une réponse indiquant que la connexion est réussie, avec le token JWT
    res.json({ message: 'Connexion réussie', token });
  } catch (err) {
    // En cas d'erreur, renvoi d'une réponse 500 avec le message d'erreur
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /logout
 * @desc Déconnecter l'utilisateur
 */
router.get('/logout', (req, res) => {
  // Ici, la déconnexion n'est pas réellement gérée côté serveur en supprimant un token,
  // mais on renvoie simplement un message indiquant que la déconnexion est réussie.
  res.json({ message: 'Déconnexion réussie' });
});

// Exportation du routeur pour être utilisé dans l'application principale
module.exports = router;
