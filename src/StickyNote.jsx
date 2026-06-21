import React, { useState } from 'react';
import { motion } from 'motion/react';

/**
 * StickyNote
 *
 * A real-life sticky-note peeling interaction:
 *  - Hover  -> the top-right corner folds up (page-curl), casting a soft shadow.
 *  - Click  -> the whole note peels off the wall, curling and falling away.
 *  - Reset  -> the note sticks itself back on.
 *
 * Geometry is authored in a 0..200 viewBox and rendered at `size` px.
 * The full + folded paths share an identical command list so motion can
 * smoothly morph between them.
 */

// Rounded square (resting state). Top-right corner is rounded.
const PATH_FLAT = `
  M 8 0
  L 100 0
  L 192 0
  C 195.3 0 200 4.7 200 8
  L 200 64
  L 200 192 A 8 8 0 0 1 192 200
  L 8 200 A 8 8 0 0 1 0 192
  L 0 8 A 8 8 0 0 1 8 0 Z
`;

// Same command list, but the top-right corner is sliced diagonally (folded).
const PATH_FOLDED = `
  M 8 0
  L 100 0
  L 144 0
  C 160 16 180 36 200 56
  L 200 64
  L 200 192 A 8 8 0 0 1 192 200
  L 8 200 A 8 8 0 0 1 0 192
  L 0 8 A 8 8 0 0 1 8 0 Z
`;

// The folded-over flap (back of the paper). Both states share an identical
// command list AND a fixed hinge edge (the crease, `C ... 144 0`) so motion
// pivots the flap about the crease like real paper:
//   FLAT   -> the un-folded corner triangle, tip at the real corner (200,0)
//   FOLDED -> reflected across the crease, tip flopped over to bottom-left
// Because the two free vertices are mirror images across the crease, the flap
// passes through a zero-area "edge-on" pose at the mid-point of the morph —
// exactly how a corner looks when lifted to 90deg before flopping over.
const PATH_EAR_FLAT = `
  M 144 0
  L 188 0
  Q 200 0 200 12
  L 200 56
  C 180 36 160 16 144 0
  Z
`;

const PATH_EAR_FOLDED = `
  M 144 0
  L 144 44
  Q 144 56 156 56
  L 200 56
  C 180 36 160 16 144 0
  Z
`;

const StickyNote = ({
  size = 240,
  color = 'yellow',
  peeled: controlledPeeled,
  onPeelChange,
  text = 'peel me',
  subtext = 'click & watch it lift',
  className = '',
  style = {},
}) => {
  const [internalPeeled, setInternalPeeled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isPeeled =
    controlledPeeled !== undefined ? controlledPeeled : internalPeeled;
  const variant = isPeeled ? 'peeled' : isHovered ? 'hover' : 'rest';

  const peel = () => {
    if (isPeeled) return;
    if (controlledPeeled === undefined) setInternalPeeled(true);
    onPeelChange?.(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      peel();
    }
  };

  const palette = COLORS[color] ?? COLORS.yellow;

  // --- Animation variants ---
  // Only transform + opacity are animated (GPU-accelerated) so motion stays
  // buttery smooth. The drop shadow is a separate static-blur layer whose
  // opacity/scale we tween, instead of an expensive per-frame `filter`.

  const wrapperVariants = {
    rest: {
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      transition: { duration: 0.25, ease: 'easeOut' },
    },
    hover: {
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      transition: { duration: 0.25, ease: 'easeOut' },
    },
    peeled: {
      x: -size * 0.5,
      y: size * 0.62,
      rotate: -78,
      scale: 0.84,
      opacity: 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const shadowVariants = {
    rest: {
      opacity: 0.45,
      y: 6,
      scale: 0.97,
      transition: { duration: 0.25, ease: 'easeOut' },
    },
    hover: {
      opacity: 0.55,
      y: 12,
      scale: 0.985,
      transition: { duration: 0.25, ease: 'easeOut' },
    },
    peeled: {
      opacity: 0,
      y: 6,
      scale: 0.95,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  const sheetVariants = {
    rest: { d: PATH_FLAT, transition: { duration: 0.3, ease: 'easeInOut' } },
    hover: { d: PATH_FOLDED, transition: { duration: 0.3, ease: 'easeInOut' } },
    peeled: { d: PATH_FOLDED, transition: { duration: 0.1 } },
  };

  const earVariants = {
    rest: {
      d: PATH_EAR_FLAT,
      opacity: 0,
      transition: {
        d: { duration: 0.3, ease: 'easeInOut' },
        opacity: { duration: 0.1 },
      },
    },
    hover: {
      d: PATH_EAR_FOLDED,
      opacity: 1,
      transition: {
        d: { duration: 0.3, ease: 'easeInOut' },
        // reveal the back face only once the flap crosses the edge-on midpoint
        opacity: { delay: 0.13, duration: 0.12 },
      },
    },
    peeled: { d: PATH_EAR_FOLDED, opacity: 1, transition: { duration: 0.1 } },
  };

  const textVariants = {
    rest: { opacity: 1, transition: { duration: 0.2 } },
    hover: { opacity: 1, transition: { duration: 0.2 } },
    peeled: { opacity: 0, transition: { duration: 0.15 } },
  };

  const gid = React.useId().replace(/:/g, '');
  const radius = (8 / 200) * size;

  return (
    <div
      role="button"
      aria-pressed={isPeeled}
      aria-label={`Sticky note: ${text}. Click to peel off.`}
      tabIndex={0}
      onClick={peel}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative outline-none ${className}`}
      style={{
        width: size,
        height: size,
        cursor: isPeeled ? 'default' : 'pointer',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      {/* Soft cast shadow — stays on the wall while the note flies off */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          borderRadius: radius,
          background: 'rgba(40,30,10,0.45)',
          filter: 'blur(14px)',
          transformOrigin: 'center top',
          willChange: 'transform, opacity',
        }}
        variants={shadowVariants}
        initial="rest"
        animate={variant}
      />

      {/* The note itself — this is what peels away */}
      <motion.div
        className="absolute inset-0"
        style={{
          transformOrigin: 'bottom left',
          willChange: 'transform, opacity',
        }}
        variants={wrapperVariants}
        initial="rest"
        animate={variant}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          fill="none"
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id={`paper-${gid}`} x1="0" y1="0" x2="0.25" y2="1">
              <stop offset="0%" stopColor={palette.top} />
              <stop offset="100%" stopColor={palette.bottom} />
            </linearGradient>
            <linearGradient id={`back-${gid}`} x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.backDark} />
              <stop offset="55%" stopColor={palette.back} />
              <stop offset="100%" stopColor={palette.backLight} />
            </linearGradient>
          </defs>

          {/* Main paper sheet */}
          <motion.path
            fill={`url(#paper-${gid})`}
            variants={sheetVariants}
            initial="rest"
            animate={variant}
          />

          {/* The folded-over flap (back of the paper). It unfolds from the
              crease and casts a soft shadow onto the sheet via a static filter. */}
          <motion.path
            fill={`url(#back-${gid})`}
            stroke={palette.crease}
            strokeWidth="0.5"
            strokeLinejoin="round"
            variants={earVariants}
            initial="rest"
            animate={variant}
            style={{ filter: 'drop-shadow(-2.5px 3px 2.5px rgba(0,0,0,0.28))' }}
          />
        </svg>

        {/* Handwritten text, peels away with the note */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          variants={textVariants}
          initial="rest"
          animate={variant}
          style={{ pointerEvents: 'none' }}
        >
          <span
            style={{
              fontFamily: '"Caveat", cursive',
              fontSize: size * 0.2,
              lineHeight: 1,
              color: palette.ink,
              fontWeight: 700,
              transform: 'rotate(-3deg)',
            }}
          >
            {text}
          </span>
          {subtext ? (
            <span
              style={{
                fontFamily: '"Caveat", cursive',
                fontSize: size * 0.085,
                marginTop: size * 0.04,
                color: palette.ink,
                opacity: 0.7,
                transform: 'rotate(-2deg)',
              }}
            >
              {subtext}
            </span>
          ) : null}
        </motion.div>
      </motion.div>
    </div>
  );
};

const COLORS = {
  yellow: {
    top: '#FFF59D',
    bottom: '#FFE249',
    back: '#F2D54A',
    backDark: '#E7C53A',
    backLight: '#FBEEA0',
    crease: '#D9B73A',
    ink: '#5A4A12',
  },
  pink: {
    top: '#FFC9DD',
    bottom: '#FF9BC0',
    back: '#F58FB3',
    backDark: '#E97AA1',
    backLight: '#FFD7E6',
    crease: '#DB6E96',
    ink: '#7A2B4A',
  },
  blue: {
    top: '#BFE3FF',
    bottom: '#82C5FF',
    back: '#74B8F2',
    backDark: '#5FA6E5',
    backLight: '#D5EEFF',
    crease: '#4F95D6',
    ink: '#1E466E',
  },
  green: {
    top: '#CDF5C2',
    bottom: '#92E27E',
    back: '#84D46F',
    backDark: '#6FC65A',
    backLight: '#DDF7D4',
    crease: '#5FB44C',
    ink: '#234D18',
  },
};

export default StickyNote;
