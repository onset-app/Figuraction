# ONSET — Stratégie Go-to-Market pour la Belgique

**Date :** 2026-07-21
**Base :** Analyse complète du codebase ONSET (code source, journal de tickets `PROGRESS.md`, revues de production-readiness `SPRINT-REVIEWS.md`, brief d'architecture `CLAUDE.md`, textes des pages en ligne) plus une étude de marché ciblée. Chaque affirmation produit de ce document est traçable dans le codebase ; les affirmations marché citent leurs sources ou sont explicitement étiquetées **[HYPOTHÈSE]**.

---

## Résumé exécutif

ONSET est une plateforme de casting bifaces (B2B2C) pour les figurants de cinéma/TV en Belgique. Le codebase révèle un **MVP réellement complet et durci côté sécurité** — pas un prototype : authentification complète avec routage par rôle, profils figurants avec upload de photo, gestion du cycle de vie projets/castings, candidatures en un clic avec mises à jour de statut en temps réel, revue de candidats en masse avec emails transactionnels automatiques, convocations groupées, covoiturage, catalogue public prêt pour le SEO avec pages indexables par casting, et une PWA installable. Six sprints de revue de code formelle (scores 7–8/10, tous les constats résolus) et une suite de 17 assertions de sécurité RLS en live placent ce produit bien au-dessus de la qualité pré-lancement habituelle.

Le tableau stratégique qui ressort du code :

1. **Le produit est tiré par le côté production.** Les fonctionnalités les plus difficiles et les plus différenciantes (revue en masse, convocations, multi-tenance isolée par RLS entre productions, statut temps réel) servent toutes le workflow production/régisseur. Les concurrents en Belgique (becasting.be, figuratie.be, figurants.com) sont **des tableaux d'annonces ou des agences payantes côté talents** — aucun n'est un SaaS de workflow pour le côté production. C'est là qu'est la brèche.
2. **L'offre (figurants) est le côté bon marché ; la demande (productions) est le côté rare.** Le marché belge de la production est petit et dense (~quelques dizaines de sociétés de production actives concentrées autour de Bruxelles, Liège et la Flandre, alimentées par un Tax Shelter d'environ 200 M€/an). Le GTM doit être une vente B2B menée par le fondateur auprès des régisseurs et directeurs de production, l'acquisition de figurants étant tirée par les appels à casting de chaque production (la boucle « apportez votre propre réseau » déjà implicite dans les pages de casting publiques du produit).
3. **Le plus gros bloqueur go-to-market est dans le code, pas dans le marché :** l'UI est 100 % en français en dur (i18n formellement différée dans la revue du Sprint 2). Cela exclut la Flandre — environ la moitié du volume de production belge (la VRT à elle seule fait tourner un pipeline permanent de figurants). Une ambition pan-belge exige le NL avant le passage à l'échelle ; le chemin recommandé est de gagner d'abord la Belgique francophone (Bruxelles + Wallonie) et de traiter le NL comme la « Series A des fonctionnalités ».
4. **Monétiser le côté production, garder les figurants gratuits pour toujours.** La page tarifs promet déjà « gratuit pendant le lancement, tarifs annoncés avant toute facturation » — un angle d'attaque honnête. Les fonctionnalités de phase 2 déjà cadrées dans le code (feuilles de service, signature électronique, recherche avancée) sont exactement les bonnes barrières de palier payant.

Objectif réaliste à 12 mois : **8–15 sociétés de production payantes, 3 000–6 000 figurants inscrits, 2–5 K€ de MRR**, et la propriété de la catégorie « casting figurants Belgique » dans la recherche francophone.

---

# Phase 1 — Compréhension du produit (depuis le codebase)

## 1.1 Le problème résolu

Énoncé dans `README.md` et vérifié par l'ensemble des fonctionnalités : le casting de figurants en Belgique tourne sur des groupes WhatsApp, des posts Facebook, des emails perdus et des tableurs Excel recopiés à la main. Les productions perdent des heures ; les figurants n'ont aucune visibilité sur le statut de leur candidature ; les no-shows plombent les journées de tournage. Le texte de la page B2B (`src/app/(public)/pour-les-productions/page.tsx`) le formule précisément : *« Des appels à figurants postés dans dix groupes Facebook… Des heures à recopier des listes dans Excel. »*

## 1.2 Utilisateurs cibles (trois rôles, imposés par le code)

`src/types/enums.ts` définit exactement trois rôles — `figurant`, `production`, `admin` — imposés à quatre niveaux : gardes de routes du proxy (`src/proxy.ts` restreint `/app/projets` et `/app/candidats` à production/admin), `RoleGuard` côté client, policies RLS Postgres (`supabase/migrations/007_rls_policies.sql`, 390 lignes), et grants limités par colonne (role/email immuables depuis l'API cliente — un correctif d'escalade de privilèges issu de la revue du Sprint 1).

- **Figurants :** profil (photo, ville, âge 16–120 selon `profileSchema`, niveau d'expérience, bio), parcours/filtrage des castings, candidature en un clic, suivi du statut en temps réel, covoiturage.
- **Productions :** projets → castings (type de rôle figurant/acteur/doublure, tranche d'âge, lieu, date, places), cycle de publication (draft→open→closed→archived avec transitions validées côté serveur), revue des candidats (unitaire + en masse, plafonnée à 200 ids), parcours de tous les figurants, convocations groupées.
- **Admins :** page placeholder uniquement (`/app/admin`) — le back-office est réellement en Phase 2.

## 1.3 Périmètre fonctionnel actuel — ce qui est réellement livré

Vérifié contre `PROGRESS.md` (48/53 tickets terminés) et l'arborescence des fichiers :

| Domaine | Livré | Preuve |
|---|---|---|
| Auth | Inscription avec choix de rôle, connexion, déconnexion, mot de passe oublié/mise à jour, callback de confirmation email (PKCE + token_hash recovery), préservation du deep-link `?next=`, garde anti open-redirect | `src/actions/auth.ts`, `src/app/auth/callback/route.ts`, revue Sprint 2 |
| Profils | CRUD complet, upload photo vers Supabase Storage (chemin dérivé de la session, correctif de limite body 6 Mo), formulaire adapté au rôle | `src/actions/profiles.ts`, `src/components/profil/*` |
| Projets/Castings | CRUD + transitions de statut allow-listées côté serveur, dialogs d'édition, compteurs de castings | `src/actions/projects.ts`, `castings.ts`, `PROJECT_STATUS_TRANSITIONS` |
| Candidatures | Postuler (anti-doublon via contrainte UNIQUE, résurrection retrait→re-candidature), mes-candidatures avec bascules de statut en **Supabase Realtime**, revue production unitaire/en masse avec UI optimiste | `src/actions/applications.ts`, `useMyApplicationsRealtime` |
| Emails | Bienvenue, confirmation, refus, convocation — templates React Email, Resend, fan-out chunké (×5, conscient du rate-limit), best-effort (échecs → Sentry, ne cassent jamais l'action) | `src/emails/*`, `src/lib/resend/send.ts` |
| Covoiturage | Créer/lister/filtrer, marquer complet + rouvrir, supprimer, contact via mailto/tel | `src/actions/carpools.ts` |
| Public/SEO | Landing, page B2B, guide SEO « devenir figurant » avec JSON-LD FAQPage, catalogue de castings public **avec pages indexables par casting + metadata dynamiques + canonical**, sitemap (castings inclus dynamiquement), robots, image OG générée au build | `src/app/(public)/*`, `src/app/sitemap.ts` |
| PWA | Manifest, service worker Serwist (66 URLs précachées), page offline, bannière d'installation (shell app uniquement) | `src/sw.ts`, `serwist.config.mjs` |
| Observabilité | Sentry sur chaque branche d'erreur des actions (tags feature/step), provider PostHog | `sentry.*.config.ts`, `posthog-provider.tsx` |
| Sécurité | RLS sur toutes les tables, 17 assertions live rejouées par `pnpm db:verify-rls` (en CI), grants limités par colonne, usage du service-role documenté cas par cas | `src/db/verify-rls.ts`, `007_rls_policies.sql` |

## 1.4 Niveau de maturité

**MVP tardif / pré-lancement.** Le signal distinctif est la qualité du process : chaque sprint a eu une revue formelle avec constats classés par sévérité, et *tous* ont été résolus et re-vérifiés (SPRINT-REVIEWS.md). Des bugs de haute sévérité qui auraient tué le lancement — les productions ne pouvaient jamais publier un projet (S3), un re-signup détruisait les comptes en attente (S2), `/app/candidats` en 404 depuis la nav principale (S4), témoignages fabriqués sur la landing (S6) — ont été détectés et corrigés. C'est plus prêt au lancement que ne le suggère son numéro de version « 0.1.0 ».

**Pas encore fait (checklist pré-lancement dans PROGRESS.md) :** mentions légales avec identité réelle de l'entreprise, politique de confidentialité, variables d'environnement Vercel (`NEXT_PUBLIC_APP_URL`, `RESEND_FROM`), vérification du domaine Resend (actuellement seul le propriétaire du compte reçoit les emails), test PWA sur appareil réel, passe Lighthouse, allowlist des redirect URLs Supabase Auth, vrais témoignages. **Le Sprint 7 (tous les tests : Vitest + 3 specs e2e Playwright) est entièrement non démarré** — tickets #49–#53 non cochés ; le répertoire `tests/` n'existe pas dans le dépôt.

## 1.5 Fonctionnalités manquantes (par rapport au plan et au marché)

- **Pas de monétisation** : aucun code Stripe nulle part (`package.json` n'a pas de dépendance stripe) ; la page tarifs affiche « Lancement 0€ » + un « Pro — Bientôt » grisé.
- **Pas d'i18n** : next-intl est dans le plan de CLAUDE.md mais absent de `package.json` ; tous les textes UI en français en dur (report formellement acté dans la revue du Sprint 2). **Pas de néerlandais = pas de Flandre.**
- **Pas de contrats/signature électronique, pas de feuilles de service, pas de notifications push, pas de back-office admin** (tout cadré Phase 2 ; la table `contracts` existe dans le schéma Drizzle mais n'a zéro UI/actions).
- **Pas de pagination** sur aucune liste (décision acceptée, « échelle lancement OK » — revue Sprint 3).
- **Pas de recherche/filtres avancés de candidats** pour les productions (`getFigurants()` renvoie une liste minimale non filtrée — Sprint 4 bis).
- **Pas d'historique des convocations** (une production ne peut pas voir qu'elle a déjà convoqué — backlog acté).
- **Pas de messagerie in-app** — le contact est mailto/tel uniquement (covoiturages, pages candidats).
- **Pas de calendrier de disponibilités, pas d'export CSV/Excel** (les productions venant d'Excel demanderont l'export presque immédiatement).

## 1.6 Avantages compétitifs visibles dans le code

1. **Profondeur du workflow côté production** — revue en masse avec UI optimiste, convocations groupées dédupliquées par figurant, cycle de statut imposé. Aucun concurrent belge n'a cela (voir Phase 2).
2. **Statut temps réel pour les figurants** — la douleur n°1 côté talents (le silence après avoir postulé) est structurellement résolue (publication `supabase_realtime` sur `applications`).
3. **Machine SEO déjà construite** — chaque casting ouvert est une page publique indexable avec metadata dynamiques, inclusion dans le sitemap et JSON-LD ; le guide « devenir figurant » cible exactement les termes de tête. Les pages d'annonces des concurrents sont techniquement faibles. C'est un actif d'acquisition composé, à coût nul.
4. **Posture confiance/conformité** — RLS vérifiée par assertions live en CI, texte de tarifs honnête, faux témoignages retirés proactivement pour raisons de droit de la consommation UE. Pour vendre à des diffuseurs (niveau RTBF), cette discipline est un atout commercial.
5. **PWA mobile-first** — les figurants sont une audience mobile ; app installable sans friction ni frais d'app store.
6. **Histoire anti-no-show** — le covoiturage est présenté de manière unique sur la page B2B comme un bénéfice production (« Moins de no-shows »), un différenciateur qu'aucun site d'annonces ne peut copier structurellement.

## 1.7 Faiblesses

- **UI en français uniquement** (le plus gros limiteur de marché — exclut ~60 % de la population belge et le cluster de production VRT/flamand).
- **Zéro couverture de tests automatisés** — chaque régression jusqu'ici a été attrapée par des passes de revue manuelle ; ça ne passe pas l'échelle après le lancement.
- **Dépendance au cold-start** : la valeur du catalogue = des castings actifs ; les données seed qui masquaient des bugs (thème récurrent des revues) sont une métaphore du risque marché — un catalogue vide tue la rétention des figurants.
- **Exposition RGPD explicitement acceptée en revue de code** (Sprint 4) : *n'importe quel* compte production peut lire le profil complet de *n'importe quel* figurant, y compris email + téléphone, même non-candidat (`profiles_select_figurants_by_staff`), et le bucket avatars est en lecture publique (URLs non devinables). Les deux sont actés comme « à durcir plus tard ». Pour une plateforme détenant des photos, âges et numéros de téléphone d'individus (16+, potentiellement proches de la minorité) dans l'UE, c'est un passif pré-revenu, et l'inscription production n'est pas vérifiée — n'importe qui peut s'auto-déclarer production et moissonner des coordonnées.
- **Aucune vérification des comptes production** — lié au point précédent ; aussi un vecteur de spam/fraude (les faux castings sont un fléau connu de ce marché ; la page « devenir figurant » met elle-même en garde contre les agences arnaqueuses).
- **La convocation est en mode « tire et oublie »** (pas d'historique, pas d'accusés de lecture) — affaiblit la promesse « remplace WhatsApp » pour la communication aux enjeux les plus élevés.

## 1.8 Limitations techniques affectant la croissance

- **La résolution du rôle est une requête DB par requête proxifiée** (`getUserRole` dans `src/proxy.ts` ; l'optimisation via claims JWT est un backlog acté). Correct à l'échelle du lancement, ajoute latence + charge Supabase avec le trafic.
- **`db:push` supprime toutes les policies RLS** (comportement drizzle-kit) — mitigé par le script chaîné `db:rls`, mais la gestion du schéma est fragile-par-discipline ; une erreur en production serait un incident d'exposition de données, pas une indisponibilité.
- **Listes non paginées + `getFigurants()` non filtré** — le parcours côté production meurt à quelques milliers de figurants ; cela entre en collision avec le succès, pas avec l'échec.
- **Client Postgres serverless épinglé à `max: 1` connexion** — correct pour l'instant, mais un usage intensif du dashboard par une grosse production fera émerger de la latence.
- **La délivrabilité email est mono-fournisseur (Resend) et le domaine est actuellement non vérifié** — les convocations sont des communications critiques pour le tournage ; un bounce est un no-show.
- **Verdict scalabilité :** l'architecture Vercel + Supabase sert confortablement le plafond belge réaliste (quelques dizaines de milliers d'utilisateurs). Le risque d'échelle est le passage à l'échelle des *fonctionnalités* (pagination, recherche), pas de l'infrastructure.

## 1.9 Forces et faiblesses UX

**Forces (d'après les journaux de revue) :** formulaires adaptés au rôle (on ne demande pas aux productions leur expérience d'acteur), mises à jour optimistes avec rollback, empty states avec CTA partout, nav mobile sur le site public comme dans l'app (onglets en bas), badges de statut avec icônes, formatage de dates en français avec gestion TZ-safe (une classe de bugs récurrente, soigneusement résolue), hints d'invisibilité des brouillons pour les productions.

**Faiblesses :** pas de séquence d'onboarding après l'inscription (les figurants atterrissent sur un dashboard, rien ne pousse à compléter le profil — et un profil incomplet est une valeur invisible pour les productions) ; pas d'indicateur de complétude du profil ; pas de préférences de notifications enregistrées ; aucun moyen pour les figurants d'être *notifiés des nouveaux castings* (ils doivent revenir vérifier — le plus gros trou de rétention ; digest email ou push est en Phase 2) ; la convocation n'a pas de boucle de confirmation (bouton « Je serai présent »).

---

# Phase 2 — Analyse du marché belge

## 2.1 Taille de marché

- **Côté production (le côté payant) :** le Tax Shelter fédéral belge canalise ~200 M€/an vers la production audiovisuelle et a plus que doublé le volume de tournages depuis son introduction ([SPF Finances](https://finance.belgium.be/en/enterprises/corporation-tax/tax-benefits/tax-shelter-audiovisual-production), [Cineuropa](https://cineuropa.org/en/newsdetail/219784), [Lexgo](https://www.lexgo.be/en/news-and-articles/2458-the-tax-shelter-for-audiovisual-productions-in-belgium-a-successful-tool-under-reform)). Jusqu'à 42 % des dépenses belges sont récupérables, ce qui fait de la Belgique un hub européen de coproduction ([Screen Flanders](https://www.screenflanders.be/en/financing/other-funds-incentives/tax-shelter), [Mbrella Films](https://mbrellafilms.com/incentives/belgium/)). **[HYPOTHÈSE]** À partir des portefeuilles des fonds (Wallimage, screen.brussels, line-ups VAF/Screen Flanders), j'estime à **60–120 organisations** celles qui embauchent des figurants avec une quelconque régularité : sociétés de production fiction/TV (Versus, Frakas, Scope, Panache, Caviar, De Mensen, Menuet…), diffuseurs (RTBF, VRT, RTL Belgium), maisons de production publicitaire, et une longue traîne de corporate/formats courts. Marché payant adressable aux prix SaaS belges : environ **150–400 K€ de plafond d'ARR domestique** — un solide business de tête de pont, pas la fin de partie (fin de partie = expansion France/NL ou montée dans la chaîne de valeur vers feuilles de service/contrats/paie comme le comparable US [Everyset](https://everyset.com/), qui a levé 9 M$ et sert Netflix/HBO/Amazon — preuve que la catégorie supporte des issues à l'échelle venture sur des marchés plus grands).
- **Côté talents :** **[HYPOTHÈSE]** sur la base des affirmations des concurrents et des tailles de groupes Facebook, le vivier actif de figurants belges est de **15 000–40 000 personnes**, fortement concentré autour de Bruxelles, Liège (Wallonie = gros hub de tournage Tax Shelter), Gand et Anvers. Ils churnent vite (la figuration est un revenu épisodique/un hobby).

## 2.2 Concurrents existants

| Concurrent | Modèle | Ce qu'ils sont | Ce qu'ils ne sont pas |
|---|---|---|---|
| [becasting.be](https://www.becasting.be/) | Tableau d'annonces côté talents (« N°1 des castings en Belgique ») | Annonces de casting figuration/mode/TV, accepte les débutants | Pas un outil de workflow production ; pas de gestion de pipeline de candidatures |
| [figurants.com](https://figurants.com/region/belgique/) | Site d'annonces français avec une section Belgique | Volume d'annonces de casting FR/BE | Franco-centré ; la Belgique est une région annexe ; pas d'outillage production BE |
| [figuratie.be](https://figuratie.be/) (In The Picture) | Base de données/agence de figurants flamande | Inscription → offres par email correspondant au profil | Intermédiée par une agence, pas en self-service pour les productions ; côté NL uniquement |
| [figuranten-gezocht.be](https://www.figuranten-gezocht.be/) | Annonces/liste email flamande | Notifications email d'opportunités | Idem — une mailing-list, pas une plateforme |
| [castprod.com](https://castprod.com/) | Tableau de castings FR/BE gratuit depuis 2003 | Annonces gratuites | UX datée, pas de pipeline, pas de focus BE |
| Agences de casting ([NK Casting](https://nkcasting.be/), [Smiling Agency](https://smiling.agency/casting-belgique/), et les directeurs listés sur [Sortlist](https://www.sortlist.be/fr/s/casting/belgique-be)) | Agences de service humain | Casting de figurants full-service, honoraires à la journée | Cher ; les productions qui s'auto-castent (la foule WhatsApp/Excel) sont exactement la cible d'ONSET |
| Groupes Facebook / WhatsApp | « Outil » gratuit en place | Là où vit réellement le marché aujourd'hui | Le statu quo que le propre texte d'ONSET attaque — c'est ça le vrai concurrent |
| Figurantendatabank VRT ([vrt.be](https://www.vrt.be/heb-je-een-vraag/s/article/Ik-wil-graag-figureren-in-een-programma-van-VRT)) | Interne au diffuseur | Le pipeline propre de la VRT | Fermé ; montre que le côté NL s'auto-organise déjà |

**Insight clé :** chaque concurrent belge monétise ou sert le **côté talents** (annonces, abonnements, honoraires d'agence). **Personne ne vend du logiciel de workflow au côté production.** Le codebase d'ONSET est à 60 % du workflow côté production. Le positionnement s'écrit tout seul : *l'outil du régisseur, avec le vivier de talents inclus.*

## 2.3 Brèches de marché & douleurs non résolues

1. **Le trou noir des candidatures** — les talents postulent dans le vide. Le statut temps réel d'ONSET + les emails de refus automatiques corrigent cela structurellement (et les emails de refus, de manière unique, sont une *fonctionnalité de rétention côté offre* : les figurants refusés-mais-informés restent).
2. **La logistique de masse** — confirmer 60 figurants et les convoquer avec date/heure/adresse est un enfer de copier-coller. Revue en masse + convocation groupée (livrées) est la démo qui tue.
3. **L'anxiété arnaque/faux casting** — des « agences » payantes prédatent les aspirants figurants (la propre page SEO d'ONSET met en garde). Une plateforme gratuite et vérifiée est un levier de confiance.
4. **Les no-shows** — traités par personne ; le covoiturage d'ONSET + la (future) boucle de confirmation est une histoire unique.
5. **Des données talents propres au sens RGPD** — les productions qui font circuler des Excel de numéros de téléphone violent le RGPD au quotidien. « Votre base de figurants, à accès contrôlé et auditable » est un angle de vente conformité que les équipes juridiques des diffuseurs belges apprécieront (et le travail RLS du codebase le crédibilise — une fois durcie la policy de parcours de tous les profils).

## 2.4 Contraintes & réglementations spécifiquement belges

- **RGPD** (photos, âges, téléphones d'individus — certains de 16–17 ans, puisque `profileSchema` autorise l'âge ≥16) : obligations façon DPO-light, politique de confidentialité (déjà un bloqueur de lancement tracké dans PROGRESS.md), pression de minimisation des données sur la policy de parcours de tous les figurants. Les mineurs sur un plateau impliquent aussi les règles belges d'autorisation de travail des enfants — mérite une FAQ, pas un périmètre produit.
- **La rémunération des figurants** est une zone grise (défraiement volontaire plafonné ~41,48 €/jour vs. paiement via SBK/agences de paie type Amplo/Tentoo ; **[HYPOTHÈSE]** plafonds 2026 exacts à vérifier). ONSET reste sagement hors des flux de paiement pour l'instant — la page SEO présente déjà la rémunération comme « variable, précisée dans l'annonce ». Opportunité de Phase 3, pas de périmètre de lancement.
- **Loi/culture linguistique :** la Belgique est FR/NL/(DE) avec des écosystèmes médias, des fonds (Wallimage/screen.brussels vs VAF) et une presse séparés. Il n'y a pas de « marché belge » — il y en a deux. Le codebase (FR uniquement, `locale: fr_BE`, villes citées : Bruxelles/Liège/Namur/Charleroi/Mons/Gand/Anvers) a déjà implicitement choisi le côté francophone d'abord. Il faut en faire une stratégie explicite.
- **eIDAS** pour les contrats de Phase 2 — DocuSeal déjà cadré dans CLAUDE.md ; un vrai différenciateur de conformité UE face aux outils US.

## 2.5 Pourquoi la Belgique est un (assez) bon premier marché

**Pour :** communauté de production dense, petite et atteignable (tout le monde se connaît — 10 bons clients = une réputation à l'échelle du marché) ; le Tax Shelter maintient le volume élevé et fait venir des tournages internationaux ayant besoin de figurants locaux rapidement ; la « concurrence » en place, c'est Facebook ; proximité du fondateur **[HYPOTHÈSE : fondateur basé en Belgique, vu la locale fr_BE, les villes belges dans les textes et le focus marché .be]**.
**Contre :** petit plafond de revenus ; complexité bilingue ; acheteurs conservateurs.
**Verdict :** la Belgique est la bonne *tête de pont*, le mauvais *état final*. Gagner la Belgique francophone en 12 mois, puis choisir : la Belgique néerlandophone (adjacente, exige l'i18n) ou le nord de la France (même langue, marché ×10, corridor de tournage Lille/Pas-de-Calais et coproductions wallonnes qui se recoupent déjà).

---

# Phase 3 — Profils de clients idéaux (ICP)

## ICP-1 (PRIMAIRE) : le régisseur / directeur de production d'un producteur de fiction belge

- **Industrie :** production cinéma & TV (longs métrages de fiction, séries, coproductions Tax Shelter)
- **Taille d'entreprise :** 5–50 permanents, équipes de tournage de 30–150
- **Décideur :** directeur de production / régisseur général (utilisateur = acheteur dans les petites structures ; dans les plus grandes, le producteur exécutif valide)
- **Budget :** budgets par production où la coordination des figurants est une ligne ; 100–300 €/mois est invisible dans une production à 2 M€+. **[HYPOTHÈSE]**
- **Douleur :** 50–200 figurants par tournage, sourcés via posts Facebook + email + Excel ; convocations par copier-coller WhatsApp ; les no-shows forcent un sur-booking de 20 % ; des tableurs douteux au sens RGPD qui circulent
- **Alternatives existantes :** groupes Facebook (gratuit, chaotique), agences de casting (300–600 €/jour de service humain — **[HYPOTHÈSE]**), stagiaires
- **Motivation d'achat :** heures gagnées par jour de tournage, moins de no-shows, gestion des données défendable
- **Objections :** « Les figurants dont j'ai besoin y sont-ils vraiment ? » (cold-start), « Encore un outil pour un tournage de 6 semaines ? », « Facebook gratuit fonctionne »
- **Canaux :** démarchage direct du fondateur (la communauté fait ~200 personnes), réseaux Wallimage/screen.brussels/Cluster TWIST, recommandations des film offices, bouche-à-oreille sur les plateaux
- **Pourquoi n°1 :** correspond exactement au périmètre livré (projets→castings→revue en masse→convocation) ; un tournage de fiction amène 50–200 figurants sur la plateforme *à votre place* — chaque client est aussi un canal d'acquisition pour le côté offre.

## ICP-2 : Diffuseurs & producteurs épisodiques à haut volume (RTBF, RTL Belgium, formats quotidiens/hebdomadaires en studio)

- **Taille d'entreprise :** 100+ ; **Décideur :** coordinateur casting/publics + achats (cycle plus long, exige documentation sécurité/RGPD — que le travail RLS/verify-rls soutient)
- **Budget :** vrais budgets logiciels ; 500 €+/mois plausible pour des fonctionnalités enterprise (SSO, audit, export)
- **Douleur :** besoins *récurrents* de figurants (publics, silhouettes) — le client de rêve pour la rétention
- **Objections :** achats, organes de concertation, « on a une liste interne » (voir la databank propre de la VRT)
- **Canaux :** intros chaleureuses via les productions ICP-1 qui tournent pour eux ; événements sectoriels
- **Pourquoi n°2 et pas n°1 :** cycle de vente de 6–12 mois ; les manques enterprise (SSO, exports, console admin) ne sont pas encore construits. Démarrer les conversations tôt, conclure plus tard.

## ICP-3 : Maisons de production pub/corporate & productions d'écoles de cinéma (amorçage côté offre)

- **Taille d'entreprise :** 2–15 ; **Décideur :** producteur/réalisateur (même personne)
- **Budget :** quasi nul — ils restent sur le palier gratuit
- **Douleur :** besoin de 5–30 figurants vite, sans aucun budget casting
- **Motivation :** gratuit + instantané ; **Objections :** aucune qui compte
- **Canaux :** écoles de cinéma IAD/INSAS/HELB, job boards Kunstenpunt/mediarte, Google (les pages SEO)
- **Rôle dans la stratégie :** pas du revenu — **la roue d'inertie du volume de castings**. Ils gardent le catalogue public rempli pour que les figurants continuent de revenir. Le plan de lancement 0€ actuel (déjà en ligne sur la page tarifs) est parfaitement conçu pour eux ; plus tard, ils restent en palier gratuit avec plafonds d'usage.

**Les figurants ne sont pas un ICP** — ils sont le côté offre, acquis via le SEO (déjà construit), les appels à casting de chaque production, et le bouche-à-oreille covoiturage/suivi de statut. Ils ne doivent jamais payer (c'est aussi le positionnement anti-arnaque).

**Priorité : ICP-1 → ICP-3 (en parallèle, coût nul) → ICP-2 (feu doux).**

---

# Phase 4 — Positionnement (Belgique francophone)

**Proposition de valeur unique :**
*« Vos figurants confirmés en quelques heures, pas en quelques semaines. »* — la accroche hero déjà en ligne sur `/pour-les-productions` est réellement bonne ; la garder comme UVP B2B. UVP côté figurant : *« Postulez en un clic, sachez toujours où en est votre candidature. »* (le statut temps réel est la promesse prouvable que les concurrents ne peuvent pas faire).

**Énoncé de positionnement :**
Pour les équipes de production belges qui castent elles-mêmes leurs figurants, ONSET est la plateforme de casting qui remplace les groupes Facebook, les boîtes mail et Excel par un seul pipeline — publier, trier, confirmer et convoquer en quelques clics — contrairement aux tableaux d'annonces (becasting, figurants.com) qui ne font que republier des annonces, et contrairement aux agences qui facturent à la journée ce que votre régisseur peut désormais faire en un après-midi.

**Pitch d'ascenseur (20 s) :**
« Le casting de figurants en Belgique tourne encore sur WhatsApp et Excel. ONSET donne aux productions un seul endroit pour publier leurs castings, recevoir des profils complets avec photos, confirmer ou refuser en masse — les emails partent automatiquement — et convoquer tout le monde en une seule action. Les figurants voient enfin le statut de leur candidature en temps réel au lieu du silence. Gratuit pour les figurants, gratuit pour les productions pendant le lancement. »

**Différenciateurs clés (chacun mappé sur du code livré) :** 1) un pipeline complet, pas un tableau d'annonces (revue en masse + emails auto) ; 2) statut temps réel pour les talents (Supabase Realtime) ; 3) convocations groupées ; 4) covoiturage intégré = moins de no-shows ; 5) architecture RGPD-first (RLS, stack UE, pas de revente de données) ; 6) 100 % gratuit pour les figurants (posture anti-arnaque).

**Piliers de message :** *Gagnez vos journées* (temps gagné, face production) · *Zéro candidature fantôme* (transparence des statuts, face talents) · *Vos données restent en règle* (RGPD, face enterprise) · *Tout le monde arrive sur le plateau* (no-shows/covoiturage, faces des deux côtés).

**Signaux de confiance :** de vrais témoignages consentis (les faux ont été correctement retirés au Sprint 6 — obtenir 3 vraies citations des productions beta avant le lancement public) ; logos des premières productions ; « conforme RGPD — données hébergées dans l'UE » ; mentions légales complètes (actuellement un bloqueur de lancement) ; plus tard : une page sécurité publique décrivant le modèle RLS (la suite verify-rls la rend crédible).

**Personnalité de marque & ton :** le texte déjà en ligne a le bon registre — *terrain, concret, sans jargon* (« Le casting sauvage vous coûte des journées de production »). La voix d'un régisseur qui a vécu le chaos, pas d'un vendeur de tech. FR : « vous » professionnel, phrases courtes, vocabulaire de plateau (plateau, convocation, feuille de service). Ne jamais promettre des fonctionnalités qui ne sont pas en ligne (la discipline de la section « Bientôt » du codebase — la conserver).

---

# Phase 5 — Stratégie de prix

**Contexte issu du code :** la page tarifs promet un lancement gratuit + « tarifs annoncés avant toute facturation » ; Stripe est en Phase 2 ; les barrières du palier Pro sont déjà listées publiquement (feuilles de service PDF, signature électronique, recherche avancée). Honorer tout cela.

**Modèle : freemium côté production, par organisation (pas par siège — les équipes de production partagent leurs logins en pratique), mensuel avec flexibilité selon la saison de tournage. Figurants : gratuit pour toujours, contractuellement et haut et fort.**

| Palier | Prix (HTVA) | Qui | Barrières | Justification |
|---|---|---|---|---|
| **Figurant** | 0 € pour toujours | Talents | Tout le côté talents | Le côté offre doit être gratuit (confiance anti-arnaque ; les concurrents qui font payer les talents sont le levier) |
| **Découverte** (gratuit) | 0 € | ICP-3, essais | 1 projet actif, 2 castings ouverts, 30 candidats confirmés/mois, pas d'export de données | Garde le catalogue rempli (roue d'inertie) ; les plafonds correspondent à de vrais objets du schéma (`projects.status='open'`, compte de castings — trivialement applicables) |
| **Studio** | 79 €/mois ou 790 €/an | Producteurs solo ICP-1, petits tournages | Projets/castings illimités, convocations, export CSV, support prioritaire | Sous la ligne « pas besoin d'approbation » pour un directeur de production **[HYPOTHÈSE : tolérance SaaS PME belge 50–150 €]** ; ancré à ~25 % d'une journée d'agence de casting |
| **Production** | 199 €/mois | Cœur ICP-1, producteurs de fiction actifs | + feuilles de service PDF, signature électronique (DocuSeal), recherche avancée de figurants, historique des convocations, multi-utilisateur | Barrières = exactement le backlog Phase 2 déjà promis comme « Pro » sur la page tarifs en ligne ; 199 € ≈ 1–2 heures de coût d'un directeur de production |
| **Broadcast** (enterprise) | à partir de 500 €/mois, annuel | ICP-2 | + SSO, exports d'audit, pack DPA/RGPD, SLA, onboarding | Prix basé sur les attentes des achats, pas sur le coût ; ne pas construire avant qu'un acheteur niveau RTBF soit à la table |

**Séquencement :** rester 100 % gratuit jusqu'à ce que **le catalogue ait ~10 castings/mois actifs et que 3+ productions aient bouclé un cycle de tournage complet** sur la plateforme (déclenché par des métriques, pas par une date). Alors, offrir aux productions beta 12 mois gratuits sur Studio en droits acquis (ce sont vos témoignages) et activer Stripe pour les nouvelles inscriptions. Pendant la phase gratuite, afficher les futurs prix sur la page tarifs (« 0€ pendant le lancement, ensuite 79€ ») — ancre la valeur et pré-qualifie.

**Pourquoi pas de commission par réservation ?** Aucun rail de paiement n'existe dans le produit, la paie des figurants est une zone grise légale (§2.4), et les modèles à commission exigent une infrastructure de paiements (la voie Everyset) — un mouvement de Series A, pas de lancement.

---

# Phase 6 — Stratégie d'acquisition client

## Côté production (ICP-1/2/3) — mené par le fondateur, budget quasi nul

| Canal | Tactique | Coût est. | Conversion attendue | Difficulté | Délai de résultats |
|---|---|---|---|---|---|
| **Démarchage direct du fondateur** | Construire la liste des ~150 sociétés de production FR-BE (les line-ups de fonds Wallimage/screen.brussels/FWB sont publics) ; email/LinkedIn personnel aux régisseurs : « démo de 15 min, votre prochain tournage gratuit » | Temps uniquement | 30–40 % de réponses, 10–15 % → pilote actif (petite communauté, pitch pertinent) **[HYPOTHÈSE]** | Moyenne | 2–6 semaines |
| **Rebond sur les cycles de tournage** | Chaque appel à casting d'une production pilote est publié sur les pages publiques d'ONSET → proposer de co-rédiger le post Facebook pointant vers l'URL de casting ONSET | 0 € | Chaque tournage = 50–300 inscriptions figurants **[HYPOTHÈSE basée sur les volumes typiques d'appels à figurants]** | Faible | Immédiat par tournage |
| **Partenariats d'écosystème** | screen.brussels / Wallimage / Cluster TWIST / mediarte / film offices (Bruxelles, Liège, Wallonie) : se faire lister comme ressource locale ; offrir aux sociétés de leur portefeuille un palier gratuit étendu | 0 € | Indirect — crédibilité + deal flow | Moyenne | 1–3 mois |
| **Écoles de cinéma (IAD, INSAS, HELB)** | Gratuit pour toujours pour les productions étudiantes ; elles amorcent les castings + deviennent les régisseurs de demain | 0 € | Fort taux d'inscription, zéro revenu (à dessein) | Faible | 1 mois |
| **LinkedIn organique** | Posts du fondateur en FR : histoires de guerre de logistique de tournage, études de cas « comment nous avons casté 120 figurants en 48 h » | 0 € | Composition lente ; la communauté ciné BE y est présente mais petite | Faible | 3–6 mois |
| **Événements locaux** | FIFF Namur, BRIFF, Millenium, Mons ; ateliers mediarte — démos en marge des événements, pas de stand | 0–500 €/événement | 2–5 conversations qualifiées/événement | Faible | Par événement |
| **Démarchage à froid des tournages étrangers entrants** | Le Tax Shelter amène des productions FR/US/NL ayant besoin de figurants locaux vite ; les film offices connaissent le line-up — être la « solution figurants locale » qu'ils recommandent | Temps | Faible volume, forte valeur | Élevée | 3–6 mois |

**Canaux payants côté production : non.** L'univers atteignable est de ~150 sociétés ; un CAC LinkedIn Ads/Google Ads serait absurde face aux emails du fondateur. **CAC blended estimé pour une production payante : 200–600 € en équivalent-temps fondateur** — contre 950–2 400 € d'ACV en première année (paliers Studio/Production), soit un ratio sain de 3–5×.

## Côté figurants (offre) — SEO + rebond, petits coups payants

| Canal | Tactique | Coût est. | Notes |
|---|---|---|---|
| **SEO (déjà construit)** | Les pages publiques par casting + sitemap + JSON-LD sont en ligne ; ajouter 6–10 guides FR de plus (« casting figurant Bruxelles », « combien gagne un figurant en Belgique », « casting série RTBF », pages par ville). L'ensemble concurrentiel est techniquement faible — un top-3 sur les termes de tête sous 6–9 mois est réaliste | 0 € (temps de rédaction) | Le canal qui se compose ; chaque page de casting est du contenu frais indexable |
| **Groupes Facebook/Instagram** | Ne pas combattre les groupes — *s'en servir* : chaque vrai casting y est posté (par la production ou ONSET) avec le lien ONSET comme seul moyen de postuler | 0 € | Le funnel de candidature convertit les membres des groupes en comptes |
| **Meta Ads (chirurgical)** | Uniquement quand un gros tournage doit se remplir vite : géociblé (ville ±30 km) « Figurants recherchés pour [production] » → page de casting | 100–300 €/casting ; CPL 0,5–2 € **[HYPOTHÈSE]** | À revendre plus tard aux productions comme fonctionnalité « boost » payante |
| **Bouche-à-oreille / covoiturage** | Le covoiturage est intrinsèquement social ; les emails de statut portent la marque auprès de chaque candidat | 0 € | Emails de refus avec CTA « voir d'autres castings » = boucle de rétention |

**Reddit :** négligeable pour les figurants BE (la communauté vit sur Facebook) ; à ignorer. **Google Ads :** à retenir jusqu'au plateau SEO ; les volumes de recherche sur « casting figurant belgique » sont de quelques centaines/mois **[HYPOTHÈSE]** — le SEO peut se les approprier gratuitement.

---

# Phase 7 — Feuille de route marketing

## Mois 1 — Devenir légalement et techniquement lançable
- **Objectifs :** apurer la checklist pré-lancement (elle est déjà écrite dans PROGRESS.md) ; recruter 3 productions design partners.
- **Actions :** mentions légales + politique de confidentialité (engager un avocat ou utiliser les ressources juridiques PME de la FWB/hub.brussels) ; env vars Vercel + vérification du domaine Resend (sans elle, **aucun utilisateur ne reçoit aucun email** — bloqueur dur) ; allowlist des redirects Supabase ; passe Lighthouse + test PWA sur appareil réel ; livrer les tests e2e du Sprint 7 ; durcir la policy RLS de parcours de tous les figurants ou ajouter la vérification des comptes production (avant toute plainte RGPD, bon marché maintenant) ; vague de démarchage n°1 du fondateur (30 sociétés).
- **KPI :** checklist à 100 % ; 3 productions pilotes signées ; 0 → 1 vrai casting en ligne.
- **Résultat attendu :** beta privée qui tourne avec de vrais tournages.

## Mois 2–3 — Beta privée, prouver la boucle
- **Objectifs :** 3–5 cycles de tournage complets (publier → postuler → confirmer → convoquer → jour de tournage) sur la plateforme.
- **Actions :** accompagnement en gants blancs de chaque pilote (le fondateur fait la saisie si nécessaire) ; rebond de chaque casting dans les groupes Facebook ; collecter 3 témoignages consentis + 1 étude de cas écrite avec des chiffres (« X heures gagnées, Y % de no-show ») ; publier 4 guides SEO ; démarrer la cadence LinkedIn du fondateur (1/semaine) ; corriger le top 3 des frictions rencontrées par les pilotes (attendu : export CSV, notification des nouveaux castings, confirmation de convocation).
- **KPI :** 5 productions actives ; 500–1 500 figurants ; ≥60 % des candidatures revues sous 72 h (la promesse de transparence, mesurable dans `reviewed_at`) ; 3 témoignages.
- **Résultat attendu :** étude de cas prouvable ; les témoignages remplacent la section placeholder « Pensé pour le terrain » (tracké dans la checklist).

## Mois 4–6 — Lancement public (francophone)
- **Objectifs :** visibilité de catégorie en Belgique FR ; 15 productions actives ; 3 000 figurants.
- **Actions :** lancement public (voir Phase 8) ; poussée presse (Cineuropa, pages tech-culture du Soir/L'Echo, RTBF Vivacité régional, newsletter mediarte) ; présence événementielle (calage BRIFF/FIFF) ; 6 pages SEO de plus dont par-ville ; partenariats formalisés (listing ressource screen.brussels) ; démarrer les conversations ICP-2 (coordinateurs RTBF) ; livrer la clé de voûte de la rétention : **alertes email de nouveaux castings pour les figurants** (le codebase a l'infra email ; c'est la fonctionnalité manquante au plus fort levier).
- **KPI :** 15 productions avec ≥1 casting publié ; 3 000 figurants ; 20+ castings/mois ; top-10 organique sur « casting figurant belgique » ; taux d'ouverture des alertes email >35 %.
- **Résultat attendu :** le réflexe par défaut du casting de figurants en self-service en Belgique FR.

## Mois 6–12 — Monétiser + décider l'expansion
- **Objectifs :** activer la facturation ; 2–5 K€ de MRR ; décision d'expansion (Belgique NL vs Nord de la France).
- **Actions :** intégration Stripe + barrières de paliers (le ticket Phase 2 existe dans CLAUDE.md) ; construire les deux fonctionnalités de palier payant à la plus forte disposition à payer d'après les retours beta (pari : feuilles de service PDF + recherche avancée — toutes deux déjà promises sur la page tarifs en ligne) ; droits acquis pour les betas ; pilote ICP-2 avec une entité de diffuseur ; si le NL est choisi : rétrofit next-intl (budgéter 3–4 semaines — chaque chaîne UI est en dur, report du Sprint 2) + cluster SEO NL + démarchage VAF/mediarte NL ; si la France : commission du film Lille/Hauts-de-France + le corridor de coproduction wallon.
- **KPI :** 8–15 payants ; MRR 2–5 K€ ; gratuit→payant ≥25 % des productions actives **[HYPOTHÈSE : élevé parce que les plafonds du palier gratuit mordent exactement à l'échelle d'un vrai tournage]** ; churn de logos <10 %/trimestre ; 6 000 figurants.

---

# Phase 8 — Stratégie de lancement

- **Pré-lancement (maintenant) :** compléter la checklist ; capture de liste d'attente sur le « Être prévenu du lancement » en mailto de la page tarifs → le remplacer par un vrai formulaire (le mailto fait fuir les conversions — voir Phase 9) ; amorcer 10 castings via les pilotes pour que les visiteurs du jour du lancement ne voient jamais un catalogue vide (la leçon « les données seed masquent le vide » des revues de sprint, appliquée au marketing).
- **Beta (M2–3) :** 3–5 productions, gants blancs, privée. Critères de sortie = les KPI M2–3 de la Phase 7, pas une date.
- **Early adopters :** offre « Membre fondateur » — 12 mois gratuits sur Studio + logo sur le site + voix au chapitre sur la roadmap. Rare (10 places), explicite, par écrit.
- **Lancement public (M4–6) :** l'ancrer sur une **histoire de tournage phare** (« La production X a casté 150 figurants pour [série] sur ONSET en 72 h ») — pas sur le produit. Dossier de presse en FR avec les chiffres de l'étude de cas.
- **Presse :** angle belge = la tech locale répare l'industrie locale + le crochet Tax Shelter. Cibles : Cineuropa (couvre déjà la production BE), pages startups de L'Echo/De Tijd, culture-tech du Soir, RTBF/BX1 régional, newsletters mediarte + Wallimage, Cinevox. Une exclusivité d'abord (L'Echo), puis large.
- **Écosystème startup belge :** hub.brussels, événements Startups.be/Scale-ups.eu, communauté BeTech, Digital Wallonia — utiles pour la crédibilité et les recrutements, **pas** pour les clients (les régisseurs ne vont pas aux événements startup). Prioriser l'écosystème *cinéma* sur l'écosystème *tech* à 4 contre 1.
- **Product Hunt :** à sauter au lancement — l'acheteur n'y est pas et un outil B2B local BE en français y fera un flop par construction ; à reconsidérer seulement si/quand le produit devient multi-pays en EN.
- **Programme de parrainage :** parrainage production→production = 2 mois gratuits des deux côtés (la communauté est soudée ; formaliser ce qui arrivera de toute façon). Le parrainage côté figurant est inutile — les appels à casting eux-mêmes sont le moteur de recommandation — et payer pour des parrainages côté offre attire les faux profils.
- **Influenceurs :** micro, pas macro — 3–5 créateurs TikTok/Instagram BE « vie de figurant » **[HYPOTHÈSE : ils existent à 5–50 K abonnés ; à vérifier]** faisant du contenu « comment je trouve des castings », payés en accès anticipé + petits cachets ; plus un régisseur respecté comme design partner public (son endossement fait bouger le marché B2B plus que n'importe quelle pub).
- **Partenariats (phase de lancement) :** film offices (Bruxelles, Liège, clusters wallons) pour la recommandation des tournages entrants ; mediarte pour du co-marketing de contenus de formation ; SBK/agences de paie (Amplo) plus tard — elles touchent chaque figurant payé légalement et pourraient devenir un partenaire de distribution *et* de produit en Phase 3.

---

# Phase 9 — Améliorations produit (Impact × Effort)

## À construire d'abord (fort impact / effort faible–moyen)
1. **Alertes de nouveaux castings pour les figurants** (digest email par correspondance ville/âge) — la clé de voûte de la rétention ; l'infra existe (Resend, les schémas ont ville/âge) ; sans elle, les figurants visitent une fois et oublient. *Impact 5/5, Effort M.*
2. **Tests du Sprint 7 (#49–#53)** — trois specs Playwright sont déjà cadrées avec les scénarios de régression de chaque bug corrigé ; vous êtes à un refactor de re-casser « les productions ne peuvent pas publier ». *Impact 4/5 (assurance vélocité), Effort M.*
3. **Formulaire de liste d'attente/contact remplaçant `mailto:contact@onset.app`** (présent sur le hero B2B, les tarifs, le footer) — le mailto perd chaque visiteur mobile sans client mail et ne capture aucune analytics. *Impact 3/5, Effort S.*
4. **Confirmation de convocation « Je serai présent » + historique des convocations** — ferme la boucle no-show, rend la fonctionnalité phare auditable (l'historique est déjà un backlog acté). *Impact 4/5, Effort M.*
5. **Export CSV des candidats confirmés** — les productions vivent dans Excel ; les rejoindre à mi-chemin ; aussi la barrière gratuit/payant naturelle. *Impact 4/5, Effort S.*
6. **Vérification des comptes production (approbation manuelle à l'inscription) + restriction de `profiles_select_figurants_by_staff` aux productions avec ≥1 casting publié ou aux seuls candidats** — ferme l'exposition RGPD actée et le vecteur faux-casting d'un seul mouvement. *Impact 4/5 (neutralisation de risque), Effort S–M.*
7. **Jauge de complétude de profil + checklist d'onboarding post-inscription pour les figurants** — les profils incomplets ne valent rien pour les productions ; rien ne pousse actuellement à la complétion. *Impact 3/5, Effort S.*

## À reporter (gros effort ou prématuré)
- **i18n/NL** — 3–4 semaines d'extraction de chaînes ; à faire uniquement sur la décision explicite d'aller en Flandre (M6+). Le faire « pour le lancement » retarderait d'un mois l'apprentissage revenu pour un marché que vous ne pouvez pas encore servir avec de l'attention commerciale.
- **Facturation Stripe** — jusqu'au déclencheur métrique (Phase 5) ; construire la facturation avant un signal de disposition à payer est du gaspillage classique.
- **Notifications push** — les alertes email d'abord (plus simples, mesurables) ; le push est un multiplicateur de Phase 2 une fois le contenu des alertes prouvé.
- **Contrats/signature électronique, feuilles de service** — à construire comme fonctionnalités de *lancement du palier payant* (M6–9), avec un design partner engagé à payer.
- **Back-office admin** — le fondateur peut utiliser Supabase Studio pendant des mois ; à construire quand le volume de support l'exige.
- **Pagination + recherche avancée** — la décision actée « échelle lancement OK » est correcte ; à planifier quand figurants >2 000.

## À retirer / dé-prioriser
- **Rien de significatif.** Le codebase est inhabituellement exempt de fonctionnalités spéculatives (le scaffold blog déjà supprimé au Sprint 6). Garder la discipline. Candidat à la rétrogradation si les données le contredisent : les types de rôle `acteur`/`doublure` dans `roleTypes` — si 95 % des castings sont `figurant`, masquer le sélecteur simplifie le formulaire (mesurer via PostHog d'abord).

## Dette technique à traiter
- Vérification du domaine Resend (M1, bloquant — pas d'emails sinon) ; rôle dans les claims JWT (backlog acté — à faire quand le trafic rend visible la requête de rôle par requête dans la latence) ; le piège `db:push`-supprime-la-RLS (mitigé par le script, mais passer à un flux basé migrations (`drizzle-kit generate`) avant qu'il y ait des données de production non re-provisionnables) ; un second fournisseur d'email en fallback pour les convocations (critiques pour le tournage) — plus tard.

## Opportunités de revenu & rétention au-delà des paliers
- **« Boost » de casting** (la tactique Meta-ads-as-a-service, Phase 6) — 50–150 € one-shot par casting, sans abonnement : monétise ICP-3 sans casser le palier gratuit.
- **Cross-sell dans l'email de refus** (« 3 autres castings près de chez vous ») — transforme l'email au plus fort volume (les refus) en canal de rétention. L'infra existe intégralement.

---

# Phase 10 — Risques & mitigations

| Risque | Sévérité | Preuve / Mitigation |
|---|---|---|
| **Cold-start : un catalogue vide tue la rétention des figurants** | Élevée | Les propres revues du produit ont montré que le seed masquait le vide. Mitiger : ne jamais faire de marketing figurants avant d'avoir des castings ; séquencement pilotes-d'abord (Phase 7) ; posts de rebond par tournage. |
| **Incident ou plainte RGPD** (accès ouvert aux profils, bucket avatars public, mineurs 16+) | Élevée | Les deux expositions sont *actées dans les revues de sprint comme acceptées-pour-plus-tard* — les rendre « maintenant » : vérification production + durcissement des policies (Phase 9 n°6), politique de confidentialité (checklist), modèle de DPA pour ICP-2. Le coût se compte en jours ; une plainte APD serait existentielle. |
| **Zéro test automatisé en pleine itération post-lancement** | Moyenne-élevée | Chaque régression passée a été attrapée par des passes de revue manuelle qui n'auront pas lieu chaque semaine après le lancement. Livrer le Sprint 7 en M1. |
| **Défaillance de délivrabilité email à un moment critique pour le tournage** | Moyenne-élevée | `RESEND_FROM` actuellement non défini ⇒ non-envoi silencieux (bruyant seulement dans Sentry). Vérifier le domaine en M1 ; remonter le statut de délivrance dans l'UI de convocation ; envisager un fallback SMS pour les convocations plus tard (le SMS BE est bon marché, le critique-tournage le justifie). |
| **Inertie Facebook : les productions postent quand même dans les groupes** | Moyenne | Ne pas lutter — la tactique de rebond fait de Facebook le haut du funnel d'ONSET. Le levier, c'est ce que Facebook ne peut pas faire : pipeline, emails en masse, RGPD. |
| **Un concurrent (becasting, figurants.com) ajoute de l'outillage production** | Moyenne | Leur modèle économique (facturer/servir les talents) entre en conflit avec un positionnement offre-gratuite ; la douve d'ONSET = profondeur du workflow production + confiance locale BE + pages SEO par casting. La vitesse est la vraie défense : posséder les ~150 relations de production FR-BE avant que quiconque ne réagisse. |
| **Piège bilingue : un concurrent NL consolide la Flandre d'abord** (figuratie.be/In The Picture est déjà nativement NL) | Moyenne | Assumer explicitement le pari FR-d'abord ; garder le rétrofit NL cadré (3–4 sem.) et le déclencher sur des preuves (demande NL entrante, conversations VAF) plutôt que sur la peur. |
| **Les régisseurs sont freelances & saisonniers → churn d'abonnement entre les tournages** | Moyenne | Facturer par organisation (société de production), pas par tournage ; remise annuelle ; « mode pause » au lieu d'annuler ; le Boost à l'usage comme revenu anti-churn. |
| **La zone grise légale de la paie des figurants dérive sur la plateforme** (les utilisateurs traitent ONSET comme employeur/intermédiaire) | Faible-moyenne | Rester hors des flux d'argent ; les CGU stipulent qu'ONSET est un outil de mise en relation ; la FAQ pointe vers les partenaires SBK/paie (aussi un canal de partenariat). |
| **Facteur bus du fondateur solo & charge de support** **[HYPOTHÈSE : solo, vu le style mono-committer de l'historique git]** | Moyenne | Gants blancs uniquement pendant la beta ; livrer un onboarding self-service avant le lancement public ; outillage admin différé mais runbooks documentés. |

---

# Phase 11 — Plan d'action (ordonné par ROI)

| # | Tâche | Priorité | Impact | Effort | Dépend de | Métrique de succès | Livrable |
|---|---|---|---|---|---|---|---|
| 1 | Apurer la checklist pré-lancement : domaine Resend + `RESEND_FROM`, `NEXT_PUBLIC_APP_URL`, allowlist auth, mentions légales, politique de confidentialité | P0 | Débloque tout | S (jours + avocat) | — | Checklist à 100 % ; vrai email délivré à une adresse non-propriétaire | Site conforme en ligne |
| 2 | Durcissement RGPD : vérification production + resserrement de `profiles_select_figurants_by_staff` ; revisiter le bucket avatars public | P0 | Neutralise le premier risque légal | S–M | — | Assertions verify-rls étendues ; une production non vérifiée ne voit aucune coordonnée | Migration + policy + flux d'inscription |
| 3 | Vague de démarchage du fondateur (30 sociétés de production FR-BE) → 3 design partners | P0 | Le chemin vers le revenu démarre | M (2 sem.) | 1 | 3 pilotes engagés, 1 casting en ligne | Accords pilotes, CRM de liste cible |
| 4 | Remplacer les CTA mailto par un formulaire de contact/liste d'attente tracké | P1 | Capture du funnel | S | — | 100 % de l'intérêt B2B capturé avec source | Formulaire + événements PostHog |
| 5 | Sprint 7 : Vitest + 3 specs e2e Playwright (#49–#53) | P1 | Assurance vélocité | M (1–2 sem.) | — | CI verte incl. e2e ; scénarios de régression des revues encodés | Suite `tests/` en CI |
| 6 | Alertes email de nouveaux castings pour figurants (correspondance ville/âge) | P1 | Levier de rétention n°1 | M (1–2 sem.) | 1 | Taux d'ouverture ≥35 % ; rétention figurants S4 +50 % vs baseline | Job d'alertes + toggle de préférence |
| 7 | Cycles de tournage beta ×3–5 avec posts Facebook de rebond par casting | P1 | Preuve + roue d'inertie de l'offre | M (continu M2–3) | 3 | 5 cycles bouclés ; 1 000 figurants ; 3 témoignages consentis | Étude de cas avec chiffres d'heures gagnées |
| 8 | Expansion SEO : 6–10 guides FR + pages par ville sur la stack existante | P1 | Acquisition gratuite qui se compose | M (rédaction) | 1 | Top-10 « casting figurant belgique » d'ici M6 ; 500 visites organiques/mois | Pages publiées, suivi GSC |
| 9 | Export CSV + confirmation & historique de convocation | P2 | Rétention beta + préparation des barrières payantes | M | 3 (retours) | Utilisé par ≥3 pilotes ; taux de no-show mesuré | Fonctionnalités livrées |
| 10 | Lancement public : témoignages sur la landing, dossier de presse, histoire de tournage phare, partenariats écosystème cinéma | P2 | Visibilité de catégorie | M (M4–6) | 7 | 15 productions actives ; 20 castings/mois ; 2 retombées presse | Campagne de lancement |
| 11 | Stripe + barrières de paliers (Studio 79 € / Production 199 €), droits acquis pour les betas | P2 | Revenu | M–L (2–3 sem.) | 7, 9, déclencheur métrique | 2 K€ MRR d'ici M9 ; ≥25 % gratuit→payant parmi les productions actives | Facturation en ligne |
| 12 | Fonctionnalités de palier payant : feuilles de service PDF, recherche avancée (déjà promises sur la page tarifs) | P3 | Revenu d'expansion | L | 11 + design partner | ≥50 % des payants sur le palier Production | Fonctionnalités Phase 2 |
| 13 | Décision d'expansion : rétrofit NL (next-intl, 3–4 sem.) vs Nord de la France | P3 | Marché suivant | L | 11 + 12 mois de données | Mémo de décision avec preuves de pipeline | Build i18n ou plan GTM FR-FR |

**Points de décision :** après le n°7 (M3) : si <3 productions bouclent un cycle ou si la qualité de présence des figurants est mauvaise, pivoter le positionnement vers le casting de formats récurrents ICP-2 avant de dépenser sur le lancement public. Après le n°11 (M9) : si gratuit→payant <10 %, revisiter la monétisation (modèle Boost-only) avant l'expansion.

---

## Évaluation finale

Le codebase raconte une histoire rare : le produit est *plus* prêt que le business qui l'entoure. La discipline d'ingénierie (suite d'assertions RLS, textes honnêtes, culture de revue) est en soi un actif commercialisable pour un marché sensible au RGPD et pauvre en confiance. Les trois mouvements qui comptent le plus dans les 90 prochains jours ne sont pas des fonctionnalités : **(1)** apurer les bloqueurs légaux/email déjà listés dans PROGRESS.md, **(2)** fermer l'exposition RGPD actée avant que de vraies données de figurants ne s'accumulent, et **(3)** faire passer trois vraies productions par un cycle de tournage complet et transformer leurs chiffres en histoire de lancement. Tout le reste — paliers de prix, Flandre, France, feuilles de service — est en aval de ces trois-là.

**Sources :** [SPF Finances — Tax Shelter](https://finance.belgium.be/en/enterprises/corporation-tax/tax-benefits/tax-shelter-audiovisual-production) · [Cineuropa — Tax shelter belge](https://cineuropa.org/en/newsdetail/219784) · [Lexgo — Réforme du Tax Shelter](https://www.lexgo.be/en/news-and-articles/2458-the-tax-shelter-for-audiovisual-productions-in-belgium-a-successful-tool-under-reform) · [Screen Flanders — Tax Shelter](https://www.screenflanders.be/en/financing/other-funds-incentives/tax-shelter) · [Mbrella Films — Incitants Belgique](https://mbrellafilms.com/incentives/belgium/) · [becasting.be](https://www.becasting.be/) · [figurants.com — Belgique](https://figurants.com/region/belgique/) · [castprod.com](https://castprod.com/) · [figuratie.be](https://figuratie.be/) · [figuranten-gezocht.be](https://www.figuranten-gezocht.be/) · [NK Casting](https://nkcasting.be/) · [Smiling Agency](https://smiling.agency/casting-belgique/) · [Sortlist — agences de casting BE](https://www.sortlist.be/fr/s/casting/belgique-be) · [VRT figuratie](https://www.vrt.be/heb-je-een-vraag/s/article/Ik-wil-graag-figureren-in-een-programma-van-VRT) · [Everyset](https://everyset.com/) · [Hollywood Reporter — Everyset](https://www.hollywoodreporter.com/business/business-news/extras-work-jobs-everyset-data-payroll-1236393829/)
