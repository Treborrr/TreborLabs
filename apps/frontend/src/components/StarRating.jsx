import { useState } from 'react';

// size: 'sm' | 'md' | 'lg'
const StarRating = ({ value = 0, max = 5, onChange, size = 'md' }) => {
  const [hovered, setHovered] = useState(null);
  const display = onChange ? (hovered ?? value) : value;

  const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <div className="flex gap-0.5">
      {[...Array(max)].map((_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined select-none ${sizeClass} transition-colors ${
            i < display ? 'text-amber-400' : 'text-on-surface-variant/25'
          } ${onChange ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          style={{ fontVariationSettings: i < display ? "'FILL' 1" : "'FILL' 0" }}
          onClick={() => onChange?.(i + 1)}
          onMouseEnter={() => onChange && setHovered(i + 1)}
          onMouseLeave={() => onChange && setHovered(null)}
        >
          star
        </span>
      ))}
    </div>
  );
};

export default StarRating;
