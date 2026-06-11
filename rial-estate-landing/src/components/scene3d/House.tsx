"use client";

import { Clone, useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";

type HouseProps = Omit<ThreeElements["group"], "ref"> & {
  /** chemin du GLB dans /public/models */
  src: string;
};

/**
 * Maison (ou tout modèle GLB du village). <Clone> partage les géométries
 * entre instances — un même GLB peut être posé plusieurs fois sans recharge.
 * Les fenêtres émissives animées arrivent à l'étape 7.
 */
export default function House({ src, ...props }: HouseProps) {
  const { scene } = useGLTF(src);
  return <Clone object={scene} {...props} />;
}
