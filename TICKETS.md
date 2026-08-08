# Tickets

Einfaches, dateibasiertes Ticketsystem für offene Punkte. Kein externes Tool nötig — einfach Einträge unten ergänzen, verschieben, abhaken.

## Format

Jedes Ticket bekommt eine fortlaufende ID, einen kurzen Titel, optional Labels und eine kurze Beschreibung.

```
### T-000X: Kurzer Titel
- **Status**: Open | In Progress | Blocked | Done
- **Priorität**: Hoch | Mittel | Niedrig
- **Labels**: z.B. bug, feature, tech-debt, performance
- **Beschreibung**: Was ist das Problem / die Aufgabe?
- **Notizen**: (optional) Kontext, betroffene Dateien, Ideen zur Lösung
```

---

## Open

### T-0001: Charakter-Walk-Animation (Spritesheet)
- **Status**: Open
- **Priorität**: Mittel
- **Labels**: feature, animation
- **Beschreibung**: Aktuell nur 4 statische Richtungs-PNGs (front/back/left/right), kein Lauf-Zyklus. Umstellung auf Spritesheet-Animation.
- **Notizen**: Betrifft `src/character/Character.tsx`. Siehe auch Ticket zu Draw-Call-Spike bei Richtungswechsel.

### T-0002: FBX-Assets auf GLTF umstellen und einbinden
- **Status**: Open
- **Priorität**: Mittel
- **Labels**: tech-debt, assets
- **Beschreibung**: FBX-Modelle in `public/models/` existieren, werden aber noch nicht gerendert. Konvention ist GLTF/GLB — Assets konvertieren und in Szene einbinden.

### T-0003: Boden-Textur und Beleuchtung upgraden
- **Status**: Open
- **Priorität**: Niedrig
- **Labels**: visual
- **Beschreibung**: Aktuelle Boden-/Lichtgestaltung ist Platzhalter-Qualität, braucht visuelles Upgrade.
- **Notizen**: Betrifft `src/world/Ground.tsx`, `src/canvas/Lights.tsx`.

### T-0004: Backend/Persistenz für User-Gärten vorbereiten
- **Status**: Open
- **Priorität**: Niedrig
- **Labels**: feature, backend
- **Beschreibung**: `localStorage`-Persistenz skaliert nicht (5–10 MB Limit). Für User-generierte Gärten braucht es ein Backend, z.B. Supabase.
- **Notizen**: Betrifft `src/store/gardenStore.ts`.

### T-0005: gardenStore.ts aufteilen (God-Object)
- **Status**: Open
- **Priorität**: Niedrig
- **Labels**: tech-debt, refactor
- **Beschreibung**: `gardenStore.ts` ist mit ~570 Zeilen zu groß. Natürliche Aufteilung wäre `editorStore` / `contentStore` / `gardenStore`.

### T-0006: Draw-Call-Spike bei Charakter-Richtungswechsel
- **Status**: Open
- **Priorität**: Niedrig
- **Labels**: performance
- **Beschreibung**: Keine Spritesheet-Animation — Richtungswechsel bedeutet Materialwechsel, was einen Draw-Call-Spike verursacht.
- **Notizen**: Hängt mit T-0001 zusammen, sollte im selben Zug gelöst werden.

---

## In Progress

_(noch leer)_

---

## Blocked

_(noch leer)_

---

## Done

_(noch leer)_
