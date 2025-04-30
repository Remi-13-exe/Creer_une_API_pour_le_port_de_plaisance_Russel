const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: [true, 'Le nom est obligatoire.'], unique: true },
  email: { type: String, required: [true, 'L’email est obligatoire.'], unique: true },
  password: { type: String, required: [true, 'Le mot de passe est obligatoire.'], minlength: 6 },
});

module.exports = mongoose.model('User', UserSchema);


// Hook Mongoose pour loguer avant de sauvegarder un utilisateur
UserSchema.pre('save', function (next) {
  console.log(`Un utilisateur est en cours d'enregistrement : ${this.name}`);
  next();
});

// Vérifier si le modèle existe déjà avant de le créer pour éviter l'erreur "OverwriteModelError"
const User = mongoose.models.User || mongoose.model('user', UserSchema);

// Exportation du modèle
module.exports = User;
