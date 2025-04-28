const mongoose = require('mongoose');

// Définition du schéma
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire.']
  },
  email: {
    type: String,
    required: [true, 'L’email est obligatoire.'],
    unique: true,
    match: [/.+@.+\..+/, 'Veuillez fournir un email valide.']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire.'],
    minlength: [6, 'Le mot de passe doit comporter au moins 6 caractères.']
  }
});

// Hook Mongoose pour loguer avant de sauvegarder un utilisateur
UserSchema.pre('save', function (next) {
  console.log(`Un utilisateur est en cours d'enregistrement : ${this.name}`);
  next();
});

// Vérifier si le modèle existe déjà avant de le créer pour éviter l'erreur "OverwriteModelError"
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Exportation du modèle
module.exports = User;
