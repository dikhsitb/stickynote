# Peeling Sticky Note

An interactive sticky note you can peel off the wall. Hover to lift the corner, click to peel it away, then stick a fresh one back in a random color.

## How the animation works

The whole note is a single SVG drawn in a `0..200` viewBox and rendered at any `size`. The illusion is built from a few layered, GPU-friendly tweens (only `transform`, `opacity`, and SVG path `d` are animated) driven by [Motion](https://motion.dev) variants:

- **Corner peel (hover).** The main paper path morphs between two path strings that share an identical command list — `PATH_FLAT` (rounded corner) and `PATH_FOLDED` (diagonally sliced corner). Because the commands line up, Motion can smoothly interpolate one into the other.
- **The fold-over flap.** A second path (the paper's underside) pivots about a fixed crease edge. Its flat and folded poses are mirror images across that crease, so the flap passes through a zero-area, edge-on pose at the midpoint of the morph — exactly how a lifted corner looks at 90°. Its back face only fades in once it crosses that midpoint.
- **Peel away (click).** The note wrapper flies off with a combined `x/y/rotate/scale/opacity` tween pivoting from its bottom-left corner, while a separate soft-blur shadow layer stays on the wall and fades, leaving an adhesive-residue mark behind.
- **Stick another one.** On reset the note remounts and animates in from an `incoming` pose that is a point-reflection of the peel exit, so it swings in **from the top** and settles onto the wall — a mirror of the peel-away.

Performance note: the cast shadow is a static pre-blurred layer whose opacity/scale are tweened, rather than an expensive per-frame CSS `filter`.

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
