#!/usr/bin/env bash
# Régénère le miroir rial-estate-landing/ — copie exacte de l'app.
#
# Pourquoi : le projet Vercel peut avoir "Root Directory" réglé soit sur
# vide (racine), soit sur "rial-estate-landing" (héritage de l'ancien
# scaffold). Ce miroir rend les DEUX configurations buildables.
# À exécuter avant chaque commit qui touche l'app.
# À SUPPRIMER dès que la config Vercel est assainie (Root Directory vide).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
rm -rf rial-estate-landing
mkdir rial-estate-landing
git ls-files -z -- . ':!rial-estate-landing' ':!scripts' \
  | tar -c --null --files-from=- \
  | tar -x -C rial-estate-landing
echo "miroir régénéré : $(find rial-estate-landing -type f | wc -l) fichiers"
