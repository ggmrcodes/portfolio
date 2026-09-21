import { useEffect, useRef } from 'react'
import {
  CENTRE,
  CREST,
  EYE_LIDS,
  NECK,
  SHOULDER,
  SOUND_ARCS,
  STAND,
  buildAvatar,
  buildNote,
  buildZ,
  palette,
  type Voxel,
} from '../data/avatar'
import { buildRapier, poseStand } from '../lib/poseStand'

/**
 * The voxel avatar in the hero. three.js is imported on demand so it never
 * sits in the initial bundle, and the canvas only exists on wide screens
 * where there is empty space to the right of the text.
 */
type Three = typeof import('three')
type GLTFLoaderModule = typeof import('three/addons/loaders/GLTFLoader.js')

const BPM = 124 // house tempo; drives the head nod
const VIEW_HEIGHT = 100 // world units visible top to bottom
const RIG_Y = -16 // push the scene down so the notes and the rapier have headroom

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

// Timing helpers for the wake-up sequence. `phase` turns the clock into a
// 0..1 progress for one step; the easings shape how that step moves.
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const phase = (t: number, start: number, duration: number) => clamp01((t - start) / duration)
const easeOutCubic = (x: number) => 1 - (1 - x) ** 3
const easeOutBack = (x: number) => 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2 // overshoots, then settles

export function HeroScene() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    // Same breakpoint as the `xl:block` class: phones never download three.js
    if (!host || !matchMedia('(min-width: 1280px)').matches) return
    let disposed = false
    let teardown = () => {}

    Promise.all([import('three'), import('three/addons/loaders/GLTFLoader.js')]).then(([THREE, loaders]) => {
      if (disposed) return
      teardown = mount(THREE, loaders, host)
      host.classList.add('opacity-100')
    })

    return () => {
      disposed = true
      teardown()
    }
  }, [])

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 right-0 top-16 hidden w-[45%] opacity-0 transition-opacity duration-700 xl:block"
    />
  )
}

function mount(THREE: Three, { GLTFLoader }: GLTFLoaderModule, host: HTMLElement) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
  // Draw at the display's own density (capped at 2x) so the printed crest stays sharp
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  // The canvas is transparent, so a hard 1px drop shadow in four directions
  // draws an outline around the silhouette, the way pixel art sprites are inked.
  const ink = 'var(--avatar-outline)'
  Object.assign(renderer.domElement.style, {
    width: '100%',
    height: '100%',
    imageRendering: 'pixelated',
    filter: `drop-shadow(1px 0 0 ${ink}) drop-shadow(-1px 0 0 ${ink}) drop-shadow(0 1px 0 ${ink}) drop-shadow(0 -1px 0 ${ink})`,
  })
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200)
  camera.position.set(0, 14, 60)
  camera.lookAt(0, 0, 0)

  // Three-point light: soft fill from the sky, a warm key from the top left,
  // and a cool rim from behind so the figure separates from the background.
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x1c2433, 1.1))
  const key = new THREE.DirectionalLight(0xfff3e0, 2.1)
  key.position.set(-7, 14, 9)
  const rim = new THREE.DirectionalLight(0x22d3ee, 1.4)
  rim.position.set(9, 6, -8)
  scene.add(key, rim)

  const cube = new THREE.BoxGeometry(1, 1, 1)
  const solid = new THREE.MeshLambertMaterial()
  const m = new THREE.Matrix4()

  /**
   * One instanced mesh for a list of voxels. `pivot` becomes the group's own
   * origin, so rotating the group turns the part about that point.
   */
  function part(voxels: Voxel[], pivot: { x: number; y: number; z: number }) {
    const group = new THREE.Group()
    const mesh = new THREE.InstancedMesh(cube, solid, voxels.length)
    const color = new THREE.Color()
    voxels.forEach((v, i) => {
      mesh.setMatrixAt(i, m.makeTranslation(v.x - pivot.x, v.y - pivot.y, v.z - pivot.z))
      mesh.setColorAt(i, color.set(v.color))
    })
    group.add(mesh)
    group.position.set(pivot.x - CENTRE.x, pivot.y - CENTRE.y, pivot.z - CENTRE.z)
    return { group, mesh }
  }

  // The character, centred on the origin so the whole rig can rotate in place.
  // The head pivots at the neck and the sabre arm at the shoulder.
  const rig = new THREE.Group()
  scene.add(rig)
  const voxels = buildAvatar()
  const headVoxels = voxels.filter((v) => v.part === 'head')
  const { group: body } = part(voxels.filter((v) => v.part === 'body'), CENTRE)
  const { group: head, mesh: headMesh } = part(headVoxels, NECK)
  const { group: arm } = part(voxels.filter((v) => v.part === 'arm'), SHOULDER)
  const headBaseY = head.position.y
  rig.add(body, head, arm)

  // Eyelids: recolour the top row of each eye to open or close them
  const lids = EYE_LIDS.map((c) => headVoxels.findIndex((v) => v.x === c.x && v.y === c.y && v.z === c.z)).filter((i) => i >= 0)
  const lidOpen = lids.map((i) => new THREE.Color(headVoxels[i].color))
  const lidShut = new THREE.Color(palette.skin)
  let eyesOpen = true
  function setEyes(open: boolean) {
    if (open === eyesOpen) return
    eyesOpen = open
    lids.forEach((i, k) => headMesh.setColorAt(i, open ? lidOpen[k] : lidShut))
    headMesh.instanceColor!.needsUpdate = true
  }

  // The Brown coat of arms, printed on the chest as a textured plane
  const crestHeight = CREST.width * CREST.aspect
  const crestGeometry = new THREE.PlaneGeometry(CREST.width, crestHeight)
  const crestMaterial = new THREE.MeshLambertMaterial({ transparent: true, alphaTest: 0.2 })
  const crest = new THREE.Mesh(crestGeometry, crestMaterial)
  crest.position.set(CREST.centreX - CENTRE.x, CREST.bottom + crestHeight / 2 - CENTRE.y, CREST.z - CENTRE.z)
  crest.visible = false
  body.add(crest)
  let crestTexture: import('three').Texture | undefined
  new THREE.TextureLoader().load(CREST.url, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
    crestMaterial.map = texture
    crestMaterial.needsUpdate = true
    crest.visible = true
    crestTexture = texture
    if (reducedMotion) still()
  })

  // Silver Chariot behind the avatar: loaded from a GLB, scaled to STAND.height,
  // made translucent with a cool glow so it reads as a Stand rather than a statue
  const stand = new THREE.Group()
  const standBaseY = -CENTRE.y + STAND.lift
  stand.position.set(STAND.x - CENTRE.x, standBaseY, STAND.z - CENTRE.z)
  stand.visible = false // summoned by the wake-up sequence once the model has loaded
  rig.add(stand)
  const standMaterials: import('three').MeshStandardMaterial[] = []
  let standReadyAt: number | null = null
  new GLTFLoader().load(STAND.url, (gltf) => {
    // Normalise: scale to STAND.height, centre on x and z, feet at y = 0
    const model = gltf.scene
    const box = new THREE.Box3().setFromObject(model)
    model.scale.setScalar(STAND.height / box.getSize(new THREE.Vector3()).y)
    box.setFromObject(model)
    const centre = box.getCenter(new THREE.Vector3())
    model.position.set(-centre.x, -box.min.y, -centre.z)
    model.updateMatrixWorld(true)

    // Bake that transform into the vertices so the poser can work in one space
    const meshes: import('three').Mesh[] = []
    model.traverse((node) => {
      if ((node as import('three').Mesh).isMesh) meshes.push(node as import('three').Mesh)
    })
    meshes.forEach((mesh) => {
      mesh.geometry.applyMatrix4(mesh.matrixWorld)
      mesh.position.set(0, 0, 0)
      mesh.quaternion.identity()
      mesh.scale.set(1, 1, 1)
      stand.add(mesh)

      const material = mesh.material as import('three').MeshStandardMaterial
      material.transparent = true
      material.opacity = STAND.opacity
      material.emissiveIntensity = STAND.glow
      standMaterials.push(material)
    })

    // Lower the arms out of their spread pose and put a rapier in the sword hand
    const { hand, blade } = poseStand(THREE, meshes.map((mesh) => mesh.geometry), STAND.height)
    const steel = new THREE.MeshStandardMaterial({
      color: 0xd5dde8,
      metalness: 0.2,
      roughness: 0.35,
      transparent: true,
      opacity: Math.min(1, STAND.opacity + 0.2),
      emissiveIntensity: STAND.glow,
    })
    standMaterials.push(steel)
    const rapier = buildRapier(THREE, STAND.height, steel)
    rapier.position.copy(hand)
    rapier.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), blade)
    stand.add(rapier)

    standMaterials.forEach((material) => (material.userData.opacity = material.opacity))
    standReadyAt = reducedMotion ? -Infinity : timer.getElapsed()
    applyTheme()
    if (reducedMotion) still()
  })

  // Checkerboard floor under the feet (4x4 tiles), with a darker patch for a shadow
  const TILE = 4
  const tiles: { x: number; z: number; odd: boolean }[] = []
  for (let tx = -2; tx <= 10; tx++)
    for (let tz = -2; tz <= 4; tz++) tiles.push({ x: tx * TILE + 1.5, z: tz * TILE + 1.5, odd: (tx + tz) % 2 !== 0 })
  const floor = new THREE.InstancedMesh(new THREE.BoxGeometry(TILE, 0.6, TILE), solid, tiles.length)
  tiles.forEach((t, i) => floor.setMatrixAt(i, m.makeTranslation(t.x - CENTRE.x, -0.3 - CENTRE.y, t.z - CENTRE.z)))
  rig.add(floor)
  const inShadow = (t: { x: number; z: number }) => ((t.x - 12) / 18) ** 2 + ((t.z - 7) / 9) ** 2 <= 1

  // Sound waves at the AirPod, pulsing on the beat
  const arcMaterial = new THREE.MeshLambertMaterial({ transparent: true })
  const arcs = new THREE.InstancedMesh(cube, arcMaterial, SOUND_ARCS.length)
  SOUND_ARCS.forEach((c, i) => arcs.setMatrixAt(i, m.makeTranslation(c.x - CENTRE.x, c.y - CENTRE.y, c.z - CENTRE.z)))
  rig.add(arcs)

  /** A small flat sprite made of cubes, coloured from a theme token, that can fade */
  function sprite(cells: { x: number; y: number }[], token: string) {
    const material = new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 })
    const mesh = new THREE.InstancedMesh(cube, material, cells.length)
    cells.forEach((c, i) => mesh.setMatrixAt(i, m.makeTranslation(c.x, c.y, 0)))
    const group = new THREE.Group()
    group.add(mesh)
    rig.add(group)
    return { token, material, group }
  }

  // Three pixel notes that drift up from the AirPod once the music starts,
  // and two Z's that drift up while the avatar is still asleep
  const notes = ['--accent', '--cyan', '--amber'].map((token) => sprite(buildNote(), token))
  const zs = ['--muted', '--muted'].map((token) => sprite(buildZ(), token))

  function applyTheme() {
    const line = new THREE.Color(cssVar('--line'))
    const panel = new THREE.Color(cssVar('--panel'))
    const shadow = line.clone().lerp(new THREE.Color(0x000000), 0.35)
    tiles.forEach((t, i) => {
      const base = t.odd ? panel : line
      floor.setColorAt(i, inShadow(t) ? base.clone().lerp(shadow, 0.6) : base)
    })
    floor.instanceColor!.needsUpdate = true
    standMaterials.forEach((material) => material.emissive.set(cssVar('--cyan')))
    arcMaterial.color.set(cssVar('--accent'))
    ;[...notes, ...zs].forEach((s) => s.material.color.set(cssVar(s.token)))
  }
  applyTheme()
  const themeWatcher = new MutationObserver(() => {
    applyTheme()
    if (reducedMotion) still()
  })
  themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  function resize() {
    const w = host.clientWidth || 1
    const h = host.clientHeight || 1
    renderer.setSize(w, h, false)
    const aspect = w / h
    camera.top = VIEW_HEIGHT / 2
    camera.bottom = -VIEW_HEIGHT / 2
    camera.left = (-VIEW_HEIGHT / 2) * aspect
    camera.right = (VIEW_HEIGHT / 2) * aspect
    camera.updateProjectionMatrix()
  }
  resize()
  const sizeWatcher = new ResizeObserver(resize)
  sizeWatcher.observe(host)

  // Mouse parallax, normalised to -1..1 across the window
  const mouse = { x: 0, y: 0 }
  function onMouse(e: MouseEvent) {
    mouse.x = (e.clientX / innerWidth) * 2 - 1
    mouse.y = (e.clientY / innerHeight) * 2 - 1
  }

  const timer = new THREE.Timer()
  let frameId = 0
  let inView = true

  /**
   * Everything that moves, as a function of seconds since the scene mounted.
   * The first few seconds are the wake-up sequence; each step below has its
   * own 0..1 progress, and once they all reach 1 this is just the idle loop.
   *
   *   0.0  asleep: head dropped, eyes shut, sabre lowered, Z's drifting up
   *   0.7  eyes open, one sleepy blink
   *   0.9  head and body lift
   *   1.3  sabre swings up into guard
   *   1.9  the music starts: head nod, notes, sound waves
   *   2.0  the Stand is summoned (or as soon as its model has loaded)
   */
  function pose(t: number) {
    const beat = ((t * BPM) / 60) * Math.PI * 2
    const pulse = Math.max(0, Math.sin(beat))

    const asleep = 1 - phase(t, 0.7, 0.6)
    const lifted = easeOutBack(phase(t, 0.9, 0.9))
    const drawn = easeOutBack(phase(t, 1.3, 0.8))
    const music = easeOutCubic(phase(t, 1.9, 0.9))
    const summon = standReadyAt === null ? 0 : phase(t, Math.max(2.0, standReadyAt), 1.3)

    // Eyes: shut while asleep, a sleepy blink on waking, then a blink every few seconds
    const sleepyBlink = t > 1.0 && t < 1.15
    const idleBlink = t > 3 && t % 4.6 > 4.48
    setEyes(t > 0.7 && !sleepyBlink && !idleBlink)

    rig.rotation.y = -0.5 + Math.sin(t * 0.5) * 0.1 + mouse.x * 0.3
    rig.rotation.x = mouse.y * 0.06
    rig.position.y = RIG_Y - (1 - lifted) * 1.2 + Math.sin(beat / 2) * 0.3 * music
    head.rotation.x = (1 - lifted) * 0.5 + Math.sin(beat) * 0.04 * music // droops forward, then nods
    head.position.y = headBaseY + pulse * 0.6 * music
    arm.rotation.x = (1 - drawn) * 1.35 // sabre tipped forward and down until it is drawn
    arm.rotation.z = (Math.sin(t * 0.9) * 0.09 + pulse * 0.02) * drawn // slow flourish

    // The Stand rises out from behind the avatar, growing and fading in with a burst of glow
    const rise = easeOutCubic(summon)
    stand.visible = summon > 0
    stand.scale.setScalar(0.3 + 0.7 * easeOutBack(summon))
    stand.position.y = standBaseY - (1 - rise) * 16 + Math.sin(t * 0.8) * 1.4 * rise
    stand.rotation.y = (1 - rise) * -1.1 + Math.sin(t * 0.35) * 0.07
    const burst = Math.sin(summon * Math.PI)
    standMaterials.forEach((material) => {
      material.opacity = material.userData.opacity * rise
      material.emissiveIntensity = STAND.glow + burst * 0.9
    })

    arcMaterial.opacity = (0.35 + 0.65 * pulse) * music
    notes.forEach((n, i) => {
      const p = (t * 0.3 + i / notes.length) % 1 // 0 at the ear, 1 fully risen
      const fade = Math.sin(p * Math.PI)
      n.group.position.set(22 - CENTRE.x + Math.sin(p * 5 + i) * 3, 45 - CENTRE.y + p * 22, 8 - CENTRE.z)
      n.group.scale.setScalar(2 * (0.5 + 0.5 * fade))
      n.material.opacity = fade * music
    })
    zs.forEach((z, i) => {
      const p = (t * 0.55 + i * 0.5) % 1
      z.group.visible = asleep > 0
      z.group.position.set(17 - CENTRE.x + p * 7, 47 - CENTRE.y + p * 13, 8 - CENTRE.z)
      z.group.scale.setScalar(1 + p)
      z.material.opacity = Math.sin(p * Math.PI) * asleep
    })
  }

  function frame(now?: number) {
    timer.update(now)
    pose(timer.getElapsed())
    renderer.render(scene, camera)
    if (inView) frameId = requestAnimationFrame(frame)
  }

  /** For reduced motion: one frame of the settled idle pose, with nothing drifting */
  function still() {
    pose(60)
    ;[...notes, ...zs].forEach((s) => (s.group.visible = false))
    renderer.render(scene, camera)
  }

  const viewWatcher = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting
    if (inView && !reducedMotion) frameId = requestAnimationFrame(frame)
  })

  if (reducedMotion) {
    still()
  } else {
    addEventListener('mousemove', onMouse)
    viewWatcher.observe(host)
  }

  return () => {
    cancelAnimationFrame(frameId)
    removeEventListener('mousemove', onMouse)
    sizeWatcher.disconnect()
    themeWatcher.disconnect()
    viewWatcher.disconnect()
    cube.dispose()
    crestGeometry.dispose()
    crestMaterial.dispose()
    crestTexture?.dispose()
    stand.traverse((node) => (node as import('three').Mesh).geometry?.dispose())
    standMaterials.forEach((material) => {
      material.map?.dispose()
      material.dispose()
    })
    solid.dispose()
    arcMaterial.dispose()
    floor.geometry.dispose()
    ;[...notes, ...zs].forEach((s) => s.material.dispose())
    renderer.dispose()
    renderer.domElement.remove()
  }
}
