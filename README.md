# <img src="public/favicon.svg" width="26" align="center" alt=""> Hatayasit Aroonvanichporn · Portfolio

My personal site, built from scratch in React and TypeScript.

<h6 align="center">
  <a href="https://www.hatayasit.com">Live site</a>
  ·
  <a href="#-overview">What it does</a>
  ·
  <a href="#-how-to-run-it">Run it</a>
  ·
  <a href="#-my-contribution">What I built</a>
</h6>

<table>
<tr>
<td width="50%"><img src="docs/demo.gif" alt="The site loading: a voxel self-portrait wakes up, lifts its head, raises a sabre into guard, and summons a translucent Stand behind it"></td>
<td width="50%"><img src="docs/screenshot-boring.png" alt="The same page after pressing I'm boring: quiet type on white, with a card deck where the avatar was"></td>
</tr>
<tr>
<td><b>Default.</b> Pixel type, a voxel self-portrait, a terminal on <kbd>`</kbd>.</td>
<td><b>After “I’m boring”.</b> Same components, no game layer.</td>
</tr>
</table>

**React 19 · TypeScript · Vite 8 · Tailwind v4 · three.js** — four runtime dependencies, no animation library.

## <img src="docs/icons/eye.svg" width="20" align="center" alt=""> Overview

- **Project gallery with category filters.** One `useState`. The visible list is derived from it on every render, and each project reaches `ProjectCard` through props.
- **An in-page terminal.** <kbd>`</kbd> opens it. Eleven commands, arrow-key history, reading the same data files as the page.
- **An "I'm boring" switch.** One attribute on `<html>`; every visual difference above is CSS keyed off it. The 3D scene is never mounted, so boring mode never downloads three.js.
- **A card deck you can throw.** Drag, flick, catch it mid-flight. A damped spring I wrote judges a throw by where the card was *going*, not where it was let go.

<details>
<summary>What the terminal knows</summary>

```console
❯ help
help             show this list
about            who I am
projects         list projects (alias: ls)
open <slug>      open a project repo in a new tab
skills           grouped skill list
experience       work and awards
contact          email, GitHub, LinkedIn
goto <section>   scroll to about | projects | experience | contact
theme            toggle dark / light
boring           turn off the retro game styling
clear            clear the screen
```

</details>

## <img src="docs/icons/terminal.svg" width="20" align="center" alt=""> How to run it

Node 22.12 or newer. Vite runs on 20.19+, but the test runner needs 22.12.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 8 unit tests over the spring maths
```

## <img src="docs/icons/folder-tree.svg" width="20" align="center" alt=""> How it is put together

```
src/
  data/        profile, projects, experience, deck, avatar (the voxel model)
  components/  one file per UI piece
  hooks/       useTheme, useBoring, useReveal, useActiveSection
  lib/         terminal, spring (+ spring.test.ts), poseStand, viewTransition
  index.css    theme tokens, retro primitives, motion
```

Every string on the page comes from `src/data/`; no component hard-codes text. Three of the four files in `lib/` import no React at all, which is what makes them straightforward to test.

## <img src="docs/icons/hammer.svg" width="20" align="center" alt=""> My contribution

Everything here is mine. The old version came out of a website builder; this one is hand-written, so I can explain any line of it.

- **`components/Projects.tsx`** — 64 lines, one `useState`, no reducer and no memoisation. The main interaction, and the part I would most like to be asked about.
- **`lib/spring.ts` + `components/CardDeck.tsx`** — one `requestAnimationFrame` loop writes `transform` straight to the cards, so dragging never re-renders React. Its only state is the card order.
- **`lib/poseStand.ts`** — the Silver Chariot model has no skeleton, so I pose its arms by rotating vertices about virtual shoulder and elbow joints.
- **`components/Nav.tsx` + `public/favicon.svg`** — the mark, a building, because Building is what people call me. One path with an even-odd fill, so the windows are real holes.

## <img src="docs/icons/lightbulb.svg" width="20" align="center" alt=""> What I learned

Keeping the terminal explainable was the hard part. My first version put everything in the component: a long `switch` on the command string, with `window.open` and theme toggles tangled into the `setState` calls. It worked, but I could not describe it in one breath.

Splitting it fixed that. `runCommand()` in `src/lib/terminal.ts` takes the input and returns `{ lines, action? }`, where `action` is a plain object like `{ type: 'open', url }`. It touches neither React nor the DOM; the component keeps state, calls it, and carries out whatever comes back. Adding a command is now one `case` in a file that has never imported React.

## <img src="docs/icons/book-open.svg" width="20" align="center" alt=""> References

- Scaffolded from the [Vite](https://vite.dev) `react-ts` template.
- The deck's spring maths comes from Apple's [Designing Fluid Interfaces](https://developer.apple.com/videos/play/wwdc2018/803/), WWDC 2018. The code is my own.
- The Stand behind the avatar is [Silver Chariot](https://sketchfab.com/3d-models/silver-chariot-86a6bf8c3ece40818f7042dbbe5720c6) by [xugangruix](https://sketchfab.com/xugangruix), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); the character is from *JoJo's Bizarre Adventure*.
- The [Brown coat of arms](https://commons.wikimedia.org/wiki/File:Brown_Coat_of_Arms.svg) on the hoodie, CC BY-SA 4.0.
- Type: Press Start 2P, Martian Mono, Manrope, Inconsolata — all OFL, licences in `public/fonts/`. Heading icons from [Lucide](https://lucide.dev) (ISC).
