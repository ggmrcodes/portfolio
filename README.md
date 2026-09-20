# Hatayasit Aroonvanichporn · Portfolio

My personal site, rebuilt from scratch in React and TypeScript for the Full Stack at Brown developer application. Live at [hatayasit.com](https://www.hatayasit.com).

![Preview](public/og.png)

## Overview

A single-page portfolio with a retro terminal theme. Two things on it are interactive:

- **Project gallery with category filters.** Buttons for Web, Mobile, ML & vision and Education filter the list of projects. The active filter is React state; the visible list is derived from it and each project is passed to a card component through props.
- **An in-page terminal.** Press the backtick key or click the terminal button, then type `help`, `projects`, `open haemocare`, `goto contact`, `theme`, and so on. It has command history (up and down arrows) and reads the same data files as the rest of the page, so it never goes out of sync with the gallery.

Also: dark and light themes persisted in `localStorage`, scroll-triggered reveals, a mobile menu, and full support for `prefers-reduced-motion` and keyboard focus.

## How to run it

Requires Node 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build locally
npm run lint       # oxlint
npm run typecheck  # tsc
```

## How it is put together

```
src/
  data/           all content: profile.ts, projects.ts, experience.ts
  components/     one file per UI piece; Projects -> ProjectCard is the props flow
  hooks/          useTheme (dark/light), useReveal (IntersectionObserver)
  lib/terminal.ts pure function: command string in, output lines + optional action out
  index.css       theme tokens, retro primitives (pixel-frame, btn, chip), motion
```

Updating the site means editing a file in `src/data/`. Components never hard-code text.

Dependencies are deliberately few: `react`, `react-dom`, `lucide-react` for icons, and `tailwindcss` for layout utilities. The retro look (offset shadows, checkerboard covers, scanlines, the boot animation) is hand-written CSS in `src/index.css`.

## My contribution

Everything in this repository is mine. The previous version of this site was generated with a website builder; this one was written by hand file by file so I could explain every line of it. The pieces I would point to first:

- `src/lib/terminal.ts` and `src/components/Terminal.tsx`: the command parser and the component that owns its state.
- `src/components/Projects.tsx`: the filter state and how the visible list is derived from it.
- `src/hooks/useTheme.ts` plus the small inline script in `index.html` that applies the saved theme before the first paint.
- `src/index.css`: the theme token system and the retro primitives.

## What I learned

<!-- TODO(Hatayasit): edit this so it is in your own words. It should describe one real challenge. -->

The hardest part was keeping the terminal explainable. My first version put everything in the component: a large `switch` on the command string, and side effects like `window.open` and toggling the theme mixed in with `setState` calls. It worked, but I could not describe it in one breath, and every new command made it worse.

The fix was to split it in two. `runCommand()` in `src/lib/terminal.ts` is a pure function: it takes the input string and returns `{ lines, action? }`, where `action` is a plain object such as `{ type: 'open', url }`. It never touches React or the DOM. `Terminal.tsx` then only does three things: keep the input and printed lines in state, call `runCommand`, and perform whatever action came back. That made the parser trivial to test by hand in the console and made the component about fifty lines.

A smaller lesson was typography. Pixel fonts have square glyphs, so my fifteen-letter surname needs roughly fifteen `em` of width. On a 390px phone that overflowed the screen. The fix was `font-size: clamp(1.15rem, 5.2vw, 3rem)` tied to the viewport width, and a deliberate line break between first and last name.

## References

- [Vite](https://vite.dev) `react-ts` template for the initial project scaffold (`package.json`, `tsconfig`, `oxlint` config).
- [React docs](https://react.dev) for `useState`, `useEffect` and `useRef`.
- [Tailwind CSS v4 docs](https://tailwindcss.com/docs) for the `@theme inline` pattern that lets utilities reference runtime CSS variables.
- [lucide-react](https://lucide.dev) for UI icons; GitHub and LinkedIn marks are from [Simple Icons](https://simpleicons.org) (CC0).
- [Google Fonts](https://fonts.google.com): Press Start 2P and IBM Plex Mono.
- MDN for `IntersectionObserver` and `prefers-reduced-motion`.
- Claude Code was used as a pair programmer while rebuilding the site. All code was read, understood, and edited by me. <!-- TODO(Hatayasit): keep, reword, or remove this line. -->
