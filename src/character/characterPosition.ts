import * as THREE from 'three'

/**
 * Shared mutable vector updated by Character every frame.
 * Other systems (e.g. GardenArea) can read this without causing re-renders.
 */
export const characterPosition = new THREE.Vector3()
