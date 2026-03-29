import { useState } from 'react';

const InfoTooltip = ({ text }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span
      style={{ position: 'relative', display: 'inline-block', marginLeft: '4px', verticalAlign: 'middle' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span
        style={{
          fontSize: '13px',
          color: '#94a3b8',
          cursor: 'help',
          lineHeight: 1,
          fontStyle: 'normal',
          fontWeight: 'normal',
          userSelect: 'none',
          display: 'inline-block',
          transition: 'color 0.15s',
        }}
      >
        ⓘ
      </span>
      {visible && (
        <span
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1e293b',
            color: '#f1f5f9',
            fontSize: '11px',
            lineHeight: '1.5',
            padding: '8px 12px',
            borderRadius: '6px',
            width: '260px',
            maxWidth: '260px',
            textTransform: 'none',
            letterSpacing: 'normal',
            fontFamily: 'sans-serif',
            fontWeight: 'normal',
            pointerEvents: 'none',
            zIndex: 9999,
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {text}
          <span
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #1e293b',
            }}
          />
        </span>
      )}
    </span>
  );
};

export default InfoTooltip;
