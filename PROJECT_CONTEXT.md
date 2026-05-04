# Contexte Projet : Tinkitest

## Description
Aucune description fournie.

## Vision
# Tinkitest



Backlog généré en mode : custom
Export du : 04/05/2026 10:59:39

## Contexte hérité des phases précédentes
# Contexte hérité des phases précédentes

Tu reprends un travail en cours. Les phases précédentes ont produit les synthèses ci-dessous. Tiens-en compte : décisions verrouillées, pistes écartées, tensions ouvertes, préférences captées et notes spécifiques pour la phase Dev.

### Phase Brainstorming (v7, 2026-05-02T06:43:52.397Z)
*Board source : « Board Principal » · 12 nodes*

**Idées principales :**

- [Recherche multicritère de ressources] : L'utilisateur accède aux ressources (places, parking) via un formulaire de recherche centralisé débouchant sur une grille de résultats.
- [Affichage conditionnel par rôle] : Les résultats proposés sont filtrés et affichés dynamiquement en fonction du persona et du rôle de l'utilisateur connecté.
- [Gestion autonome du cycle de vie des réservations] : Un espace dédié permet à l'utilisateur de piloter ses réservations actives (consultation, modification, annulation).

**Hypothèses :**

- [Hypothèse 1] : Nous croyons que le filtrage par rôle est essentiel parce que les droits d'accès aux espaces diffèrent selon les profils, ce qui se vérifiera si les utilisateurs ne visualisent que des ressources pertinentes pour leur catégorie dans la grille de résultats.
- [Hypothèse 2] : Nous croyons que la précision des attributs (étage, type de place) est critique pour le choix final parce que l'usage des lieux est spécifique (besoin de calme vs appel), ce qui se vérifiera si le taux de rebond après clic sur une card est faible.

**Questions ouvertes :**

- [Identité des personas] : Quels sont les besoins spécifiques et les droits associés aux trois personas identifiés (PER-00001, PER-00002, PER-00003) ?
- [Gestion des conflits] : Que se passe-t-il si une réservation est éditée alors que la ressource n'est plus disponible sur le nouveau créneau ?
- [Critères du formulaire] : Quels sont les champs exacts du formulaire de recherche (date, heure, durée, équipements) ?

**Pistes écartées :**

- _(rien d'identifié)_

**Domaine métier & vocabulaire :**

- **Contexte d'usage :** Application interne de gestion d'espace de travail (Flex office) et de stationnement.
- **Personas distincts :** 
    - Persona 1 (PER-00001) : Utilisateur avec besoins/rôles non spécifiés.
    - Persona 2 (PER-00002) : Utilisateur avec besoins/rôles non spécifiés.
    - Persona 3 (PER-00003) : Utilisateur avec besoins/rôles non spécifiés.
- **Vocabulaire spécifique :** places electrique, open space, phonesbox, numero de la place, etage, type de place, cards, annuler, editer une reservation, aucun resultat.
- **Données manipulées :** 
    - **Place / Ressource :** numéro, étage, type (open space, phonesbox, parking électrique).
    - **Réservation :** statut (en cours), actions (annuler, éditer).
    - **Utilisateur :** rôle (lié au persona).

**Contraintes / non-objectifs :**

- [Authentification/Rôles] : L'affichage dépend strictement du rôle ; un système de gestion des droits est donc requis en amont.
- [Gestion des erreurs] : Le cas "aucun résultat" doit obligatoirement rediriger vers une nouvelle recherche.
- [Hors-scope : Paiement] : PAS de module de paiement ou de monétisation des places mentionné.
- [Hors-scope : Social] : PAS de fonctionnalités de partage, de visibilité des collègues ou d'aspects sociaux.
- [Hors-scope : Onboarding] : PAS de processus d'inscription publique (le système semble basé sur des rôles pré-établis).

**Notes pour la suite :**

- Le design des cards dans la grille de résultats doit impérativement faire ressortir le trio "Numéro / Étage / Type".
- Prévoir un état "vide" (empty state) explicite pour le formulaire de recherche incitant à modifier les critères.
- La vue "Mes réservations" doit présenter les données sous forme de tableau (TBL) avec des actions d'édition directes.

**Cartographie des nodes :**

*Transcription structurée des nodes du board Tinkerer pour exploitation IA. Générée déterministiquement à partir des données du board.*

**Stats :** 12 nodes (12 dans un cluster), 7 liens, 3 clusters.
**Board :** « Board Principal »

### Cluster « Ecran1 homepage »

- 👤 `PER-00001` **Node PER-00001**
- 👤 `PER-00002` **Node PER-00002**
- 👤 `PER-00003` **Node PER-00003**
- 📝 `TXT-00048` **aucun resultat, l'utilisateur doit refaire une nouvelle recherche**
- 📝 `TXT-00049` **Le parking dispose de 8 places electrique**
    - 🔗 dérive de → **Formulaire de recherche**
- 📑 `FRM-00005` **Formulaire de recherche**
    - 🔗 dérive de → **Node HYP-00002**
    - 🔗 dérive de → **Node HYP-00001**

### Cluster « Ecran 2 : Grilles des résultats »

- 📝 `TXT-00050` **Sur cette page on ffiche les résultat possible selon le persona (le persona est directement lié au role de l'utilisat…**
- 📋 `LST-00003` **Liste des resultats sous la forme de cards**
    - {"text":"affichage sousla forme de cards contenant le numero de la place, l'etage et le type de place (open space, phonesbox ...)","checked":false}
    - 🔗 dérive de → **Mes reservations**
- 🧪 `HYP-00001` **Node HYP-00001**
    - 🔗 dérive de → **aucun resultat, l'utilisateur doit refaire une nouvelle recherche**
- 🧪 `HYP-00002` **Node HYP-00002**
    - 🔗 dérive de → **Liste des resultats sous la forme de cards**

### Cluster « Ecran 3 : gestion de mes reservations »

- 📊 `TBL-00005` **Mes reservations**
- 📝 `TXT-00053` **ecran 3 : ecrans Mes reservations qui permet de gerer mes reservation, : annuler, editer une reservation en cours**
    - 🔗 dérive de → **Mes reservations**


### Phase Mockup (v1, 2026-05-02T19:08:01.404Z)

**Décisions verrouillées :**

- Cible technique : ServiceNow Now Experience, HTML + Tailwind CDN.
- Mode dual A (classique) + B (direction artistique) actif sur l'ensemble des écrans.
- Périmètre figé à 5 écrans : Formulaire de recherche, Grille des résultats, Mes Reservation, historique, edition d'une reservation.
- Formulaire de recherche = point d'entrée post-authentification (pas d'onboarding ni d'écran d'accueil générique).
- Champs minimaux du formulaire : date, durée, type de ressource (bureau ou parking).
- Grille des résultats sous forme de cards exposant impérativement le trio numéro de place / étage / type (open space, phonesbox…).
- Pour le parking : mention explicite "place électrique" (8 places au total dans le parc).
- Deux états distincts pour la grille : nominal (cards sélectionnables + action de confirmation) et "aucun résultat" avec CTA renvoyant vers le formulaire.
- Filtrage des résultats par persona/rôle géré côté système, transparent pour l'utilisateur.
- Mes Reservation : grand tableau récapitulatif avec actions d'édition et de suppression directes.
- Source d'inspiration / design system : Accenture (accenture.com/fr-fr).

**Tensions :**

- Frames Figma manquants en variante A pour Formulaire de recherche et Grille des résultats (statut "generating", aucune URL produite malgré deux runs successifs).
- Besoins et droits spécifiques des trois personas (PER-00001, PER-00002, PER-00003) toujours non précisés.
- Comportement attendu lorsqu'une réservation est éditée et que la ressource n'est plus disponible sur le nouveau créneau.
- Liste exhaustive des champs du formulaire au-delà du minimum (heure, équipements, étage souhaité…) non arbitrée.
- Écran historique : périmètre fonctionnel non détaillé (filtres, colonnes, actions disponibles).
- Écran edition d'une reservation : champs modifiables précisés partiellement (date, heure d'arrivée, de départ, "…") sans liste fermée.

**Préférences :**

- Ton fonctionnel et professionnel, pas de dimension sociale ni ludique.
- Vocabulaire métier à respecter strictement : place, numéro de la place, étage, type de place, open space, phonesbox, place électrique, réservation en cours, annuler, éditer une réservation, aucun résultat.
- Hors-scope ferme : paiement, inscription publique, partage / visibilité entre collègues.
- Préférence pour des actions directes dans les vues de gestion (édition inline dans le tableau Mes reservations).
- État vide explicite et orienté action (toujours ramener vers une nouvelle recherche).

**Notes pour cette phase :**

- Priorité immédiate : relancer / débloquer la génération des variantes A pour Formulaire de recherche et Grille des résultats — ces deux écrans n'ont actuellement aucun frame Figma en A, seule la B existe.
- Frames disponibles à exploiter : Mes Reservation (A: node 33-2, B: node 38-2), historique (A: node 34-2, B: node 39-2), edition d'une reservation (A: node 41-2, B: node 42-2). Ancien run Mes Reservation (A: 23-2, B: 27-2) à considérer comme obsolète.
- Vérifier sur les frames livrés que la grille de résultats expose bien numéro / étage / type au premier coup d'œil et que la mention "place électrique" est traitée pour le parking.
- Vérifier la présence et la qualité de l'état "aucun résultat" avec CTA retour formulaire — contrainte non négociable.
- Confirmer que le tableau Mes Reservation porte des actions d'édition/suppression directes (pas de navigation intermédiaire pour les actions courantes).
- Avant tout enrichissement fonctionnel (personas détaillés, conflits d'édition, périmètre historique), remonter les questions ouvertes au client : ne pas inventer de règles métier sur ces zones grises.
- Conserver le mode dual A/B sur toute itération future ; ne pas fusionner les directions sans validation explicite.


### Phase Sitemap & Annotations (v5, 2026-05-04T08:59:33.781Z)

**Décisions verrouillées :**

- **Arborescence cible** : Structure à 5 pages : Formulaire de recherche (accueil), Grille des résultats, Mes Réservations, Historique, Édition d'une réservation.
- **Modèle de données ServiceNow** : Utilisation des tables `sc_request` / `sc_req_item` (Service Catalog) pour le moteur de réservation au lieu des tables Incident ou Change. Table custom `x_wsb_space` pour le référentiel des places.
- **Navigation & Header** : Header persistant sur toutes les pages incluant : liens directs vers "Mes réservations" et "Aide & Support" (KB), et un menu avatar (initiales/rôle dynamiques) avec options Préférences, Impersonate et Déconnexion.
- **Logique de recherche** : Formulaire à 4 champs obligatoires (Bâtiment A/B, Étage, Date, Type d'espace). Bouton de recherche activé uniquement si complet. Transmission des critères via query strings URL.
- **Composants Grille** : Affichage par cards avec trio "Numéro / Étage / Type". Gestion obligatoire de trois états : Chargement (skeleton loader), Nominal (cards disponibles/occupées), et Vide (illustration + CTA de retour).

**Tensions :**

- **Variantes de design** : Absence des maquettes en variante A pour le Formulaire et la Grille (génération technique en échec).
- **Logique métier des Personas** : Les droits spécifiques et restrictions d'accès pour les profils PER-00001, PER-00002 et PER-00003 ne sont pas encore définis.
- **Gestion des conflits** : Comportement non arbitré en cas d'indisponibilité d'une ressource lors de la modification d'un créneau existant.
- **Détails de l'Historique** : Liste des colonnes et filtres spécifiques pour la page historique non documentée.

**Préférences :**

- **Inspiration Design** : Alignement sur l'identité visuelle Accenture (accenture.com).
- **Expérience Utilisateur** : Préférence pour les actions directes (édition inline dans les tableaux) et la réduction des clics intermédiaires.
- **Couplage Bureau/Parking** : Lors de la réservation d'un bureau, le système doit proposer proactivement une place de parking (thermique ou électrique selon disponibilité) si l'utilisateur signale venir en voiture.
- **Ton** : Strictement professionnel et utilitaire, orienté efficacité "Flex Office".

**Notes pour cette phase :**

- **Épics prioritaires** : 1. Moteur de recherche et calcul de disponibilité (Script Include), 2. Tunnel de réservation (Service Catalog), 3. Dashboard de gestion utilisateur (Mes réservations/Historique).
- **Contrainte technique (Disponibilité)** : Prévoir un Script Include complexe pour calculer la disponibilité en soustrayant les `sc_req_item` actifs de la table `x_wsb_space` selon le créneau.
- **Développement Frontend** : Utilisation impérative de Tailwind CDN et des composants natifs Now Experience (`now-skeleton`, `now-dropdown`).
- **Mapping Data** : Mapper les champs `opened_by`, `state` et `short_description` de ServiceNow vers les besoins de l'interface de réservation.


### Phase Backlog (v1, 2026-05-04T10:03:37.489Z)

**Décisions verrouillées :**

- Pipeline backlog finalisé : 6 epics, 34 stories générées (30 high / 3 med / 1 low), toutes assignées au rôle dev.
- Découpage en 6 epics : ep-00 Design System (8 stories), ep-01 (5), ep-02 (6), ep-04 (4), ep-05 (6), ep-06 (5).
- Epic 0 acté comme socle transverse : Design System & Composants partagés, incluant le composant `<wsb-header>` global.
- Stack technique de mise en œuvre confirmée : ServiceNow Now Experience + Tailwind CDN obligatoire, aucun build CSS.
- Modèle de données ServiceNow appliqué au backlog : `sc_request` / `sc_req_item` pour le moteur de réservation, table custom `x_wsb_space` pour le référentiel des places.
- Pipeline de génération exécuté de bout en bout : extraction → synthesis → structuration → stories → challenge → doublecheck (durée totale 3732 s).

**Tensions :**

- Couverture sitemap incomplète signalée par l'audit qualité : la page « Contrôle d'accès par rôle » n'a qu'un guard partiel (US-6.01) sans story dédiée complète.
- Step `doublecheck` exécuté en 0 ms et produisant une sortie identique au step `stories` : compilation/corrections probablement non réellement appliquées, à vérifier.
- Droits et restrictions des trois personas (PER-00001, PER-00002, PER-00003) toujours non définis — impactent les stories de filtrage par rôle.
- Comportement en cas de conflit lors de l'édition d'une réservation (ressource devenue indisponible sur le nouveau créneau) non arbitré.
- Périmètre fonctionnel détaillé de la page Historique (colonnes, filtres, actions) non documenté.
- Variantes de design A pour Formulaire de recherche et Grille des résultats toujours absentes (échec de génération hérité de la phase Mockup).

**Préférences :**

- Ton strictement professionnel et utilitaire, orienté efficacité Flex Office — pas de social, pas de ludique.
- Vocabulaire métier à respecter à la lettre : place, numéro, étage, type, open space, phonesbox, place électrique, réservation en cours, annuler, éditer, aucun résultat.
- Actions directes privilégiées (édition inline dans les tableaux, réduction des clics intermédiaires).
- Couplage proactif Bureau ↔ Parking lorsque l'utilisateur signale venir en voiture.
- État vide systématiquement orienté action (CTA retour formulaire).
- Inspiration visuelle Accenture (accenture.com/fr-fr).
- Hors-scope ferme : paiement, inscription publique, partage entre collègues.

**Notes pour cette phase :**

- Auditer en priorité la sortie du step `doublecheck` (durée 0 ms, contenu dupliqué de `stories`) : refaire passer les corrections de l'audit qualité avant tout démarrage de développement.
- Combler le gap sitemap signalé par l'audit : créer ou compléter la story dédiée au contrôle d'accès par rôle au-delà du simple guard US-6.01.
- Avant d'attaquer les stories des epics ep-04/ep-05 (réservation, gestion), faire trancher par le client les zones grises bloquantes : matrice de droits par persona, règles de conflit en édition, périmètre Historique.
- Reprendre le déblocage des variantes A manquantes (Formulaire, Grille) hérité de la phase Mockup — sans ces frames, les stories UI correspondantes resteront partiellement spécifiables.
- Story technique structurante à séquencer tôt : le Script Include de calcul de disponibilité (soustraction des `sc_req_item` actifs sur `x_wsb_space` selon créneau) — dépendance de l'ensemble du tunnel de réservation.
- Conserver le mode dual A/B sur toute itération UI ; ne pas fusionner les directions sans validation explicite.
- Vérifier que les stories d'Epic 0 (`<wsb-header>`, skeleton, dropdown) sont bien priorisées en amont — elles conditionnent la cohérence visuelle des 5 pages.

## Backlog
Mode de génération : custom
Total tâches : 34 (HIGH: 30, MED: 3, LOW: 1)

### Aperçu des tâches
- [HIGH] [US-0.03] Boutons partagés (primaire, secondaire, ghost, destructif) (dev)
- [HIGH] [US-0.04] Toasts & Notifications `<wsb-toast>` (dev)
- [HIGH] [US-0.05] Skeleton Loaders, Spinners & Empty States (dev)
- [HIGH] [US-0.06] Card ressource `<wsb-booking-card>` (dev)
- [HIGH] [US-0.07] Data Table générique & `<wsb-booking-table-row>` (dev)
- [HIGH] [US-0.08] Modal de confirmation `<wsb-confirm-modal>` (dev)
- [HIGH] [US-0.09] Couche API, Services HTTP & Navigation inter-pages (dev)
- [HIGH] [US-0.10] Accessibilité globale, Skip Links & Focus Management (WCAG 2.1 AA) (dev)
- [HIGH] [US-1.01] Header persistant `<wsb-header>` : barre de navigation, liens et composant avatar (dev)
- [HIGH] [US-1.02] Formulaire de recherche : structure de la page et 4 champs principaux (dev)
- [HIGH] [US-1.03] Activation conditionnelle du bouton "Lancer la recherche" et validation en temps réel (dev)
- [MEDIUM] [US-1.04] Section conditionnelle parking : toggle "Venez-vous en voiture ?" et radio Thermique/Électrique (dev)
- [HIGH] [US-1.05] Soumission du formulaire, construction des query strings et navigation vers la Grille des résultats (dev)
- [HIGH] [US-2.01] Chargement de la grille et appel API de disponibilité (dev)
- [HIGH] [US-2.02] Bandeau récapitulatif des critères actifs et CTA "Modifier la recherche" (dev)
- [HIGH] [US-2.03] Grille nominale — cards disponibles et cards occupées (dev)
- [HIGH] [US-2.04] Action "Réserver cet espace" et navigation vers la page de confirmation (dev)
- [HIGH] [US-2.05] États spéciaux : vide (aucun résultat) et erreur serveur (dev)
- [HIGH] [US-2.06] Endpoint serveur de disponibilité et filtrage par persona/rôle (Script Include) (dev)
- [HIGH] [US-4.01] Structure de page, chargement et tableau des réservations passées (dev)
- [MEDIUM] [US-4.02] Filtres de recherche dans l'Historique (Période, Type, Statut) (dev)
- [HIGH] [US-4.03] États vide et erreur spécifiques à la page Historique (dev)
- [LOW] [US-4.04] Action "Re-réserver" depuis l'Historique** *(conditionnel — à arbitrer avec le client) (dev)
- [HIGH] [US-5.01] Chargement et affichage pré-rempli de la page d'édition (dev)
- [HIGH] [US-5.02] Modification de la date et du créneau horaire avec validation temps réel (dev)
- [HIGH] [US-5.03] Gestion des 4 modes de place de stationnement en édition (dev)
- [HIGH] [US-5.04] Soumission, vérification de disponibilité et persistance des modifications (dev)
- [HIGH] [US-5.05] Affichage et récupération du conflit de disponibilité (dev)
- [MEDIUM] [US-5.06] Annulation et retour sans modification vers "Mes réservations" (dev)
- [HIGH] [US-6.01] Initialisation SPA, déclaration des routes client et guard d'authentification ServiceNow (dev)
… et 4 autres tâches

## Sitemap
- Contrôle d'accès par rôle
- Formulaire de recherche
- Erreur de validation formulaire
- Grille des résultats
- Aucun résultat
- Chargement des disponibilités
- Confirmation de réservation
- Mes Reservation
- Confirmation d'annulation
- Edition d'une reservation
- Conflit de disponibilité
- Historique

## Conventions
- Commits : Conventional Commits (feat/fix/chore/docs/style/refactor/test)
- Langue : commentaires en français, code en anglais
- Tests : écrire les tests pour les fonctions critiques

## Assets disponibles
Maquettes : 5 nues + 4 annotées (pins numérotés)
Contexte Forge : `forge-context.md` (Pain Points / User Voices / Validations + Canvas Lean UX/JX + Stories)


---
_Généré par Synapse Bridge le 04/05/2026 10:59:39_