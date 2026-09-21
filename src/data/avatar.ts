/**
 * The voxel avatar shown in the hero, described as boxes on an integer grid
 * roughly 48 wide and 50 tall. x runs left to right (viewer's view), y runs
 * up, z runs toward the viewer. Later `set` calls overwrite earlier ones, so
 * details are painted on top of the base shapes in the order they appear.
 */
export interface Voxel {
  x: number
  y: number
  z: number
  color: string
  /** Parts that move on their own get their own mesh: the head nods, the sabre arm flourishes. */
  part: 'body' | 'head' | 'arm'
}

export const palette = {
  skin: '#e3ad86',
  skinShade: '#c9926c',
  blush: '#e08e80',
  hair: '#15120f',
  hairShine: '#2b2420',
  hoodie: '#5b3f2e', // Brown University seal brown, lifted a touch for the dark background
  hoodieDark: '#3f2a1e',
  hoodieLight: '#74523d',
  red: '#c00404', // Brown University red
  white: '#f4f6f8',
  denim: '#26334d',
  denimDark: '#1b2538',
  denimLight: '#33456a',
  sole: '#1c2230',
  metal: '#b9c5d3',
  metalDark: '#8a97ab',
  metalBright: '#e6edf5',
  grip: '#1a1a1a',
  eye: '#15120f',
  mouth: '#b9755c',
}

/** Grid point that sits at the rig's origin (mid torso) */
export const CENTRE = { x: 12, y: 24, z: 6 }
/** Where the sabre arm pivots (the shoulder), in grid units */
export const SHOULDER = { x: 21, y: 30, z: 6 }

type Range = [from: number, to: number]

export function buildAvatar(): Voxel[] {
  const cells = new Map<string, Voxel>()

  function set(color: string, part: Voxel['part'], [x0, x1]: Range, [y0, y1]: Range, [z0, z1]: Range) {
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++)
        for (let z = z0; z <= z1; z++) cells.set(`${x},${y},${z}`, { x, y, z, color, part })
  }
  const dot = (color: string, part: Voxel['part'], x: number, y: number, z: number) =>
    set(color, part, [x, x], [y, y], [z, z])

  const p = palette

  // ---- Head ------------------------------------------------------------
  set(p.skin, 'head', [6, 17], [34, 45], [1, 10])
  set(p.skinShade, 'head', [6, 17], [34, 34], [1, 10]) // jaw shadow
  // Short black hair: top with a messy tuft, back, sides, and a swept fringe
  set(p.hair, 'head', [6, 17], [44, 45], [1, 10])
  set(p.hair, 'head', [8, 15], [46, 46], [2, 9])
  set(p.hair, 'head', [9, 13], [47, 47], [3, 7])
  set(p.hair, 'head', [6, 17], [36, 45], [1, 2])
  set(p.hair, 'head', [6, 7], [39, 45], [1, 10])
  set(p.hair, 'head', [16, 17], [39, 45], [1, 10])
  set(p.hair, 'head', [6, 17], [42, 45], [10, 10])
  set(p.hair, 'head', [6, 11], [41, 41], [10, 10])
  set(p.hair, 'head', [6, 8], [40, 40], [10, 10])
  set(p.hair, 'head', [6, 6], [37, 38], [3, 6]) // sideburns
  set(p.hair, 'head', [17, 17], [37, 38], [3, 6])
  for (let x = 9; x <= 14; x += 2) dot(p.hairShine, 'head', x, 45, 4 + ((x / 2) % 3)) // sheen
  // Face: brows, two-voxel eyes with a highlight, nose, smile, blush
  set(p.hair, 'head', [9, 10], [40, 40], [10, 10])
  set(p.hair, 'head', [13, 15], [40, 40], [10, 10])
  set(p.eye, 'head', [8, 9], [38, 39], [10, 10])
  set(p.eye, 'head', [14, 15], [38, 39], [10, 10])
  dot(p.white, 'head', 8, 39, 10)
  dot(p.white, 'head', 14, 39, 10)
  set(p.skinShade, 'head', [11, 12], [36, 37], [10, 10])
  set(p.skin, 'head', [11, 12], [36, 37], [11, 11])
  dot(p.mouth, 'head', 10, 35, 10)
  set(p.mouth, 'head', [11, 12], [34, 34], [10, 10])
  dot(p.mouth, 'head', 13, 35, 10)
  dot(p.blush, 'head', 8, 36, 10)
  dot(p.blush, 'head', 15, 36, 10)
  // Ears, with an AirPod Pro sitting in front of each and a short stem
  set(p.skin, 'head', [5, 5], [37, 39], [5, 6])
  set(p.skin, 'head', [18, 18], [37, 39], [5, 6])
  dot(p.skinShade, 'head', 5, 38, 6)
  dot(p.skinShade, 'head', 18, 38, 6)
  set(p.white, 'head', [5, 5], [36, 38], [7, 7])
  set(p.white, 'head', [18, 18], [36, 38], [7, 7])

  // ---- Neck and torso ----------------------------------------------------
  set(p.hoodie, 'body', [4, 19], [16, 30], [3, 9])
  set(p.hoodie, 'body', [5, 18], [31, 31], [3, 9]) // rounded shoulders
  set(p.hoodie, 'body', [6, 17], [27, 35], [1, 2]) // hood resting on the back
  set(p.hoodieDark, 'body', [8, 15], [30, 33], [3, 3]) // inside of the hood
  set(p.hoodieDark, 'body', [5, 18], [31, 31], [9, 9]) // collar seam
  set(p.skin, 'body', [10, 13], [31, 33], [4, 7]) // neck
  set(p.skinShade, 'body', [10, 13], [33, 33], [4, 7])
  // Kangaroo pocket with an opening, drawstrings with aglets.
  // The Brown coat of arms is printed between the strings; see CREST below.
  set(p.hoodieDark, 'body', [6, 17], [17, 19], [9, 9])
  set(p.hoodie, 'body', [11, 12], [18, 19], [9, 9])
  set(p.hoodieLight, 'body', [6, 17], [20, 20], [9, 9])
  set(p.white, 'body', [7, 7], [24, 29], [9, 9])
  set(p.white, 'body', [16, 16], [24, 29], [9, 9])
  dot(p.metal, 'body', 7, 23, 9)
  dot(p.metal, 'body', 16, 23, 9)
  // Ribbed hem
  for (let x = 4; x <= 19; x++) set(x % 2 ? p.hoodie : p.hoodieDark, 'body', [x, x], [16, 16], [3, 9])

  // Left arm hangs down and holds the crutch
  set(p.hoodie, 'body', [0, 3], [18, 29], [4, 8])
  set(p.hoodie, 'body', [1, 3], [30, 30], [4, 8])
  for (let x = 0; x <= 3; x++) set(x % 2 ? p.hoodie : p.hoodieDark, 'body', [x, x], [18, 19], [4, 8]) // cuff

  // ---- Four-point crutch ------------------------------------------------
  set(p.metal, 'body', [-2, -1], [2, 14], [5, 6])
  set(p.metalDark, 'body', [-2, -2], [2, 14], [5, 5])
  set(p.grip, 'body', [-2, 1], [15, 16], [5, 6]) // handle, wrapped by the hand below
  set(p.metal, 'body', [-2, -1], [0, 1], [5, 6]) // hub
  const legs: [number, number][] = [
    [-4, 3], [-3, 4], [0, 7], [1, 8], // one diagonal
    [-4, 8], [-3, 7], [0, 4], [1, 3], // the other
  ]
  legs.forEach(([x, z]) => dot(p.metal, 'body', x, 0, z))
  ;[[-4, 3], [1, 8], [-4, 8], [1, 3]].forEach(([x, z]) => set(p.sole, 'body', [x, x], [0, 1], [z, z])) // rubber feet

  // Left hand, drawn after the handle so it wraps around it
  set(p.skin, 'body', [0, 3], [15, 17], [4, 8])
  dot(p.skinShade, 'body', 1, 16, 8)
  dot(p.skinShade, 'body', 3, 16, 8)

  // ---- Jeans and sneakers ----------------------------------------------
  set(p.denim, 'body', [4, 10], [3, 15], [4, 9])
  set(p.denim, 'body', [13, 19], [3, 15], [4, 9])
  set(p.denimDark, 'body', [10, 10], [3, 15], [4, 9]) // inner seams
  set(p.denimDark, 'body', [13, 13], [3, 15], [4, 9])
  set(p.denimLight, 'body', [7, 7], [4, 14], [9, 9]) // front creases
  set(p.denimLight, 'body', [16, 16], [4, 14], [9, 9])
  set(p.denimDark, 'body', [5, 9], [9, 9], [9, 9]) // knees
  set(p.denimDark, 'body', [14, 18], [9, 9], [9, 9])
  set(p.denimDark, 'body', [4, 19], [3, 3], [4, 9]) // hems
  set(p.sole, 'body', [3, 10], [0, 0], [4, 11])
  set(p.sole, 'body', [13, 20], [0, 0], [4, 11])
  set(p.white, 'body', [3, 10], [1, 2], [4, 11])
  set(p.white, 'body', [13, 20], [1, 2], [4, 11])
  set(p.red, 'body', [4, 9], [1, 2], [11, 11]) // toe stripes
  set(p.red, 'body', [14, 19], [1, 2], [11, 11])
  for (const x of [5, 7, 9, 14, 16, 18]) dot(p.red, 'body', x, 2, 10) // laces

  // ---- Right arm, bent forward, holding the sabre (its own mesh) --------
  set(p.hoodie, 'arm', [20, 23], [24, 29], [4, 8]) // upper arm
  set(p.hoodie, 'arm', [20, 22], [30, 30], [4, 8])
  set(p.hoodie, 'arm', [22, 27], [21, 24], [6, 10]) // forearm comes forward and out
  for (let x = 27; x <= 28; x++) set(x % 2 ? p.hoodieDark : p.hoodie, 'arm', [x, x], [21, 24], [6, 10]) // cuff
  set(p.skin, 'arm', [29, 31], [20, 25], [7, 10]) // fist
  set(p.skinShade, 'arm', [29, 31], [21, 21], [10, 10]) // finger lines
  set(p.skinShade, 'arm', [29, 31], [23, 23], [10, 10])
  // Sabre: grip and pommel in front of the fist, knuckle bow and cup guard, then the blade
  set(p.grip, 'arm', [30, 31], [19, 26], [11, 11])
  set(p.metal, 'arm', [30, 31], [18, 18], [11, 11])
  const bow: [number, number][] = [[32, 19], [33, 20], [34, 21], [34, 22], [34, 23], [34, 24], [33, 25], [32, 26]]
  bow.forEach(([x, y]) => dot(p.metal, 'arm', x, y, 11))
  set(p.metal, 'arm', [31, 34], [20, 25], [12, 12]) // cup
  set(p.metalDark, 'arm', [31, 34], [20, 20], [12, 12])
  for (let i = 0; i < 24; i++) {
    const x = 31 + Math.floor(i / 2)
    dot(i >= 21 ? p.metalBright : p.metal, 'arm', x, 27 + i, 11)
  }

  return [...cells.values()]
}

/**
 * The Brown University coat of arms, printed on the chest as a textured
 * plane rather than voxels so it stays exact. The PNG is rasterised from
 * the Wikimedia Commons vector (CC BY-SA 4.0); see the README credits.
 */
export const CREST = {
  url: '/avatar/brown-crest.png',
  /** Grid coordinates: centred between the drawstrings, sitting on the pocket seam */
  centreX: 11.5,
  bottom: 20.5,
  width: 6.6,
  aspect: 463 / 320, // height / width of the PNG
  z: 9.6, // just proud of the chest face at z = 9.5
}

/**
 * Silver Chariot, standing behind the avatar the way a Stand looms behind
 * its user. Model by xugangruix on Sketchfab (CC BY 4.0); see the README.
 * Distances are in the same grid units as the voxels.
 */
export const STAND = {
  url: '/avatar/silver-chariot.glb',
  height: 58, // the avatar is about 47 tall
  x: -1, // grid x of the Stand's centre line; left of the avatar so it reads as centred once the rig is turned
  z: -14, // behind the avatar
  lift: 14, // how far its feet float above the floor, high enough that both arms clear the avatar's head
  opacity: 0.55,
  glow: 0.16, // emissive strength of the cool tint
}

/** Where the head pivots (the base of the neck), so it can droop and nod in place */
export const NECK = { x: 12, y: 33, z: 6 }

/**
 * The upper row of each eye. Painting these skin-coloured leaves only the
 * lower row dark, which reads as a closed eye: used for sleeping and blinking.
 */
export const EYE_LIDS = [8, 9, 14, 15].map((x) => ({ x, y: 39, z: 10 }))

/** Small pixel sprites, drawn top row first: '#' is a filled cell */
const NOTE_ROWS = ['..#', '.##', '.#.', '.#.', '##.', '##.']
const Z_ROWS = ['####', '..#.', '.#..', '####']

function buildGlyph(rows: string[]): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = []
  rows.forEach((row, rowIndex) => {
    const y = rows.length - 1 - rowIndex
    ;[...row].forEach((ch, x) => {
      if (ch === '#') cells.push({ x, y })
    })
  })
  return cells
}

/** A pixel eighth-note for the music, and a Z for sleeping */
export const buildNote = () => buildGlyph(NOTE_ROWS)
export const buildZ = () => buildGlyph(Z_ROWS)

/** Two sound-wave arcs next to the right AirPod, in grid units. */
export const SOUND_ARCS: { x: number; y: number; z: number }[] = [
  ...[[21, 41], [22, 40], [22, 39], [22, 38], [22, 37], [21, 36]].map(([x, y]) => ({ x, y, z: 8 })),
  ...[[24, 43], [25, 42], [26, 41], [26, 40], [26, 39], [26, 38], [26, 37], [25, 36], [24, 35]].map(([x, y]) => ({ x, y, z: 8 })),
]
