// Importation de mongoose pour permettre la définition et la manipulation des schémas dans MongoDB
const mongoose = require('mongoose');

// Définition du schéma Mongoose pour un utilisateur
const UserSchema = new mongoose.Schema({
  // Champ "username" : nom d'utilisateur
  username: { 
    type: String, // Type chaîne de caractères
    required: [true, 'Le nom est obligatoire.'], // Validation : champ requis avec message d'erreur personnalisé
    unique: true // Assure l'unicité du nom d'utilisateur dans la base de données
  },
  // Champ "email" : adresse email de l'utilisateur
  email: { 
    type: String, // Type chaîne de caractères
    required: [true, 'L’email est obligatoire.'], // Validation : champ requis avec message d'erreur personnalisé
    unique: true // Assure l'unicité de l'email
  },
  // Champ "password" : mot de passe de l'utilisateur
  password: { 
    type: String, // Type chaîne de caractères
    required: [true, 'Le mot de passe est obligatoire.'], // Validation : champ requis avec message d'erreur personnalisé
    minlength: 6 // Validation : longueur minimale du mot de passe
  },
});

// Exportation du modèle "User" basé sur le schéma défini ci-dessus
module.exports = mongoose.model('User', UserSchema);


// Hook Mongoose pour loguer un message avant de sauvegarder un utilisateur dans la base de données
UserSchema.pre('save', function (next) {
  // Affiche dans la console un message indiquant qu'un utilisateur est en cours d'enregistrement
  // Remarque : "this.name" n'existe probablement pas, il est possible que cela doive être "this.username"
  console.log(`Un utilisateur est en cours d'enregistrement : ${this.name}`);
  next(); // Passe le contrôle au middleware suivant ou à la sauvegarde
});

// Vérifier si le modèle "User" existe déjà dans mongoose.models pour éviter une erreur "OverwriteModelError"
// Si le modèle existe, il est réutilisé ; sinon, le modèle est créé
const User = mongoose.models.User || mongoose.model('user', UserSchema);

// Exportation du modèle, permettant d'utiliser "User" dans d'autres parties de l'application
module.exports = User;
