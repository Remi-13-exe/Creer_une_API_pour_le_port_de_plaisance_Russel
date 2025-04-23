const mongoose = require('mongoose');

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

module.exports = mongoose.model('User', UserSchema);
