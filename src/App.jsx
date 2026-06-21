import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import StickyNote from './StickyNote.jsx';

const NOTE_SIZE = 230;

export default function App() {
  const [peeled, setPeeled] = useState(false);
  const [color, setColor] = useState('yellow');
  // bump key to fully remount the note so it animates back on from "rest"
  const [resetKey, setResetKey] = useState(0);

  const stickBack = () => {
    setPeeled(false);
    setResetKey((k) => k + 1);
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
        <h1 className="text-3xl font-semibold tracking-tight text-stone-800">
          Sticky Note
        </h1>
        <p className="mt-2 text-stone-500">
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
          {['yellow', 'pink', 'blue', 'green'].map((c) => (
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

        <div className="h-10 flex items-center">
          <AnimatePresence>
            {peeled && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                onClick={stickBack}
                className="px-5 py-2 rounded-full bg-stone-800 text-stone-50 text-sm font-medium shadow-lg hover:bg-stone-700 transition-colors"
              >
                Stick it back
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const SWATCH = {
  yellow: '#FFE249',
  pink: '#FF9BC0',
  blue: '#82C5FF',
  green: '#92E27E',
};
