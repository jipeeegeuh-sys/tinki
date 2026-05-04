# Synthèse — Tinkitest

_Exporté le lundi 4 mai 2026_

## Brainstorming

---
phase: brainstorming
projectId: 42ec43f4-ba47-432d-8370-c3238735af4f
version: 7
writtenAt: 2026-05-02T06:43:52.397Z
author: ai
sessionId: 
boardId: 18
boardName: Board Principal
nodeCount: 12
---

# Résumé — Phase Brainstorming

> Version 7 · 2026-05-02T06:43:52.397Z · auteur : ai
> Board : « Board Principal » · 12 nodes

<a id="ideas"></a>
## Idées principales

- [Recherche multicritère de ressources] : L'utilisateur accède aux ressources (places, parking) via un formulaire de recherche centralisé débouchant sur une grille de résultats.
- [Affichage conditionnel par rôle] : Les résultats proposés sont filtrés et affichés dynamiquement en fonction du persona et du rôle de l'utilisateur connecté.
- [Gestion autonome du cycle de vie des réservations] : Un espace dédié permet à l'utilisateur de piloter ses réservations actives (consultation, modification, annulation).

<a id="hypotheses"></a>
## Hypothèses

- [Hypothèse 1] : Nous croyons que le filtrage par rôle est essentiel parce que les droits d'accès aux espaces diffèrent selon les profils, ce qui se vérifiera si les utilisateurs ne visualisent que des ressources pertinentes pour leur catégorie dans la grille de résultats.
- [Hypothèse 2] : Nous croyons que la précision des attributs (étage, type de place) est critique pour le choix final parce que l'usage des lieux est spécifique (besoin de calme vs appel), ce qui se vérifiera si le taux de rebond après clic sur une card est faible.

<a id="questions"></a>
## Questions ouvertes

- [Identité des personas] : Quels sont les besoins spécifiques et les droits associés aux trois personas identifiés (PER-00001, PER-00002, PER-00003) ?
- [Gestion des conflits] : Que se passe-t-il si une réservation est éditée alors que la ressource n'est plus disponible sur le nouveau créneau ?
- [Critères du formulaire] : Quels sont les champs exacts du formulaire de recherche (date, heure, durée, équipements) ?

<a id="discarded"></a>
## Pistes écartées

- _(rien d'identifié)_

<a id="glossary"></a>
## Domaine métier & vocabulaire

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

<a id="non-goals"></a>
## Contraintes / non-objectifs

- [Authentification/Rôles] : L'affichage dépend strictement du rôle ; un système de gestion des droits est donc requis en amont.
- [Gestion des erreurs] : Le cas "aucun résultat" doit obligatoirement rediriger vers une nouvelle recherche.
- [Hors-scope : Paiement] : PAS de module de paiement ou de monétisation des places mentionné.
- [Hors-scope : Social] : PAS de fonctionnalités de partage, de visibilité des collègues ou d'aspects sociaux.
- [Hors-scope : Onboarding] : PAS de processus d'inscription publique (le système semble basé sur des rôles pré-établis).

<a id="notes-for-next-phase"></a>
## Notes pour la suite

- Le design des cards dans la grille de résultats doit impérativement faire ressortir le trio "Numéro / Étage / Type".
- Prévoir un état "vide" (empty state) explicite pour le formulaire de recherche incitant à modifier les critères.
- La vue "Mes réservations" doit présenter les données sous forme de tableau (TBL) avec des actions d'édition directes.

---

## Cartographie des nodes (annexe technique)

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

---

## Maquettes

---
phase: mockup
projectId: 42ec43f4-ba47-432d-8370-c3238735af4f
version: 1
writtenAt: 2026-05-02T19:08:01.404Z
author: ai
sessionId: 20260501182739-7brw56
---

# Résumé — Phase Mockup

> Version 1 · 2026-05-02T19:08:01.404Z · auteur : ai

<a id="decisions-locked"></a>
## Décisions verrouillées

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

<a id="rejected"></a>
## Rejetés (et pourquoi)

_(à compléter — pistes explorées et écartées avec rationale)_

<a id="tensions"></a>
## Tensions non résolues

- Frames Figma manquants en variante A pour Formulaire de recherche et Grille des résultats (statut "generating", aucune URL produite malgré deux runs successifs).
- Besoins et droits spécifiques des trois personas (PER-00001, PER-00002, PER-00003) toujours non précisés.
- Comportement attendu lorsqu'une réservation est éditée et que la ressource n'est plus disponible sur le nouveau créneau.
- Liste exhaustive des champs du formulaire au-delà du minimum (heure, équipements, étage souhaité…) non arbitrée.
- Écran historique : périmètre fonctionnel non détaillé (filtres, colonnes, actions disponibles).
- Écran edition d'une reservation : champs modifiables précisés partiellement (date, heure d'arrivée, de départ, "…") sans liste fermée.

<a id="preferences"></a>
## Préférences captées

- Ton fonctionnel et professionnel, pas de dimension sociale ni ludique.
- Vocabulaire métier à respecter strictement : place, numéro de la place, étage, type de place, open space, phonesbox, place électrique, réservation en cours, annuler, éditer une réservation, aucun résultat.
- Hors-scope ferme : paiement, inscription publique, partage / visibilité entre collègues.
- Préférence pour des actions directes dans les vues de gestion (édition inline dans le tableau Mes reservations).
- État vide explicite et orienté action (toujours ramener vers une nouvelle recherche).

<a id="notes-for-next-phase"></a>
## Notes pour la phase suivante

- Priorité immédiate : relancer / débloquer la génération des variantes A pour Formulaire de recherche et Grille des résultats — ces deux écrans n'ont actuellement aucun frame Figma en A, seule la B existe.
- Frames disponibles à exploiter : Mes Reservation (A: node 33-2, B: node 38-2), historique (A: node 34-2, B: node 39-2), edition d'une reservation (A: node 41-2, B: node 42-2). Ancien run Mes Reservation (A: 23-2, B: 27-2) à considérer comme obsolète.
- Vérifier sur les frames livrés que la grille de résultats expose bien numéro / étage / type au premier coup d'œil et que la mention "place électrique" est traitée pour le parking.
- Vérifier la présence et la qualité de l'état "aucun résultat" avec CTA retour formulaire — contrainte non négociable.
- Confirmer que le tableau Mes Reservation porte des actions d'édition/suppression directes (pas de navigation intermédiaire pour les actions courantes).
- Avant tout enrichissement fonctionnel (personas détaillés, conflits d'édition, périmètre historique), remonter les questions ouvertes au client : ne pas inventer de règles métier sur ces zones grises.
- Conserver le mode dual A/B sur toute itération future ; ne pas fusionner les directions sans validation explicite.

---

<details>
<summary>Proposition initiale de l'IA (avant édition humaine)</summary>

> Générée le 2026-05-02T19:07:41.171Z

### Décisions verrouillées (IA)

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

### Rejetés (IA)

_(vide)_

### Tensions (IA)

- Frames Figma manquants en variante A pour Formulaire de recherche et Grille des résultats (statut "generating", aucune URL produite malgré deux runs successifs).
- Besoins et droits spécifiques des trois personas (PER-00001, PER-00002, PER-00003) toujours non précisés.
- Comportement attendu lorsqu'une réservation est éditée et que la ressource n'est plus disponible sur le nouveau créneau.
- Liste exhaustive des champs du formulaire au-delà du minimum (heure, équipements, étage souhaité…) non arbitrée.
- Écran historique : périmètre fonctionnel non détaillé (filtres, colonnes, actions disponibles).
- Écran edition d'une reservation : champs modifiables précisés partiellement (date, heure d'arrivée, de départ, "…") sans liste fermée.

### Préférences (IA)

- Ton fonctionnel et professionnel, pas de dimension sociale ni ludique.
- Vocabulaire métier à respecter strictement : place, numéro de la place, étage, type de place, open space, phonesbox, place électrique, réservation en cours, annuler, éditer une réservation, aucun résultat.
- Hors-scope ferme : paiement, inscription publique, partage / visibilité entre collègues.
- Préférence pour des actions directes dans les vues de gestion (édition inline dans le tableau Mes reservations).
- État vide explicite et orienté action (toujours ramener vers une nouvelle recherche).

### Notes phase suivante (IA)

- Priorité immédiate : relancer / débloquer la génération des variantes A pour Formulaire de recherche et Grille des résultats — ces deux écrans n'ont actuellement aucun frame Figma en A, seule la B existe.
- Frames disponibles à exploiter : Mes Reservation (A: node 33-2, B: node 38-2), historique (A: node 34-2, B: node 39-2), edition d'une reservation (A: node 41-2, B: node 42-2). Ancien run Mes Reservation (A: 23-2, B: 27-2) à considérer comme obsolète.
- Vérifier sur les frames livrés que la grille de résultats expose bien numéro / étage / type au premier coup d'œil et que la mention "place électrique" est traitée pour le parking.
- Vérifier la présence et la qualité de l'état "aucun résultat" avec CTA retour formulaire — contrainte non négociable.
- Confirmer que le tableau Mes Reservation porte des actions d'édition/suppression directes (pas de navigation intermédiaire pour les actions courantes).
- Avant tout enrichissement fonctionnel (personas détaillés, conflits d'édition, périmètre historique), remonter les questions ouvertes au client : ne pas inventer de règles métier sur ces zones grises.
- Conserver le mode dual A/B sur toute itération future ; ne pas fusionner les directions sans validation explicite.

</details>

---

## Sitemap

---
phase: sitemap
projectId: 42ec43f4-ba47-432d-8370-c3238735af4f
version: 5
writtenAt: 2026-05-04T08:59:33.781Z
author: ai
sessionId: 20260504085933-p0y891
---

# Résumé — Phase Sitemap & Annotations

> Version 5 · 2026-05-04T08:59:33.781Z · auteur : ai

<a id="decisions-locked"></a>
## Décisions verrouillées

- **Arborescence cible** : Structure à 5 pages : Formulaire de recherche (accueil), Grille des résultats, Mes Réservations, Historique, Édition d'une réservation.
- **Modèle de données ServiceNow** : Utilisation des tables `sc_request` / `sc_req_item` (Service Catalog) pour le moteur de réservation au lieu des tables Incident ou Change. Table custom `x_wsb_space` pour le référentiel des places.
- **Navigation & Header** : Header persistant sur toutes les pages incluant : liens directs vers "Mes réservations" et "Aide & Support" (KB), et un menu avatar (initiales/rôle dynamiques) avec options Préférences, Impersonate et Déconnexion.
- **Logique de recherche** : Formulaire à 4 champs obligatoires (Bâtiment A/B, Étage, Date, Type d'espace). Bouton de recherche activé uniquement si complet. Transmission des critères via query strings URL.
- **Composants Grille** : Affichage par cards avec trio "Numéro / Étage / Type". Gestion obligatoire de trois états : Chargement (skeleton loader), Nominal (cards disponibles/occupées), et Vide (illustration + CTA de retour).

<a id="rejected"></a>
## Rejetés (et pourquoi)

_(à compléter — pistes explorées et écartées avec rationale)_

<a id="tensions"></a>
## Tensions non résolues

- **Variantes de design** : Absence des maquettes en variante A pour le Formulaire et la Grille (génération technique en échec).
- **Logique métier des Personas** : Les droits spécifiques et restrictions d'accès pour les profils PER-00001, PER-00002 et PER-00003 ne sont pas encore définis.
- **Gestion des conflits** : Comportement non arbitré en cas d'indisponibilité d'une ressource lors de la modification d'un créneau existant.
- **Détails de l'Historique** : Liste des colonnes et filtres spécifiques pour la page historique non documentée.

<a id="preferences"></a>
## Préférences captées

- **Inspiration Design** : Alignement sur l'identité visuelle Accenture (accenture.com).
- **Expérience Utilisateur** : Préférence pour les actions directes (édition inline dans les tableaux) et la réduction des clics intermédiaires.
- **Couplage Bureau/Parking** : Lors de la réservation d'un bureau, le système doit proposer proactivement une place de parking (thermique ou électrique selon disponibilité) si l'utilisateur signale venir en voiture.
- **Ton** : Strictement professionnel et utilitaire, orienté efficacité "Flex Office".

<a id="notes-for-next-phase"></a>
## Notes pour la phase suivante

- **Épics prioritaires** : 1. Moteur de recherche et calcul de disponibilité (Script Include), 2. Tunnel de réservation (Service Catalog), 3. Dashboard de gestion utilisateur (Mes réservations/Historique).
- **Contrainte technique (Disponibilité)** : Prévoir un Script Include complexe pour calculer la disponibilité en soustrayant les `sc_req_item` actifs de la table `x_wsb_space` selon le créneau.
- **Développement Frontend** : Utilisation impérative de Tailwind CDN et des composants natifs Now Experience (`now-skeleton`, `now-dropdown`).
- **Mapping Data** : Mapper les champs `opened_by`, `state` et `short_description` de ServiceNow vers les besoins de l'interface de réservation.

## Structure du sitemap

12 nodes, 23 connexions, 0 cluster.

### Nodes
- **Contrôle d'accès par rôle** [auth-gate]
- **Formulaire de recherche** [page]
- **Erreur de validation formulaire** [state]
- **Grille des résultats** [page]
- **Aucun résultat** [state]
- **Chargement des disponibilités** [state]
- **Confirmation de réservation** [modal]
- **Mes Reservation** [page]
- **Confirmation d'annulation** [modal]
- **Edition d'une reservation** [page]
- **Conflit de disponibilité** [state]
- **Historique** [page]

### Connexions
- Contrôle d'accès par rôle → Formulaire de recherche (navigates) — post-auth
- Formulaire de recherche → Grille des résultats (navigates) — soumission
- Formulaire de recherche → Aucun résultat (navigates) — pas de résultats
- Formulaire de recherche → Erreur de validation formulaire (navigates) — validation échouée
- Erreur de validation formulaire → Formulaire de recherche (redirects) — correction des critères
- Grille des résultats → Confirmation de réservation (opens_modal) — sélection d'une place
- Grille des résultats → Aucun résultat (navigates) — pas de résultats
- Grille des résultats → Conflit de disponibilité (navigates) — ressource indisponible
- Grille des résultats → Chargement des disponibilités (navigates) — recherche en cours
- Aucun résultat → Formulaire de recherche (redirects) — nouvelle recherche
- Chargement des disponibilités → Grille des résultats (redirects) — fin du chargement
- Chargement des disponibilités → Conflit de disponibilité (navigates) — ressource non disponible
- Confirmation de réservation → Mes Reservation (opens_modal) — réservation confirmée
- Confirmation de réservation → Grille des résultats (opens_modal) — annulation
- Mes Reservation → Edition d'une reservation (navigates) — action d'édition
- Mes Reservation → Confirmation d'annulation (opens_modal) — action d'annulation
- Mes Reservation → Historique (navigates) — consultation
- Confirmation d'annulation → Mes Reservation (opens_modal) — annulation confirmée
- Edition d'une reservation → Conflit de disponibilité (navigates) — modification impossible
- Edition d'une reservation → Confirmation de réservation (opens_modal) — sauvegarde
- Conflit de disponibilité → Edition d'une reservation (redirects) — correction des critères
- Conflit de disponibilité → Grille des résultats (redirects) — nouvelle recherche
- Historique → Mes Reservation (navigates) — retour

---

<details>
<summary>Proposition initiale de l'IA (avant édition humaine)</summary>

> Générée le 2026-05-04T08:59:01.442Z

### Décisions verrouillées (IA)

- **Arborescence cible** : Structure à 5 pages : Formulaire de recherche (accueil), Grille des résultats, Mes Réservations, Historique, Édition d'une réservation.
- **Modèle de données ServiceNow** : Utilisation des tables `sc_request` / `sc_req_item` (Service Catalog) pour le moteur de réservation au lieu des tables Incident ou Change. Table custom `x_wsb_space` pour le référentiel des places.
- **Navigation & Header** : Header persistant sur toutes les pages incluant : liens directs vers "Mes réservations" et "Aide & Support" (KB), et un menu avatar (initiales/rôle dynamiques) avec options Préférences, Impersonate et Déconnexion.
- **Logique de recherche** : Formulaire à 4 champs obligatoires (Bâtiment A/B, Étage, Date, Type d'espace). Bouton de recherche activé uniquement si complet. Transmission des critères via query strings URL.
- **Composants Grille** : Affichage par cards avec trio "Numéro / Étage / Type". Gestion obligatoire de trois états : Chargement (skeleton loader), Nominal (cards disponibles/occupées), et Vide (illustration + CTA de retour).

### Rejetés (IA)

_(vide)_

### Tensions (IA)

- **Variantes de design** : Absence des maquettes en variante A pour le Formulaire et la Grille (génération technique en échec).
- **Logique métier des Personas** : Les droits spécifiques et restrictions d'accès pour les profils PER-00001, PER-00002 et PER-00003 ne sont pas encore définis.
- **Gestion des conflits** : Comportement non arbitré en cas d'indisponibilité d'une ressource lors de la modification d'un créneau existant.
- **Détails de l'Historique** : Liste des colonnes et filtres spécifiques pour la page historique non documentée.

### Préférences (IA)

- **Inspiration Design** : Alignement sur l'identité visuelle Accenture (accenture.com).
- **Expérience Utilisateur** : Préférence pour les actions directes (édition inline dans les tableaux) et la réduction des clics intermédiaires.
- **Couplage Bureau/Parking** : Lors de la réservation d'un bureau, le système doit proposer proactivement une place de parking (thermique ou électrique selon disponibilité) si l'utilisateur signale venir en voiture.
- **Ton** : Strictement professionnel et utilitaire, orienté efficacité "Flex Office".

### Notes phase suivante (IA)

- **Épics prioritaires** : 1. Moteur de recherche et calcul de disponibilité (Script Include), 2. Tunnel de réservation (Service Catalog), 3. Dashboard de gestion utilisateur (Mes réservations/Historique).
- **Contrainte technique (Disponibilité)** : Prévoir un Script Include complexe pour calculer la disponibilité en soustrayant les `sc_req_item` actifs de la table `x_wsb_space` selon le créneau.
- **Développement Frontend** : Utilisation impérative de Tailwind CDN et des composants natifs Now Experience (`now-skeleton`, `now-dropdown`).
- **Mapping Data** : Mapper les champs `opened_by`, `state` et `short_description` de ServiceNow vers les besoins de l'interface de réservation.

</details>

---

## Backlog

---
phase: backlog
projectId: 42ec43f4-ba47-432d-8370-c3238735af4f
version: 1
writtenAt: 2026-05-04T10:03:37.489Z
author: ai
sessionId: 20260504090033-ydad9e
---

# Résumé — Phase Backlog

> Version 1 · 2026-05-04T10:03:37.489Z · auteur : ai

<a id="decisions-locked"></a>
## Décisions verrouillées

- Pipeline backlog finalisé : 6 epics, 34 stories générées (30 high / 3 med / 1 low), toutes assignées au rôle dev.
- Découpage en 6 epics : ep-00 Design System (8 stories), ep-01 (5), ep-02 (6), ep-04 (4), ep-05 (6), ep-06 (5).
- Epic 0 acté comme socle transverse : Design System & Composants partagés, incluant le composant `<wsb-header>` global.
- Stack technique de mise en œuvre confirmée : ServiceNow Now Experience + Tailwind CDN obligatoire, aucun build CSS.
- Modèle de données ServiceNow appliqué au backlog : `sc_request` / `sc_req_item` pour le moteur de réservation, table custom `x_wsb_space` pour le référentiel des places.
- Pipeline de génération exécuté de bout en bout : extraction → synthesis → structuration → stories → challenge → doublecheck (durée totale 3732 s).

<a id="rejected"></a>
## Rejetés (et pourquoi)

_(à compléter — pistes explorées et écartées avec rationale)_

<a id="tensions"></a>
## Tensions non résolues

- Couverture sitemap incomplète signalée par l'audit qualité : la page « Contrôle d'accès par rôle » n'a qu'un guard partiel (US-6.01) sans story dédiée complète.
- Step `doublecheck` exécuté en 0 ms et produisant une sortie identique au step `stories` : compilation/corrections probablement non réellement appliquées, à vérifier.
- Droits et restrictions des trois personas (PER-00001, PER-00002, PER-00003) toujours non définis — impactent les stories de filtrage par rôle.
- Comportement en cas de conflit lors de l'édition d'une réservation (ressource devenue indisponible sur le nouveau créneau) non arbitré.
- Périmètre fonctionnel détaillé de la page Historique (colonnes, filtres, actions) non documenté.
- Variantes de design A pour Formulaire de recherche et Grille des résultats toujours absentes (échec de génération hérité de la phase Mockup).

<a id="preferences"></a>
## Préférences captées

- Ton strictement professionnel et utilitaire, orienté efficacité Flex Office — pas de social, pas de ludique.
- Vocabulaire métier à respecter à la lettre : place, numéro, étage, type, open space, phonesbox, place électrique, réservation en cours, annuler, éditer, aucun résultat.
- Actions directes privilégiées (édition inline dans les tableaux, réduction des clics intermédiaires).
- Couplage proactif Bureau ↔ Parking lorsque l'utilisateur signale venir en voiture.
- État vide systématiquement orienté action (CTA retour formulaire).
- Inspiration visuelle Accenture (accenture.com/fr-fr).
- Hors-scope ferme : paiement, inscription publique, partage entre collègues.

<a id="notes-for-next-phase"></a>
## Notes pour la phase suivante

- Auditer en priorité la sortie du step `doublecheck` (durée 0 ms, contenu dupliqué de `stories`) : refaire passer les corrections de l'audit qualité avant tout démarrage de développement.
- Combler le gap sitemap signalé par l'audit : créer ou compléter la story dédiée au contrôle d'accès par rôle au-delà du simple guard US-6.01.
- Avant d'attaquer les stories des epics ep-04/ep-05 (réservation, gestion), faire trancher par le client les zones grises bloquantes : matrice de droits par persona, règles de conflit en édition, périmètre Historique.
- Reprendre le déblocage des variantes A manquantes (Formulaire, Grille) hérité de la phase Mockup — sans ces frames, les stories UI correspondantes resteront partiellement spécifiables.
- Story technique structurante à séquencer tôt : le Script Include de calcul de disponibilité (soustraction des `sc_req_item` actifs sur `x_wsb_space` selon créneau) — dépendance de l'ensemble du tunnel de réservation.
- Conserver le mode dual A/B sur toute itération UI ; ne pas fusionner les directions sans validation explicite.
- Vérifier que les stories d'Epic 0 (`<wsb-header>`, skeleton, dropdown) sont bien priorisées en amont — elles conditionnent la cohérence visuelle des 5 pages.

---
