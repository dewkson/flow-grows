# flow-grows — CLAUDE.md

## Projektüberblick
Begehbarer "digitaler Garten" als Webplattform. Ein Charakter (der Besitzer) bewegt sich auf einer isometrischen 2D/3D-Karte. Bereiche der Karte sind interaktive Inhaltszonen (Musik-Portfolio, Game-Dev-Showcase, etc.) mit verlinkten Embeds (SoundCloud, itch.io). Späteres Ziel: User-generierte Gärten, Privacy-Einstellungen, Besuche/Posts, Monetarisierung.

## Tech-Stack
- **Framework**: React 19 + TypeScript 5.9
- **3D**: Three.js 0.182 via React Three Fiber 9 + @react-three/drei 10
- **Build**: Vite 7
- **State**: Zustand 5 (`src/store/gardenStore.ts`)
- **Persistenz**: `localStorage` (kein Backend, kein Auth)
- **Assets**: PNG-Sprites (Karte + Charakter), FBX-Modelle (in `public/models/`, noch nicht in Szene eingebunden)

## Architektur

### Szene
`App.tsx` → `<Canvas>` (orthografisch, isometrisch 45°, `zoom: 50`) → `Scene.tsx`

Kamera: Maus-Drag auf Canvas; Charakter folgt per Lerp (`LERP_SPEED = 0.02`).
`CameraFocus` zoomt automatisch auf ein aktives Content-Panel.
Kamera-Offset von Welt-Origin: `CAM_OFFSET = 5` (in `src/world/constants.ts`).

### Charakter
`src/character/Character.tsx` — Billboard-Plane mit 4 direktionalen PNGs (front/back/left/right).
Bewegung = Kamera-XZ minus `CAM_OFFSET`, geclampt auf `CHARACTER_BOUND`.
Kollision: Circle-vs-AABB gegen `Collider[]` aus dem Store (`src/character/collision.ts`).
Globaler Singleton `characterPosition` (`src/character/characterPosition.ts`) für systemübergreifenden Zugriff ohne Re-Renders.

### Proximity
`src/character/useProximity.ts` — gemeinsamer Hook für Näheprüfung.
Wird von `InteractableContent` und `ClickZoneHotspot` genutzt.

### Garten-Daten (`src/data/`)
- `ContentArea`: Inhaltszonen mit Position, Radius, Embed-URLs, Panel-Konfiguration
- `Collider`: AABB-Kollisionsboxen (Position/Größe auf XZ-Ebene)
- `LinkedClickZone`: freie Click-Zonen, unabhängig von ContentAreas
- `SpriteConfig`: Boden-Sprite-Layer (URL, Position, Scale)
- `GardenSnapshot`: fasst alles zusammen für Speichern/Laden

### Persistenz
Zustand in `gardenStore.ts` wird in 8 separaten `localStorage`-Keys gehalten.
Beim Laden eines Snapshots werden alle Keys synchron überschrieben.
Kein Backend, kein User-Account — alles clientseitig.

## Konventionen
- Keine Klassen; funktionale React-Komponenten + Custom Hooks
- Zustand immer über `useGardenStore` lesen/schreiben, nicht direkt auf `localStorage`
- `characterPosition` direkt lesen (kein Store-Selector) für Performance-kritische `useFrame`-Loops
- Neue 3D-Assets als GLTF/GLB in `public/models/`, nicht als FBX
- Sprites in `public/sprites/`, Texturen in `public/models/textures/`
- Welt-Dimensionen und Kamera-Konstanten zentral in `src/world/constants.ts`
- `THREE.Color`-Objekte immer auf Modul-Level erstellen, nie im Komponenten-Body
- Geometrien die mehrfach gerendert werden mit `useMemo` erstellen und im `useEffect`-Cleanup `dispose()` aufrufen

## Bekannte Schulden
- `localStorage`-Persistenz skaliert nicht (5–10 MB Limit); für User-Gärten braucht es ein Backend (z.B. Supabase)
- `gardenStore.ts` ist ein God-Object (~570 Zeilen); natürliche Aufteilung wäre `editorStore` / `contentStore` / `gardenStore`
- FBX-Assets in `public/models/` existieren, werden noch nicht gerendert — auf GLTF umstellen wenn eingebunden
- Keine Spritesheet-Animation: Richtungswechsel = Materialwechsel = Draw-Call-Spike

## Nächste Prioritäten (Stand: 2026-06)
1. Charakter-Walk-Animation (Spritesheet statt Einzel-PNGs)
2. FBX-Assets auf GLTF umstellen + in Szene einbinden
3. Boden-Textur und Beleuchtung upgraden
4. Backend/Persistenz für User-Gärten vorbereiten
