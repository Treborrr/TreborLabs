import { useState, useRef } from 'react';

const PRIZES = [
  { label: 'S/10 de descuento', color: '#7c3aed', prob: 50 },
  { label: 'Envío gratis', color: '#2563eb', prob: 30 },
  { label: 'S/15 de descuento', color: '#7c3aed', prob: 13 },
  { label: 'S/20 de descuento', color: '#9333ea', prob: 5 },
  { label: '¡S/50 de descuento!', color: '#d6baff', prob: 1 },
  { label: 'S/10 de descuento', color: '#7c3aed', prob: 0 },
  { label: 'Envío gratis', color: '#2563eb', prob: 0 },
  { label: 'S/15 de descuento', color: '#7c3aed', prob: 0 },
];

const SEGMENT_ANGLE = 360 / PRIZES.length;

const SpinWheel = ({ onSpin, spinning }) => {
  const [rotation, setRotation] = useState(0);
  const [spun, setSpun] = useState(false);
  const rotRef = useRef(0);

  const handleSpin = () => {
    if (spinning || spun) return;
    // Random full spins (5–10) + random landing
    const spins = 5 + Math.floor(Math.random() * 5);
    const extra = Math.floor(Math.random() * 360);
    const newRot = rotRef.current + spins * 360 + extra;
    rotRef.current = newRot;
    setRotation(newRot);
    setSpun(true);
    // After animation ends, notify parent
    setTimeout(() => {
      const normalised = ((newRot % 360) + 360) % 360;
      const idx = Math.floor((360 - normalised) / SEGMENT_ANGLE) % PRIZES.length;
      onSpin(PRIZES[idx]);
    }, 4200);
  };

  // Build conic-gradient
  const gradient = PRIZES.map((p, i) => {
    const start = i * SEGMENT_ANGLE;
    const end = start + SEGMENT_ANGLE;
    return `${p.color} ${start}deg ${end}deg`;
  }).join(', ');

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Pointer */}
      <div className="relative flex flex-col items-center">
        <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[20px] border-l-transparent border-r-transparent border-b-primary z-10" />
        {/* Wheel */}
        <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-primary/30 shadow-[0_0_40px_rgba(107,76,154,0.3)]"
          style={{
            background: `conic-gradient(${gradient})`,
            transform: `rotate(${rotation}deg)`,
            transition: spun ? 'transform 4s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none',
          }}>
          {PRIZES.map((p, i) => {
            const angle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
            const rad = (angle - 90) * (Math.PI / 180);
            const x = 50 + 35 * Math.cos(rad);
            const y = 50 + 35 * Math.sin(rad);
            return (
              <div key={i} style={{
                position: 'absolute',
                left: `${x}%`, top: `${y}%`,
                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'white',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                whiteSpace: 'nowrap',
                maxWidth: '70px',
                textAlign: 'center',
                lineHeight: '1.2',
              }}>
                {p.label}
              </div>
            );
          })}
          {/* Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-surface rounded-full border-2 border-primary/40 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-lg">star</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSpin}
        disabled={spinning || spun}
        className="flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-8 py-3 rounded-xl font-headline font-bold text-sm uppercase tracking-widest hover:bg-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="material-symbols-outlined">{spinning ? 'hourglass_empty' : 'casino'}</span>
        {spinning ? 'Girando…' : spun ? 'Girada' : '¡Girar!'}
      </button>
    </div>
  );
};

export default SpinWheel;
