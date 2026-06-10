import React from 'react';

export default function LiquidBubbles() {
  const bubbles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    size: Math.random() * 8 + 4,
    left: Math.random() * 100,
    duration: Math.random() * 2 + 2,
    delay: Math.random() * 2
  }));

  return (
    <>
      <style>
        {`
          @keyframes riseUpBubble {
            0% { transform: translateY(150px) scale(0.5); opacity: 0; }
            30% { opacity: 0.6; }
            100% { transform: translateY(-20px) scale(1.1); opacity: 0; }
          }
        `}
      </style>
      <div className="absolute inset-x-0 bottom-0 top-1/2 pointer-events-none overflow-hidden">
        {bubbles.map(b => (
          <div
            key={b.id}
            className="absolute bottom-0 rounded-full bg-white/30"
            style={{
              width: `${b.size}px`,
              height: `${b.size}px`,
              left: `${b.left}%`,
              animation: `riseUpBubble ${b.duration}s infinite ease-in ${b.delay}s`
            }}
          />
        ))}
      </div>
    </>
  );
}
