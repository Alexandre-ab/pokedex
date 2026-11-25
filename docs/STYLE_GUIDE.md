# Guide de style — Vitrine « Lentille » du Pokédex

> Statut : **validé par l'humain le 25/11/2026**. Pile retenue : `ogl` (shader GLSL de la lentille) + `motion` (déjà installé) + `lenis` (défilement doux, installé à l'étape 2). Placement retenu : vitrine + catalogue des 1 025 sur `/`, avec l'ancre `/#catalogue`.
> Mise en œuvre : étape 1 (fondations CSS/polices + hero « Lentille ») faite ; manifeste, frise, panthéon et `lenis` aux étapes suivantes.
> Date : 25/11/2026. Branche : `feat/pokedex-vitrine-cinetique`.
> Références observées au navigateur (1440×900) : `landonorris.com` + 3 sites Off+Brand / Awwwards SOTD.
> Captures : `research/screenshots/01` à `06` (voir la section 9 pour leurs limites).

| Capture | Site | Ce qu'on en retient |
|---|---|---|
| `01-landonorris-hero.png` | landonorris.com, hero | Sujet central plein cadre, casque en filaire révélé par le shader au curseur, chrome d'angle minimal, micro-carte encadrée en bas à gauche |
| `02-landonorris-manifesto.png` | landonorris.com, manifeste | Titre capitales serrées sur 5 lignes, un seul mot en serif évasée de couleur (`LEGACY`), fond sombre olive |
| `03-landonorris-helmets-hall.png` | landonorris.com, Hall of Fame | Grille en quinconce, cartes au filet de 1 px à encoche biseautée, légende titre + année |
| `04-itsoffbrand.png` | itsoffbrand.com | Orbe WebGL central, typographie monumentale en `mix-blend-mode: difference` |
| `05-trevornoah.png` | trevornoah.com | Titre géant **derrière** le sujet détouré : profondeur immédiate |
| `06-steven.png` | steven.com | Cadran rotatif central, titre ancré en bas à gauche, micro-télémétrie |

**Concept retenu, en une phrase :** la page d'accueil devient une *lentille d'observation*. Le hero montre un spécimen emblématique en illustration officielle ; sous le curseur, une lentille au bord organique révèle sa **variante chromatique** (l'illustration « shiny » de PokéAPI, même pose au pixel près). La vitrine raconte ensuite le Pokédex avec ses **vraies données** (nuancier des 18 types, frise des 9 générations, records), puis rend la main au **catalogue complet des 1 025 Pokémon**, inchangé.

Pourquoi la variante chromatique : sur landonorris.com, la révélation au curseur marche parce que les deux états (visage / casque filaire) sont **parfaitement superposés** (capture 01). Les illustrations normale et chromatique de PokéAPI partagent exactement la même pose et le même cadrage : c'est la seule paire de données du projet qui permet cette superposition sans retouche, et elle a un sens pour un fan (la chasse aux chromatiques).

---

## 1. Principes du style

1. **Le spécimen d'abord** : chaque section met en scène une illustration officielle ou une donnée PokéAPI réelle, jamais une décoration gratuite.
2. **Un seul moment spectaculaire** : la lentille chromatique du hero concentre l'effet lourd (WebGL) ; tout le reste se contente de transformations CSS et de défilement lié au scroll.
3. **La structure dit le vrai** : la numérotation n'apparaît que là où l'ordre a un sens (générations I → IX, numéros `#0006`), et chaque chiffre affiché vient des données.
4. **Profondeur par alternance** : on passe du papier clair à la nuit puis à l'abysse, et retour au papier pour le catalogue ; le contraste des surfaces remplace les quadrillages (interdits par la direction « design doux »).
5. **Typographie qui met en scène** : capitales condensées et serrées pour la voix, un seul mot par titre en serif italique « molle » et colorée pour l'émotion.
6. **Douceur ergonomique conservée** : rayons généreux, ombres douces, cibles de 44 px, lecture rapide ; la vitrine est spectaculaire sans être hostile.
7. **Tout effet a une sortie** : chaque animation a une version mobile et une version `prefers-reduced-motion: reduce` qui garde 100 % du contenu.
8. **Le Pokédex reste un outil** : le catalogue filtrable est à un clic (lien d'évitement, bouton du hero, lien « Index ») et n'hérite d'aucun effet lourd.

---

## 2. Palette

### 2.1 Couleurs de la vitrine

On **réutilise les tokens existants** de `app/globals.css` (papier, encre, vermillon) et on ajoute seulement 4 surfaces/encres sombres propres à la vitrine. Pas de vert citron ni d'olive (identité de landonorris.com).

| Token proposé | Clair (`:root`) | Sombre (`.dark`) | Rôle |
|---|---|---|---|
| `--paper` (existant) | `#F7F6F3` | `#111215` | Hero, frise des générations, catalogue |
| `--ink` (existant) | `#18181B` | `#F3F4F6` | Texte principal sur papier |
| `--muted-foreground` (existant) | `#5F6068` | `#A1A6B0` | Légendes sur papier |
| `--vermilion` (existant) | `#D62839` | `#FF5A6E` | Accent unique : CTA, mot-clé serif sur fond clair, anneau de focus |
| `--vitrine-nuit` (nouveau) | `#14161F` | `#1A1D27` | Manifeste + nuancier des types (bleu-charbon d'encre, nuit de capture) |
| `--vitrine-abysse` (nouveau) | `#0B0C10` | `#07080B` | Panthéon des records (la surface la plus profonde de la page) |
| `--vitrine-os` (nouveau) | `#E7E3D8` | `#F3F4F6` | Texte sur nuit / abysse (os chaud, pas de blanc pur) |
| `--vitrine-brume` (nouveau) | `#9A9FAB` | `#A1A6B0` | Légendes, micro-étiquettes mono sur fond sombre |
| `--vitrine-filet` (nouveau) | `#5D6270` | `#5D6270` | Contour des cartes à œillet sur l'abysse |

En mode sombre, l'alternance « clair ↔ sombre » devient une alternance de **profondeur** : papier `#111215` → nuit relevée `#1A1D27` → abysse `#07080B` → papier. Le rythme reste lisible sans aucun flash blanc.

### 2.2 Contrastes vérifiés (formule WCAG 2.x, calculés le 25/11/2026)

Seuils : **≥ 4,5:1** pour le texte courant, **≥ 3:1** pour le grand texte (≥ 24 px, ou ≥ 18,66 px gras), les composants d'interface et le focus.

| Paire (texte / fond) | Ratio | Verdict |
|---|---|---|
| `#18181B` / `#F7F6F3` | 16,39 | Texte ✅ |
| `#5F6068` / `#F7F6F3` | 5,78 | Texte ✅ |
| `#D62839` / `#F7F6F3` | 4,60 | Texte ✅ (mot-clé, liens) |
| `#FFFFFF` / `#D62839` | 4,97 | Texte du CTA ✅ |
| `#D62839` / `#FFFFFF` | 4,97 | Focus sur carte blanche ✅ |
| `#E7E3D8` / `#14161F` (nuit) | 14,07 | Texte ✅ |
| `#9A9FAB` / `#14161F` | 6,80 | Texte ✅ |
| `#FF5A6E` / `#14161F` | 5,96 | Texte + focus ✅ |
| `#E7E3D8` / `#0B0C10` (abysse) | 15,24 | Texte ✅ |
| `#9A9FAB` / `#0B0C10` | 7,37 | Texte ✅ |
| `#FF5A6E` / `#0B0C10` | 6,46 | Texte + focus ✅ |
| `#5D6270` / `#0B0C10` | 3,21 | Contour de carte (UI) ✅ |
| `#F3F4F6` / `#1A1D27` (nuit, sombre) | 15,28 | Texte ✅ |
| `#A1A6B0` / `#1A1D27` | 6,88 | Texte ✅ |
| `#FF5A6E` / `#1A1D27` | 5,56 | Texte + focus ✅ |
| `#F3F4F6` / `#07080B` (abysse, sombre) | 18,20 | Texte ✅ |
| `#FF5A6E` / `#07080B` | 6,62 | Texte + focus ✅ |

**Interdits mesurés** (à ne jamais utiliser pour du texte ni pour un focus) :

- `#D62839` sur `#14161F` = 3,63 et sur `#0B0C10` = 3,93 → sur fond sombre, l'accent est **toujours** `#FF5A6E`.
- `#5D6270` sur `#14161F` = 2,96 → sur la nuit, les filets sont décoratifs uniquement (jamais seul indicateur d'état).
- `#CFCCC4` (`--rule-strong`) sur `#F7F6F3` = 1,48 → filet décoratif uniquement.

### 2.3 Cohabitation avec les 18 couleurs `--type-*`

Les 18 types restent la **seule source** de couleur des types (`app/globals.css`, contrat testé dans `tests/refonte.test.js`). La vitrine les utilise de trois façons, et seulement trois :

1. **Aura** (décoratif, sans exigence de contraste) : dégradé radial CSS derrière le spécimen du hero, `color-mix(in oklab, var(--type-fire) 22%, transparent)`. La couleur suit le type principal du spécimen affiché.
2. **Pastilles** (texte) : toujours le couple `--type-x` en fond + `--type-x-foreground` en texte, déjà validé ≥ 4,5:1 dans les deux thèmes.
3. **Texte coloré sur fond sombre** (chiffres des records, segments du nuancier) : variantes `.dark` des types sur l'abysse `#0B0C10`. Mesures : 16 types ≥ 4,5:1 (de 4,62 pour Spectre à 15,28 pour Glace). Exceptions :
   - **Spectre** `#8B5CF6` = 4,62 sur l'abysse mais 4,26 sur la nuit → sur la nuit, grand texte uniquement.
   - **Ténèbres** `#6B6B76` = 3,71 / 3,43 → jamais en texte ; segment de graphique uniquement, avec étiquette en `--vitrine-os`.

Sur le papier clair, **aucune** couleur de type n'est utilisée en texte : 12 des 18 variantes claires sont sous 4,5:1 sur `#F7F6F3` (Électrik 1,42, Glace 1,34, Fée 1,75…).

Pour lire une variante `.dark` à l'intérieur d'une section sombre alors que le site est en thème clair, la section sombre porte la classe `dark` (`<section className="dark ...">`) : la variante `@custom-variant dark (&:is(.dark *))` déjà déclarée applique alors les valeurs sombres de tous les tokens à l'intérieur, sans dupliquer une seule couleur.

---

## 3. Typographie

Toutes les polices sont **libres (SIL OFL)** et chargées par `next/font/google` (auto-hébergées au build, aucune requête vers Google côté visiteur). Disponibilité et axes vérifiés dans `node_modules/next/dist/compiled/@next/font/dist/google/font-data.json`.

| Rôle | Police | Déjà chargée ? | Réglages |
|---|---|---|---|
| Voix monumentale (titres en capitales) | **Bricolage Grotesque** | Oui (`--font-display`) | Ajouter l'axe `wdth` : `axes: ["opsz", "wdth"]` ; usage `wdth 75`, `wght 800`, capitales |
| Mot-clé mis en scène (1 par titre) | **Fraunces** italique | **Non, seule police ajoutée** | Variable, `style: ["italic"]`, `axes: ["SOFT", "WONK", "opsz"]` ; usage `SOFT 100`, `WONK 1`, `wght 500` |
| Interface et texte courant | **Instrument Sans** | Oui (`--font-sans`) | Inchangé |
| Numéros `#0025`, compteurs, micro-étiquettes | **JetBrains Mono** | Oui (`--font-mono`) | `tabular-nums slashed-zero` (utilitaire `text-index` existant) |

**Pourquoi pas Mona Sans** (elle existe sur Google Fonts, `wdth 75–125`) : c'est la police de landonorris.com. La reprendre copierait l'identité ; Bricolage Grotesque en largeur 75 donne des capitales condensées tout aussi serrées, avec des terminaisons plus rondes qui collent au « design doux », **sans ajouter de police**.

**Pourquoi Fraunces plutôt qu'Instrument Serif** : landonorris.com mélange une serif évasée (Brier) dans ses titres (capture 02). Fraunces en `SOFT 100` + `WONK 1` donne une italique aux empattements arrondis et légèrement « bancale », plus ludique et plus Pokémon. Ses axes permettent aussi une micro-animation propre (voir A4, section 5). Instrument Serif n'a qu'une graisse et aucun axe.

Variable proposée : `--font-accent` (Fraunces), exposée dans `@theme inline` comme `--font-accent: var(--font-accent)`, classe Tailwind `font-accent`.

### Échelle responsive

| Token | Valeur | Police / réglage | Usage |
|---|---|---|---|
| `--text-monument` | `clamp(6rem, 2rem + 17vw, 17rem)` (utilitaire `chiffre-monument`) | Bricolage, `wdth 75`, `wght 800`, `line-height: 0.86`, `letter-spacing: -0.035em`, capitales | Numéro géant derrière le spécimen (`0006`) |
| `--text-impact` | `clamp(2.5rem, 1.2rem + 5.4vw, 6.75rem)` (utilitaire `titre-impact`) | Bricolage, `wdth 75`, `wght 800`, `lh 0.88`, `ls -0.03em`, capitales | Titre du hero, titre du manifeste |
| `--text-h2` | `clamp(2rem, 1.2rem + 3.4vw, 4.5rem)` | Bricolage, `wdth 80`, `wght 750`, `lh 0.92`, `ls -0.02em`, capitales | Titres de section |
| `--text-keyword` | `1.06em` (relatif au titre) | Fraunces italique, `SOFT 100`, `WONK 1`, `wght 500`, `ls -0.01em`, **casse normale** | Le mot mis en scène, couleur `--vermilion` (clair) / `#FF5A6E` (sombre) |
| `--text-lead` | `clamp(1.125rem, 1rem + 0.5vw, 1.375rem)` | Instrument Sans 400, `lh 1.5` | Chapeaux, phrases du manifeste |
| `--text-body` | `1rem` | Instrument Sans 400, `lh 1.6` | Texte courant |
| `--text-record` | `clamp(2.5rem, 1.5rem + 4vw, 5rem)` | JetBrains Mono 700, `tabular-nums`, `ls -0.04em` | Valeurs des records (`255`, `999,9 kg`) |
| `--text-micro` | `0.75rem` | JetBrains Mono 500, `ls 0.04em`, capitales | Micro-étiquettes (`GÉN. III`, `#0384`) |

Le mot-clé est légèrement plus grand (`1.06em`) que les capitales qui l'entourent : à hauteur d'x égale, une italique en casse normale paraît plus petite que des capitales (même logique que `97.5px` contre `93.3px` mesurés sur landonorris.com).

Règles : au plus **un** mot en Fraunces par titre ; jamais de paragraphe en capitales ; `text-wrap: balance` sur les titres et `text-wrap: pretty` sur les paragraphes ; pas de texte de plus de 70 caractères par ligne.

---

## 4. Espacements, grille et rythme des sections

### 4.1 Échelle d'espacement

Base de 4 px (échelle Tailwind). Tokens de rythme :

| Token | Valeur | Usage |
|---|---|---|
| `--gutter` | `clamp(1rem, 0.5rem + 2vw, 2.5rem)` | Marge latérale de toutes les sections (16 px sur mobile) |
| `--section-y` | `clamp(5rem, 3rem + 8vw, 10rem)` | Respiration verticale entre deux sections |
| `--stack-lg` | `clamp(2rem, 1.5rem + 2vw, 3.5rem)` | Titre → contenu |
| `--stack-sm` | `0.75rem` | Étiquette → titre |

### 4.2 Grille

- **Desktop (≥ `lg`, 1024 px)** : 12 colonnes, gouttière `1.5rem`, dans la zone à droite du rail (`lg:pl-rail`, 15 rem). Les sections « plein cadre » prennent **100 % de cette zone, jamais `100vw`** (sinon elles passeraient sous le rail fixe).
- **Tablette (`sm` → `lg`)** : 6 colonnes.
- **Mobile (< 640 px)** : 4 colonnes, marges de 16 px, aucun défilement horizontal de la page (la frise utilise son propre conteneur défilant).
- Largeur de lecture maximale : `max-w-7xl` (comme le catalogue actuel) pour le texte ; les visuels peuvent déborder jusqu'aux bords de la zone.

### 4.3 Rythme des sections (thème clair)

```
 Hero « Lentille »          PAPIER  #F7F6F3   100svh   (clair, aura de type)
 Manifeste + nuancier       NUIT    #14161F   ~120svh  (sombre)
 Frise des générations      PAPIER  #F7F6F3   piste épinglée (desktop)
 Panthéon des records       ABYSSE  #0B0C10   ~150svh  (le plus profond)
 Aube → Catalogue           ABYSSE → PAPIER   fondu de fond lié au scroll
 Catalogue des 1 025        PAPIER  #F7F6F3   inchangé
```

Alternance stricte : deux sections voisines n'ont jamais la même profondeur. Les surfaces se touchent bord à bord (pas de séparateur, pas de quadrillage), avec des coins de section arrondis (`rounded-t-[2.5rem]`) quand une section sombre recouvre une claire : la nuit « monte » sur le papier comme une carte posée.

---

## 5. Catalogue des animations

Courbes communes, toutes déjà dans l'esprit de `globals.css` :

- `--ease-fluid: cubic-bezier(0.22, 1, 0.36, 1)` (existante) : entrées, survols.
- `--ease-lens: cubic-bezier(0.16, 1, 0.3, 1)` (nouvelle, « expo out ») : ouverture de la lentille, titres.
- Interpolation linéaire (lerp) par image : suivi du curseur, facteur `0.12` à 60 fps.

Règle WCAG 2.2.2 : **aucune animation autonome de plus de 5 s sans moyen de la mettre en pause**. Tout ce qui bouge en continu est piloté par le curseur ou par le scroll, donc s'arrête quand l'utilisateur s'arrête. Seule exception : la lentille autonome sur écran tactile (A1), qui a son bouton pause.

| # | Nom | Description | Technique | Durée / courbe | Mobile | `reduce` |
|---|---|---|---|---|---|---|
| A1 | **Lentille chromatique** *(signature)* | Sous le curseur, une goutte au bord organique (tête + traînée souple) révèle l'illustration chromatique du spécimen | 1 canvas WebGL (OGL), 1 triangle plein cadre, 2 textures ; shader : distance signée de 5 disques fusionnés (`smin`) + bruit simplex 2D qui dérive, `mix(normal, chromatique, masque)`, liseré de 1,5 px à la couleur d'accent | Rayon 0 → 160 px (lissage « expo out ») à l'entrée du curseur ; suivi lerp `0.12` ; traînée lerp `0.3` | `(pointer: coarse)` : la lentille se promène seule (courbe de Lissajous) **avec un bouton pause** (WCAG 2.2.2) ; bouton « Variante chromatique » (révélation complète organique) | **Pas de WebGL** (ni `saveData`, ni erreur de shader) : image statique + même bouton, 2e image en fondu |
| A2 | **Aura de type** | Halo coloré doux derrière le spécimen, couleur du type principal | CSS `radial-gradient` + `color-mix` ; transition de couleur au changement de spécimen | 500 ms `--ease-fluid` | Identique | Changement instantané |
| A3 | **Montée des lignes** | Les lignes du titre du hero montent depuis un masque à l'arrivée | Chaque **ligne** dans un `span` en `overflow: clip` ; `motion` anime `y: "105%" → 0` ; mots entiers, texte réel dans le DOM | 700 ms `--ease-lens`, décalage 80 ms par ligne | Identique (2 à 4 lignes) | Texte affiché directement |
| A4 | **Éclosion du mot-clé** | Le mot en Fraunces passe de droit et sec à italique doux et bancal | Animation des axes variables `font-variation-settings: "SOFT" 0 → 100, "WONK" 0 → 1` + couleur encre → vermillon | 450 ms `--ease-fluid`, une seule fois, à l'entrée dans l'écran | Identique | État final direct |
| A5 | **Manifeste mot à mot** | Les mots du manifeste passent de la teinte brume à la teinte os au fil du scroll | `motion` `useScroll({ target, offset: ["start 75%", "end 40%"] })` + `useTransform` par mot ; seule la **couleur** change, de `--vitrine-brume` (`#9A9FAB`, 6,80:1 sur la nuit ; `#A1A6B0`, 6,88:1 en sombre) à `--vitrine-os` (14,07:1). **Aucune opacité réduite** : chaque mot reste ≥ 4,5:1 à tout instant du scroll | Lié au scroll (pas de durée) | Identique, plage de scroll plus courte | Teinte os partout, directement |
| A6 | **Compteurs** | `1 025`, `18`, `9` comptent depuis 0 | `motion` `animate(0, n)` sur un `span aria-hidden` ; la vraie valeur est dans un `span sr-only` rendu côté serveur | 900 ms `--ease-fluid`, une fois | Identique | Valeur finale directe |
| A7 | **Nuancier des types** | Les 18 segments s'étirent de 0 à leur largeur réelle | `transform: scaleX(0 → 1)` avec `transform-origin: left`, décalage 25 ms par segment | 600 ms `--ease-fluid`, une fois | Barre verticale empilée en mobile | Largeur finale directe |
| A8 | **Frise épinglée** | Les 9 générations défilent horizontalement pendant que l'on scrolle verticalement | Section haute de `n × 100vh`, enfant `position: sticky; top: 0` ; `useScroll` → `useTransform` → `x` en `%` ; **pas de GSAP** | Lié au scroll | **Pas d'épinglage** : liste horizontale native `overflow-x: auto` + `scroll-snap-type: x mandatory` (glisser au doigt) | Même liste native que le mobile |
| A9 | **Parallaxe du Panthéon** | La colonne centrale de cartes glisse légèrement plus vite que les autres | `useScroll` sur la section → `y: "6%" → "-6%"` sur la colonne du milieu | Lié au scroll | Désactivée (1 colonne) | Désactivée |
| A10 | **Œillet qui tourne** | Au survol d'une carte record, l'illustration grossit et la pastille ronde de l'œillet tourne d'un quart de tour | CSS uniquement, `motion-safe:hover:` (même approche que les 1 025 cartes actuelles) | 260 ms `--ease-fluid` | Pas de survol ; état au `:active` | Couleur seule |
| A11 | **Aube** | Le fond passe de l'abysse au papier en arrivant au catalogue | `useScroll` sur un bloc de 60vh → `useTransform` vers `backgroundColor` (abysse → papier) | Lié au scroll | Identique | Coupure nette entre les deux sections |
| A12 | **Bouton roulant** | Au survol des CTA, le libellé sort par le haut et sa copie entre par le bas | 2 copies du libellé : la visible porte le texte accessible, la copie est `aria-hidden` ; `translateY(-100%)` en CSS | 260 ms `--ease-fluid` | Pas de survol | Couleur seule |
| A13 | **Morph vers la fiche** | Clic sur un record ou un spécimen : l'illustration glisse vers la fiche `/pokemon/[id]` | `<ViewTransition>` existant + `transitionTypes` sur `next/link` (motif déjà en place) | 260 ms `--ease-fluid` (`--duration-move`) | Identique | Règle `reduce` existante (0 s) |
| A14 | **Défilement doux** *(optionnel)* | Inertie légère de la molette sur la vitrine | `lenis`, `lerp: 0.1`, `autoRaf: false`, piloté par la boucle unique (section 7) | Continu | Inactif sur tactile (`syncTouch: false`, valeur par défaut) | **Non instancié** |

**Point d'attention A13** : la grille du catalogue donne déjà le nom de transition `pokemon-image-{id}` à chaque carte. Si un record (ex. Leuphorie `#0242`) est aussi dans la grille, deux éléments porteraient le même nom sur la même page, ce qui casse la View Transition. Les cartes de la vitrine utilisent donc un nom distinct (`vitrine-image-{id}`), posé **seulement sur la carte cliquée**.

---

## 6. Plan de la page d'accueil

Tout reste sur la route `/` : la vitrine en haut, le catalogue en bas, avec l'ancre `#catalogue`.

### 0. Liens d'évitement

Le lien existant « Aller au contenu » (`#main-content`) est complété par **« Aller au catalogue »** (`#catalogue`), premier élément focusable. Un habitué arrive au catalogue en une touche.

### 1. Hero « Lentille » — papier, `100svh`

```
┌──────┬─────────────────────────────────────────────────────────────┐
│ RAIL │ MILLE VINGT-CINQ ESPÈCES.              [ Ouvrir le catalogue ]│
│ w-60 │ REGARDEZ-LES  de plus près.   ← mot-clé Fraunces vermillon   │
│      │                                                              │
│      │          ░░░░░ aura du type (CSS) ░░░░░                      │
│      │    0 0 0 6   ← numéro monumental DERRIÈRE l'illustration     │
│      │           ┌────────────────────┐                             │
│      │           │ illustration       │ ◯ lentille chromatique      │
│      │           │ officielle (canvas)│   sous le curseur           │
│      │           └────────────────────┘                             │
│      │ ┌─ Spécimen ──────────┐                                      │
│      │ │ #0006  Dracaufeu    │      Survolez pour voir sa           │
│      │ │ [Feu] [Vol]   ‹  ›  │      variante chromatique            │
│      │ └─────────────────────┘                                      │
└──────┴─────────────────────────────────────────────────────────────┘
```

- **Spécimens proposés** (contraste chromatique fort, à valider à l'œil) : `#0006` Dracaufeu (noir), `#0130` Léviator (rouge), `#0197` Noctali (anneaux bleus), `#0384` Rayquaza (noir). Choisis par des boutons « Spécimen précédent / suivant » (`aria-label` explicites). **Pas de tirage aléatoire au rendu** : `Math.random()` ou `Date` rendraient la page dynamique sous `cacheComponents: true`.
- Le **numéro monumental derrière le sujet** reprend l'idée de profondeur de trevornoah.com (capture 05), avec l'identité propre du Pokédex : son numéro. Il est `aria-hidden` ; le vrai numéro est dans la micro-carte.
- **LCP** : l'illustration est d'abord rendue côté serveur en `next/image` avec `preload` (Next 16 a remplacé `priority` par `preload`). Le canvas se superpose **exactement** à elle une fois prêt (même boîte, `position: absolute`) : zéro décalage de mise en page.
- Mobile : titre au-dessus, illustration à 80 % de la largeur, micro-carte en dessous, hauteur `min-h-[calc(100svh-7rem)]` pour laisser la place au dock flottant.

### 2. Manifeste + nuancier des types — nuit

- Titre : « UN POKÉDEX SE CONSULTE CHAQUE JOUR. CELUI-CI SE *contemple* AUSSI. » (A3 + A4 + A5).
- **Trois chiffres réels** en mono : `1 025` espèces · `18` types · `9` générations (A6). Tous viennent des données (`pokemonList.length`, `types.length`, calcul des générations), jamais écrits en dur.
- **Nuancier des types** : une barre horizontale de 18 segments dont la largeur est proportionnelle au nombre de Pokémon de chaque type (calculé depuis `typeMap`, déjà chargé par la page actuelle). C'est un vrai graphique : une liste lisible (type + nombre) l'accompagne pour les lecteurs d'écran et pour le mobile. Les étiquettes utilisent `--vitrine-os` ; la couleur du segment ne porte jamais seule l'information (A7).

### 3. Frise des générations — papier, piste épinglée

Ici la numérotation a du sens : l'ordre chronologique est l'information. 9 panneaux :

| Gén. | Région | Numéros | Espèces | Starters affichés |
|---|---|---|---|---|
| I | Kanto | `#0001–#0151` | 151 | 1, 4, 7 |
| II | Johto | `#0152–#0251` | 100 | 152, 155, 158 |
| III | Hoenn | `#0252–#0386` | 135 | 252, 255, 258 |
| IV | Sinnoh | `#0387–#0493` | 107 | 387, 390, 393 |
| V | Unys | `#0494–#0649` | 156 | 495, 498, 501 |
| VI | Kalos | `#0650–#0721` | 72 | 650, 653, 656 |
| VII | Alola | `#0722–#0809` | 88 | 722, 725, 728 |
| VIII | Galar | `#0810–#0905` | 96 | 810, 813, 816 |
| IX | Paldea | `#0906–#1025` | 120 | 906, 909, 912 |

Total : 1 025 (contrôle testable par Codex). Chaque panneau : numéro romain en `--text-h2`, région, plage en mono, 3 illustrations (`next/image` en `loading="lazy"`, `sizes` adapté), liens vers les fiches. Les plages sont à rapprocher du calcul de génération déjà utilisé par la fiche détaillée, pour qu'il n'existe qu'une seule source.

Clavier (desktop) : quand le focus entre dans un panneau hors champ, `scrollIntoView({ block: "center" })` sur la section ramène la piste à ce panneau. Sinon le focus serait invisible.

### 4. Panthéon des records — abysse

Pas une copie du Hall of Fame (capture 03) : on ne classe pas des objets par année, on montre **des records de données**. Une carte = un record, sa valeur en mono géante, le spécimen et un lien vers sa fiche.

| Record (à vérifier via PokéAPI) | Spécimen pressenti | Valeur attendue |
|---|---|---|
| Plus de PV | `#0242` Leuphorie | 255 |
| Plus rapide | `#0894` Regieleki | 200 |
| Meilleure Défense | `#0213` Caratroc | 230 |
| Plus grand | `#0890` Éthernatos | 20 m |
| Plus lourd | `#0790` Cosmovum (égalité avec `#0797`, le plus petit numéro l'emporte) | 999,9 kg |
| Plus haut total de stats | `#0493` Arceus | 720 |

**Carte à œillet** (élément propre au projet, inspiré de l'œilleton d'un instrument d'optique) : carte `rounded-3xl`, contour 1 px `--vitrine-filet`, **découpe circulaire de 56 px dans le coin bas-droit** (masque CSS `radial-gradient`), où se loge une pastille ronde du type principal (`--type-x` / `--type-x-foreground`). Différences voulues avec landonorris.com : coin arrondi et découpe ronde au lieu d'un biseau, 3 colonnes au lieu de 4, valeur chiffrée au lieu d'un titre + année.

Grille : 3 colonnes en desktop (colonne centrale décalée de `8rem` vers le bas + A9), 2 en tablette, 1 en mobile.

### 5. Aube → Catalogue complet — papier

- Bloc de transition (A11) avec le titre « LES 1 025, *sans* DÉTOUR. » puis, directement, le `<section id="catalogue">` qui contient **le code actuel sans modification** : en-tête, `PokemonGrid` (recherche, Popover des types, compteur), cartes en `content-visibility: auto`.
- `scroll-margin-top` sur `#catalogue` pour le bandeau mobile.

### 6. Impact maîtrisé sur la navigation globale

| Élément | Changement proposé | Ce qui ne doit pas casser |
|---|---|---|
| `Header.js` — logo | Inchangé : `/` (haut de la vitrine) | — |
| `Header.js` — lien « Index » | `href: "/#catalogue"` avec une clé de correspondance séparée (`match: "/"`), car `estActif()` compare aujourd'hui `href === "/"` | « Index » reste actif sur `/` **et** sur `/pokemon/...` |
| `Header.js` — `usePathname` | Aucun changement : reste isolé sous `<Suspense>` (contrat testé) | Build avec `cacheComponents: true` |
| Rail desktop `w-60` | Reste visible et clair sur toutes les sections ; les sections sombres ne remplissent que la zone `lg:pl-rail` | Pas de contenu sous le rail |
| Dock mobile | Inchangé ; la vitrine respecte le `pb-28` du conteneur | Toasts toujours au-dessus du dock |
| `app/pokemon/[id]/page.js` — retour à l'index | `href="/#catalogue"` | Navigation ← / → et morph d'image |
| `TeamView.js`, `FavoritesList.js` — états vides | `href="/#catalogue"` | Stores persistés, aucune erreur d'hydratation |
| `not-found.js` | Inchangé (`/`) | — |
| Thème | Sections sombres via la classe `dark` locale ; `ThemeToggle` inchangé | `next-themes` sans décalage d'hydratation |

---

## 7. Architecture technique et budget de performance

### 7.1 Choix des librairies

| Besoin | Décision | Alternatives écartées et pourquoi |
|---|---|---|
| Shader de la lentille | **`ogl`** (WebGL minimaliste, ES modules, JS pur) | **`three`** : plusieurs centaines de Ko minifiés (ordre de grandeur, à mesurer au build) pour **un seul quad et deux textures**, et un tree-shaking peu efficace. **WebGL brut** : 0 Ko, mais ~150 lignes de code bas niveau, peu lisibles pour un projet d'apprentissage. OGL expose les mêmes notions que Three (`Renderer`, `Program`, `Mesh`, `Texture`) pour une fraction du poids. |
| Animations liées au scroll, épinglage, entrées | **`motion`, déjà installé** (`useScroll`, `useTransform`, `animate`, `frame`) | **`gsap` + `ScrollTrigger`** : gratuit, mais une deuxième librairie d'animation pour un besoin déjà couvert. Et `AGENTS.md` impose « animations motion ». L'épinglage se fait en CSS `position: sticky` + `useScroll`, sans ScrollTrigger. |
| Défilement doux | **`lenis`, optionnel** (quelques Ko), activé seulement sur la vitrine | Défilement natif : c'est le repli par défaut. Lenis fait tourner le défilement natif de `window` : `useScroll` de motion le lit donc sans adaptation. |
| Polices | `next/font/google` : + Fraunces uniquement | Aucune police auto-hébergée à la main. |

Les trois paquets sont en **JavaScript** (pas besoin de TypeScript) et s'importent en ES modules sous Turbopack.

### 7.2 Découpage en composants (règle : un composant par fichier, dans `components/`)

```
app/page.js                    Server Component, non async au niveau page si besoin de Suspense
 ├─ HeroLentille.js            "use client" : image SSR + état du spécimen + bouton chromatique
 │   └─ HeroLentilleCanvas.js  "use client", chargé par next/dynamic({ ssr: false }) DANS HeroLentille
 ├─ VitrineDefilement.js       "use client" : Lenis + boucle unique (aucun rendu visuel)
 ├─ Manifeste.js               "use client" : A3, A4, A5, A6
 ├─ NuancierTypes.js            Server : calcul des largeurs depuis typeMap (+ petite île client pour A7)
 ├─ FriseGenerations.js        "use client" : A8
 ├─ PantheonRecords.js         Server : 6 getPokemonDetail(id) en cache ('use cache')
 │   └─ CarteOeillet.js        Server : carte + lien + A10 en CSS
 ├─ AubeCatalogue.js           "use client" : A11
 └─ PokemonGrid.js             existant, inchangé
lib/vitrine.js                 Données pures et testables : générations, spécimens, ids des records
```

Contraintes Next.js 16 vérifiées dans `node_modules/next/dist/docs/` :

- `next/dynamic(..., { ssr: false })` n'est **autorisé que dans un Client Component** (`02-guides/lazy-loading.md`) : il vit donc dans `HeroLentille.js`, jamais dans `app/page.js`.
- `cacheComponents: true` : la page reste statique. Les données de la vitrine passent par les fonctions `'use cache'` existantes de `lib/pokeapi.js` (6 fiches de records en plus, mises en cache comme les autres). Aucun `Math.random()`, `Date.now()` ni `cookies()` au rendu.
- `usePathname()` n'est utilisé par aucun composant de la vitrine. S'il le devenait, il irait sous `<Suspense>`, comme dans `Header.js`.
- `next/image` : `preload` (et non `priority`, déprécié en v16) sur l'illustration du hero uniquement ; qualité par défaut `[75]` en v16.

### 7.3 Boucle unique et cycle de vie

- **Une seule boucle** : le planificateur `frame` de motion (`frame.update(tick, true)`), qui anime déjà tout le reste de la page. `tick` appelle `lenis.raf(time)` (Lenis créé avec `autoRaf: false`), puis le rendu OGL **seulement si** quelque chose a changé (lerp de la souris non convergé, ouverture de la lentille en cours) **et** si le hero est visible (`IntersectionObserver`). Pas de deuxième `requestAnimationFrame`, et une boucle au repos quand rien ne bouge.
- **DPR plafonné** : `renderer.dpr = Math.min(window.devicePixelRatio, 2)`. À titre de comparaison, landonorris.com rend son canvas en `1800×1125` pour une fenêtre de `1440×900` (ratio ≈ 1,25) alors que la machine de capture était en DPR 2 : ils plafonnent eux aussi.
- **Textures** : les PNG officiels (475 px) chargés directement depuis `raw.githubusercontent.com` (domaine de `remotePatterns`) avec `crossOrigin = "anonymous"` (le serveur répond `Access-Control-Allow-Origin: *`), en alpha prémultiplié, sans mipmaps. Variante chromatique : `.../sprites/pokemon/other/official-artwork/shiny/{id}.png`. Au changement de spécimen, les anciennes textures sont supprimées du GPU (`gl.deleteTexture`) et les téléchargements en cours abandonnés.
- **Démontage** (navigation vers `/pokemon/[id]`, `/favoris`, `/sacoche`) : `cancelAnimationFrame` (étape 1 ; `cancelFrame(tick)` quand la boucle passera sur `frame` de motion avec Lenis), `lenis.destroy()`, `program.remove()`, suppression des textures (`gl.deleteTexture`), `WEBGL_lose_context.loseContext()`, `ResizeObserver.disconnect()`, `IntersectionObserver.disconnect()`, retrait des écouteurs `pointermove`. Les autres pages retrouvent un défilement 100 % natif.
- **Replis** : pas de WebGL, `prefers-reduced-motion: reduce`, `navigator.connection.saveData` ou erreur de compilation du shader → on garde l'image SSR et le bouton « Voir la variante chromatique ». Le contenu est identique dans tous les cas.
- Les panneaux défilants (`Sheet` du Header, Popover des types) portent `data-lenis-prevent` pour garder leur défilement interne.

### 7.4 Zéro effet lourd sur les 1 025 cartes

- `PokemonCard.js` et `PokemonGrid.js` ne changent pas : survol en CSS `motion-safe:`, `content-visibility: auto`, aucune `motion.div` par carte (contrat déjà testé).
- La vitrine charge **au plus** : 1 canvas, 2 textures, ~14 illustrations (`loading="lazy"`), 6 appels de fiche en cache.
- Le code OGL est dans un chunk séparé, chargé après le premier rendu ; le catalogue n'en dépend pas. Effets lourds autorisés **uniquement** sur le hero vitrine et la fiche détaillée (`AGENTS.md`).

### 7.5 Budget (à mesurer au build et dans Lighthouse, pas estimé ici)

| Indicateur | Cible sur `/` |
|---|---|
| JS ajouté par la vitrine (hors `motion`, déjà présent) | ≤ 60 Ko gzip au total, chunk OGL compris |
| LCP (illustration du hero, SSR + `preload`) | ≤ 2,5 s en 4G simulée |
| CLS | ≤ 0,05 (canvas superposé à une image de même taille) |
| INP | ≤ 200 ms (aucun calcul lourd dans les gestionnaires) |
| WebGL | 1 draw call, 2 textures de 640 px, boucle au repos sans interaction |
| Polices | 1 fichier de plus (Fraunces italique, sous-ensemble `latin`) |

Tests possibles pour Codex (dans `tests/`, hors de mon périmètre) : somme des générations = 1 025 et ids entre 1 et 1 025 (`lib/vitrine.js`), absence d'import `gsap`/`three`, présence de `useReducedMotion` dans les composants animés, présence des appels de nettoyage dans `LentilleCanvas.js`, `Header.js` toujours sous `<Suspense>`.

---

## 8. Ce qui est volontairement différent de landonorris.com

| Axe | landonorris.com | Pokédex « Lentille » |
|---|---|---|
| Univers | Un pilote, sa carrière, sa boutique | 1 025 espèces, un outil de consultation quotidien |
| Révélation au curseur | Visage → casque filaire | Illustration normale → variante chromatique (donnée réelle de PokéAPI) |
| Fond du hero | Courbes topographiques fines | Aura douce de la couleur du type du spécimen, sans motif ni quadrillage |
| Palette | Olive `#282C20`, noir `#111112`, craie `#F4F4ED`, citron `#D2FF00` | Papier `#F7F6F3`, nuit `#14161F`, abysse `#0B0C10`, vermillon Pokédex `#D62839` / `#FF5A6E`, + 18 couleurs de type pilotées par les données |
| Typographie | Mona Sans + Brier (propriétaire) | Bricolage Grotesque condensée + Fraunces italique douce + JetBrains Mono, 100 % libres |
| Galerie horizontale | Photos d'ambiance et citations | Frise des 9 générations : ordre chronologique, plages de numéros, starters |
| Grille de cartes | Casques par année, encoche biseautée, 4 colonnes | Records chiffrés, découpe ronde « œillet », coins arrondis, 3 colonnes |
| Navigation | Chrome d'angle + menu plein écran | Rail latéral et dock existants conservés, lien « Aller au catalogue » |
| Accessibilité | Lettres découpées + `sr-only` | Mots entiers, contrastes mesurés, chaque effet a sa version réduite, focus visible `#FF5A6E` / `#D62839` |
| Fin de page | Pied de page de marque | Le catalogue filtrable : la vitrine sert l'outil, elle ne le remplace pas |

---

## 9. Limites de l'analyse

- **Captures statiques** : 6 captures à des positions de scroll fixes, sans enregistrement vidéo. Les durées et courbes de la section 5 sont **proposées** à partir des techniques observées (Lenis, canvas, pistes épinglées), pas chronométrées sur les sites.
- **Shader non lu** : le WebGL de landonorris.com (`<canvas class="gl">`) a été analysé visuellement (casque filaire visible dans la capture 01) et structurellement (taille du canvas). Le code GLSL tiers n'a pas été lu, et l'interaction au curseur n'a pas été observée en direct.
- **Pas d'observation mobile** : les 4 sites ont été vus uniquement en 1440×900. Les comportements mobiles décrits ici sont des choix pour le Pokédex, pas des constats.
- **Mesures partielles** : couleurs relevées dans les variables `:root` et quelques styles calculés, sans inventaire complet. Polices identifiées par leur nom CSS. Le DPR plafonné à ~1,25 est une **déduction** (taille du canvas / taille de la fenêtre), pas une lecture du code.
- **Pas d'audit d'accessibilité** des sites de référence : leurs contrastes et leur navigation clavier n'ont pas été testés.
- **Captures à DPR 2** (2880×1800) : les mesures en px citées sont en pixels CSS d'une fenêtre de 1440×900.
- **Données à vérifier au moment du code** : valeurs et égalités des records (section 6.4), rendu réel des variantes chromatiques des 4 spécimens du hero, plages des générations face au calcul existant de la fiche.
- **Poids des librairies non mesurés** : aucune dépendance n'a été installée pendant cette phase. Les ordres de grandeur de `three`, `ogl`, `gsap` et `lenis` sont à confirmer par un `next build` sur une branche d'essai.
- **Pas de test utilisateur** : l'hypothèse « un habitué atteint le catalogue en une action » repose sur le lien d'évitement et le lien « Index », pas sur une observation.
