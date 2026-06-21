# Peeling Sticky Note

An interactive sticky note you can peel off the wall, then stick a fresh one back in a random color. It adapts to the input device: hover + click on desktop, tap + swipe on touch screens.

## Behavior

The interaction model depends on whether the device can hover (detected via the `(hover: none) and (pointer: coarse)` media query):

| Action       | Desktop (mouse / hover) | Mobile (touch)              |
| ------------ | ----------------------- | --------------------------- |
| Fold corner  | **Hover** over the note | **Tap** (toggles up / down) |
| Peel off     | **Click**               | **Swipe**                   |
| Stick a new one | Press **Stick another one** | Press **Stick another one** |

- The note is also keyboard accessible: it's a focusable `button`, and <kbd>Enter</kbd> / <kbd>Space</kbd> peels it off.
- The layout is responsive — the note scales to the viewport, and the heading, padding, spacing, and helper copy adapt on small screens.

## How the animation works

The whole note is a single SVG drawn in a `0..200` viewBox and rendered at any `size`. The illusion is built from a few layered, GPU-friendly tweens (only `transform`, `opacity`, and SVG path `d` are animated) driven by [Motion](https://motion.dev) variants:

- **Corner peel (hover).** The main paper path morphs between two path strings that share an identical command list — `PATH_FLAT` (rounded corner) and `PATH_FOLDED` (diagonally sliced corner). Because the commands line up, Motion can smoothly interpolate one into the other.
- **The fold-over flap.** A second path (the paper's underside) pivots about a fixed crease edge. Its flat and folded poses are mirror images across that crease, so the flap passes through a zero-area, edge-on pose at the midpoint of the morph — exactly how a lifted corner looks at 90°. Its back face only fades in once it crosses that midpoint.
- **Peel away (click).** The note wrapper flies off with a combined `x/y/rotate/scale/opacity` tween pivoting from its bottom-left corner, while a separate soft-blur shadow layer stays on the wall and fades, leaving an adhesive-residue mark behind.
- **Stick another one.** On reset the note remounts and animates in from an `incoming` pose that is a point-reflection of the peel exit, so it swings in **from the top** and settles onto the wall — a mirror of the peel-away.

Performance note: the cast shadow is a static pre-blurred layer whose opacity/scale are tweened, rather than an expensive per-frame CSS `filter`.

## How the input handling works

Device capability is detected with a small `useMediaQuery` hook (`src/useResponsive.js`) using `(hover: none) and (pointer: coarse)`. The component swaps its event handlers based on the result:

- **Desktop** uses `onClick` (peel) plus `onMouseEnter` / `onMouseLeave` (hover-fold).
- **Touch** uses pointer events. On `pointerup` the gesture is classified by how far the pointer moved from `pointerdown`:
  - movement ≤ `12px` → **tap**, which toggles an `isFolded` state (fold up / down),
  - movement ≥ `45px` → **swipe**, which peels the note off.

  The element captures the pointer (`setPointerCapture`) so the gesture keeps tracking even if the finger drifts off the note, and it sets `touch-action: none` so a swipe isn't consumed by page scrolling.

The fold is driven by `isHovered || isFolded`, so the same visual state is reached whether the corner was lifted by hovering (desktop) or tapping (mobile). Responsive sizing comes from a `useViewportWidth` hook that scales the note to fit small screens, with Tailwind breakpoints (`sm:`) tuning the heading, padding, and spacing.

## Tech stack

- [React 18](https://react.dev/)
- [Vite](https://vite.dev/) (build/dev server)
- [Motion](https://motion.dev) (animation)
- [Tailwind CSS v4](https://tailwindcss.com/) (styling)
- Fonts: **Tanker** (heading) and **Bespoke Serif** self-hosted from `public/fonts`, plus **Outfit** and **Caveat** via Google Fonts.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. Build for production with `npm run build` and preview with `npm run preview`.

## Credits

- Sticky-note peeling interaction idea — [Tushar Negi (tushaar.me)](https://tushaar.me/)
- 3D button and SVG background — [Pixel Perfect UI (pixel-perfect.space)](https://www.pixel-perfect.space/)
