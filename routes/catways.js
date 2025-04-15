const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });

const CatwaySchema = new mongoose.Schema({ number: String, catwayState: String });
const Catway = mongoose.model('Catway', CatwaySchema);
const catways = await Catway.find();
console.log(catways);





app.delete('/catways/:id', async (req, res) => {
  console.log('Requête reçue pour suppression:', req.params.id);
  try {
    const deletedCatway = await Catway.findByIdAndDelete(req.params.id);
    res.json(deletedCatway);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

app.listen(5000, () => console.log('Serveur en écoute sur le port 5000'));
