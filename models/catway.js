// Définition du schéma Mongoose pour le modèle "Catway"
const CatwaySchema = new mongoose.Schema({
  // Champ "catwayNumber" : numéro unique du catway
  catwayNumber: {
    type: Number, // Remplacez String par Number pour avoir une valeur numérique pour le numéro du catway
    unique: true, // Assure que chaque catway a un numéro unique
    required: [true, 'Le numéro du catway est obligatoire.'] // Validation : le champ est obligatoire et affiche ce message en cas d'absence
  },
  // Champ "catwayType" : type du catway, limité aux valeurs "long" ou "short"
  catwayType: {
    type: String, // Le type est une chaîne de caractères
    required: [true, 'Le type du catway est obligatoire.'], // Validation : ce champ est requis
    enum: ['long', 'short'], // Limite les valeurs possibles à 'long' ou 'short'
  },
  // Champ "catwayState" : description de l'état du catway
  catwayState: {
    type: String, // Le champ est de type chaîne de caractères
    required: [true, 'L’état du catway est obligatoire.'], // Validation obligatoir pour décrire l'état du catway
    maxlength: [200, 'La description de l’état ne peut pas dépasser 200 caractères.'], // Limitation de la longueur maximale à 200 caractères avec message d'erreur en cas de dépassement
  }
});
