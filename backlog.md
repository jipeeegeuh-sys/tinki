# Tinkitest

_34 user stories — 6 epics_

---

## EP-00

### [US-0.03] Boutons partagés (primaire, secondaire, ghost, destructif)

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B.png`

En tant que collaborateur Flex Office authentifié,
Je veux que tous les boutons de l'application suivent une convention visuelle claire selon leur niveau d'importance,
Afin de comprendre instantanément la hiérarchie des actions disponibles sur chaque écran et agir en confiance.

**Critères d'acceptation**

```gherkin
# Bouton primaire actif
Étant donné que les 4 champs du formulaire sont remplis
Quand le bouton "Lancer la recherche" est affiché
Alors son fond est #A100FF, le texte est blanc, la cible tactile est ≥ 44×44 px
Et au focus clavier, un outline 2px solid #A100FF offset 2px est visible

# Bouton disabled
Étant donné que le formulaire est incomplet
Quand le bouton "Lancer la recherche" est affiché
Alors il porte aria-disabled="true" et opacity: 0.45, curseur not-allowed
Et le tooltip "Complétez tous les champs" est visible au survol via aria-describedby
Et aucun appel API n'est déclenché au clic

# État loading
Étant donné que j'ai cliqué sur un bouton primaire déclenchant un appel API
Quand la requête est en cours
Alors un spinner SVG 16px remplace le texte du bouton
Et le bouton porte aria-busy="true" et aria-disabled="true" pendant la requête
Quand la requête se termine (succès ou erreur)
Alors le bouton revient à son état initial avec son texte d'origine

# Un seul primaire par section
Étant donné que n'importe quel écran de l'application est affiché
Quand je compte les boutons primaires visibles dans une même zone de formulaire ou d'action
Alors il y en a exactement 1 (hiérarchie visuelle respectée)
```

---

### [US-0.04] Toasts & Notifications `<wsb-toast>`

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B.png`

En tant que collaborateur Flex Office authentifié,
Je veux recevoir des retours visuels non bloquants (success, error, warning, info) après chaque action critique,
Afin de savoir en temps réel si ma réservation, modification ou annulation a abouti sans avoir à naviguer vers une autre page.

**Critères d'acceptation**

```gherkin
# Toast succès post-réservation
Étant donné que j'ai confirmé une réservation
Quand je suis redirigé vers Mes Réservations
Alors un toast succès "Votre réservation a été confirmée." s'affiche en haut à droite
Et il disparaît automatiquement après 4 secondes avec une animation fade-out 300ms
Et aria-live="assertive" annonce immédiatement le message aux lecteurs d'écran

# Toast erreur persistant
Étant donné qu'une action déclenche une erreur 500
Quand le toast erreur s'affiche
Alors il reste visible jusqu'au clic sur "Fermer" (pas de disparition automatique)
Et le bouton "Fermer" est accessible au clavier (Tab + Enter)

# Toast warning — conflit disponibilité
Étant donné que la ressource choisie a été prise entre la sélection et la confirmation
Quand le check de disponibilité final échoue
Alors un toast warning "La ressource sélectionnée n'est plus disponible." s'affiche 6 secondes
Et l'utilisateur reste sur la page courante sans redirection

# Empilement toasts
Étant donné que 2 notifications sont déclenchées rapidement
Quand les 2 toasts s'affichent
Alors ils s'empilent verticalement dans le wsb-toast-container (max 3 simultanés)
Et le plus ancien est retiré si la limite de 3 est dépassée
```

---

### [US-0.05] Skeleton Loaders, Spinners & Empty States

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B.png`

En tant que collaborateur Flex Office authentifié,
Je veux voir des indicateurs visuels clairs lorsque des données sont en cours de chargement ou absentes,
Afin de comprendre l'état de l'interface à tout moment et ne jamais rester face à un écran vide ou figé.

**Critères d'acceptation**

```gherkin
# Skeleton pendant chargement
Étant donné que j'ai soumis le formulaire de recherche
Quand la page Grille des résultats se charge
Alors 6 composants now-skeleton sont affichés avec la même disposition que les vraies cards (pas de layout shift)
Et aria-live="polite" annonce "Chargement des espaces disponibles…" aux lecteurs d'écran
Et aria-busy="true" est positionné sur le container de grille
Quand l'API répond en moins de 10 secondes
Alors les skeletons sont remplacés par les vraies cards ou l'empty state

# Timeout skeleton → erreur serveur
Étant donné que le Script Include WsbAvailabilityChecker ne répond pas
Quand 10 secondes s'écoulent
Alors les 6 skeletons sont remplacés par wsb-empty-state mode erreur serveur
Et le message "Impossible de charger les espaces. Veuillez réessayer." est affiché avec le CTA "Réessayer"

# Empty state — 0 résultat avec retour formulaire pré-rempli
Étant donné que l'API retourne un tableau vide []
Quand la grille est rendue
Alors l'empty state "Aucun espace disponible pour ces critères." est affiché
Quand je clique sur "Modifier ma recherche"
Alors je suis redirigé vers /x_acf_wsb_search.do?building=A&floor=3&date=2026-04-30&type=openspace-classique
Et les 4 champs du formulaire sont pré-remplis avec les valeurs des query strings

# Empty state — Mes Réservations
Étant donné que sc_req_item retourne 0 réservation pour l'utilisateur courant
Quand la page Mes Réservations se charge
Alors l'empty state "Vous n'avez aucune réservation active." est affiché
Et le CTA "Réserver un espace" redirige vers /x_acf_wsb_search.do (formulaire vide)
```

---

### [US-0.06] Card ressource `<wsb-booking-card>`

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B.png`

En tant que collaborateur Flex Office authentifié,
Je veux visualiser chaque espace sous forme d'une card affichant instantanément le trio numéro / étage / type avec son statut de disponibilité,
Afin de sélectionner l'espace adapté sans avoir à cliquer pour voir les détails, et identifier d'un coup d'œil les places électriques.

**Critères d'acceptation**

```gherkin
# Card disponible
Étant donné que l'API retourne une place avec status = available
Quand la card est rendue
Alors le badge "Disponible" (fond #00AA00) est visible
Et le trio Numéro / Niveau / Type est visible sans scroll ni tooltip
Et le bouton "Réserver cet espace" est actif
Et aria-label sur le bouton est "Réserver espace Bureau 207-B, Niveau 3, Openspace classique"

# Card occupée — non cliquable
Étant donné que l'API retourne une place avec status = occupied
Quand la card est rendue
Alors la card a une opacité de 45%
Et le badge "Occupé" (fond #CC0000) est visible
Et le label "Indisponible" remplace le bouton (aucun <button> actif)
Et la card n'est pas tabulable au clavier

# Mention place électrique
Étant donné que l'API retourne une place de type parking-electrique
Quand la card est rendue
Alors "Place électrique ⚡" est visible en couleur #FFA500
Et le type affiché est "Parking électrique"

# Clic Réserver
Étant donné que je clique sur "Réserver cet espace"
Quand l'événement click est traité
Alors je suis redirigé vers /x_acf_wsb_confirm.do?space_id={sys_id}&{currentSearchParams}
```

---

### [US-0.07] Data Table générique & `<wsb-booking-table-row>`

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B.png`

En tant que collaborateur Flex Office authentifié,
Je veux consulter mes réservations et mon historique dans un tableau structuré avec badges de statut, actions directes par ligne et pagination,
Afin de gérer l'ensemble de mes réservations sans navigation intermédiaire et retrouver rapidement une réservation passée.

**Critères d'acceptation**

```gherkin
# Affichage Mes Réservations
Étant donné que j'ai des réservations actives
Quand je charge la page Mes Réservations
Alors le tableau affiche les 6 colonnes : Espace, Type, Date, Créneau, Statut, Actions
Et les lignes "En cours" ont les boutons "Éditer" et "Annuler"
Et les lignes "Terminée" ou "Annulée" n'ont aucun bouton d'action

# Aria-labels uniques par bouton
Étant donné que le tableau affiche plusieurs réservations
Quand je navigue au clavier entre les boutons
Alors le bouton "Éditer" de la ligne Bureau 207-B porte aria-label="Éditer réservation Bureau 207-B du 30/04/2026"
Et le bouton "Annuler" porte aria-label="Annuler réservation Bureau 207-B du 30/04/2026"

# Mode lecture seule — Historique
Étant donné que je suis sur la page Historique
Quand le tableau est affiché avec la prop readonly=true
Alors la colonne "Actions" est vide (aucun bouton sur aucune ligne)
Et les badges de statut Terminée / Annulée sont visibles

# Tri par colonne Date
Étant donné que je clique sur l'en-tête "Date"
Quand le tri est déclenché
Alors le tableau est réordonné par date croissante
Et aria-sort="ascending" est mis à jour sur le <th>

# Pagination
Étant donné que j'ai plus de 10 réservations
Quand la page Mes Réservations se charge
Alors le composant now-pagination est affiché sous le tableau
Et seulement 10 lignes sont visibles par page
```

---

### [US-0.08] Modal de confirmation `<wsb-confirm-modal>`

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B.png`

En tant que collaborateur Flex Office authentifié,
Je veux être invité à confirmer explicitement les annulations via une modal accessible avec gestion du focus,
Afin de ne jamais annuler une réservation par accident et toujours pouvoir revenir en arrière.

**Critères d'acceptation**

```gherkin
# Ouverture et focus management
Étant donné que je suis sur la page Mes Réservations
Quand je clique sur le bouton "Annuler" d'une ligne
Alors la modal s'ouvre avec l'overlay sombre
Et le focus est déplacé sur le bouton "Retour" (action la moins destructive)
Et role="dialog", aria-modal="true", aria-labelledby="modal-title", aria-describedby="modal-desc" sont présents
Et le Tab boucle entre les 3 éléments interactifs : ✕, "Retour", "Confirmer l'annulation"

# Fermeture sans annulation
Étant donné que la modal est ouverte
Quand je clique sur "Retour", sur ✕, sur l'overlay, ou appuie sur Escape
Alors la modal se ferme sans modifier le statut de la réservation
Et le focus retourne sur le bouton "Annuler" de la ligne déclenchante

# Confirmation de l'annulation
Étant donné que la modal est ouverte pour la réservation "Bureau 207-B du 30/04/2026"
Quand je clique sur "Confirmer l'annulation"
Alors un appel PATCH est effectué sur /api/now/table/sc_req_item/{sys_id} avec { "state": "7" }
Et la modal se ferme
Et le badge de la ligne passe à "Annulée"
Et un toast succès "Votre réservation a été annulée." s'affiche
```

---

### [US-0.09] Couche API, Services HTTP & Navigation inter-pages

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B.png`

En tant que collaborateur Flex Office authentifié,
Je veux que tous les appels ServiceNow soient centralisés avec gestion automatique de l'authentification, des erreurs (401/403/500) et du timeout, et que les critères de recherche soient transmis correctement via query strings entre les 5 pages,
Afin de ne jamais subir d'erreur silencieuse, être redirigé vers le login si ma session expire, et retrouver mes critères pré-remplis à chaque retour au formulaire.

**Critères d'acceptation**

```gherkin
# Token d'authentification systématique
Étant donné que l'utilisateur est authentifié sur ServiceNow
Quand n'importe quel composant effectue un appel fetch vers /api/now/
Alors l'en-tête X-UserToken: window.g_ck est systématiquement présent
Et l'en-tête Accept: application/json est présent

# Gestion 401 — session expirée
Étant donné que ma session ServiceNow a expiré
Quand un appel API retourne 401
Alors un toast info "Votre session a expiré. Reconnexion en cours…" s'affiche
Et window.location.href est redirigé vers /login.do?redirectTo=[URL courante encodée]

# Gestion 403 — accès refusé
Étant donné que mon rôle ne donne pas accès à la ressource
Quand un appel API retourne 403
Alors aucune redirection n'est effectuée
Et le toast erreur "Vous n'êtes pas autorisé à effectuer cette action." est affiché

# Gestion 500 — erreur serveur
Étant donné qu'un appel API retourne 500 ou 503
Quand l'erreur est reçue
Alors le toast erreur "Une erreur est survenue. Veuillez réessayer." est affiché
Et le composant en attente de données affiche le wsb-empty-state mode erreur serveur

# Timeout — 10 secondes
Étant donné qu'une requête API ne répond pas
Quand 10 secondes s'écoulent
Alors l'AbortController annule la requête
Et une erreur structurée { status: 'timeout' } est retournée au composant appelant

# Transmission query strings inter-pages
Étant donné que j'ai rempli le formulaire : Bâtiment A, Étage 3, 2026-04-30, Openspace classique
Quand je soumets le formulaire
Alors je suis redirigé vers /x_acf_wsb_results.do?building=A&floor=3&date=2026-04-30&type=openspace-classique
Quand je clique sur "Modifier ma recherche" depuis la grille
Alors je suis redirigé vers /x_acf_wsb_search.do?building=A&floor=3&date=2026-04-30&type=openspace-classique
Et les 4 champs du formulaire sont pré-remplis

# Guard — query strings manquants
Étant donné qu'un utilisateur accède à /x_acf_wsb_results.do sans query string
Quand la page Grille tente de se charger
Alors aucune requête API n'est lancée
Et l'utilisateur est redirigé vers /x_acf_wsb_search.do (formulaire vide)

# Route 404
Étant donné qu'un utilisateur accède à une URL non reconnue dans le scope x_acf_wsb
Quand la page se charge
Alors le message "Page introuvable." est affiché avec le CTA "Retour à l'accueil"
Et le CTA redirige vers /x_acf_wsb_search.do
```

---

### [US-0.10] Accessibilité globale, Skip Links & Focus Management (WCAG 2.1 AA)

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B.png`

En tant que collaborateur Flex Office authentifié utilisant des technologies d'assistance (lecteur d'écran NVDA, navigation clavier exclusive),
Je veux pouvoir utiliser l'intégralité de l'application Tinkitest au clavier et avec un lecteur d'écran,
Afin de bénéficier des mêmes fonctionnalités que les utilisateurs ne dépendant pas de technologies d'assistance, en conformité WCAG 2.1 AA.

**Critères d'acceptation**

```gherkin
# Skip link fonctionnel
Étant donné que j'accède à l'application uniquement au clavier
Quand j'appuie sur Tab dès le chargement d'une page
Alors le skip link "Aller au contenu principal" devient visible (haut gauche)
Et si j'appuie sur Enter, le focus saute directement à <main id="main-content">

# Navigation clavier complète — formulaire
Étant donné que je navigue sur le formulaire de recherche au clavier
Quand je presse Tab successivement
Alors j'accède dans l'ordre : skip link, liens header, Bâtiment, Étage, Date, Type, toggle parking, radios parking (si visible), bouton "Lancer la recherche"
Et chaque focus est visuellement visible (outline 2px solid #A100FF)

# Erreur de validation accessible
Étant donné que je soumets un formulaire avec un champ vide
Quand la validation est déclenchée
Alors le champ en erreur reçoit aria-invalid="true"
Et un message d'erreur est affiché avec id="err-{field}"
Et aria-errormessage="{id}" est ajouté sur l'input
Et le focus est déplacé sur le premier champ en erreur

# Annonces dynamiques lecteur d'écran
Étant donné que j'utilise NVDA
Quand les skeletons passent aux vraies cards
Alors aria-live="polite" annonce "6 espaces disponibles chargés."
Quand un toast apparaît
Alors aria-live="assertive" annonce immédiatement son message

# Radios parking accessibles
Étant donné que le toggle "Venez-vous en voiture ?" est coché
Quand le groupe radio s'affiche
Alors il est encapsulé dans <fieldset> avec <legend>"Type de parking souhaité"</legend>
Et chaque radio a un <label for> associé

# Navigation clavier tableau
Étant donné que je navigue dans le tableau Mes Réservations au clavier
Quand je Tab sur les boutons d'une ligne
Alors j'accède à "Éditer" puis "Annuler" sans piégeage du focus dans le tableau
Et chaque bouton a un aria-label unique et descriptif
```

---

## EP-01

### [US-1.01] Header persistant `<wsb-header>` : barre de navigation, liens et composant avatar

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B.png`

En tant que collaborateur authentifié (PER-00001, PER-00002, PER-00003),
Je veux disposer d'une barre de navigation persistante en haut de chaque page,
Afin de naviguer directement vers "Mes réservations", "Historique" et "Aide & Support", et d'accéder à mon profil utilisateur via le composant avatar.

**Critères d'acceptation**

```gherkin
Fonctionnalité: Header persistant <wsb-header>

  Scénario: Affichage du header avec les données utilisateur
    Étant donné qu'un collaborateur est authentifié sur ServiceNow
    Quand une page de l'application Tinkitest se charge
    Alors le header est affiché en pleine largeur avec le fond #000000
    Et les liens "Mes réservations", "Historique" et "Aide & Support" sont visibles
    Et le bouton avatar affiche les initiales issues de sys_user.initials

  Scénario: Navigation via les liens header
    Étant donné que le collaborateur est sur n'importe quelle page de l'application
    Quand il clique sur "Mes réservations"
    Alors il est redirigé vers x_wsb_flexoffice_reservations.do dans le même onglet
    Quand il clique sur "Historique"
    Alors il est redirigé vers x_wsb_flexoffice_history.do dans le même onglet
    Quand il clique sur "Aide & Support"
    Alors l'article KB ServiceNow OOTB s'ouvre dans le même onglet

  Scénario: Ouverture du dropdown avatar
    Étant donné que le collaborateur voit le bouton avatar dans le header
    Quand il clique sur le bouton avatar
    Alors le dropdown s'affiche avec : nom complet, rôle, "Préférences utilisateur",
      "Impersonate user" et "Se déconnecter"
    Et aria-expanded du bouton passe à "true"

  Scénario: Fermeture du dropdown avatar via Escape
    Étant donné que le dropdown avatar est ouvert
    Quand le collaborateur appuie sur Escape
    Alors le dropdown se ferme
    Et le focus retourne sur le bouton avatar
    Et aria-expanded repasse à "false"

  Scénario: Clic sur "Se déconnecter"
    Étant donné que le dropdown avatar est ouvert
    Quand le collaborateur clique sur "Se déconnecter"
    Alors il est redirigé vers /logout.do (page OOTB ServiceNow)
```

---

### [US-1.02] Formulaire de recherche : structure de la page et 4 champs principaux

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B.png`

En tant que collaborateur authentifié (PER-00001, PER-00002, PER-00003),
Je veux accéder à un formulaire centré présentant les 4 critères de recherche obligatoires (Bâtiment, Étage, Date, Type d'espace),
Afin de définir mes critères pour trouver un espace de travail disponible pour une journée donnée.

**Critères d'acceptation**

```gherkin
Fonctionnalité: Formulaire de recherche — 4 champs principaux

  Scénario: Chargement initial de la page
    Étant donné qu'un collaborateur authentifié accède à x_wsb_flexoffice_search.do
    Quand la page se charge
    Alors le titre "Rechercher un espace de travail" est affiché
    Et la card formulaire est centrée sur fond #F5F5F5
    Et les champs Bâtiment, Étage et Type d'espace affichent leur placeholder respectif
    Et le champ Date est pré-rempli avec la date J+1

  Scénario: Sélection du Bâtiment
    Étant donné que le collaborateur visualise le formulaire chargé
    Quand il clique sur le dropdown "Bâtiment"
    Alors les options "Bâtiment A" et "Bâtiment B" sont affichées
    Quand il sélectionne "Bâtiment A"
    Alors le champ Bâtiment affiche "Bâtiment A"

  Scénario: Sélection de l'Étage
    Étant donné que le collaborateur visualise le formulaire chargé
    Quand il clique sur le dropdown "Étage"
    Alors les options "Niv. 2", "Niv. 3", "Niv. 4", "Niv. 5" sont affichées dans cet ordre
    Quand il sélectionne "Niv. 3"
    Alors le champ Étage affiche "Niv. 3"

  Scénario: Date picker — comportement par défaut et restrictions
    Étant donné que le champ Date est affiché au chargement de la page
    Alors la date affichée est J+1 calculée côté client
    Et les dates passées et la date du jour courant sont désactivées (non sélectionnables)
    Et les samedis et dimanches sont désactivés
    Quand J+1 tombe un samedi
    Alors la date pré-remplie est le lundi suivant (J+3)
    Quand J+1 tombe un dimanche
    Alors la date pré-remplie est le lundi suivant (J+2)

  Scénario: Sélection du Type d'espace
    Étant donné que le collaborateur visualise le formulaire chargé
    Quand il clique sur le dropdown "Type d'espace"
    Alors les options suivantes sont affichées dans l'ordre :
      | "Openspace classique"                  |
      | "Openspace spécialisé (RH, Compta…)"   |
      | "Phone Box"                            |
      | "Meeting Room"                         |
    Quand il sélectionne "Phone Box"
    Alors le champ Type d'espace affiche "Phone Box"
```

---

### [US-1.03] Activation conditionnelle du bouton "Lancer la recherche" et validation en temps réel

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B.png`

En tant que collaborateur authentifié (PER-00001, PER-00002, PER-00003),
Je veux que le bouton "Lancer la recherche" s'active automatiquement dès que les 4 champs obligatoires sont remplis, avec un feedback visuel immédiat à chaque modification de champ,
Afin de savoir instantanément si mon formulaire est complet et prêt à être soumis, sans avoir à attendre un message d'erreur après clic.

**Critères d'acceptation**

```gherkin
Fonctionnalité: Activation conditionnelle du CTA "Lancer la recherche"

  Scénario: État initial — bouton grisé car champ Date seul est pré-rempli
    Étant donné que le collaborateur arrive sur la page Formulaire de recherche
    Quand la page est chargée (Date = J+1, Bâtiment/Étage/Type vides)
    Alors le bouton "Lancer la recherche" a le fond #CCCCCC et la couleur #999999
    Et il porte aria-disabled="true"
    Et le tooltip "Complétez tous les champs" est associé via aria-describedby

  Scénario: Remplissage progressif — le bouton reste grisé
    Étant donné que 1, 2 ou 3 champs sur 4 sont remplis
    Quand le collaborateur modifie n'importe quel champ
    Alors le bouton "Lancer la recherche" reste à l'état grisé (#CCCCCC)
    Et chaque champ rempli affiche une bordure violette #A100FF

  Scénario: 4 champs remplis — activation immédiate du bouton
    Étant donné que les champs Bâtiment, Étage, Date et Type d'espace sont tous remplis
    Quand le collaborateur complète le 4e champ
    Alors le bouton "Lancer la recherche" passe instantanément à fond #A100FF et texte #FFFFFF
    Et aria-disabled passe à "false"
    Et le tooltip n'est plus exposé via aria-describedby

  Scénario: Remise à zéro d'un champ — le bouton repasse grisé
    Étant donné que les 4 champs sont remplis et le bouton est actif
    Quand le collaborateur remet un champ à son placeholder vide
    Alors le bouton repasse immédiatement à l'état grisé (#CCCCCC)
    Et aria-disabled repasse à "true"

  Scénario: Tooltip au survol et au focus clavier du bouton grisé
    Étant donné que le bouton est à l'état grisé
    Quand le collaborateur survole le bouton avec la souris OU l'atteint via Tab
    Alors le tooltip "Complétez tous les champs" est visible
    Et il reste accessible aux technologies d'assistance via aria-describedby="cta-tooltip"
```

---

### [US-1.04] Section conditionnelle parking : toggle "Venez-vous en voiture ?" et radio Thermique/Électrique

**Priorité** : medium · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B.png`

En tant que collaborateur authentifié (PER-00001, PER-00002, PER-00003),
Je veux pouvoir indiquer que je viens en voiture et choisir le type de place de parking souhaité (thermique ou électrique),

**Critères d'acceptation**

```gherkin
Fonctionnalité: Section conditionnelle parking

  Scénario: État initial — section radio masquée
    Étant donné que le collaborateur arrive sur le formulaire
    Quand la page est chargée
    Alors le toggle "Venez-vous en voiture ?" est en position Off
    Et la section radio "Type de parking souhaité" est masquée (max-height: 0, opacity: 0)

  Scénario: Activation du toggle — affichage de la section radio
    Étant donné que le toggle est en position Off
    Quand le collaborateur l'active (clic ou touche Espace)
    Alors le toggle passe en position On (fond #A100FF)
    Et aria-checked du toggle passe à "true"
    Et la section radio s'affiche avec une transition fluide (0.2s)
    Et aucune option radio n'est pré-sélectionnée

  Scénario: Sélection du type "Électrique ⚡"
    Étant donné que la section radio est visible
    Quand le collaborateur sélectionne "Électrique ⚡"
    Alors le bouton "Lancer la recherche" reste actif si les 4 champs principaux sont remplis
    Et la mention "8 places électriques disponibles dans le parc" apparaît sous les radios

  Scénario: Sélection du type "Thermique"
    Étant donné que la section radio est visible
    Quand le collaborateur sélectionne "Thermique"
    Alors la mention "8 places électriques disponibles dans le parc" est masquée

  Scénario: Désactivation du toggle — masquage et réinitialisation
    Étant donné que le toggle est On et un type de parking est sélectionné
    Quand le collaborateur désactive le toggle
    Alors la section radio est masquée avec animation
    Et la sélection radio est réinitialisée (aucune option cochée)
    Et la valeur `car` sera absente des query strings à la soumission

  Scénario: Transmission des paramètres parking dans les query strings
    Étant donné que le toggle est On et "Électrique ⚡" est sélectionné
    Quand les critères sont soumis (voir US-1.05)
    Alors les query strings incluent car=true&parking=electric
    Quand le toggle est Off
    Alors les paramètres car et parking sont absents des query strings
```

---

### [US-1.05] Soumission du formulaire, construction des query strings et navigation vers la Grille des résultats

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B.png`

En tant que collaborateur authentifié (PER-00001, PER-00002, PER-00003),
Je veux qu'un clic sur le bouton "Lancer la recherche" me redirige vers la Grille des résultats en transmettant tous mes critères dans l'URL, et que le formulaire soit pré-rempli si je reviens depuis un état "Aucun résultat",

**Critères d'acceptation**

```gherkin
Fonctionnalité: Soumission et navigation vers la Grille des résultats

  Scénario: Soumission nominale sans parking
    Étant donné que les champs sont : Bâtiment "A", Étage "Niv. 3",
      Date "2026-05-10", Type "Openspace classique", toggle voiture Off
    Quand le collaborateur clique sur "Lancer la recherche"
    Alors la navigation se produit vers :
      x_wsb_flexoffice_results.do?building=A&floor=3&date=2026-05-10&type=openspace
    Et le spinner est affiché dans le bouton pendant la navigation
    Et le bouton est désactivé temporairement pour prévenir le double-clic

  Scénario: Soumission avec parking électrique
    Étant donné que les 4 champs sont remplis, toggle On, "Électrique ⚡" sélectionné
    Quand le collaborateur clique sur "Lancer la recherche"
    Alors la navigation se produit vers :
      x_wsb_flexoffice_results.do?building=A&floor=3&date=2026-05-10&type=openspace&car=true&parking=electric

  Scénario: Soumission avec parking thermique
    Étant donné que les 4 champs sont remplis, toggle On, "Thermique" sélectionné
    Quand le collaborateur clique sur "Lancer la recherche"
    Alors l'URL contient car=true&parking=thermique

  Scénario: Retour depuis "Aucun résultat" — formulaire pré-rempli
    Étant donné que la page Grille affiche l'état "Aucun résultat"
    Et que l'URL contient ?building=B&floor=4&date=2026-05-12&type=phonebox
    Quand le collaborateur clique sur le CTA "Modifier ma recherche" (Epic 2)
    Alors il est redirigé vers x_wsb_flexoffice_search.do?building=B&floor=4&date=2026-05-12&type=phonebox
    Et le formulaire se charge avec : Bâtiment "B", Étage "Niv. 4",
      Date "2026-05-12", Type "Phone Box" pré-remplis
    Et le bouton "Lancer la recherche" est immédiatement actif (4 champs remplis)
    Et le focus est positionné sur le champ Bâtiment

  Scénario: Mapping des valeurs vers les query strings
    Alors le mapping appliqué est :
      | Label UI                          | Valeur query string     |
      | "Bâtiment A"                      | building=A              |
      | "Bâtiment B"                      | building=B              |
      | "Niv. 2"                          | floor=2                 |
      | "Niv. 3"                          | floor=3                 |
      | "Niv. 4"                          | floor=4                 |
      | "Niv. 5"                          | floor=5                 |
      | "Openspace classique"             | type=openspace          |
      | "Openspace spécialisé (RH, …)"    | type=openspace-spe      |
      | "Phone Box"                       | type=phonebox           |
      | "Meeting Room"                    | type=meetingroom        |
      | Toggle On + Électrique            | car=true&parking=electric|
      | Toggle On + Thermique             | car=true&parking=thermique|
      | Toggle Off                        | (paramètres absents)    |
```

---

## EP-02

### [US-2.01] Chargement de la grille et appel API de disponibilité

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B_annotated.png`

En tant que collaborateur authentifié ayant soumis le formulaire de recherche,
Je veux voir immédiatement six cartes squelettes animées le temps que le serveur calcule les disponibilités, puis voir la liste réelle des espaces retournés,
Afin de comprendre que la page est active et obtenir les résultats sans attente perçue.

**Critères d'acceptation**

```gherkin
Étant donné que le collaborateur arrive sur /x_wsb_flexoffice_results.do
  avec les query strings building=A&floor=3&date=2026-04-30&type=bureau
Quand le composant React monte (useEffect initial)
Alors 6 `now-skeleton` identiques s'affichent dans la grille CSS immédiatement (< 100 ms)
  Et un appel GET /api/x_wsb/v1/spaces/available?building=A&floor=3&date=2026-04-30&type=bureau
     est émis avec le header X-UserToken: window.g_ck

Étant donné que l'API répond avec succès (HTTP 200, liste d'espaces)
Quand la réponse est reçue
Alors les 6 now-skeleton disparaissent
  Et la grille affiche les vraies cards (disponibles + occupées) en CSS Grid 2–3 colonnes

Étant donné que l'API répond en moins de 10 secondes
Quand le délai dépasse 10 secondes sans réponse
Alors les skeletons sont remplacés par l'état erreur serveur (voir US-2.05)
  Et un log console.error('[WSB] Timeout API disponibilité') est émis
```

---

### [US-2.02] Bandeau récapitulatif des critères actifs et CTA "Modifier la recherche"

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B_annotated.png`

En tant que collaborateur authentifié consultant la grille des résultats,
Je veux voir en haut de page un bandeau affichant les quatre critères de ma recherche active et un lien "Modifier la recherche" renvoyant vers le formulaire pré-rempli,
Afin de comprendre immédiatement le contexte des résultats affichés et pouvoir affiner mes critères sans ressaisie.

**Critères d'acceptation**

```gherkin
Étant donné que la page se charge avec les query strings
  building=A&floor=3&date=2026-04-30&type=bureau
Quand le composant CriteriaBar monte
Alors le bandeau affiche "Bâtiment A · Niveau 3 · 30 avril 2026 · Openspace classique"
  Et le lien "Modifier la recherche" est visible à droite du bandeau

Étant donné que la date en query string est au format ISO "2026-04-30"
Quand le bandeau l'affiche
Alors elle est formatée en français "30 avril 2026" (Intl.DateTimeFormat 'fr-FR', { day:'numeric', month:'long', year:'numeric' })

Étant donné que le collaborateur clique sur "Modifier la recherche"
Quand le clic est déclenché
Alors la navigation se fait vers /x_wsb_flexoffice_search.do?building=A&floor=3&date=2026-04-30&type=bureau
  Et le formulaire de recherche est pré-rempli avec ces valeurs

Étant donné que le collaborateur navigue au clavier (Tab)
Quand il atteint le lien "Modifier la recherche"
Alors le focus est visible (outline violet 2px)
  Et Entrée déclenche la même navigation que le clic
```

---

### [US-2.03] Grille nominale — cards disponibles et cards occupées

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B_annotated.png`

En tant que collaborateur authentifié,
Je veux voir la liste des espaces retournés par la recherche sous forme de cards organisées en grille, avec une distinction visuelle claire entre espaces disponibles (badge vert, bouton actif) et espaces occupés (badge rouge, grisé, non cliquable),

**Critères d'acceptation**

```gherkin
Étant donné que l'API a retourné une liste mixte (espaces disponibles + occupés)
Quand la grille se rend
Alors chaque espace disponible s'affiche avec :
  - badge "Disponible" fond #00AA00
  - trio : nom de l'espace + étage (ex: "Niveau 3") + type (ex: "Openspace")
  - bouton actif "Réserver cet espace" fond #A100FF
  - opacité 100%, curseur pointer
  Et chaque espace occupé s'affiche avec :
  - badge "Occupé" fond #CC0000
  - même trio : nom + étage + type
  - label statique "Indisponible" couleur #999999
  - opacité ~45%, curseur not-allowed

Étant donné qu'un espace de type "parking_electrique" est dans la liste
Quand sa card se rend
Alors le badge "Place électrique ⚡" est affiché en plus du badge de disponibilité

Étant donné que le collaborateur survole (hover) une card disponible
Quand le pointeur entre dans la zone de la card
Alors la bordure passe à #A100FF
  Et une ombre légère apparaît : box-shadow 0 4px 12px rgba(161,0,255,0.15)

Étant donné qu'une card occupée est affichée
Quand le collaborateur tente d'interagir avec (clic, hover)
Alors aucune action n'est déclenchée
  Et le curseur reste not-allowed

Étant donné que l'API retourne exactement N espaces
Quand la grille est rendue
Alors N cards sont présentes dans le DOM sous #wsb-results-grid
```

---

### [US-2.04] Action "Réserver cet espace" et navigation vers la page de confirmation

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B_annotated.png`

En tant que collaborateur authentifié identifiant un espace disponible dans la grille,
Je veux cliquer sur le bouton "Réserver cet espace" d'une card et être redirigé vers la page de confirmation avec l'identifiant de l'espace en paramètre d'URL,

**Critères d'acceptation**

```gherkin
Étant donné qu'une card disponible est affichée dans la grille
  avec l'espace id="207-B", name="Bureau 207-B", floor="3", type="bureau"
Quand le collaborateur clique sur le bouton "Réserver cet espace" de cette card
Alors le navigateur est redirigé vers :
  /x_wsb_flexoffice_confirm.do?space_id=207-B&building=A&floor=3&date=2026-04-30&type=bureau
  (les paramètres de recherche originaux sont repropagés)

Étant donné que le collaborateur navigue au clavier (Tab + Entrée)
Quand il atteint le bouton "Réserver cet espace" et presse Entrée
Alors la même navigation est déclenchée

Étant donné que le bouton est activé
Quand le clic est enregistré
Alors le bouton passe en état "loading" (spinner inline visible, texte masqué)
  Et il est désactivé (`disabled`, `aria-busy="true"`) pour éviter un double clic
  pendant la navigation
```

---

### [US-2.05] États spéciaux : vide (aucun résultat) et erreur serveur

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B_annotated.png`

En tant que collaborateur authentifié dont la recherche ne retourne aucun espace ou rencontre une erreur serveur,
Je veux voir un message explicite avec un appel à l'action clair me renvoyant vers le formulaire pré-rempli,
Afin de ne pas me retrouver bloqué sur une page sans issue et pouvoir affiner mes critères facilement.

**Critères d'acceptation**

```gherkin
# --- État vide ---
Étant donné que l'API répond HTTP 200 avec un tableau vide ([])
Quand le composant ResultsGrid traite la réponse
Alors les skeletons disparaissent
  Et le composant <wsb-empty-state> est affiché avec :
  - l'illustration picto calendrier barré
  - le message exact "Aucun espace disponible pour ces critères. Essayez un autre créneau ou un autre étage."
  - le bouton "Modifier ma recherche"

Étant donné que l'état vide est affiché
Quand le collaborateur clique sur "Modifier ma recherche"
Alors il est redirigé vers /x_wsb_flexoffice_search.do?building=A&floor=3&date=2026-04-30&type=bureau
  Et le formulaire est pré-rempli avec ces valeurs (identique au comportement de "Modifier la recherche" du bandeau)

# --- État tout occupé (aucun DISPONIBLE mais des espaces existent) ---
Étant donné que l'API retourne une liste d'espaces mais tous avec status="occupied"
Quand la grille se rend
Alors toutes les cards occupées sont affichées (badge rouge, grisé)
  Et aucun état vide n'est déclenché (l'état vide ne s'active que si le tableau est vide)

# --- État erreur serveur ---
Étant donné que l'appel API retourne HTTP 500 ou un timeout (> 10 s)
Quand le composant reçoit l'erreur
Alors les skeletons disparaissent
  Et le message "Une erreur est survenue lors du chargement des résultats. Veuillez réessayer." s'affiche en rouge #CC0000
  Et le lien "Retour à la recherche" est présent et renvoie vers /x_wsb_flexoffice_search.do avec les paramètres actuels
```

---

### [US-2.06] Endpoint serveur de disponibilité et filtrage par persona/rôle (Script Include)

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B_annotated.png`

En tant que système ServiceNow recevant une requête de recherche d'espaces disponibles,
Je veux calculer côté serveur la liste des espaces de `x_wsb_space` correspondant aux critères (bâtiment, étage, type, date) en soustrayant les réservations actives (`sc_req_item`) et en filtrant selon le rôle de l'utilisateur connecté,
Afin de renvoyer au client React uniquement les espaces autorisés et réellement disponibles, sans exposer la logique de filtrage à l'interface.

**Critères d'acceptation**

```gherkin
# --- Appel nominal ---
Étant donné une requête GET /api/x_wsb/v1/spaces/available?building=A&floor=3&date=2026-04-30&type=bureau
  avec un token utilisateur valide (X-UserToken présent)
Quand le Scripted REST API reçoit la requête
Alors il exécute le Script Include WSBAvailabilityCalculator
  Et le Script Include interroge x_wsb_space avec addQuery('floor', '3') + addQuery('type', 'bureau') + addQuery('building', 'A')
  Et il exclut les espaces ayant un sc_req_item actif :
    - même space_id (via variable sc_req_item.variables.space_id)
    - même date (sc_req_item.variables.date = '2026-04-30')
    - state NOT IN ('cancelled', 'closed_incomplete')
  Et la réponse HTTP 200 retourne :
  {
    "spaces": [
      { "id": "207-B", "name": "Bureau 207-B", "floor": "3", "type": "bureau", "available": true },
      { "id": "207-C", "name": "Bureau 207-C", "floor": "3", "type": "bureau", "available": false }
    ]
  }

# --- Filtrage par rôle ---
Étant donné que l'utilisateur connecté a le rôle "x_wsb.standard_user"
Quand le Script Include construit la requête GlideRecord
Alors il ajoute addQuery('allowed_roles', 'CONTAINS', 'x_wsb.standard_user')
  (ou logique équivalente basée sur la table de droits des personas)

Étant donné que l'utilisateur n'a pas de rôle applicatif valide
Quand le Scripted REST API vérifie les droits
Alors il retourne HTTP 403 { "error": "Accès non autorisé" }
  Et aucune donnée x_wsb_space n'est exposée

# --- Validation des paramètres ---
Étant donné qu'un appel arrive sans le paramètre "date"
Quand le Scripted REST API valide les params
Alors il retourne HTTP 400 { "error": "Paramètres manquants", "missing": ["date"] }
  Sans exécuter le GlideRecord
```

---

## EP-04

### [US-4.01] Structure de page, chargement et tableau des réservations passées

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_historique___B.png`

En tant que Collaborateur Flex Office (PER-00001 / PER-00002 / PER-00003),
Je veux accéder à une page dédiée affichant l'intégralité de mes réservations passées et annulées sous forme de tableau paginé, avec un skeleton pendant le chargement,
Afin de consulter mon historique d'utilisation des espaces sans action ni modification possible.

**Critères d'acceptation**

```gherkin
Étant donné que le collaborateur est authentifié et navigue vers /x_wsb_flexoffice_history.do
Quand la page se charge initialement
Alors le titre "Historique de mes réservations" est affiché en h1
  Et 6 skeleton-rows (now-skeleton) sont affichés pendant la requête API
  Et l'appel suivant est déclenché avec le header X-UserToken: window.g_ck :
    GET /api/now/table/sc_req_item
      ?sysparm_query=opened_by=javascript:gs.getUserID()^stateIN3,4,6
      &sysparm_fields=sys_id,number,short_description,state,opened_at,closed_at,cat_item
      &sysparm_orderby=opened_at&sysparm_order=DESC
      &sysparm_limit=20&sysparm_offset=0
  Et les skeletons sont remplacés par le tableau une fois l'API répondue
  Et le tableau affiche les colonnes : "Espace", "Type", "Date", "Créneau", "Statut", "Annulée le"
  Et chaque ligne expose le trio numéro de place / étage / type au premier regard
  Et le badge "Terminée" (gris) est affiché pour state=3 et state=4
  Et le badge "Annulée" (rouge) est affiché pour state=6
  Et la colonne "Annulée le" affiche closed_at uniquement sur les lignes state=6
  Et le compteur "1–20 sur Z réservations" est affiché sous le tableau
  Et la pagination est masquée si Z ≤ 20, visible si Z > 20

Étant donné que le tableau Historique est chargé avec 35 réservations
Quand le collaborateur clique sur "Suivant" dans la pagination
Alors l'API est rappelée avec sysparm_offset=20
  Et les lignes 21 à 35 sont affichées dans le tableau
  Et le compteur indique "21–35 sur 35 réservations"
  Et le bouton "Suivant" est désactivé (dernière page)
  Et le bouton "Précédent" est actif

Étant donné que le tableau affiche la page 2 d'un historique de 35 réservations
Quand le collaborateur clique sur "Précédent"
Alors l'API est rappelée avec sysparm_offset=0
  Et les lignes 1 à 20 sont affichées
  Et le compteur indique "1–20 sur 35 réservations"
  Et le bouton "Précédent" est désactivé (première page)
```

---

### [US-4.02] Filtres de recherche dans l'Historique (Période, Type, Statut)

**Priorité** : medium · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_historique___B.png`

En tant que Collaborateur Flex Office,
Je veux filtrer mon historique de réservations par période (date de début / fin), par type d'espace et par statut,
Afin de retrouver rapidement une réservation passée sans parcourir l'ensemble des pages.

**Critères d'acceptation**

```gherkin
Étant donné que le collaborateur est sur la page Historique avec le tableau chargé
Quand il saisit "01/03/2026" dans "Du" et "31/03/2026" dans "Au" puis clique "Appliquer"
Alors le bouton "Appliquer" passe en état loading (spinner inline) pendant le fetch
  Et l'API est rappelée avec sysparm_query incluant ^opened_at>=2026-03-01^opened_at<=2026-03-31
  Et le tableau est mis à jour avec uniquement les réservations de mars 2026
  Et la pagination est remise à la page 1
  Et le compteur est mis à jour
  Et le badge "1 filtre(s) actif(s)" apparaît
  Et le bouton "Réinitialiser" devient visible

Étant donné que le collaborateur sélectionne "Type d'espace : Open Space" puis clique "Appliquer"
Quand l'API répond
Alors seules les réservations de type "Open Space" sont affichées
  Et le badge indique "1 filtre(s) actif(s)"

Étant donné que le collaborateur sélectionne "Statut : Annulée" puis clique "Appliquer"
Quand l'API répond
Alors toutes les lignes affichent le badge "Annulée" (rouge)
  Et aucune ligne avec badge "Terminée" n'est visible

Étant donné que 3 filtres sont actifs (Période + Type + Statut)
Quand l'API répond
Alors le badge indique "3 filtre(s) actif(s)"
  Et l'API a été appelée avec les 3 critères combinés en logique AND dans sysparm_query

Étant donné qu'au moins un filtre est actif
Quand le collaborateur clique "Réinitialiser"
Alors tous les champs reviennent à leur valeur par défaut (vide / "Tous")
  Et l'API est rappelée sans paramètres de filtre
  Et le badge "filtre(s) actif(s)" disparaît
  Et le bouton "Réinitialiser" est masqué
  Et la pagination revient à la page 1
```

---

### [US-4.03] États vide et erreur spécifiques à la page Historique

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_historique___B.png`

En tant que Collaborateur Flex Office,
Je veux voir des messages clairs et orientés action lorsque mon historique est vide ou qu'une erreur survient,
Afin de comprendre la situation et savoir quoi faire ensuite sans rester bloqué sur un écran vide.

**Critères d'acceptation**

```gherkin
# Variante 1 : historique vide (aucune réservation passée, sans filtre actif)
Étant donné que le collaborateur n'a aucune réservation passée ou annulée dans sc_req_item
Quand la page Historique se charge et que l'API répond avec une liste vide
Alors les skeletons sont remplacés par le composant <wsb-empty-state>
  Et l'illustration "sans historique" est affichée
  Et le message "Vous n'avez pas encore d'historique de réservations." est affiché
  Et le bouton "Réserver un espace" est visible
  Et la barre de filtres est masquée (aucun intérêt sans données)
  Et aucun tableau ni compteur n'est affiché

Quand le collaborateur clique sur "Réserver un espace"
Alors il est redirigé vers /x_wsb_flexoffice_search.do (Formulaire de recherche) sans paramètres

# Variante 2 : aucun résultat après application de filtres
Étant donné que le collaborateur a appliqué ≥ 1 filtre et que l'API répond avec une liste vide
Quand l'affichage est mis à jour
Alors le tableau est remplacé par le composant <wsb-empty-state>
  Et l'illustration "filtre sans résultat" est affichée
  Et le message "Aucune réservation ne correspond à vos critères." est affiché
  Et le bouton "Réinitialiser les filtres" est visible
  Et la barre de filtres reste visible (avec les filtres actifs affichés)
  Et le compteur affiche "0 réservation"

Quand le collaborateur clique sur "Réinitialiser les filtres"
Alors le comportement est identique au clic sur "Réinitialiser" dans la barre de filtres (voir US-4.02)
  Et les données initiales (sans filtre) sont rechargées

# Variante 3 : erreur 500 ou timeout
Étant donné que l'API retourne une erreur 500 ou que le timeout de 10 000 ms est atteint
Quand la page est dans l'état chargement
Alors les skeletons sont remplacés par <wsb-empty-state> mode erreur
  Et le message correspondant est affiché (500 : "Une erreur est survenue." / timeout : "La connexion a expiré.")
  Et le bouton "Réessayer" est visible et relance le dernier appel API (avec les filtres actifs conservés)

# Variante 4 : erreur 403
Étant donné que l'API retourne une erreur 403
Quand l'état est mis à jour
Alors le message "Vous n'avez pas accès à cette page. Contactez votre administrateur." est affiché
  Et aucun bouton "Réessayer" n'est affiché (action inutile sur 403)
```

---

### [US-4.04] Action "Re-réserver" depuis l'Historique** *(conditionnel — à arbitrer avec le client)

**Priorité** : low · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_historique___B.png`

En tant que Collaborateur Flex Office,
Je veux pouvoir lancer une nouvelle réservation pré-remplie depuis une réservation passée dans mon historique,
Afin de reproduire rapidement un type de réservation déjà utilisé sans saisir manuellement tous les critères.

**Critères d'acceptation**

```gherkin
# Prérequis : décision client "Re-réserver est in-scope"
Étant donné que le collaborateur est sur la page Historique avec son tableau chargé
Quand il clique sur le bouton "Re-réserver" d'une ligne ayant les attributs :
    Bâtiment = "A", Étage = "3", Type = "Open Space"
Alors il est redirigé vers /x_wsb_flexoffice_search.do avec les query strings suivants :
    ?building=A&floor=3&type=open_space
  Et le Formulaire de recherche est affiché avec ces 3 champs pré-remplis
  Et le champ "Date" est vide (la date passée ne peut pas être pré-remplie)
  Et l'utilisateur doit saisir manuellement la nouvelle date souhaitée
  Et les 3 champs pré-remplis sont éditables (l'utilisateur peut les modifier avant de lancer la recherche)

Étant donné que le collaborateur est sur la page Historique avec son tableau chargé
Quand il clique sur "Re-réserver" d'une réservation de type "Parking électrique"
Alors il est redirigé vers /x_wsb_flexoffice_search.do?type=parking_electric
  Et le champ "Type d'espace" du formulaire est pré-sélectionné sur "Parking électrique"
  Et la checkbox "Venez-vous en voiture ?" est pré-cochée
  Et le champ "Date" est vide
```

---

## EP-05

### [US-5.01] Chargement et affichage pré-rempli de la page d'édition

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Mes_Reservation___B.png`

En tant que collaborateur authentifié (tous rôles),
Je veux que la page "Modifier ma réservation" s'ouvre avec le formulaire entièrement pré-rempli à partir des données de ma réservation existante, avec un état skeleton pendant le chargement et un message d'erreur explicite si la récupération échoue,
Afin de corriger uniquement les valeurs souhaitées sans ressaisir l'intégralité de ma réservation.

**Critères d'acceptation**

```gherkin
Étant donné qu'un collaborateur authentifié est sur la page "Mes réservations"
Et qu'il clique sur le bouton "Éditer" de la ligne REQ-0001234
Quand la page /x_acf_swift_edit.do?booking_id={sys_id} se charge
Alors un skeleton (voir US-0.05) s'affiche pendant la durée du fetch GET /api/now/table/sc_req_item/{sys_id}
Et une fois la réponse reçue le skeleton disparaît
Et le H1 affiche "Modifier ma réservation"
Et le sous-titre affiche "Réservation #REQ-0001234"
Et le champ "Date" est pré-rempli avec la valeur de u_booking_date (format JJ/MM/AAAA)
Et le champ "Heure d'arrivée" est pré-rempli avec la valeur de u_arrival_time
Et le champ "Heure de départ" est pré-rempli avec la valeur de u_departure_time
Et la section "Espace de travail" affiche le nom, l'étage et le type de l'espace (non éditable)
Et le radio "Place de stationnement" est pré-sélectionné selon u_parking_space (Aucun / Thermique / Électrique)

Étant donné qu'un collaborateur est sur la page d'édition
Quand il clique sur le lien "← Mes réservations" dans le breadcrumb
Alors il est redirigé vers la page Mes réservations sans modification
```

---

### [US-5.02] Modification de la date et du créneau horaire avec validation temps réel

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Mes_Reservation___B.png`

En tant que collaborateur authentifié souhaitant décaler une réservation,
Je veux modifier la date (avec un sélecteur bloquant les jours passés et les week-ends), l'heure d'arrivée et l'heure de départ (avec validation arrivée < départ en temps réel),
Afin de choisir un nouveau créneau valide avant de tenter de sauvegarder.

**Critères d'acceptation**

```gherkin
Étant donné qu'un collaborateur est sur la page d'édition avec les champs pré-remplis
Quand il modifie le champ "Date" en sélectionnant une date valide (J+1 ou plus, jour ouvré)
Alors le champ affiche la nouvelle date sans message d'erreur

Étant donné qu'un collaborateur a saisi une date et une heure d'arrivée valides
Quand il saisit une heure de départ POSTÉRIEURE à l'heure d'arrivée
Alors aucun message d'erreur n'apparaît
Et le bouton "Enregistrer les modifications" reste dans son état actif (si tous champs valides)

Étant donné qu'un collaborateur a rempli le champ "Heure d'arrivée" à 14h00
Quand il saisit "Heure de départ" à 09h00 (antérieure)
Alors le message "L'heure de départ doit être postérieure à l'heure d'arrivée." s'affiche sous le champ "Heure de départ"
Et le champ "Heure de départ" reçoit aria-invalid="true"
Et le bouton "Enregistrer les modifications" est désactivé

Étant donné que les champs Date, Heure d'arrivée et Heure de départ sont tous valides
Quand aucune modification n'a encore été sauvegardée
Alors le bouton "Enregistrer les modifications" est actif (non grisé)
```

---

### [US-5.03] Gestion des 4 modes de place de stationnement en édition

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Mes_Reservation___B.png`

En tant que collaborateur authentifié souhaitant modifier les options de parking de sa réservation,
Je veux choisir parmi les 4 modes disponibles — conserver l'existant, changer de type (thermique ↔ électrique), supprimer le parking, ou en ajouter un que je n'avais pas initialement réservé — via un groupe de radio buttons pré-sélectionné selon ma réservation actuelle,
Afin de aligner mes options de stationnement avec mes besoins du jour sans recommencer une nouvelle réservation.

**Critères d'acceptation**

```gherkin
# Mode 1 — Conserver (aucun changement)
Étant donné qu'un collaborateur possède une réservation avec parking thermique (u_parking_space non null, type=thermique)
Quand la page d'édition se charge
Alors le radio "Thermique" est pré-sélectionné
Et aucune action n'est requise pour conserver le parking

# Mode 2 — Changer le type
Étant donné qu'un collaborateur a un parking thermique et veut basculer en électrique
Quand il clique sur le radio "Électrique (⚡)"
Alors "Électrique (⚡)" devient le radio sélectionné
Et "Thermique" est désélectionné
Et le sous-texte "8 places électriques dans le parc" s'affiche
Et aucune validation immédiate n'est déclenchée (vérification à la soumission)

# Mode 3 — Supprimer le parking
Étant donné qu'un collaborateur a un parking et ne veut plus en réserver
Quand il clique sur "Aucun parking"
Alors le radio "Aucun parking" est sélectionné
Et le message "Votre réservation ne comprendra aucune place de stationnement." s'affiche
Et u_parking_space sera envoyé vide (null) lors de la soumission

# Mode 4 — Ajouter un parking non initialement réservé
Étant donné qu'un collaborateur n'avait pas de parking (u_parking_space = null)
Quand la page d'édition se charge
Alors le radio "Aucun parking" est pré-sélectionné
Quand il clique sur "Thermique" ou "Électrique (⚡)"
Alors le radio correspondant est sélectionné
Et la disponibilité sera vérifiée à la soumission

# Pré-sélection génériques
Étant donné une réservation sans parking (u_parking_space = null)
Quand la page d'édition s'affiche
Alors le radio "Aucun parking" est sélectionné par défaut
```

---

### [US-5.04] Soumission, vérification de disponibilité et persistance des modifications

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Mes_Reservation___B.png`

En tant que collaborateur authentifié ayant modifié un ou plusieurs champs de sa réservation,
Je veux cliquer sur "Enregistrer les modifications" pour déclencher une vérification de disponibilité sur le nouveau créneau puis, si la ressource est libre, persister les changements dans ServiceNow et être redirigé vers "Mes réservations" avec un toast de succès,
Afin de confirmer ma modification en toute certitude que l'espace est bien disponible.

**Critères d'acceptation**

```gherkin
# Flow nominal — espace disponible sur le nouveau créneau
Étant donné qu'un collaborateur a modifié la date (05/05/2026), l'heure d'arrivée (10:00), l'heure de départ (13:00)
Et que tous les champs sont valides (date ≥ J+1, arrivée < départ, non week-end)
Quand il clique sur "Enregistrer les modifications"
Alors le bouton bascule en état loading : texte = "Enregistrement en cours…", aria-busy="true"
Et une requête GET de vérification de disponibilité est envoyée sur sc_req_item avec le nouveau créneau
Et si aucun conflit n'est détecté (0 enregistrement retourné)
Alors une requête PATCH /api/now/table/sc_req_item/{booking_id} est envoyée avec les nouvelles valeurs
Et après réponse 200 le collaborateur est redirigé vers /x_acf_swift_mes_reservations.do
Et le toast "Votre réservation a bien été modifiée." (vert) s'affiche 3 secondes (voir US-0.04)
Et la ligne de la réservation dans le tableau "Mes réservations" est mise à jour avec les nouvelles valeurs

# Désactivation bouton si formulaire invalide
Étant donné qu'un collaborateur a l'heure de départ antérieure à l'heure d'arrivée
Quand il observe le bouton "Enregistrer les modifications"
Alors le bouton est désactivé (disabled, opacity 0.4) et non cliquable

# Modification uniquement du parking (sans changement de créneau)
Étant donné qu'un collaborateur change uniquement le type de parking (thermique → électrique) sans modifier date ni heure
Quand il clique sur "Enregistrer les modifications"
Alors seule la vérification de disponibilité du parking électrique est effectuée
Et le PATCH inclut le nouveau u_parking_space (sys_id de la place électrique trouvée)
Et le flow de succès est identique (redirection + toast)
```

---

### [US-5.05] Affichage et récupération du conflit de disponibilité

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Mes_Reservation___B.png`

En tant que collaborateur authentifié dont le nouveau créneau est indisponible au moment de la soumission,
Je veux voir un message d'erreur inline rouge directement dans le formulaire (sans navigation), avec les champs concernés surlignés, et la possibilité de corriger et resoumettre sur place,
Afin de comprendre immédiatement le problème et choisir un autre créneau sans perdre mes saisies en cours.

**Critères d'acceptation**

```gherkin
# Conflit sur le bureau
Étant donné qu'un collaborateur a modifié le créneau et cliqué sur "Enregistrer les modifications"
Et que la vérification (GET sc_req_item) a retourné ≥1 enregistrement en conflit
Quand la réponse de vérification est reçue
Alors AUCUNE requête PATCH n'est envoyée
Et le message "Cet espace n'est plus disponible sur ce créneau. Veuillez choisir une autre date ou un autre horaire." s'affiche en rouge dans la page
Et les champs "Date", "Heure d'arrivée", "Heure de départ" reçoivent une bordure rouge (--color-error)
Et chaque champ en erreur reçoit aria-invalid="true"
Et aria-errormessage de chaque champ pointe vers l'id du message d'erreur
Et le focus est déplacé sur le message d'erreur (tabIndex=-1 + .focus())
Et le bouton "Enregistrer les modifications" reste actif et cliquable
Et le reste du formulaire est intact (valeurs modifiées conservées)

# Conflit sur le parking
Étant donné qu'un collaborateur a ajouté ou changé le type de parking
Et que la vérification parking retourne 0 place du type sélectionné disponible
Quand la réponse est reçue
Alors le message "Aucune place de stationnement [Thermique / Électrique] n'est disponible sur ce créneau." s'affiche sous la section parking
Et le radio sélectionné reçoit aria-invalid="true"
Et les champs de créneau ne sont pas en erreur (conflit isolé au parking)

# Correction après conflit — nouvelle tentative
Étant donné que le message de conflit est affiché
Quand le collaborateur modifie la date ou le créneau
Alors le message d'erreur disparaît immédiatement (onchange)
Et aria-invalid est retiré des champs concernés
Et le bouton "Enregistrer les modifications" reste actif pour une nouvelle tentative
```

---

### [US-5.06] Annulation et retour sans modification vers "Mes réservations"

**Priorité** : medium · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Mes_Reservation___B.png`

En tant que collaborateur authentifié ayant ouvert la page d'édition,
Je veux pouvoir quitter la page d'édition via le bouton "Annuler" ou le breadcrumb "← Mes réservations" pour revenir à "Mes réservations" sans qu'aucune modification ne soit sauvegardée,
Afin de sortir du flux d'édition à tout moment sans conséquence sur ma réservation existante.

**Critères d'acceptation**

```gherkin
# Annulation via bouton "Annuler"
Étant donné qu'un collaborateur est sur la page d'édition
Et qu'il a modifié des champs (date, heure, parking) sans les sauvegarder
Quand il clique sur le bouton "Annuler"
Alors il est redirigé immédiatement vers /x_acf_swift_mes_reservations.do
Et aucune requête PATCH n'est envoyée
Et aucune modification n'est persistée dans sc_req_item
Et la réservation dans "Mes réservations" affiche toujours les valeurs d'origine

# Annulation via breadcrumb
Étant donné qu'un collaborateur est sur la page d'édition (avec ou sans modification)
Quand il clique sur le lien "← Mes réservations" dans le breadcrumb
Alors il est redirigé vers /x_acf_swift_mes_reservations.do sans modification
Et le comportement est identique au clic sur "Annuler"

# Annulation sans modification préalable
Étant donné qu'un collaborateur ouvre la page d'édition mais ne modifie aucun champ
Quand il clique sur "Annuler"
Alors il est redirigé vers Mes réservations (comportement identique)
Et aucun toast ne s'affiche (succès réservé aux modifications réelles)

# Navigation dans le même onglet
Étant donné que la navigation interne se fait dans le même onglet (règle UX non négociable)
Quand l'utilisateur clique sur "Annuler" ou le breadcrumb
Alors la redirection s'effectue dans l'onglet courant (pas de window.open, pas de target="_blank")
```

---

## EP-06

### [US-6.01] Initialisation SPA, déclaration des routes client et guard d'authentification ServiceNow

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B.png`

En tant que Collaborateur Flex Office dont la session ServiceNow peut être active ou expirée,
Je veux que l'application Tinkitest s'initialise depuis `/x_wsb_tinkitest.do`, résolve ses routes internes (Formulaire, Grille, Mes Réservations, Historique, Édition) via paramètre `?route=`, et me redirige vers `/login.do` si ma session est expirée,
Afin de ne jamais accéder à une page protégée sans authentification valide et de pouvoir partager des liens profonds vers un écran spécifique.

**Critères d'acceptation**

```gherkin
Étant donné que je suis un Collaborateur Flex Office avec une session ServiceNow active
Quand j'ouvre l'URL /x_wsb_tinkitest.do sans paramètre route
Alors l'application React se monte sur #x_wsb-app-root
Et la route par défaut "/" affiche le Formulaire de recherche
Et le splash loader disparaît dès que le montage est terminé

Étant donné que je suis un Collaborateur Flex Office avec une session active
Quand j'ouvre /x_wsb_tinkitest.do?route=mes-reservations
Alors l'application charge directement la page "Mes Réservations" sans passer par le Formulaire
Et le focus initial est placé sur le titre de la page "Mes Réservations"

Étant donné que je navigue vers une route inconnue (ex: ?route=xyz-inconnu)
Quand le routeur client évalue la valeur du paramètre
Alors le composant <NotFound> s'affiche avec le texte "Page introuvable"
Et le CTA "Retour au formulaire de recherche" est présent et focalisable au clavier

Étant donné que je suis un Collaborateur Flex Office dont la session ServiceNow est expirée
Quand le premier appel API à l'initialisation retourne une réponse 401
Alors le banner "Votre session a expiré. Redirection en cours…" s'affiche
Et après 3 secondes, le navigateur est redirigé vers /login.do?redirect=<url_courante_encodée>
```

---

### [US-6.02] Tunnel de réservation bout-en-bout : Formulaire → Grille → Confirmation → Mes Réservations

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B.png`

En tant que Collaborateur Flex Office authentifié,
Je veux suivre le tunnel complet depuis le formulaire de recherche jusqu'à la confirmation de réservation — critères transmis en query strings, récapitulatif complet avant création, création atomique `sc_request` + `sc_req_item`, et retour sur "Mes Réservations" avec toast de succès —,
Afin de finaliser une réservation d'espace de travail (et optionnellement une place de parking) en autonomie totale sans intervention du support.

**Critères d'acceptation**

```gherkin
Étant donné que je suis sur le Formulaire de recherche
Quand je remplis les 4 champs obligatoires (Bâtiment A, Étage 3, date J+1, Open Space)
Alors le bouton "Lancer la recherche" devient actif
Et la navigation vers la Grille encode les critères : ?building=A&floor=3&date=2026-05-10&type=open_space
Et le bandeau "Résultats pour Bâtiment A – Étage 3 – 10/05/2026 – Open Space" s'affiche en tête de grille

Étant donné que je suis sur la Grille des résultats et qu'une card est disponible
Quand je clique sur "Réserver cet espace"
Alors je suis dirigé vers la page de Confirmation
Et le récapitulatif affiche l'espace sélectionné, la date, le créneau, et la mention parking si applicable

Étant donné que je suis sur la page de Confirmation
Quand je clique sur "Confirmer ma réservation"
Alors un spinner remplace le label du bouton ("Confirmer ma réservation" → spinner) et le bouton reçoit aria-busy="true"
Et un POST /api/now/table/sc_request est effectué (header X-UserToken: window.g_ck)
Et un POST /api/now/table/sc_req_item est effectué avec la référence sc_request.sys_id retournée
Et sc_req_item.state = "Open" à la création
Et je suis redirigé vers "Mes Réservations"
Et le toast "Réservation confirmée !" s'affiche pendant 4 secondes avec role="alert"

Étant donné que j'ai coché "Venez-vous en voiture ?" et sélectionné "Électrique"
Quand je confirme ma réservation
Alors un second POST /api/now/table/sc_req_item est effectué pour la place parking
Et le récapitulatif inclut la mention "Place électrique ⚡"
Et les deux sc_req_item partagent le même sc_request.sys_id

Étant donné que je suis sur la page de Confirmation
Quand je clique sur "Annuler"
Alors je suis redirigé vers la Grille des résultats avec les critères préservés en state
```

---

### [US-6.03] Persistance des critères de recherche et retour contextuel depuis l'état "Aucun résultat"

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B.png`

En tant que Collaborateur Flex Office,
Je veux que mes critères de recherche soient encodés dans les query strings de l'URL et que le CTA "Modifier ma recherche" — accessible depuis l'état vide ou le bandeau de la grille — me ramène au Formulaire intégralement pré-rempli avec mes paramètres précédents,
Afin de ne pas ressaisir entièrement mes critères lorsque j'affine une recherche sans résultat.

**Critères d'acceptation**

```gherkin
Étant donné que je suis sur le Formulaire de recherche
Quand je lance une recherche (Bâtiment A, Étage 3, 10/05/2026, Open Space)
Alors la navigation encode les critères : ?building=A&floor=3&date=2026-05-10&type=open_space
Et le bandeau "Résultats pour Bâtiment A – Étage 3 – 10/05/2026 – Open Space" s'affiche en tête de grille

Étant donné que la Grille ne retourne aucun espace disponible (0 résultats)
Quand le composant <wsb-empty-state> s'affiche avec le message "Aucun espace disponible pour vos critères"
Alors le CTA "Modifier ma recherche" est visible
Et le focus est automatiquement placé sur ce CTA

Étant donné que je clique sur "Modifier ma recherche" depuis l'état vide
Quand la navigation vers le Formulaire s'effectue
Alors les 4 champs sont pré-remplis avec les valeurs des query strings précédentes
Et le bouton "Lancer la recherche" est immédiatement actif (critères déjà complets)

Étant donné que je clique sur "Modifier la recherche" depuis le bandeau de la Grille nominale
Quand la navigation vers le Formulaire s'effectue
Alors les critères courants pré-remplissent également les 4 champs du Formulaire
Et le bouton "Lancer la recherche" est immédiatement actif
```

---

### [US-6.04] Flux d'édition d'une réservation existante avec gestion des conflits de disponibilité cross-pages

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B.png`

En tant que Collaborateur Flex Office,
Je veux accéder à l'édition d'une réservation active depuis "Mes Réservations" (bouton inline "Éditer"), modifier la date et les heures (et les 4 modes de gestion parking), puis être informé en cas de conflit de disponibilité par un message inline rouge sans quitter la page — ou être redirigé vers "Mes Réservations" avec toast de succès si la mise à jour est acceptée,
Afin de corriger mes réservations sans avoir à les annuler et recréer manuellement.

**Critères d'acceptation**

```gherkin
Étant donné que je suis sur "Mes Réservations" et qu'une ligne affiche le badge "En cours"
Quand je clique sur "Éditer" sur cette ligne
Alors je suis dirigé vers la page "Édition d'une réservation" avec l'identifiant sc_req_item.sys_id en state
Et les champs Date, Heure d'arrivée, Heure de départ affichent les valeurs actuelles de la réservation
Et le champ "Espace de bureau" est affiché en lecture seule (pas de <input>, pas de focus clavier)
Et le radio group "Gestion parking" est initialisé sur "Conserver"

Étant donné que je suis sur la page "Édition d'une réservation" et que le créneau demandé est disponible
Quand je modifie la Date et les heures puis clique "Enregistrer les modifications"
Alors le Script Include x_wsb_availability_engine est appelé via l'endpoint server custom
Et si disponible : PATCH /api/now/table/sc_req_item/{sys_id} met à jour la réservation
Et je suis redirigé vers "Mes Réservations" avec le toast "Réservation mise à jour !" visible 4 s

Étant donné que le créneau demandé n'est plus disponible (conflit détecté)
Quand la réponse server indique un conflit
Alors je reste sur la page "Édition d'une réservation" sans navigation
Et le message inline rouge s'affiche : "Cet espace n'est plus disponible sur ce créneau. Veuillez choisir un autre horaire."
Et le focus est placé automatiquement sur ce message

Étant donné que la réservation n'a pas de parking et que je sélectionne "Ajouter" puis "Électrique"
Quand je soumets
Alors un POST /api/now/table/sc_req_item crée une nouvelle entrée parking liée au même sc_request.sys_id

Étant donné que la réservation a un parking et que je sélectionne "Supprimer"
Quand je soumets
Alors un PATCH /api/now/table/sc_req_item/{parking_sys_id} définit state = "Cancelled"
```

---

### [US-6.05] Gestion globale des erreurs API, session timeout et états de chargement inter-pages

**Priorité** : high · **Statut** : open · **Rôle** : dev · **Maquette** : `maquette_Formulaire_de_recherche___B.png`

En tant que Collaborateur Flex Office,
Je veux que toute erreur API (401, 403, 500, timeout réseau, hors-ligne) soit interceptée de façon centralisée et affichée avec un message explicite sur n'importe quelle page — et que chaque vue à données expose un état de chargement cohérent (skeleton ou spinner) — sans jamais laisser de page blanche ni d'erreur silencieuse,
Afin de rester informé de l'état du système et savoir quoi faire pour continuer.

**Critères d'acceptation**

```gherkin
Étant donné que je suis sur la Grille des résultats et que la requête de disponibilité est en cours
Quand la requête s'exécute depuis moins de 10 secondes
Alors 6 cards skeleton <wsb-skeleton-grid> s'affichent (aria-hidden="true" sur les cards, aria-label="Chargement en cours" sur le conteneur)

Étant donné que je suis sur "Mes Réservations" et que la liste est en cours de récupération
Quand le composant monte
Alors un skeleton tableau de 5 lignes <wsb-skeleton-table> s'affiche pendant le fetch

Étant donné qu'un chargement dépasse 10 secondes (AbortController déclenché)
Quand le signal abort est reçu par le fetch
Alors le skeleton est masqué
Et le message "Le chargement prend trop de temps. Veuillez réessayer." s'affiche avec le bouton "Réessayer"

Étant donné que n'importe quel appel API retourne une réponse 401
Quand l'erreur est interceptée par ApiService.js
Alors le banner "Votre session a expiré. Redirection en cours…" s'affiche avec role="alert"
Et après 3 secondes, redirection vers /login.do?redirect=<url_courante_encodée>

Étant donné que n'importe quel appel API retourne une réponse 403
Quand l'erreur est interceptée
Alors le banner "Vous n'avez pas les droits nécessaires pour cette action." s'affiche
Et aucune redirection automatique n'est déclenchée

Étant donné que n'importe quel appel API retourne une réponse 500 ou une TypeError réseau
Quand l'erreur est interceptée
Alors le banner "Une erreur est survenue. Veuillez réessayer." s'affiche avec le bouton "Réessayer"
Et le bouton "Réessayer" relance l'appel API ayant échoué

Étant donné que navigator.onLine passe à false (événement "offline")
Quand l'application détecte la perte de connexion
Alors le banner "Vérifiez votre connexion internet." s'affiche immédiatement
Et quand navigator.onLine repasse à true (événement "online"), le banner disparaît automatiquement
```

---
