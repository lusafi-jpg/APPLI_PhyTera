Je comprends. Tu veux maintenant **fusionner les deux documents** pour obtenir une **spécification globale, cohérente et suffisamment précise pour qu'une IA développe uniquement le backend Django de PhyTera**.

Le point important est de bien séparer :

* **Ce que PhyTera fait comme produit** : IoT, IA, drone, application, montre, agriculture.
* **Ce que cette phase doit développer** : uniquement le **backend central** qui reçoit, organise, analyse, synchronise et expose toutes ces données.

Voici la version propre et consolidée.

# Spécification complète du Backend — PhyTera

## 1. Vision générale du projet

**PhyTera – Surveillance végétale automatisée, intelligente et mobile**

PhyTera est une plateforme intelligente de surveillance agricole conçue pour aider les agriculteurs à suivre l'état de leurs cultures, détecter les anomalies et maladies potentielles, recevoir des alertes et prendre de meilleures décisions.

Le système PhyTera peut recevoir des données provenant de plusieurs sources :

* boîtiers IoT équipés notamment d'ESP32 ;
* capteurs environnementaux et agricoles ;
* applications mobiles ;
* photos prises par les utilisateurs ;
* drones équipés de caméras RGB, thermiques ou multispectrales ;
* futurs équipements connectés, notamment les montres destinées aux travailleurs agricoles.

Le présent développement concerne **uniquement le backend central de PhyTera**.

Le backend doit être conçu comme le **cerveau central de la plateforme**. Il ne développe pas directement l'interface mobile, le tableau de bord ou le firmware ESP32, mais fournit toutes les API, la logique métier, le stockage, l'analyse, la sécurité, le temps réel et la synchronisation nécessaires à ces composants.

---

# 2. Problématique

Les agriculteurs font face à plusieurs difficultés :

* maladies végétales détectées trop tard ;
* manque de surveillance continue ;
* conditions climatiques variables ;
* stress hydrique ;
* problèmes liés au sol ;
* mauvaise gestion de l'irrigation ;
* difficulté à centraliser les données agricoles ;
* manque d'alertes précoces et personnalisées.

La question principale est donc :

> **Comment permettre à plusieurs agriculteurs de surveiller automatiquement leurs cultures, de recevoir des données en temps réel, de détecter des risques et de continuer à fonctionner même lorsque la connexion Internet est indisponible ?**

Le backend PhyTera doit répondre à cette problématique.

---

# 3. Objectif du backend

Le backend doit permettre de :

1. gérer plusieurs utilisateurs ;
2. gérer plusieurs exploitations agricoles ;
3. gérer plusieurs champs ou parcelles par utilisateur ;
4. gérer plusieurs boîtiers PhyTera par champ ;
5. recevoir les données des capteurs IoT ;
6. stocker les données localement et dans la base centrale ;
7. permettre le fonctionnement en mode hors-ligne ;
8. synchroniser automatiquement les données lorsque la connexion Internet revient ;
9. analyser les données pour détecter des anomalies et risques de maladies ;
10. générer des alertes personnalisées ;
11. transmettre les données en temps réel aux applications clientes ;
12. synchroniser certaines données du backend vers Firebase ;
13. protéger strictement les données entre les utilisateurs ;
14. gérer les rôles et permissions ;
15. préparer l'architecture pour les futures fonctionnalités IA, drone et analyse d'images.

---

# 4. Architecture générale

La relation principale doit être structurée ainsi :

```text
Utilisateur
    │
    ├── Exploitation agricole
    │       │
    │       ├── Champ / Parcelle
    │       │       │
    │       │       ├── Boîtier PhyTera
    │       │       │       │
    │       │       │       ├── Capteurs
    │       │       │       │
    │       │       │       └── Mesures
    │       │       │
    │       │       ├── Analyses
    │       │       │
    │       │       ├── Alertes
    │       │       │
    │       │       └── Historique
    │       │
    │       └── Techniciens autorisés
    │
    └── Abonnement
```

Architecture simplifiée du flux de données :

```text
ESP32 / Capteurs
       │
       ▼
Base locale du boîtier
       │
       │ Internet disponible
       ▼
Backend Django / API
       │
       ├── PostgreSQL
       │
       ├── Analyse maladies / IA
       │
       ├── Alertes
       │
       ├── WebSocket temps réel
       │
       └── Synchronisation
               │
               ▼
            Firebase
```

---

# 5. Architecture multi-utilisateurs

PhyTera doit pouvoir être utilisé simultanément par plusieurs personnes, plusieurs exploitations et plusieurs champs.

## Si plusieurs personnes utilisent PhyTera

Le système doit permettre :

* la gestion des comptes : inscription, connexion et rôles ;
* chaque utilisateur peut créer une ou plusieurs exploitations ;
* chaque exploitation peut contenir un ou plusieurs champs ;
* chaque champ peut avoir un ou plusieurs boîtiers PhyTera ;
* chaque boîtier peut envoyer plusieurs types de données ;
* les données envoyées par chaque boîtier doivent être isolées par utilisateur ;
* aucune fuite de données entre utilisateurs ne doit être possible ;
* chaque utilisateur ne peut consulter que les exploitations auxquelles il a accès ;
* l'interface cliente doit recevoir uniquement les données autorisées ;
* les alertes doivent être personnalisées selon l'utilisateur, l'exploitation et le champ ;
* les analyses doivent être exécutées sur les données du champ concerné ;
* chaque utilisateur doit pouvoir suivre **en temps réel ses propres données**, ses boîtiers et ses alertes.

---

# 6. Rôles et fonctionnalités attendues

## 6.1 Agriculteur

L'agriculteur est le propriétaire principal de ses exploitations et champs.

Il doit pouvoir :

* créer un compte ;
* se connecter ;
* modifier son profil ;
* créer une ou plusieurs exploitations ;
* créer un ou plusieurs champs ;
* modifier ou supprimer ses champs ;
* définir les limites d'un champ sur une carte grâce à un polygone GPS ;
* calculer automatiquement la superficie de la parcelle ;
* définir le type de culture ;
* définir éventuellement la variété cultivée ;
* associer ou dissocier un boîtier PhyTera ;
* consulter l'état de ses boîtiers ;
* suivre ses données en temps réel ;
* consulter l'historique des mesures ;
* visualiser les graphiques et tendances ;
* recevoir des alertes ;
* consulter les risques de maladies ;
* recevoir des recommandations automatiques ;
* voir les problèmes liés à l'humidité, la température, le pH et la luminosité ;
* consulter les données synchronisées et non synchronisées ;
* fonctionner en mode hors-ligne via les applications clientes ;
* consulter l'historique des synchronisations ;
* gérer son abonnement ;
* consulter les limites de son abonnement.

---

## 6.2 Technicien

Le technicien ne doit pas automatiquement avoir accès à toutes les données de tous les agriculteurs.

Son accès doit être accordé explicitement.

Le technicien doit pouvoir :

* voir les exploitations ou champs auxquels il est autorisé ;
* consulter les boîtiers qui lui sont assignés ;
* voir le statut des boîtiers ;
* voir la dernière connexion ;
* consulter les erreurs techniques ;
* consulter les dernières transmissions ;
* consulter les données techniques disponibles ;
* détecter les boîtiers hors-ligne ;
* créer un ticket d'intervention ;
* enregistrer une intervention ;
* modifier certains paramètres techniques autorisés ;
* préparer ou déclencher une mise à jour OTA si cette fonctionnalité est activée ;
* consulter l'historique de maintenance.

Chaque accès technicien doit être contrôlé par des permissions.

---

## 6.3 Administrateur

L'administrateur gère la plateforme globale.

Il doit pouvoir :

* gérer les utilisateurs ;
* attribuer ou modifier les rôles ;
* désactiver ou réactiver un compte ;
* gérer les plans d'abonnement ;
* gérer les limitations par plan ;
* superviser les boîtiers ;
* voir les statistiques globales ;
* surveiller les erreurs de synchronisation ;
* surveiller la connexion Firebase ;
* consulter les métriques globales ;
* gérer les règles générales de détection ;
* consulter les logs d'audit ;
* gérer les permissions ;
* superviser les incidents techniques.

L'administrateur doit avoir accès à des données globales uniquement selon les règles de sécurité définies.

---

# 7. Modèles principaux Django

## User

Le projet doit utiliser un `CustomUser`.

Champs :

* `id` : UUID ;
* `nom` ;
* `email` unique ;
* `password` hashé ;
* `role` :

  * agriculteur ;
  * technicien ;
  * admin ;
* `is_active` ;
* `is_staff` ;
* `date_inscription` ;
* `last_login` ;
* `preferences` : JSON.

Les préférences peuvent contenir :

* langue ;
* unité de température ;
* préférences de notifications ;
* fréquence des rapports ;
* préférences d'alertes.

---

# 8. Exploitation agricole

Ajouter un modèle permettant de représenter une exploitation.

## Farm

Champs :

* `id` UUID ;
* `owner` → User ;
* `name` ;
* `description` ;
* `location` ;
* `location_polygon` si nécessaire ;
* `created_at` ;
* `updated_at`.

Un utilisateur peut avoir :

```text
1 User → plusieurs Farms
```

---

# 9. Champ agricole

## Field

Chaque champ appartient à une exploitation.

Champs :

* `id` UUID ;
* `farm` → Farm ;
* `owner` → User si nécessaire pour simplifier certaines requêtes ;
* `name` ;
* `description` ;
* `location_polygon` ;
* `surface_area` ;
* `culture_type` ;
* `variety` ;
* `timezone` ;
* `config_local` JSON ;
* `created_at` ;
* `updated_at`.

Le polygone GPS permet à l'utilisateur de dessiner les limites de son champ.

Le backend doit pouvoir :

* recevoir les coordonnées ;
* enregistrer le polygone ;
* calculer ou enregistrer la superficie ;
* utiliser PostGIS si nécessaire.

---

# 10. Boîtier PhyTera

## Device

Chaque champ peut posséder un ou plusieurs boîtiers.

Champs :

* `id` UUID ;
* `device_key` unique ;
* `serial_number` ;
* `field` ;
* `owner` si nécessaire ;
* `device_type` ;
* `firmware_version` ;
* `status` :

  * active ;
  * offline ;
  * maintenance ;
  * disabled ;
* `last_seen` ;
* `metadata` JSON ;
* `created_at` ;
* `updated_at`.

Le boîtier doit être identifiable de manière unique.

---

# 11. Capteurs et extensibilité

Le système ne doit pas être limité définitivement aux capteurs actuels.

Les données initiales peuvent inclure :

* température de l'air ;
* humidité de l'air ;
* température du sol ;
* humidité du sol ;
* pH du sol ;
* luminosité.

Mais l'architecture doit permettre d'ajouter plus tard :

* qualité de l'eau ;
* conductivité électrique ;
* niveau d'eau ;
* fertilité ;
* CO₂ ;
* pression atmosphérique ;
* vitesse du vent ;
* pluie ;
* batterie ;
* autres capteurs agricoles.

Le backend doit donc prévoir une architecture extensible.

---

# 12. Données des capteurs

## SensorData

Champs principaux :

* `id` UUID ;
* `client_uuid` unique pour éviter les doublons ;
* `device` ;
* `field` ;
* `timestamp` ;
* `temp_air` ;
* `hum_air` ;
* `temp_sol` ;
* `hum_sol` ;
* `ph_sol` ;
* `luminosite` ;
* autres valeurs éventuellement nulles ;
* `raw_payload` JSON ;
* `origin_timestamp` ;
* `ingested_at` ;
* `synced_to_firebase` ;
* `firebase_synced_at` ;
* `created_at` ;
* `updated_at`.

Les mesures doivent rester extensibles.

---

# 13. Détection des maladies et anomalies

Le backend doit intégrer une logique de détection basée initialement sur des règles.

Exemples :

### Tomate en bonne santé

Conditions approximatives :

* humidité air : 60–80 % ;
* température : 22–28 °C ;
* humidité du sol : 50–70 % ;
* pH : 6–7 ;
* luminosité : 20 000–60 000 lux.

---

### Risque de mildiou

Conditions :

* humidité air > 80 % ;
* température entre environ 20 et 25 °C ;
* humidité du sol élevée.

Le backend doit générer une analyse telle que :

```text
Risque détecté : Mildiou
Niveau : Warning
Champ : Tomate_Jardin_1
Raison :
Humidité de l'air élevée + température favorable.
```

---

### Autres risques à préparer

Le moteur de règles doit pouvoir détecter notamment :

* mildiou ;
* oïdium ;
* alternariose ;
* fusariose ;
* verticilliose ;
* tache bactérienne ;
* chancre bactérien ;
* flétrissement bactérien ;
* mosaïque virale ;
* jaunisse en cuillère ;
* nécrose apicale ;
* éclatement des fruits ;
* stress hydrique ;
* humidité excessive ;
* pH anormal ;
* température critique ;
* manque ou excès de luminosité.

Important :

> Les données environnementales permettent principalement de détecter un **risque ou une condition favorable**, mais une confirmation précise de certaines maladies peut nécessiter une image, une analyse IA ou une observation humaine.

L'architecture doit donc distinguer :

```text
RISQUE DÉTECTÉ
```

et

```text
MALADIE CONFIRMÉE
```

---

# 14. Règles personnalisées par champ

Chaque champ peut avoir :

* un climat différent ;
* un type de sol différent ;
* une variété différente ;
* une irrigation différente ;
* des seuils personnalisés.

Les règles doivent donc pouvoir être :

```text
Règles globales
        ↓
Règles par culture
        ↓
Règles personnalisées par champ
```

Une structure `FieldRule` ou `DiseaseRule` est préférable à un simple JSON si le système devient complexe.

---

# 15. Alertes

## Alert

Champs :

* `id` UUID ;
* `field` ;
* `device` optionnel ;
* `type` ;
* `level` :

  * info ;
  * warning ;
  * critical ;
* `title` ;
* `message` ;
* `detected_at` ;
* `resolved` ;
* `resolved_at` ;
* `resolution_note` ;
* `created_by` ;
* `created_at`.

Exemples :

```text
Votre champ Tomate_Jardin_1 présente un risque de mildiou.

Humidité de l'air : 85 %
Température : 23 °C

Recommandation :
Aérer les plants et éviter l'arrosage direct sur les feuilles.
```

---

# 16. Suivi en temps réel

Le backend doit fournir un suivi temps réel.

Technologie recommandée :

* Django Channels ;
* WebSockets ;
* Redis comme channel layer.

Chaque utilisateur doit recevoir uniquement les événements auxquels il a droit.

Canaux possibles :

```text
user_{user_id}
field_{field_id}
device_{device_id}
```

Événements :

```text
new_measure
new_alert
analysis_result
device_online
device_offline
sync_completed
```

Exemple :

```json
{
  "event": "new_measure",
  "field_id": "UUID",
  "device_id": "UUID",
  "data": {
    "temp_air": 27.1,
    "hum_air": 78,
    "temp_sol": 25.2,
    "hum_sol": 65,
    "ph_sol": 6.4,
    "luminosite": 42000
  }
}
```

---

# 17. Authentification des utilisateurs

Technologie recommandée :

* Django REST Framework ;
* JWT avec SimpleJWT ;
* refresh token ;
* access token ;
* RBAC basé sur les rôles.

Le backend doit vérifier :

```text
Qui est connecté ?
        ↓
Quel est son rôle ?
        ↓
À quelles exploitations a-t-il accès ?
        ↓
À quels champs ?
        ↓
À quels boîtiers ?
```

---

# 18. Authentification des boîtiers ESP32

Chaque boîtier possède une clé unique.

Exemple :

```text
PHYTERA_ABC123
```

Lorsqu'un ESP32 envoie des données :

```text
POST /api/device/data/
```

il doit fournir son `device_key`.

Le backend :

1. vérifie la clé ;
2. vérifie que le boîtier est actif ;
3. identifie son champ ;
4. identifie son exploitation ;
5. identifie le propriétaire ;
6. enregistre les données ;
7. déclenche l'analyse ;
8. génère éventuellement une alerte ;
9. transmet les événements en temps réel ;
10. prépare la synchronisation vers Firebase.

À prévoir ultérieurement :

* HMAC ;
* rotation des clés ;
* révocation des clés ;
* authentification machine ;
* signatures.

---

# 19. API principale

## Authentification

```text
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/refresh/
POST /api/auth/logout/
GET  /api/auth/me/
```

## Exploitations

```text
GET    /api/farms/
POST   /api/farms/
GET    /api/farms/{id}/
PUT    /api/farms/{id}/
DELETE /api/farms/{id}/
```

## Champs

```text
GET    /api/fields/
POST   /api/fields/
GET    /api/fields/{id}/
PUT    /api/fields/{id}/
DELETE /api/fields/{id}/
```

## Boîtiers

```text
GET  /api/devices/
POST /api/devices/register/
GET  /api/devices/{id}/
PUT  /api/devices/{id}/
POST /api/devices/{id}/rotate-key/
```

## Données IoT

```text
POST /api/device/data/
POST /api/device/data/batch/
GET  /api/fields/{id}/data/
GET  /api/devices/{id}/data/
```

## Analyses

```text
GET /api/fields/{id}/analysis/
GET /api/fields/{id}/health/
```

## Alertes

```text
GET  /api/alerts/
GET  /api/alerts/{id}/
POST /api/alerts/{id}/resolve/
```

## Synchronisation

```text
GET  /api/sync/status/
POST /api/sync/retry/
GET  /api/sync/history/
```

## Abonnement

```text
GET /api/subscription/
GET /api/plans/
```

---

# 20. Exemple d'envoi ESP32

Le boîtier peut envoyer plusieurs mesures dans une requête.

```json
{
  "device_key": "PHYTERA_ABC123",
  "measurements": [
    {
      "client_uuid": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2026-09-03T14:05:00Z",
      "temp_air": 25.7,
      "hum_air": 82,
      "temp_sol": 26.4,
      "hum_sol": 71,
      "ph_sol": 6.2,
      "luminosite": 18000
    }
  ]
}
```

Réponse :

```json
{
  "status": "ok",
  "accepted": [
    "550e8400-e29b-41d4-a716-446655440000"
  ],
  "rejected": [],
  "server_time": "2026-09-03T14:05:10Z"
}
```

---

# 21. Mode hors-ligne et base de données locale

PhyTera doit fonctionner même lorsque la connexion Internet est indisponible.

Le principe est :

```text
Internet disponible
ESP32 → Backend
```

Mais lorsque le réseau disparaît :

```text
ESP32
   ↓
Base locale
   ↓
Attente
   ↓
Internet revient
   ↓
Synchronisation automatique
   ↓
Backend
```

---

## Stockage local sur ESP32

Le boîtier peut utiliser :

* LittleFS ;
* SPIFFS.

Il doit stocker localement les mesures non envoyées.

Chaque mesure doit contenir :

* `client_uuid` ;
* `device_key` ;
* timestamp ;
* données des capteurs ;
* statut de synchronisation ;
* nombre de tentatives.

Structure logique :

```text
pending_sensor_data
```

Exemple :

```json
{
  "client_uuid": "UUID",
  "device_key": "PHYTERA_ABC123",
  "timestamp": "2026-09-03T14:05:00Z",
  "payload": {},
  "attempts_count": 0,
  "last_attempt_at": null,
  "synced": false
}
```

---

# 22. Stratégie de synchronisation

Lorsqu'Internet revient :

1. le boîtier détecte la connexion ;
2. il récupère les données non synchronisées ;
3. il envoie les données par lots ;
4. le backend répond avec les identifiants acceptés ;
5. le boîtier marque uniquement ces données comme synchronisées ;
6. les données confirmées peuvent être supprimées de la file locale ;
7. les données refusées restent disponibles pour analyse ou correction.

Le système doit utiliser :

* FIFO ;
* batch ;
* retry automatique ;
* backoff exponentiel.

---

# 23. Protection contre les doublons

Chaque mesure possède un identifiant unique :

```text
client_uuid
```

Le backend doit garantir :

```text
1 client_uuid = 1 mesure
```

Ainsi, si la connexion coupe après l'envoi et que le boîtier renvoie les données, le backend ne doit pas créer un doublon.

---

# 24. Base centrale du backend

La base principale recommandée est :

```text
PostgreSQL
```

Avec :

```text
PostGIS
```

si la gestion géographique avancée est utilisée.

PostgreSQL doit être la **source principale de vérité**.

Architecture :

```text
ESP32
   ↓
Django API
   ↓
PostgreSQL
   ↓
Analyse
   ↓
Alertes
   ↓
Firebase
```

Firebase ne doit pas remplacer la base centrale du backend.

---

# 25. Synchronisation Backend vers Firebase

Firebase Firestore sera utilisé comme :

* miroir ;
* couche temps réel supplémentaire ;
* source pratique pour certaines applications clientes ;
* cache synchronisé si nécessaire.

Le backend Django reste le système principal.

## Processus

Lorsqu'une donnée arrive :

```text
ESP32
   ↓
Django
   ↓
PostgreSQL
   ↓
Celery Task
   ↓
Firestore
```

Dans la base PostgreSQL :

```text
synced_to_firebase = false
```

Après succès :

```text
synced_to_firebase = true
firebase_synced_at = timestamp
```

---

# 26. Synchronisation asynchrone

Utiliser :

* Celery ;
* Redis ;
* tâches asynchrones.

Exemple :

```text
Nouvelle mesure
       ↓
Sauvegarde PostgreSQL
       ↓
Création tâche Celery
       ↓
Push Firestore
       ↓
Succès ?
   ┌────┴────┐
   │         │
  Oui       Non
   │         │
 synced     retry
   │         │
   └─────┬───┘
         ↓
       DLQ
```

---

# 27. Gestion des échecs Firebase

Si Firebase est indisponible :

* la donnée reste dans PostgreSQL ;
* `synced_to_firebase = false` ;
* Celery réessaie ;
* après plusieurs échecs, l'événement est placé dans une Dead Letter Queue ;
* l'administrateur peut consulter les erreurs ;
* une nouvelle synchronisation peut être déclenchée.

Aucune donnée ne doit être perdue parce que Firebase est temporairement indisponible.

---

# 28. Synchronisation des autres clients

L'architecture doit également prévoir la synchronisation future de :

* données IoT ;
* alertes ;
* configurations ;
* paramètres de champs ;
* règles personnalisées ;
* données créées hors-ligne par l'application.

Pour les données modifiables hors-ligne :

```text
last_modified
version
updated_by
```

doivent être prévus.

Stratégie principale :

```text
Last Write Wins
```

avec journalisation et historique pour les opérations importantes.

---

# 29. Abonnements

## Plans

### Standard

* environ 150 m² ;
* IoT ;
* IA ;
* cartographie simplifiée ;
* accès aux données et cartes régionales mutualisées ;
* environ 1 vol par saison ;
* 4–5 USD/mois.

### Pro

* 150–500 m² ;
* IoT ;
* IA ;
* cartographie avancée ;
* recommandations personnalisées ;
* environ 2 vols par saison ;
* 7–10 USD/mois.

### Premium

* à partir de 500 m² ;
* IoT ;
* IA ;
* cartographie complète ;
* suivi drone à la demande ;
* cartographie multispectrale ;
* rapports avancés ;
* assistance prioritaire ;
* minimum 3 vols par saison ;
* 15–25 USD/mois.

---

# 30. Modèle Subscription

```text
Subscription
```

Champs :

* `id` ;
* `user` ;
* `plan` :

  * standard ;
  * pro ;
  * premium ;
* `start_date` ;
* `end_date` ;
* `active` ;
* `limits` JSON ;
* `created_at` ;
* `updated_at`.

Les limites peuvent contrôler :

* nombre de champs ;
* nombre de boîtiers ;
* fonctionnalités IA ;
* accès drone ;
* nombre d'analyses ;
* niveau de précision des rapports.

---

# 31. Intégration future de l'IA

Le backend doit être préparé pour recevoir plusieurs types d'analyse.

## Analyse des capteurs

```text
SensorData
     ↓
Rule Engine
     ↓
Risk / Anomaly
     ↓
Alert
```

## Analyse d'images

Plus tard :

```text
Image
   ↓
AI Model
   ↓
Disease Detection
   ↓
Confidence Score
   ↓
Diagnosis
```

Sources d'images possibles :

* smartphone ;
* drone ;
* caméra connectée.

Le backend doit donc prévoir une future entité :

```text
CropImage
```

avec :

* image ;
* champ ;
* utilisateur ;
* source ;
* timestamp ;
* coordonnées GPS ;
* résultat IA ;
* confidence score.

---

# 32. Drone

Le backend ne contrôle pas nécessairement le drone dans la première version, mais doit pouvoir recevoir :

* images ;
* métadonnées de vol ;
* coordonnées ;
* résultats d'analyse ;
* NDVI ;
* données thermiques ;
* cartes générées.

Structure future possible :

```text
DroneMission
```

et :

```text
DroneCapture
```

---

# 33. Montre connectée et travailleurs

La montre connectée peut être utilisée pour transmettre ou recevoir :

* alertes urgentes ;
* notifications de terrain ;
* tâches ;
* informations de sécurité ;
* statut d'intervention.

Le backend doit prévoir un système générique de notifications afin que les alertes puissent être envoyées vers :

```text
Application mobile
Web dashboard
Montre connectée
Firebase
Autres systèmes futurs
```

---

# 34. Notifications

Créer une architecture de notifications extensible.

Types :

* push notification ;
* WebSocket ;
* Firebase Cloud Messaging ;
* notifications pour montre ;
* éventuellement SMS plus tard.

Une notification doit être liée à :

* utilisateur ;
* alerte ;
* champ ;
* priorité ;
* canal.

---

# 35. Séparation stricte des données

Principe obligatoire :

> Un utilisateur ne doit jamais pouvoir accéder aux données d'un autre utilisateur simplement en modifiant un ID dans une URL.

Chaque requête doit vérifier :

```text
request.user
       ↓
Farm
       ↓
Field
       ↓
Device
       ↓
SensorData
```

Exemple :

```text
GET /api/fields/{id}/data/
```

Le backend doit vérifier que le champ appartient à l'utilisateur ou que celui-ci possède une permission explicite.

---

# 36. Sécurité

Le backend doit inclure :

* HTTPS ;
* JWT ;
* RBAC ;
* permissions par objet ;
* device keys ;
* rate limiting ;
* rotation des clés ;
* audit logs ;
* validation stricte des payloads ;
* protection contre les doublons ;
* protection contre les accès non autorisés.

Les mots de passe doivent toujours être hashés.

Les identifiants Firebase ne doivent jamais être exposés aux clients.

---

# 37. Logs et audit

Les actions importantes doivent être enregistrées :

* connexion ;
* création de champ ;
* suppression ;
* association d'un boîtier ;
* changement de configuration ;
* rotation d'une clé ;
* intervention technicien ;
* changement d'abonnement ;
* synchronisation ;
* erreurs importantes.

---

# 38. Monitoring

Le backend doit permettre de surveiller :

* nombre de boîtiers ;
* nombre de boîtiers en ligne ;
* nombre de boîtiers hors-ligne ;
* dernière transmission ;
* volume de données ;
* taux d'échec de synchronisation ;
* tâches Firebase en attente ;
* erreurs API ;
* alertes critiques.

---

# 39. Stack technique recommandée

```text
Backend
├── Django
├── Django REST Framework
├── Django Channels
├── PostgreSQL
├── PostGIS
├── Redis
├── Celery
├── Firebase Admin SDK
├── Daphne ou ASGI server
├── Gunicorn selon architecture
└── Nginx
```

Architecture :

```text
Client / ESP32
       │
       ▼
     Nginx
       │
       ▼
 Django ASGI / API
       │
 ┌─────┼─────────────┐
 ▼     ▼             ▼
Postgres Redis    WebSockets
       │
       ▼
     Celery
       │
       ▼
    Firebase
```

---

# 40. MVP Backend — ordre de développement

## Phase 1 : Fondation

1. Configuration Django.
2. Custom User.
3. JWT.
4. Rôles et permissions.
5. PostgreSQL.
6. Farm.
7. Field.
8. Device.

## Phase 2 : IoT

9. Génération des `device_key`.
10. Endpoint ESP32.
11. Validation des données.
12. SensorData.
13. Protection contre les doublons.
14. Historique des mesures.

## Phase 3 : Intelligence

15. Rule Engine.
16. Détection des risques.
17. Alert.
18. Recommandations.
19. Analyse par champ.

## Phase 4 : Temps réel

20. Django Channels.
21. WebSocket.
22. Nouveaux événements.
23. Alertes temps réel.
24. Détection online/offline.

## Phase 5 : Offline et synchronisation

25. API batch.
26. Idempotence.
27. Synchronisation LittleFS/SQLite vers backend.
28. Retry.
29. Historique de synchronisation.

## Phase 6 : Firebase

30. Firebase Admin SDK.
31. Celery.
32. Synchronisation SensorData.
33. Synchronisation Alert.
34. Retry.
35. DLQ.
36. Monitoring.

## Phase 7 : Extensions futures

37. IA image.
38. Drone.
39. NDVI.
40. Montres connectées.
41. Prévisions de rendement.
42. Machine Learning avancé.

---

# 41. Principe fondamental de l'architecture

La règle principale doit être :

```text
LOCAL → BACKEND → POSTGRESQL
                    ↓
                  ANALYSE
                    ↓
                 ALERTES
                    ↓
                TEMPS RÉEL
                    ↓
                  FIREBASE
```

En cas d'absence d'Internet :

```text
CAPTEURS
    ↓
ESP32
    ↓
BASE LOCALE
    ↓
FILE D'ATTENTE
    ↓
INTERNET DISPONIBLE ?
    │
    ├── NON → continuer stockage local
    │
    └── OUI
          ↓
      SYNCHRONISATION
          ↓
        BACKEND
```

---

# 42. Conclusion technique

PhyTera doit être développé comme une **plateforme backend agricole multi-utilisateurs, multi-exploitations, multi-champs et multi-boîtiers**.

Le backend doit être capable de :

* gérer plusieurs agriculteurs ;
* isoler totalement leurs données ;
* gérer les exploitations ;
* gérer les champs ;
* gérer plusieurs boîtiers ESP32 ;
* recevoir et stocker les données IoT ;
* fonctionner avec une stratégie hors-ligne ;
* synchroniser les données dès le retour d'Internet ;
* éviter les doublons ;
* analyser les conditions agricoles ;
* détecter les risques de maladies ;
* distinguer un risque environnemental d'une maladie confirmée ;
* générer des alertes personnalisées ;
* fournir un suivi en temps réel ;
* gérer les techniciens et leurs autorisations ;
* gérer les abonnements ;
* préparer l'intégration de l'IA, des images, des drones et des montres connectées ;
* utiliser PostgreSQL comme **source principale de vérité** ;
* utiliser Firebase comme **miroir et couche complémentaire de synchronisation** ;
* garantir qu'aucune donnée ne soit perdue en cas de coupure Internet ou d'indisponibilité temporaire de Firebase.

**En résumé, PhyTera ne doit pas être construit comme une simple API qui reçoit des données de capteurs. Il doit être conçu dès le départ comme le backend central d'un véritable écosystème d'agriculture intelligente, capable de fonctionner dans des environnements où la connexion Internet peut être instable ou inexistante.**
