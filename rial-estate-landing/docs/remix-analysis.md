# Memo technique — reconnaissance remix.run

**Limite d'environnement** : `https://remix.run` est bloqué par la politique réseau de la sandbox (HTTP 403 `host_not_allowed`, y compris via le proxy de fetch). Impossible d'inspecter le DOM, le bundle JS ou les requêtes réseau en live. Ce memo s'appuie sur le brief + la connaissance documentée du site ; à re-vérifier si la politique réseau est élargie (ajouter `remix.run` à l'allowlist de l'environnement).

## Ce qui sera répliqué, et comment

1. **Background cinématique** : un seul canvas WebGL `fixed inset-0`, fragment shader full-screen (pas de géométrie 3D complexe) — sol en perspective par projection UV (`y → 1/z`), trails = fonctions de distance animées par `uTime`, brouillard exponentiel, skybox en gradient radial dans le même shader.
2. **Mouvement continu** : `uTime` avance au raf, jamais lié au scroll. Le scroll pilote uniquement tilt caméra + vignette via uniforms séparés.
3. **Long exposure** : trails étirées en Z avec falloff doux (`smoothstep`) + courbure en S (offset sinus sur X selon Z) + halo additive ; bloom via `@react-three/postprocessing`.
4. **Grain** : pass `Noise` animée (intensity 0.07, blend OVERLAY) dans l'EffectComposer + baseline SVG DOM (opacity 0.05, `mix-blend-overlay`) pour les sections sans canvas.
5. **Wordmark** : Geist 800, `clamp(96px, 18vw, 280px)`, tracking −0.05em, `mix-blend-exclusion`, débordement `translateY(-15%)` au-dessus du fold.
6. **Rythme d'entrée** : ease `cubic-bezier(0.16, 1, 0.3, 1)`, 1.4s wordmark, split-text par mot stagger 60ms (GSAP, splitter maison — pas le plugin Club).

**Assets clés** : aucun récupérable (fetch bloqué). Tout sera procédural (shader), zéro vidéo/texture externe.
