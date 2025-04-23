const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * @route GET /users
 * @desc Récupérer tous les utilisateurs
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /users/:id
 * @desc Récupérer un utilisateur par ID
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /users/:email
 * @desc Récupérer un utilisateur par email
 */
router.get('/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-password');
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /users
 * @desc Créer un utilisateur
 */
router.post('/', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Hash le mot de passe avant de le sauvegarder
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ username, email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'Utilisateur créé', user: { username, email, role } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route PUT /users/:id
 * @desc Mettre à jour un utilisateur
 */
router.put('/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur mis à jour', updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route DELETE /users/:id
 * @desc Supprimer un utilisateur
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /login
 * @desc Authentifier un utilisateur
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Mot de passe incorrect' });

    // Créer un token JWT pour l'utilisateur
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Connexion réussie', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /logout
 * @desc Déconnecter l'utilisateur
 */
router.get('/logout', (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
});

module.exports = router;
