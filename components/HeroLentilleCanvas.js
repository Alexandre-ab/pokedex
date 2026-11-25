"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Texture } from "ogl";

// ---------------------------------------------------------------------------
// Lentille chromatique (WebGL, librairie « ogl »).
//
// Un seul triangle plein cadre, deux textures : l'illustration officielle
// normale et sa variante chromatique (« shiny »), qui ont EXACTEMENT la même
// pose. Le shader mélange les deux avec un masque : à l'intérieur d'une
// forme organique (la « lentille »), on voit la variante chromatique.
//
// - Souris / trackpad : la lentille suit le curseur, avec une traînée souple
//   (5 points qui se suivent et fusionnent en une seule goutte).
// - Écran tactile (pointer: coarse) : la lentille se promène toute seule
//   (prop `auto`), et le parent propose un bouton pause.
// - `chromatique` = true : la variante chromatique envahit tout le spécimen.
//
// Ce composant n'est JAMAIS rendu côté serveur : HeroLentille le charge avec
// next/dynamic({ ssr: false }), et seulement si WebGL a une chance de marcher
// et que l'utilisateur n'a pas demandé moins d'animations.
// Il prévient son parent de son état via onEtat("chargement" | "pret" | "erreur").
// ---------------------------------------------------------------------------

const VERTEX = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision highp float;

uniform sampler2D tNormal;   // illustration normale
uniform sampler2D tChroma;   // illustration chromatique (même cadrage)
uniform vec2 uTaille;        // taille du canvas en pixels CSS
uniform vec2 uTrace[5];      // tête de la lentille + 4 points de traînée (px)
uniform float uRayon;        // rayon de la lentille (px), 0 = fermée
uniform float uRevele;       // 0 = lentille seule, 1 = chromatique partout
uniform float uTemps;        // secondes, pour faire onduler le bord
uniform vec3 uBord;          // couleur du liseré (accent du thème)
varying vec2 vUv;

// Bruit simplex 2D (Ian McEwan, Ashima Arts — licence MIT).
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Minimum « doux » : deux disques proches fusionnent comme deux gouttes.
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

void main() {
  // Position du pixel en px CSS, origine en haut à gauche (comme la souris).
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uTaille;

  // Bruit organique : deux couches qui dérivent dans des sens opposés.
  float n = snoise(p / 140.0 + vec2(uTemps * 0.18, -uTemps * 0.11)) * 0.65
          + snoise(p / 55.0 - vec2(uTemps * 0.27, uTemps * 0.21)) * 0.35;

  // 1. La lentille : la tête et sa traînée (rayons décroissants) fusionnées.
  //    d < 0 à l'intérieur, d > 0 à l'extérieur (distance signée, en px).
  float d = 1e4;
  for (int i = 0; i < 5; i++) {
    float r = uRayon * (1.0 - float(i) * 0.16);
    d = smin(d, length(p - uTrace[i]) - r, uRayon * 0.45 + 1.0);
  }
  // Ondulation du bord modérée : une enveloppe souple, sans filaments.
  d += n * uRayon * 0.14;

  // 2. La révélation complète : une tache organique qui grandit depuis le
  //    centre jusqu'à couvrir tout le canvas quand uRevele vaut 1.
  float rMax = length(uTaille) * 0.66;
  float dRevele = length(p - uTaille * 0.5) - uRevele * rMax + n * rMax * 0.08 * uRevele;

  // Masque final, avec 1,2 px d'anticrénelage sur le bord.
  float masqueLentille = 1.0 - smoothstep(-1.2, 1.2, d);
  float masqueRevele = 1.0 - smoothstep(-1.2, 1.2, dRevele);
  float masque = max(masqueLentille, masqueRevele);

  // Textures en alpha prémultiplié : le mélange reste propre sur les bords.
  vec4 normal = texture2D(tNormal, vUv);
  vec4 chroma = texture2D(tChroma, vUv);
  vec4 couleur = mix(normal, chroma, masque);

  // Voile léger dans la lentille, visible aussi hors du Pokémon : on
  // devine nettement la forme de l'instrument d'observation.
  float ouverte = smoothstep(2.0, 14.0, uRayon) * (1.0 - masqueRevele);
  vec4 voile = vec4(uBord, 1.0) * 0.12 * masqueLentille * ouverte;
  couleur = couleur + voile * (1.0 - couleur.a);

  // Halo doux juste à l'extérieur du bord (sur ~10 px) : l'enveloppe rouge
  // ressort aussi sur le fond, autour de la zone révélée.
  float halo = (1.0 - smoothstep(0.0, 10.0, d)) * step(0.0, d) * 0.22 * ouverte;
  couleur = vec4(uBord, 1.0) * halo + couleur * (1.0 - halo);

  // Liseré net de 2,5 px au bord de la lentille, couleur de l'accent.
  float lisere = (1.0 - smoothstep(0.75, 2.5, abs(d))) * 0.9 * ouverte;
  couleur = vec4(uBord, 1.0) * lisere + couleur * (1.0 - lisere);

  gl_FragColor = couleur;
}
`;

// Lit la couleur d'accent du thème (--vermilion, en #rrggbb) et la renvoie
// en 3 nombres entre 0 et 1 pour le shader.
function lireCouleurAccent() {
  const hex = getComputedStyle(document.documentElement)
    .getPropertyValue("--vermilion")
    .trim();
  const resultat = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!resultat) return [0.84, 0.16, 0.22];
  return resultat.slice(1).map((canal) => parseInt(canal, 16) / 255);
}

// Charge une image distante utilisable comme texture WebGL. Les images de
// raw.githubusercontent.com autorisent le CORS : avec crossOrigin =
// "anonymous", le navigateur nous laisse les envoyer au GPU.
function chargerImage(src) {
  const image = new window.Image();
  image.crossOrigin = "anonymous";
  image.decoding = "async";
  const promesse = new Promise((resolve, reject) => {
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Image introuvable : ${src}`));
  });
  image.src = src;
  return { image, promesse };
}

// Facteur de lissage indépendant du nombre d'images par seconde :
// « f » est la part du chemin parcourue en 1/60 s.
function lissage(f, dt) {
  return 1 - Math.pow(1 - f, dt * 60);
}

export default function HeroLentilleCanvas({
  normalSrc,
  chromaSrc,
  chromatique = false,
  auto = false,
  enPause = false,
  onEtat,
}) {
  const conteneurRef = useRef(null);
  // Tout l'état WebGL et d'animation vit dans un objet mutable : il change
  // à chaque image, on ne veut surtout pas de re-rendu React pour ça.
  const moteurRef = useRef(null);
  // Les dernières props, lues par la boucle d'animation.
  const propsRef = useRef({ chromatique, auto, enPause, onEtat });

  useEffect(() => {
    propsRef.current = { chromatique, auto, enPause, onEtat };
    // Une prop a changé : on relance la boucle (elle s'arrête d'elle-même
    // si rien ne bouge).
    moteurRef.current?.demarrer();
  }, [chromatique, auto, enPause, onEtat]);

  // ---- 1. Création du moteur WebGL (une seule fois) ----------------------
  useEffect(() => {
    const conteneur = conteneurRef.current;
    if (!conteneur) return;

    let renderer;
    try {
      renderer = new Renderer({
        // DPR plafonné à 2 : au-delà, 4× plus de pixels pour un gain invisible.
        dpr: Math.min(window.devicePixelRatio || 1, 2),
        alpha: true,
        premultipliedAlpha: true,
        depth: false,
        antialias: false,
        powerPreference: "low-power",
      });
    } catch {
      // Pas de WebGL (ou contexte refusé) : le parent garde l'image fixe.
      propsRef.current.onEtat?.("erreur");
      return;
    }
    const gl = renderer.gl;
    // ogl crée son propre <canvas> : on l'ajoute au conteneur. Un canvas neuf
    // à chaque montage évite de réutiliser un contexte déjà « perdu ».
    const canvas = gl.canvas;
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "absolute inset-0 size-full";
    conteneur.appendChild(canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tNormal: { value: null },
        tChroma: { value: null },
        uTaille: { value: [1, 1] },
        // Un VRAI tableau JS (pas un Float32Array) : pour un tableau
        // d'uniforms GLSL (uTrace[5]), ogl vérifie Array.isArray(value).
        // Avec un Float32Array, uTrace n'était jamais envoyé au GPU et la
        // lentille restait collée au coin (0, 0).
        uTrace: { value: new Array(10).fill(0) },
        uRayon: { value: 0 },
        uRevele: { value: 0 },
        uTemps: { value: 0 },
        uBord: { value: lireCouleurAccent() },
      },
    });
    // Shader qui ne compile pas (vieux GPU, pilote capricieux) : repli.
    if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) {
      program.remove();
      geometry.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
      propsRef.current.onEtat?.("erreur");
      return;
    }
    const mesh = new Mesh(gl, { geometry, program });

    // État de l'animation.
    const etat = {
      largeur: 1,
      hauteur: 1,
      souris: { x: 0, y: 0 },
      sourisDansZone: false,
      trace: Array.from({ length: 5 }, () => ({ x: 0, y: 0 })),
      rayon: 0,
      revele: 0,
      temps: 0,
      tempsAuto: 0,
      raf: 0,
      dernier: 0,
      pret: false,
      visible: true,
      ongletVisible: !document.hidden,
      textures: [],
    };

    function dessiner() {
      const u = program.uniforms;
      etat.trace.forEach((point, i) => {
        u.uTrace.value[i * 2] = point.x;
        u.uTrace.value[i * 2 + 1] = point.y;
      });
      u.uRayon.value = etat.rayon;
      u.uRevele.value = etat.revele;
      u.uTemps.value = etat.temps;
      renderer.render({ scene: mesh });
    }

    function boucle(maintenant) {
      etat.raf = 0;
      // Durée depuis l'image précédente, bornée (onglet réveillé, etc.).
      const dt = Math.min(Math.max((maintenant - etat.dernier) / 1000, 0), 0.05);
      etat.dernier = maintenant;

      const { auto: modeAuto, chromatique: toutReveler } = propsRef.current;
      const { largeur: w, hauteur: h } = etat;
      // Rayon : 160 px au plus, plus petit sur les petits écrans.
      const rayonMax = Math.min(160, Math.min(w, h) * (modeAuto ? 0.24 : 0.3));

      // Où va la tête de la lentille ?
      let cible;
      let rayonCible;
      if (modeAuto) {
        // Promenade autonome : une courbe de Lissajous lente et douce.
        etat.tempsAuto += dt;
        const t = etat.tempsAuto;
        cible = {
          x: w * (0.5 + 0.27 * Math.sin(t * 0.42)),
          y: h * (0.5 + 0.23 * Math.sin(t * 0.61 + 1.3)),
        };
        rayonCible = rayonMax;
      } else {
        cible = etat.souris;
        rayonCible = etat.sourisDansZone ? rayonMax : 0;
      }

      // La tête suit la cible (lerp 0.12 par image à 60 i/s), et chaque point
      // de la traînée suit le précédent : d'où la traînée souple.
      const tete = etat.trace[0];
      const kTete = lissage(modeAuto ? 0.2 : 0.12, dt);
      tete.x += (cible.x - tete.x) * kTete;
      tete.y += (cible.y - tete.y) * kTete;
      const kTrace = lissage(0.3, dt);
      for (let i = 1; i < etat.trace.length; i++) {
        const point = etat.trace[i];
        const devant = etat.trace[i - 1];
        point.x += (devant.x - point.x) * kTrace;
        point.y += (devant.y - point.y) * kTrace;
      }

      // Ouverture rapide (sensation « expo out »), fermeture un peu plus vive.
      const kRayon = lissage(rayonCible > etat.rayon ? 0.1 : 0.14, dt);
      etat.rayon += (rayonCible - etat.rayon) * kRayon;
      const reveleCible = toutReveler ? 1 : 0;
      etat.revele += (reveleCible - etat.revele) * lissage(0.07, dt);
      etat.temps += dt;

      dessiner();

      // Faut-il continuer ? Non si la lentille est fermée, la révélation
      // terminée et la traînée immobile : la boucle se met au repos.
      const queue = etat.trace[etat.trace.length - 1];
      const enMouvement =
        modeAuto ||
        etat.rayon > 0.5 ||
        Math.abs(rayonCible - etat.rayon) > 0.5 ||
        Math.abs(reveleCible - etat.revele) > 0.001 ||
        Math.hypot(queue.x - cible.x, queue.y - cible.y) > 0.5;
      if (enMouvement) demarrer();
    }

    // Lance la boucle si tout est réuni : textures prêtes, hero visible,
    // onglet affiché et animation non mise en pause.
    function demarrer() {
      if (etat.raf || !etat.pret) return;
      if (!etat.visible || !etat.ongletVisible || propsRef.current.enPause) return;
      if (!etat.dernier) etat.dernier = performance.now();
      etat.raf = requestAnimationFrame(boucle);
    }

    function arreter() {
      if (etat.raf) cancelAnimationFrame(etat.raf);
      etat.raf = 0;
      // Au redémarrage, on repart d'un dt neutre (pas de « saut »).
      etat.dernier = 0;
    }

    // ---- Taille du canvas : suit celle du conteneur (le spécimen). ----
    const observateurTaille = new ResizeObserver(([entree]) => {
      const { width, height } = entree.contentRect;
      etat.largeur = Math.max(width, 1);
      etat.hauteur = Math.max(height, 1);
      renderer.setSize(etat.largeur, etat.hauteur);
      program.uniforms.uTaille.value = [etat.largeur, etat.hauteur];
      // setSize efface le canvas : on redessine tout de suite.
      if (etat.pret) dessiner();
    });
    observateurTaille.observe(conteneur);

    // ---- Pause hors écran (IntersectionObserver). ----
    const observateurVisibilite = new IntersectionObserver(([entree]) => {
      etat.visible = entree.isIntersecting;
      if (etat.visible) demarrer();
      else arreter();
    });
    observateurVisibilite.observe(conteneur);

    // ---- Pause quand l'onglet est caché. ----
    function surVisibiliteOnglet() {
      etat.ongletVisible = !document.hidden;
      if (etat.ongletVisible) demarrer();
      else arreter();
    }
    document.addEventListener("visibilitychange", surVisibiliteOnglet);

    // ---- Curseur (souris / stylet uniquement : le tactile est en auto). ----
    function surMouvementPointeur(evenement) {
      if (evenement.pointerType === "touch") return;
      const zone = conteneur.getBoundingClientRect();
      const x = evenement.clientX - zone.left;
      const y = evenement.clientY - zone.top;
      // La lentille s'ouvre seulement quand le curseur survole le spécimen,
      // et se referme (en douceur, via le lissage du rayon) dès qu'il sort.
      const dedans = x >= 0 && y >= 0 && x <= zone.width && y <= zone.height;
      // Lentille fermée qui se rouvre : on la fait naître sous le curseur
      // plutôt que de la faire glisser depuis son ancienne position.
      if (dedans && etat.rayon < 1) {
        etat.trace.forEach((point) => {
          point.x = x;
          point.y = y;
        });
      }
      etat.souris = { x, y };
      etat.sourisDansZone = dedans;
      demarrer();
    }
    function surSortiePointeur(evenement) {
      // relatedTarget null : le curseur a quitté la fenêtre.
      if (evenement.relatedTarget) return;
      etat.sourisDansZone = false;
      demarrer();
    }
    window.addEventListener("pointermove", surMouvementPointeur, { passive: true });
    document.addEventListener("pointerout", surSortiePointeur);

    // ---- Thème clair/sombre : le liseré reprend la couleur d'accent. ----
    const observateurTheme = new MutationObserver(() => {
      program.uniforms.uBord.value = lireCouleurAccent();
      if (etat.pret) dessiner();
    });
    observateurTheme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Remplace les deux textures (changement de spécimen) et libère les
    // anciennes de la mémoire du GPU.
    function changerTextures(imageNormale, imageChroma) {
      const options = { generateMipmaps: false, premultiplyAlpha: true };
      const nouvelles = [
        new Texture(gl, { image: imageNormale, ...options }),
        new Texture(gl, { image: imageChroma, ...options }),
      ];
      program.uniforms.tNormal.value = nouvelles[0];
      program.uniforms.tChroma.value = nouvelles[1];
      etat.textures.forEach((texture) => gl.deleteTexture(texture.texture));
      etat.textures = nouvelles;
      etat.pret = true;
      dessiner();
      demarrer();
    }

    function suspendre() {
      etat.pret = false;
      arreter();
    }

    moteurRef.current = { demarrer, changerTextures, suspendre };

    // ---- Nettoyage complet au démontage. ----
    return () => {
      moteurRef.current = null;
      arreter();
      observateurTaille.disconnect();
      observateurVisibilite.disconnect();
      observateurTheme.disconnect();
      document.removeEventListener("visibilitychange", surVisibiliteOnglet);
      window.removeEventListener("pointermove", surMouvementPointeur);
      document.removeEventListener("pointerout", surSortiePointeur);
      etat.textures.forEach((texture) => gl.deleteTexture(texture.texture));
      etat.textures = [];
      program.remove();
      geometry.remove();
      // Rend tout de suite le contexte WebGL au navigateur (sinon il reste
      // occupé jusqu'au passage du ramasse-miettes).
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, []);

  // ---- 2. Chargement des textures du spécimen affiché ----------------------
  useEffect(() => {
    const moteur = moteurRef.current;
    if (!moteur) return;
    let annule = false;

    // Le parent ré-affiche l'image fixe pendant le chargement.
    moteur.suspendre();
    propsRef.current.onEtat?.("chargement");

    const normale = chargerImage(normalSrc);
    const chroma = chargerImage(chromaSrc);
    Promise.all([normale.promesse, chroma.promesse])
      .then(([imageNormale, imageChroma]) => {
        if (annule || !moteurRef.current) return;
        moteurRef.current.changerTextures(imageNormale, imageChroma);
        propsRef.current.onEtat?.("pret");
      })
      .catch(() => {
        if (!annule) propsRef.current.onEtat?.("erreur");
      });

    return () => {
      annule = true;
      // Spécimen changé avant la fin : on abandonne les téléchargements.
      for (const { image } of [normale, chroma]) {
        image.onload = null;
        image.onerror = null;
        image.src = "";
      }
    };
  }, [normalSrc, chromaSrc]);

  return (
    <div
      ref={conteneurRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    />
  );
}
