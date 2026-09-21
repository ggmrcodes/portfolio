/**
 * A damped spring and the two gesture helpers that go with it. Pure maths:
 * no React, no DOM, so it can be reasoned about and unit-tested on its own
 * (see spring.test.ts). components/CardDeck.tsx is the only caller.
 *
 * A spring is described the way Apple's design tools describe one, with two
 * numbers a designer can feel, instead of mass / stiffness / damping:
 *
 *   response      how quickly it gets there, in seconds (not a duration:
 *                 a spring has no fixed end, it settles)
 *   dampingRatio  1 is critically damped: it arrives without overshooting.
 *                 Below 1 it overshoots and bounces. Lower is bouncier.
 *
 * Springs are used rather than timed animations because a spring only knows
 * where it is, how fast it is moving and where it is going. That means it
 * can start from wherever a card currently is, inherit the speed of the
 * finger that let go of it, and be re-targeted or grabbed at any moment.
 */
export interface SpringConfig {
  stiffness: number
  damping: number
}

export interface SpringState {
  value: number
  velocity: number
}

/** Convert (response, dampingRatio) to the physical constants, for a mass of 1 */
export function springConfig(response: number, dampingRatio: number): SpringConfig {
  const omega = (2 * Math.PI) / response // natural frequency
  return { stiffness: omega * omega, damping: 2 * dampingRatio * omega }
}

/** For anything that was not thrown: arrive smoothly, no bounce */
export const SETTLE = springConfig(0.4, 1)
/** Only when a flick carried real momentum: a little overshoot reads as physical */
export const THROW = springConfig(0.35, 0.8)

const MAX_STEP = 1 / 120 // integrate in slices this small so a slow frame cannot blow the spring up
const MAX_FRAME = 0.064 // a frame longer than this means the tab was asleep; do not try to catch up

/**
 * Advance a spring by `dt` seconds toward `target` (semi-implicit Euler:
 * velocity first, then position, which stays stable where plain Euler gains energy).
 */
export function stepSpring(state: SpringState, target: number, config: SpringConfig, dt: number): SpringState {
  let { value, velocity } = state
  let remaining = Math.min(dt, MAX_FRAME)
  while (remaining > 1e-9) {
    const h = Math.min(MAX_STEP, remaining)
    const acceleration = -config.stiffness * (value - target) - config.damping * velocity
    velocity += acceleration * h
    value += velocity * h
    remaining -= h
  }
  return { value, velocity }
}

/** Close enough and slow enough that no one could see another frame of it */
export function isAtRest(state: SpringState, target: number, distance = 0.05, speed = 0.5): boolean {
  return Math.abs(state.value - target) < distance && Math.abs(state.velocity) < speed
}

/**
 * Where would something moving at `velocity` (px/s) coast to a stop?
 * This is the scroll-deceleration formula Apple uses, and it is how a small
 * flick becomes a big throw: the decision is made on where the gesture was
 * going, not on where the finger happened to let go.
 */
export function project(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate)
}

/**
 * Soft boundary. The further past the limit you pull, the less it follows,
 * approaching (never reaching) `dimension`. Keeps the sign of `overshoot`.
 */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}
