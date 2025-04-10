const express = require("express");
const router = express.Router();
const Catway = require("../models/Catway");

// 📌 GET : Récupérer tous les catways
router.get("/", async (req, res) => {
  try {
    const catways = await Catway.find();
    res.json(catways);  // Envoie tous les catways récupérés
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 GET : Récupérer un catway par son catwayNumber
router.get("/:id", async (req, res) => {
  try {
    const catwayNumber = parseInt(req.params.id);

    if (isNaN(catwayNumber)) {
      return res.status(400).json({ error: "Le paramètre catwayNumber doit être un nombre valide." });
    }

    const catways = await Catway.find({ catwayNumber: catwayNumber });

    if (!catways || catways.length === 0) {
      return res.status(404).json({ error: "Catway non trouvé" });
    }

    res.json({
      message: "Catway trouvé",
      data: catways
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 POST : Ajouter un catway
router.post("/", async (req, res) => {
  try {
    const { catwayNumber, catwayType, catwayState } = req.body;

    // Vérifier si catwayNumber existe déjà
    const existingCatway = await Catway.findOne({ catwayNumber });
    if (existingCatway) {
      return res.status(400).json({ error: "Le numéro de catway existe déjà." });
    }

    const newCatway = new Catway({ catwayNumber, catwayType, catwayState });
    await newCatway.save();
    res.status(201).json({
      message: "Catway créé avec succès",
      catway: newCatway
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 PUT : Modifier l'état d'un catway par son catwayNumber
router.put("/:id", async (req, res) => {
  try {
    const { catwayState } = req.body;

    const updatedCatway = await Catway.findOneAndUpdate(
      { catwayNumber: req.params.id },
      { catwayState },
      { new: true }
    );
    if (!updatedCatway) return res.status(404).json({ error: "Catway non trouvé" });

    res.json({
      message: "Catway mis à jour",
      catway: updatedCatway
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 DELETE : Supprimer un catway par son catwayNumber
router.delete("/:id", async (req, res) => {
  try {
    const deletedCatway = await Catway.findOneAndDelete({ catwayNumber: req.params.id });
    if (!deletedCatway) return res.status(404).json({ error: "Catway non trouvé" });

    res.json({
      message: "Catway supprimé",
      deletedCatway
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
