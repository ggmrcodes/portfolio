import { ChevronLeft, ChevronRight, Flame } from 'lucide-react'
import { useLayoutEffect, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { deck } from '../data/deck'
import { SETTLE, THROW, isAtRest, project, rubberband, stepSpring, type SpringConfig, type SpringState } from '../lib/spring'

/**
 * A deck of cards you can drag, flick to the back, or catch in mid-flight.
 * Shown in the hero in "I'm boring" mode.
 *
 * Two halves, like the terminal. The maths is in lib/spring.ts. This file has
 * an engine that moves the cards and a component that renders them:
 *
 *   createEngine()  plain JavaScript, created once. Holds every card's x, y,
 *                   rotation, scale and opacity as springs, runs one
 *                   requestAnimationFrame loop, and writes `style.transform`
 *                   directly. Dragging never re-renders React.
 *   <CardDeck>      renders the cards and forwards pointer and key events.
 *                   Its only state is the card order, because that is the
 *                   only thing that changes what is rendered (z-index, the
 *                   counter, the screen-reader announcement).
 */
const AXES = ['x', 'y', 'rotate', 'scale', 'opacity'] as const
type Axis = (typeof AXES)[number]
type Pose = Record<Axis, number>

interface Body {
  state: Record<Axis, SpringState>
  target: Pose
  config: SpringConfig
  dragging: boolean
  /** -1 or 1 while a thrown card is on its way out to that side */
  leaving: -1 | 0 | 1
}

interface Drag {
  pointerId: number
  index: number
  startX: number
  startY: number
  originX: number
  originY: number
  width: number
  moved: boolean
  history: { t: number; x: number; y: number }[]
}

const TAP_SLOP = 8 // px of movement before a press counts as a drag
const THROW_AT = 0.4 // throw if the projected landing point is this far out, in card widths
const TILT = 0.06 // degrees of rotation per px dragged sideways

const still = (value: number): SpringState => ({ value, velocity: 0 })

/** Where a card rests, given how deep in the stack it is (0 is the top) */
function restPose(depth: number): Pose {
  const d = Math.min(depth, 4)
  return {
    x: 0,
    y: d * 11,
    rotate: depth === 0 ? 0 : (depth % 2 ? -1 : 1) * Math.min(depth, 3) * 1.6,
    scale: 1 - d * 0.05,
    opacity: depth > 3 ? 0 : 1,
  }
}

function createEngine(count: number, onOrder: (order: number[]) => void, onTouch: () => void) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  const cards: (HTMLElement | null)[] = []
  let order = Array.from({ length: count }, (_, i) => i) // card indices, top first
  let drag: Drag | null = null
  let frame = 0
  let lastTime = 0

  // Every card starts a little below its place and fades in, so the deck deals itself on arrival
  const bodies: Body[] = order.map((_, depth) => {
    const pose = restPose(depth)
    const from = reducedMotion ? pose : { ...pose, y: pose.y + 48, scale: pose.scale - 0.06, opacity: 0 }
    return {
      state: { x: still(from.x), y: still(from.y), rotate: still(from.rotate), scale: still(from.scale), opacity: still(from.opacity) },
      target: pose,
      config: SETTLE,
      dragging: false,
      leaving: 0,
    }
  })

  const widthOf = (i: number) => cards[i]?.offsetWidth ?? 320

  function paint(i: number) {
    const el = cards[i]
    if (!el) return
    const s = bodies[i].state
    el.style.transform = `translate3d(${s.x.value}px, ${s.y.value}px, 0) rotate(${s.rotate.value}deg) scale(${s.scale.value})`
    el.style.opacity = String(Math.min(1, Math.max(0, s.opacity.value)))
  }

  /** Adopt a new order: every card is pointed at the rest pose for its new depth */
  function reorder(next: number[]) {
    order = next
    next.forEach((cardIndex, depth) => {
      const body = bodies[cardIndex]
      if (body.dragging || body.leaving) return
      body.target = restPose(depth)
      body.config = SETTLE
      if (reducedMotion) {
        for (const axis of AXES) body.state[axis] = still(body.target[axis])
        paint(cardIndex)
      }
    })
    onOrder(next)
    wake()
  }

  /** One loop for the whole deck. It stops itself once nothing is moving. */
  function tick(now: number) {
    const dt = lastTime ? (now - lastTime) / 1000 : 1 / 60
    lastTime = now
    let moving = false

    bodies.forEach((body, i) => {
      if (body.dragging) {
        moving = true
        return
      }
      for (const axis of AXES) {
        body.state[axis] = stepSpring(body.state[axis], body.target[axis], body.config, dt)
        if (!isAtRest(body.state[axis], body.target[axis])) moving = true
      }
      // A thrown card that has cleared the stack is tucked underneath, then springs home
      if (body.leaving && Math.abs(body.state.x.value) > widthOf(i) * 0.85) {
        body.leaving = 0
        reorder([...order.filter((c) => c !== i), i])
      }
      paint(i)
    })

    frame = moving ? requestAnimationFrame(tick) : 0
    if (moving) return
    lastTime = 0
    // "At rest" still leaves a few hundredths of a pixel and 0.999 opacity behind.
    // Land exactly on the rest pose, so the text is not drawn through a fractional transform.
    bodies.forEach((body, i) => {
      for (const axis of AXES) body.state[axis] = still(body.target[axis])
      paint(i)
    })
  }

  function wake() {
    if (!frame && !reducedMotion) frame = requestAnimationFrame(tick)
  }

  function throwCard(i: number, direction: -1 | 1) {
    const body = bodies[i]
    body.leaving = direction
    body.config = THROW
    body.target = { ...body.target, x: direction * widthOf(i) * 1.3, rotate: direction * 16 }
    wake()
  }

  return {
    attach(i: number, el: HTMLElement | null) {
      cards[i] = el
      if (el) paint(i)
    },
    start: wake,
    stop() {
      cancelAnimationFrame(frame)
      frame = 0
    },

    /** Buttons, keys and taps: next sends the top card away, previous brings the bottom one back */
    advance(step: 1 | -1) {
      onTouch()
      if (reducedMotion) {
        reorder(step === 1 ? [...order.slice(1), order[0]] : [order[order.length - 1], ...order.slice(0, -1)])
      } else if (step === 1) {
        throwCard(order[0], -1)
      } else {
        const returning = order[order.length - 1]
        const body = bodies[returning]
        body.state.x = still(widthOf(returning) * 0.9) // it comes back in from the side
        body.state.rotate = still(12)
        body.state.opacity = still(0)
        reorder([returning, ...order.slice(0, -1)])
      }
    },

    pointerDown(e: ReactPointerEvent<HTMLElement>, i: number) {
      if (reducedMotion || e.button !== 0 || order[0] !== i) return
      try {
        e.currentTarget.setPointerCapture(e.pointerId) // keep tracking even if the pointer leaves the card
      } catch {
        // a synthetic event (in a test) has no pointer to capture
      }
      // Interruptible: whatever the card was doing, the drag continues from where it is on screen right now
      const body = bodies[i]
      body.dragging = true
      body.leaving = 0
      drag = {
        pointerId: e.pointerId,
        index: i,
        startX: e.clientX,
        startY: e.clientY,
        originX: body.state.x.value,
        originY: body.state.y.value,
        width: e.currentTarget.offsetWidth,
        moved: false,
        history: [{ t: e.timeStamp, x: e.clientX, y: e.clientY }],
      }
      wake()
    },

    pointerMove(e: ReactPointerEvent<HTMLElement>) {
      if (!drag || e.pointerId !== drag.pointerId) return
      const dx = e.clientX - drag.startX
      const dy = e.clientY - drag.startY
      if (!drag.moved && Math.hypot(dx, dy) < TAP_SLOP) return
      drag.moved = true

      // Sideways the card is glued to the pointer. Vertically it resists, because cards are thrown sideways.
      const x = drag.originX + dx
      const body = bodies[drag.index]
      body.state.x = still(x)
      body.state.y = still(drag.originY + rubberband(dy, 140))
      body.state.rotate = still(x * TILT)
      body.state.scale = still(1.03)
      paint(drag.index)

      drag.history.push({ t: e.timeStamp, x: e.clientX, y: e.clientY })
      if (drag.history.length > 6) drag.history.shift()
    },

    pointerUp(e: ReactPointerEvent<HTMLElement>, cancelled = false) {
      if (!drag || e.pointerId !== drag.pointerId) return
      const d = drag
      drag = null
      const body = bodies[d.index]
      body.dragging = false
      onTouch()

      // A press that never moved is a tap, but only on a card that was sitting still.
      // Catching a card in mid-air and letting go falls through to the release rule below.
      if (!d.moved && Math.abs(d.originX) < 1) {
        if (cancelled) wake()
        else this.advance(1)
        return
      }

      // Release velocity from the last ~100ms of movement, in px/s. No samples in
      // that window means the pointer was being held still, so there is no velocity.
      const first = d.history.find((h) => e.timeStamp - h.t <= 100)
      const seconds = first ? Math.max((e.timeStamp - first.t) / 1000, 1 / 240) : 1
      const vx = cancelled || !first ? 0 : (e.clientX - first.x) / seconds
      const vy = cancelled || !first ? 0 : (e.clientY - first.y) / seconds

      // Hand the pointer's velocity to the springs so there is no seam between dragging and animating
      body.state.x.velocity = vx
      body.state.y.velocity = vy * 0.4
      body.state.rotate.velocity = vx * TILT

      // Decide on where the gesture was going, not on where it was let go
      const landing = body.state.x.value + project(vx)
      if (!cancelled && Math.abs(landing) > d.width * THROW_AT) {
        throwCard(d.index, landing < 0 ? -1 : 1)
      } else {
        body.target = restPose(0)
        body.config = Math.abs(vx) > 400 ? THROW : SETTLE
        wake()
      }
    },
  }
}

const NEXT_KEYS = ['ArrowRight', 'ArrowDown', ' ', 'Enter']
const PREVIOUS_KEYS = ['ArrowLeft', 'ArrowUp']

export default function CardDeck() {
  const [order, setOrder] = useState(() => deck.map((_, i) => i))
  const [touched, setTouched] = useState(false)
  // Created once. The state setters it is given never change, so it never needs recreating.
  const [engine] = useState(() => createEngine(deck.length, setOrder, () => setTouched(true)))

  useLayoutEffect(() => {
    engine.start()
    return () => engine.stop()
  }, [engine])

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return // let the buttons below handle their own keys
    if (NEXT_KEYS.includes(e.key)) engine.advance(1)
    else if (PREVIOUS_KEYS.includes(e.key)) engine.advance(-1)
    else return
    e.preventDefault()
  }

  const top = deck[order[0]]

  return (
    <div className="deck-wrap">
      <div
        className="deck"
        role="group"
        aria-roledescription="card deck"
        aria-label="A few quick facts about me. Drag or flick the top card, or use the arrow keys."
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <ul>
          {deck.map((card, i) => (
            <li
              key={card.label}
              ref={(el) => engine.attach(i, el)}
              className="deck-card"
              data-tone={card.tone}
              data-depth={order.indexOf(i)}
              style={{ zIndex: deck.length - order.indexOf(i) }}
              onPointerDown={(e) => engine.pointerDown(e, i)}
              onPointerMove={(e) => engine.pointerMove(e)}
              onPointerUp={(e) => engine.pointerUp(e)}
              onPointerCancel={(e) => engine.pointerUp(e, true)}
            >
              <span className="deck-label">{card.label}</span>
              <span className="deck-headline">{card.headline}</span>
              <span className="deck-detail">{card.detail}</span>
              {card.streak && (
                // Decorative: the headline right above already lists these languages,
                // so repeating the codes to a screen reader would only add noise.
                <span className="deck-streak" aria-hidden="true">
                  <Flame size={15} strokeWidth={2.25} />
                  {card.streakDays !== undefined && <span className="deck-streak-days">{card.streakDays}</span>}
                  {card.streak.map((language) => (
                    <span key={language.code} className="deck-streak-tile">
                      {language.code}
                    </span>
                  ))}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="deck-controls">
        <button type="button" onClick={() => engine.advance(-1)} aria-label="Previous card">
          <ChevronLeft size={16} />
        </button>
        <span className="deck-count">
          {order[0] + 1} / {deck.length}
        </span>
        <button type="button" onClick={() => engine.advance(1)} aria-label="Next card">
          <ChevronRight size={16} />
        </button>
        <span className="deck-hint" data-hidden={touched}>
          drag or flick
        </span>
      </div>

      <p className="sr-only" aria-live="polite">
        {top.label}: {top.headline}. {top.detail}
      </p>
    </div>
  )
}
