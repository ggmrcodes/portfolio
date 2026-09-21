/**
 * The Silver Chariot model is a static mesh with no skeleton, frozen with
 * its arms spread. This poses it by hand: each arm is treated as two
 * virtual bones (shoulder to elbow, elbow to wrist), every vertex that lies
 * along the arm is rotated about those two joints, and the rotation is
 * blended in smoothly around each joint so the mesh bends instead of tearing.
 *
 * All landmark positions were measured from the mesh and are expressed as
 * fractions of the model's height, so they survive any rescaling. The
 * geometry passed in must already be baked into a space where the feet are
 * at y = 0, the model is centred on x and z, and it faces +z.
 */
type Three = typeof import('three')
type Vector3 = import('three').Vector3
type BufferGeometry = import('three').BufferGeometry

/** Bind-pose landmarks for the arm on the +x side; the other arm mirrors x */
const SHOULDER = [0.13, 0.835, -0.02]
const WRIST = [0.41, 0.595, -0.015]
const ELBOW_AT = 0.5 // fraction of the way from shoulder to wrist
const ARM_RADIUS = 0.12 // vertices farther than this from the arm's axis are not arm

/**
 * Target directions for each virtual bone, as (x outward, y up, z toward the
 * viewer). They copy the voxel avatar: the sword arm hangs from the shoulder
 * with the forearm bent out level at the elbow, the other arm hangs straight
 * down the way the avatar's crutch arm does, and the blade rises at the same
 * one-across, two-up diagonal as the avatar's sabre.
 */
const SWORD_ARM = { upper: [0.12, -0.99, 0.02], fore: [0.95, 0.02, 0.3] }
const FREE_ARM = { upper: [0.1, -0.99, 0.0], fore: [0.07, -0.99, 0.1] }
const BLADE = [0.447, 0.894, 0.0]
const BLADE_LENGTH = 0.55 // as a fraction of the model's height, the same proportion as the avatar's sabre

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/**
 * Poses both arms in place. `swordSide` is +1 for the arm on the viewer's
 * right, the same side the avatar holds its sabre. Returns where the sword
 * hand ended up and which way the blade should point.
 */
export function poseStand(THREE: Three, geometries: BufferGeometry[], height: number, swordSide: 1 | -1 = 1) {
  const hand = poseArm(THREE, geometries, height, swordSide, SWORD_ARM)
  poseArm(THREE, geometries, height, -swordSide as 1 | -1, FREE_ARM)
  geometries.forEach((g) => g.computeVertexNormals())
  return { hand, blade: new THREE.Vector3(BLADE[0] * swordSide, BLADE[1], BLADE[2]).normalize() }
}

function poseArm(
  THREE: Three,
  geometries: BufferGeometry[],
  height: number,
  side: 1 | -1,
  pose: { upper: number[]; fore: number[] },
): Vector3 {
  const at = ([x, y, z]: number[]) => new THREE.Vector3(x * side * height, y * height, z * height)
  const dir = ([x, y, z]: number[]) => new THREE.Vector3(x * side, y, z).normalize()

  const shoulder = at(SHOULDER)
  const wrist = at(WRIST)
  const axis = wrist.clone().sub(shoulder)
  const length = axis.length()
  axis.normalize()

  const upper = dir(pose.upper)
  const fore = dir(pose.fore)
  const turnUpper = new THREE.Quaternion().setFromUnitVectors(axis, upper)
  const turnFore = new THREE.Quaternion().setFromUnitVectors(upper, fore)
  // Where the elbow lands once the upper arm has turned
  const elbow = shoulder.clone().addScaledVector(upper, ELBOW_AT * length)

  const identity = new THREE.Quaternion()
  const q = new THREE.Quaternion()
  const v = new THREE.Vector3()
  const along = new THREE.Vector3()

  for (const geometry of geometries) {
    const position = geometry.attributes.position
    for (let i = 0; i < position.count; i++) {
      v.fromBufferAttribute(position, i)
      if (v.x * side < 0.09 * height) continue // torso, or the other arm

      v.sub(shoulder)
      const t = v.dot(axis) / length // 0 at the shoulder, 1 at the wrist
      const radial = along.copy(axis).multiplyScalar(v.dot(axis)).sub(v).length()
      if (t < -0.25 || radial > ARM_RADIUS * height) continue // hip armour, chest

      // Upper arm: blend the rotation in around the shoulder
      q.copy(identity).slerp(turnUpper, smoothstep(-0.12, 0.1, t))
      v.applyQuaternion(q).add(shoulder)
      // Forearm: blend a second rotation in around the elbow
      q.copy(identity).slerp(turnFore, smoothstep(ELBOW_AT - 0.08, ELBOW_AT + 0.08, t))
      v.sub(elbow).applyQuaternion(q).add(elbow)

      position.setXYZ(i, v.x, v.y, v.z)
    }
    position.needsUpdate = true
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()
  }

  // The wrist follows both rotations
  return elbow.clone().addScaledVector(fore, (1 - ELBOW_AT) * length)
}

/**
 * A rapier from simple shapes, pointing along +y with the grip centred on
 * the origin: tapered blade, cup guard, grip, pommel.
 */
export function buildRapier(THREE: Three, height: number, material: import('three').Material) {
  const rapier = new THREE.Group()
  const add = (geometry: BufferGeometry, y: number) => {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.y = y * height
    rapier.add(mesh)
    return mesh
  }
  const h = height
  add(new THREE.CylinderGeometry(0.0012 * h, 0.006 * h, BLADE_LENGTH * h, 6), 0.05 + BLADE_LENGTH / 2) // blade
  add(new THREE.SphereGeometry(0.036 * h, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0.035) // cup guard, dome toward the tip
  add(new THREE.CylinderGeometry(0.008 * h, 0.008 * h, 0.09 * h, 8), -0.005) // grip
  add(new THREE.SphereGeometry(0.013 * h, 10, 8), -0.055) // pommel
  return rapier
}
