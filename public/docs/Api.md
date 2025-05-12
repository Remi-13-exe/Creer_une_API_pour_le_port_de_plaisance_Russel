# Documentation de l'API Privée - Port de Plaisance Russell

## Introduction

Bienvenue dans la documentation officielle de l'API privée du port de plaisance de Russell. Cette API permet de gérer les réservations, les catways (appontements), et les utilisateurs de la capitainerie. Elle est également dotée d'un système d'authentification pour sécuriser l'accès.

---

## Authentification

Toutes les routes (sauf `/login`) nécessitent un jeton d'authentification transmis via l'en-tête HTTP :

```http
Authorization: Bearer <token>
```

Les jetons sont générés lors de la connexion via la route `/login`.

### Routes d'authentification

* **POST /login**

  * Description : Authentifie un utilisateur.
  * Corps requis :

    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```
  * Réponse :

    ```json
    {
      "token": "<JWT_TOKEN>"
    }
    ```

* **GET /logout**

  * Description : Invalide le jeton actif.
  * En-tête requis : `Authorization: Bearer <token>`
  * Réponse :

    ```json
    {
      "message": "Déconnecté avec succès."
    }
    ```

---

## Gestion des Catways

Les catways représentent les appontements pour bateaux. Chaque catway est unique.

### Routes

* **GET /catways**

  * Description : Liste tous les catways.
  * Réponse :

    ```json
    [
      {
        "catwayNumber": 1,
        "catwayType": "long",
        "catwayState": "En bon état"
      },
      {
        "catwayNumber": 2,
        "catwayType": "short",
        "catwayState": "Nécessite une réparation"
      }
    ]
    ```

* **GET /catways/\:id**

  * Description : Récupère les détails d’un catway.
  * Réponse :

    ```json
    {
      "catwayNumber": 1,
      "catwayType": "long",
      "catwayState": "En bon état"
    }
    ```

* **POST /catways**

  * Description : Crée un nouveau catway.
  * Corps requis :

    ```json
    {
      "catwayNumber": 3,
      "catwayType": "long",
      "catwayState": "Disponible"
    }
    ```

* **PUT /catways/\:id**

  * Description : Met à jour l’état d’un catway.
  * Corps requis :

    ```json
    {
      "catwayState": "En réparation"
    }
    ```

* **DELETE /catways/\:id**

  * Description : Supprime un catway.
  * Réponse :

    ```json
    {
      "message": "Catway supprimé avec succès."
    }
    ```

---

## Gestion des Réservations

Les réservations sont liées à un catway spécifique.

### Routes

* **GET /catways/\:id/reservations**

  * Description : Liste toutes les réservations pour un catway donné.

* **GET /catways/\:id/reservations/\:idReservation**

  * Description : Récupère les détails d’une réservation.

* **POST /catways/\:id/reservations**

  * Description : Crée une nouvelle réservation.
  * Corps requis :

    ```json
    {
      "clientName": "Jean Dupont",
      "boatName": "Le Grand Bleu",
      "startDate": "2023-05-01",
      "endDate": "2023-05-10"
    }
    ```

* **PUT /catways/\:id/reservations/\:idReservation**

  * Description : Met à jour une réservation.
  * Corps requis :

    ```json
    {
      "endDate": "2023-05-15"
    }
    ```

* **DELETE /catways/\:id/reservations/\:idReservation**

  * Description : Supprime une réservation.
  * Réponse :

    ```json
    {
      "message": "Réservation supprimée avec succès."
    }
    ```

---

## Gestion des Utilisateurs

Les utilisateurs sont gérés pour l’authentification et l’autorisation.

### Routes

* **GET /users**

  * Description : Liste tous les utilisateurs.

* **GET /users/\:email**

  * Description : Récupère les détails d’un utilisateur par son email.

* **POST /users**

  * Description : Crée un utilisateur.
  * Corps requis :

    ```json
    {
      "username": "JeanD",
      "email": "jean.dupont@example.com",
      "password": "password123"
    }
    ```

* **PUT /users/\:email**

  * Description : Met à jour les détails d’un utilisateur.
  * Corps requis :

    ```json
    {
      "username": "Jean Dupont"
    }
    ```

* **DELETE /users/\:email**

  * Description : Supprime un utilisateur.
  * Réponse :

    ```json
    {
      "message": "Utilisateur supprimé avec succès."
    }
    ```

---

## Codes de réponse HTTP

* **200 OK** : Requête réussie.
* **201 Created** : Ressource créée avec succès.
* **400 Bad Request** : Erreur dans la syntaxe de la requête.
* **401 Unauthorized** : Authentification requise.
* **404 Not Found** : Ressource non trouvée.
* **500 Internal Server Error** : Erreur serveur.

---

## Déploiement

L'API est déployée sur : \[Lien vers l'application déployée].

Utilisez ce guide pour comprendre et exploiter l'API privée du port de plaisance Russell. Pour toute question, contactez \[[support@example.com](mailto:support@example.com)].
