/**
 * ScatterToSignal - Blended concept showing progression from chaos to clarity
 * Left: Scattered points (noise/data)
 * Middle: Points organize into multiple parallel lines
 * Right: Lines converge into single clean signal
 */

import { useEffect, useState } from 'react';

export default function ScatterToSignal() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Generate scatter points for left side (chaos) - extended further right
  const scatterPoints = Array.from({ length: 50 }, (_, i) => ({
    x: 10 + (i % 10) * 10 + Math.random() * 8,
    y: 20 + Math.random() * 40,
    delay: Math.random() * 2,
  }));

  // Define middle section: multiple organizing lines
  const organizingLines = [
    { startY: 25, endY: 28, color: 0 },
    { startY: 35, endY: 37, color: 0.25 },
    { startY: 40, endY: 40, color: 0.5 },
    { startY: 45, endY: 43, color: 0.75 },
    { startY: 55, endY: 52, color: 1 },
  ];

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 700 80"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Main gradient violet to orange */}
          <linearGradient id="scatter-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#a78bfa', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
          </linearGradient>

          {/* Glow effect for final line */}
          <filter id="signal-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Section 1: Scattered points (0-120px) - CHAOS */}
        <g opacity="0.9">
          {scatterPoints.map((point, i) => (
            <circle
              key={`scatter-${i}`}
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill="#8b5cf6"
              opacity="0.6"
              className="animate-scatter"
              style={{
                animation: prefersReducedMotion ? 'none' : `scatter-pulse 3s ease-in-out infinite`,
                animationDelay: `${point.delay}s`,
              }}
            />
          ))}
        </g>

        {/* Section 2: Organizing into multiple lines (120-320px) - ORGANIZATION */}
        <g>
          {organizingLines.map((line, i) => (
            <g key={`org-line-${i}`}>
              {/* Connecting dots showing organization */}
              {[...Array(12)].map((_, dotIndex) => {
                const progress = dotIndex / 11;
                const x = 120 + progress * 200;
                const startY = line.startY;
                const endY = line.endY;
                const y = startY + (endY - startY) * progress;

                return (
                  <circle
                    key={`dot-${i}-${dotIndex}`}
                    cx={x}
                    cy={y}
                    r="1.5"
                    fill="url(#scatter-gradient)"
                    opacity={0.4 + progress * 0.4}
                    style={{
                      animation: prefersReducedMotion ? 'none' : `organize 4s ease-in-out infinite`,
                      animationDelay: `${i * 0.2 + dotIndex * 0.05}s`,
                    }}
                  />
                );
              })}

              {/* Line connecting organized dots */}
              <path
                d={`M 120 ${line.startY} L 320 ${line.endY}`}
                stroke="url(#scatter-gradient)"
                strokeWidth="1"
                fill="none"
                opacity="0.3"
                strokeDasharray="5 5"
                style={{
                  animation: prefersReducedMotion ? 'none' : `line-emerge 5s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            </g>
          ))}
        </g>

        {/* Section 3: Convergence into single signal (320-680px) - CLARITY */}
        <g>
          {/* Converging lines merging into one */}
          {organizingLines.map((line, i) => (
            <path
              key={`converge-${i}`}
              d={`M 320 ${line.endY} Q 450 ${40 + (line.endY - 40) * 0.4} 580 40 L 680 40`}
              stroke="url(#scatter-gradient)"
              strokeWidth="1.5"
              fill="none"
              opacity={0.6}
              style={{
                strokeDasharray: prefersReducedMotion ? 'none' : '360',
                strokeDashoffset: prefersReducedMotion ? '0' : '360',
                animation: prefersReducedMotion ? 'none' : `converge 6s ease-out infinite`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}

          {/* Final unified signal line with glow */}
          <line
            x1="480"
            y1="40"
            x2="680"
            y2="40"
            stroke="#f97316"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#signal-glow)"
            style={{
              animation: prefersReducedMotion ? 'none' : 'signal-pulse 2s ease-in-out infinite',
            }}
          />
        </g>

        {/* Traveling particle showing the complete journey */}
        {prefersReducedMotion ? (
          /* Static endpoint for reduced motion */
          <circle cx="680" cy="40" r="2.5" fill="#f97316" opacity="0.9" />
        ) : (
          <circle r="2.5" fill="#f97316" opacity="0.9">
            <animateMotion
              dur="8s"
              repeatCount="indefinite"
              path="M 40 40 L 120 40 Q 220 38 320 40 Q 450 40 580 40 L 680 40"
            />
            <animate
              attributeName="opacity"
              dur="8s"
              repeatCount="indefinite"
              values="0; 0.3; 0.6; 0.9; 1; 1"
            />
          </circle>
        )}

        {/* CSS animations */}
        <style>{`
          @keyframes scatter-pulse {
            0%, 100% {
              r: 1.5;
              opacity: 0.4;
            }
            50% {
              r: 2;
              opacity: 0.8;
            }
          }

          @keyframes organize {
            0%, 100% {
              opacity: 0.4;
              transform: translateY(0);
            }
            50% {
              opacity: 0.8;
              transform: translateY(-1px);
            }
          }

          @keyframes line-emerge {
            0% {
              stroke-dashoffset: 300;
              opacity: 0;
            }
            40% {
              opacity: 0.3;
            }
            100% {
              stroke-dashoffset: 0;
              opacity: 0.3;
            }
          }

          @keyframes converge {
            0% {
              stroke-dashoffset: 360;
              opacity: 0;
              stroke-width: 1.5;
            }
            60% {
              opacity: 0.6;
            }
            100% {
              stroke-dashoffset: 0;
              opacity: 0.6;
              stroke-width: 2;
            }
          }

          @keyframes signal-pulse {
            0%, 100% {
              stroke-width: 3;
              opacity: 1;
            }
            50% {
              stroke-width: 4;
              opacity: 0.8;
            }
          }
        `}</style>
      </svg>
    </div>
  );
}
