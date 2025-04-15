const CatwaySchema = new mongoose.Schema({
  catwayNumber: {
    type: Number, // Remplacez String par Number
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
