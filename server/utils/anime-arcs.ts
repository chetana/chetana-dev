export interface AnimeArc {
  name: string
  start: number
  end: number | null // null = en cours
  filler?: boolean
}

export const ANIME_ARCS: Record<number, AnimeArc[]> = {
  // ── One Piece ──────────────────────────────────────────────────────────────
  21: [
    { name: 'Romance Dawn', start: 1, end: 3 },
    { name: 'Orange Town', start: 4, end: 8 },
    { name: 'Syrup Village', start: 9, end: 18 },
    { name: 'Baratie', start: 19, end: 30 },
    { name: 'Arlong Park', start: 31, end: 45 },
    { name: 'Loguetown', start: 46, end: 53 },
    { name: 'Reverse Mountain', start: 62, end: 63 },
    { name: 'Whisky Peak', start: 64, end: 67 },
    { name: 'Little Garden', start: 70, end: 77 },
    { name: 'Drum Island', start: 78, end: 91 },
    { name: 'Alabasta', start: 92, end: 130 },
    { name: 'Jaya', start: 144, end: 152 },
    { name: 'Skypiea', start: 153, end: 195 },
    { name: 'Long Ring Long Land', start: 207, end: 219 },
    { name: 'Water 7', start: 229, end: 263 },
    { name: 'Enies Lobby', start: 264, end: 312 },
    { name: 'Post-Enies Lobby', start: 313, end: 325 },
    { name: 'Thriller Bark', start: 337, end: 381 },
    { name: 'Sabaody Archipelago', start: 385, end: 405 },
    { name: 'Amazon Lily', start: 408, end: 417 },
    { name: 'Impel Down', start: 422, end: 452 },
    { name: 'Marineford', start: 457, end: 489 },
    { name: 'Post-Marineford', start: 490, end: 516 },
    { name: 'Return to Sabaody', start: 517, end: 522 },
    { name: 'Fish-Man Island', start: 523, end: 574 },
    { name: 'Punk Hazard', start: 579, end: 625 },
    { name: 'Dressrosa', start: 629, end: 746 },
    { name: 'Zou', start: 751, end: 779 },
    { name: 'Whole Cake Island', start: 783, end: 877 },
    { name: 'Levely', start: 878, end: 889 },
    { name: 'Wano Country', start: 890, end: 1085 },
    { name: 'Egghead Island', start: 1086, end: null },
  ],

  // ── Naruto ─────────────────────────────────────────────────────────────────
  20: [
    { name: 'Introduction', start: 1, end: 5 },
    { name: 'Land of Waves', start: 6, end: 19 },
    { name: 'Chunin Exams', start: 20, end: 67 },
    { name: 'Konoha Crush', start: 68, end: 80 },
    { name: 'Search for Tsunade', start: 81, end: 100 },
    { name: 'Sasuke Recovery Mission', start: 107, end: 135 },
  ],

  // ── Naruto Shippuden ───────────────────────────────────────────────────────
  1735: [
    { name: 'Kazekage Rescue', start: 1, end: 32 },
    { name: 'Tenchi Bridge Reconnaissance', start: 33, end: 53 },
    { name: 'Akatsuki Suppression Mission', start: 72, end: 88 },
    { name: 'Itachi Pursuit Mission', start: 113, end: 118 },
    { name: 'Fated Battle Between Brothers', start: 119, end: 126 },
    { name: "Pain's Assault", start: 152, end: 175 },
    { name: 'Five Kage Summit', start: 197, end: 214 },
    { name: 'Fourth Shinobi World War', start: 243, end: 362 },
    { name: 'Kaguya Ōtsutsuki Strikes', start: 458, end: 468 },
    { name: 'Epilogue', start: 494, end: 500 },
  ],

  // ── Dragon Ball Z ──────────────────────────────────────────────────────────
  813: [
    { name: 'Saiyan Saga', start: 1, end: 35 },
    { name: 'Namek Saga', start: 36, end: 74 },
    { name: 'Captain Ginyu Saga', start: 75, end: 85 },
    { name: 'Frieza Saga', start: 86, end: 107 },
    { name: 'Garlic Jr. Saga', start: 108, end: 117, filler: true },
    { name: 'Android Saga', start: 118, end: 139 },
    { name: 'Imperfect Cell Saga', start: 140, end: 152 },
    { name: 'Perfect Cell Saga', start: 153, end: 165 },
    { name: 'Cell Games Saga', start: 166, end: 194 },
    { name: 'Great Saiyaman / World Tournament', start: 200, end: 219 },
    { name: 'Majin Buu Saga', start: 220, end: 253 },
    { name: 'Fusion Saga', start: 254, end: 275 },
    { name: 'Kid Buu Saga', start: 276, end: 291 },
  ],

  // ── Dragon Ball Super ──────────────────────────────────────────────────────
  30694: [
    { name: 'God of Destruction Beerus Saga', start: 1, end: 14 },
    { name: 'Golden Frieza Saga', start: 15, end: 27 },
    { name: 'Universe 6 Saga', start: 28, end: 46 },
    { name: 'Future Trunks Saga', start: 47, end: 76 },
    { name: 'Tournament of Power', start: 77, end: 131 },
  ],

  // ── Bleach ─────────────────────────────────────────────────────────────────
  269: [
    { name: 'Agent of the Shinigami', start: 1, end: 20 },
    { name: 'Soul Society: The Sneak Entry', start: 21, end: 41 },
    { name: 'Soul Society: The Rescue', start: 42, end: 63 },
    { name: 'Bount', start: 64, end: 91, filler: true },
    { name: 'Arrancar: The Arrival', start: 110, end: 131 },
    { name: 'Arrancar: Hueco Mundo Expedition', start: 132, end: 167 },
    { name: 'Arrancar: Fake Karakura Town', start: 190, end: 266 },
    { name: 'The Lost Substitute Shinigami', start: 343, end: 366 },
  ],

  // ── Hunter × Hunter (2011) ─────────────────────────────────────────────────
  11061: [
    { name: 'Hunter Exam', start: 1, end: 21 },
    { name: 'Zoldyck Family', start: 22, end: 26 },
    { name: 'Heavens Arena', start: 27, end: 36 },
    { name: 'Yorknew City', start: 37, end: 58 },
    { name: 'Greed Island', start: 59, end: 75 },
    { name: 'Chimera Ant', start: 76, end: 136 },
    { name: 'Election', start: 137, end: 148 },
  ],

  // ── Fullmetal Alchemist: Brotherhood ──────────────────────────────────────
  5114: [
    { name: 'Elric Brothers & Homunculi', start: 1, end: 14 },
    { name: 'Rush Valley', start: 15, end: 26 },
    { name: "Ishbal & Father's Truth", start: 27, end: 33 },
    { name: 'Northern Command', start: 34, end: 45 },
    { name: 'The Promised Day', start: 46, end: 64 },
  ],

  // ── Attack on Titan (S1) ───────────────────────────────────────────────────
  16498: [
    { name: 'Fall of Shiganshina', start: 1, end: 5 },
    { name: 'Battle of Trost District', start: 6, end: 13 },
    { name: 'The Female Titan', start: 14, end: 25 },
  ],

  // ── Demon Slayer S1 ────────────────────────────────────────────────────────
  38000: [
    { name: 'Final Selection', start: 1, end: 5 },
    { name: 'Asakusa', start: 6, end: 8 },
    { name: 'Tsuzumi Mansion', start: 9, end: 13 },
    { name: 'Mt. Natagumo', start: 14, end: 21 },
    { name: 'Rehabilitation Training', start: 22, end: 26 },
  ],

  // ── My Hero Academia S1 ────────────────────────────────────────────────────
  31964: [
    { name: 'Entrance Exam', start: 1, end: 4 },
    { name: 'U.A. High School', start: 5, end: 8 },
    { name: 'Battle Training', start: 9, end: 11 },
    { name: 'Unforeseen Simulation Joint', start: 12, end: 13 },
  ],

  // ── Sword Art Online ───────────────────────────────────────────────────────
  11757: [
    { name: 'Aincrad', start: 1, end: 14 },
    { name: 'Fairy Dance (ALfheim Online)', start: 15, end: 25 },
  ],

  // ── Death Note ─────────────────────────────────────────────────────────────
  1535: [
    { name: 'L vs Kira', start: 1, end: 26 },
    { name: 'Near & Mello vs Kira', start: 27, end: 37 },
  ],

  // ── Code Geass ─────────────────────────────────────────────────────────────
  1575: [
    { name: 'Rise of the Black Knights', start: 1, end: 17 },
    { name: 'Fall of Zero', start: 18, end: 25 },
  ],

  // ── Code Geass R2 ──────────────────────────────────────────────────────────
  2904: [
    { name: 'Return of Zero', start: 1, end: 10 },
    { name: 'Black Rebellion', start: 11, end: 25 },
  ],
}
