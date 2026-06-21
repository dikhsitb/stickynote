import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import StickyNote from './StickyNote.jsx';
import ThreedButton from './ThreedButton.jsx';

const NOTE_SIZE = 320;

const COLOR_KEYS = ['blue', 'green', 'lavender', 'grey', 'yellow', 'red'];

// Pair each note color with a matching 3D-button variant
const NOTE_TO_BUTTON = {
  blue: 'sky',
  green: 'emerald',
  lavender: 'violet',
  grey: 'slate',
  yellow: 'amber',
  red: 'rose',
};

export default function App() {
  const [peeled, setPeeled] = useState(false);
  const [color, setColor] = useState('yellow');
  // bump key to fully remount the note so it animates back on from "rest"
  const [resetKey, setResetKey] = useState(0);

  const stickBack = () => {
    setPeeled(false);
    setResetKey((k) => k + 1);
    // Pick a fresh random color (different from the current one)
    setColor((current) => {
      const others = COLOR_KEYS.filter((c) => c !== current);
      return others[Math.floor(Math.random() * others.length)];
    });
  };

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center gap-10 p-8 text-stone-700"
      style={{
        backgroundColor: '#efece4',
        // Diagonal micro pattern ("Gradient 3") across the entire page
        backgroundImage:
          'repeating-linear-gradient(315deg, var(--pattern-fg) 0, var(--pattern-fg) 1px, transparent 0, transparent 50%)',
        backgroundSize: '10px 10px',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="text-center">
        <h1
          className="text-5xl tracking-tight text-stone-800"
          style={{ fontFamily: '"Tanker", sans-serif' }}
        >
          Sticky Note
        </h1>
        <p
          className="mt-3 text-stone-500"
          style={{ fontFamily: '"Outfit", sans-serif' }}
        >
          Hover to lift the corner, click to peel it off the wall.
        </p>
      </div>

      {/* Stage: residue mark + the sticky note */}
      <div
        className="relative"
        style={{ width: NOTE_SIZE, height: NOTE_SIZE }}
      >
        {/* Adhesive residue / shadow left behind after peeling */}
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            boxShadow: 'inset 0 0 22px rgba(90,65,35,0.12)',
            background: 'rgba(90,65,35,0.05)',
            opacity: peeled ? 1 : 0,
            transition: 'opacity 0.4s ease 0.15s',
          }}
        >
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2 rounded-sm"
            style={{
              width: '55%',
              height: 16,
              background: 'rgba(90,65,35,0.10)',
              filter: 'blur(1px)',
            }}
          />
        </div>

        <StickyNote
          key={resetKey}
          size={NOTE_SIZE}
          color={color}
          peeled={peeled}
          onPeelChange={setPeeled}
          text="peel me"
          subtext="click & watch it lift"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-5">
        <div className="flex items-center gap-3">
          {COLOR_KEYS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`${c} note`}
              className="h-7 w-7 rounded-full ring-2 ring-white/70 shadow transition-transform hover:scale-110"
              style={{
                background: SWATCH[c],
                outline: color === c ? '2px solid #57514a' : 'none',
                outlineOffset: 2,
              }}
            />
          ))}
        </div>

        <div className="h-16 flex items-start justify-center pt-1">
          <AnimatePresence>
            {peeled && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                <ThreedButton
                  threedVariant={NOTE_TO_BUTTON[color] ?? 'amber'}
                  onClick={stickBack}
                >
                  Stick another one
                </ThreedButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const SWATCH = {
  blue: '#80CAFF',
  green: '#85E0A3',
  lavender: '#D9B8FF',
  grey: '#E6E6E6',
  yellow: '#FBD767',
  red: '#FFAFA3',
};
