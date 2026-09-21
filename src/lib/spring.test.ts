import { describe, expect, it } from 'vitest'
import { SETTLE, THROW, isAtRest, project, rubberband, springConfig, stepSpring, type SpringState } from './spring'

/** Run a spring at 60fps for `seconds`, returning every value it passed through */
function run(start: SpringState, target: number, config = SETTLE, seconds = 3) {
  const values: number[] = []
  let state = start
  for (let i = 0; i < seconds * 60; i++) {
    state = stepSpring(state, target, config, 1 / 60)
    values.push(state.value)
  }
  return { state, values }
}

describe('stepSpring', () => {
  it('a critically damped spring arrives without overshooting', () => {
    const { state, values } = run({ value: 0, velocity: 0 }, 100, SETTLE)
    expect(Math.max(...values)).toBeLessThanOrEqual(100.001)
    expect(isAtRest(state, 100)).toBe(true)
  })

  it('an under-damped spring overshoots, then still settles', () => {
    const { state, values } = run({ value: 0, velocity: 0 }, 100, THROW)
    expect(Math.max(...values)).toBeGreaterThan(100)
    expect(isAtRest(state, 100)).toBe(true)
  })

  it('carries the velocity it is handed, even away from the target', () => {
    const next = stepSpring({ value: 0, velocity: -500 }, 100, SETTLE, 1 / 60)
    expect(next.value).toBeLessThan(0)
  })

  it('survives a very long frame without blowing up', () => {
    const next = stepSpring({ value: 0, velocity: 0 }, 100, springConfig(0.2, 0.5), 5)
    expect(Number.isFinite(next.value)).toBe(true)
    expect(Math.abs(next.value)).toBeLessThan(300)
  })
})

describe('project', () => {
  it('matches the deceleration formula', () => {
    expect(project(1000)).toBeCloseTo(499, 5) // (1000/1000) * 0.998 / 0.002
    expect(project(0)).toBe(0)
  })

  it('keeps direction, and a snappier rate travels less far', () => {
    expect(project(-800)).toBeLessThan(0)
    expect(project(1000, 0.99)).toBeLessThan(project(1000, 0.998))
  })
})

describe('rubberband', () => {
  it('follows less and less, and never passes the dimension', () => {
    const pulls = [10, 50, 200, 1000, 1e6].map((o) => rubberband(o, 300))
    for (let i = 1; i < pulls.length; i++) expect(pulls[i]).toBeGreaterThan(pulls[i - 1])
    expect(pulls[pulls.length - 1]).toBeLessThan(300)
    expect(rubberband(10, 300)).toBeLessThan(10)
  })

  it('is symmetric', () => {
    expect(rubberband(-80, 300)).toBeCloseTo(-rubberband(80, 300), 10)
  })
})
