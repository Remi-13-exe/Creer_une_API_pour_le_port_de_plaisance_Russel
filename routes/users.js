const express = require('express');
const router = express.Router();
const User = require('../models/User');

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
 * @route POST /users
 * @desc Créer un utilisateur
 */
router.post('/', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const user = new User({ username, email, password, role });
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

module.exports = router;
