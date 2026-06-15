'use client';

import { useEffect, useState } from 'react';

const STAGES = [
  { label: 'Confirmed', icon: 'check' },
  { label: 'Processing', icon: 'box' },
  { label: 'Shipped', icon: 'truck' },
  { label: 'Out for Delivery', icon: 'map' },
  { label: 'Delivered', icon: 'home' },
];

interface DeliveryTrackerProps {
  currentStage: number;
  animate?: boolean;
  showDeliveredMessage?: boolean;
}

function TruckSVG() {
  return (
    <svg width="30" height="18" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="4" width="22" height="13" rx="2" fill="var(--color-primary)" />
      <rect x="3" y="6" width="8" height="7" rx="1" fill="var(--color-white-warm)" opacity="0.85" />
      <rect x="23" y="9" width="12" height="8" rx="1.5" fill="var(--color-primary-dark)" />
      <rect x="26" y="11" width="6" height="4" rx="1" fill="var(--color-white-warm)" opacity="0.7" />
      <circle cx="9" cy="19" r="3" fill="var(--color-text-dark)" />
      <circle cx="9" cy="19" r="1.5" fill="var(--color-text-muted)" />
      <circle cx="31" cy="19" r="3" fill="var(--color-text-dark)" />
      <circle cx="31" cy="19" r="1.5" fill="var(--color-text-muted)" />
      <rect x="1" y="17" width="34" height="1.5" rx="0.5" fill="var(--color-text-dark)" opacity="0.1" />
    </svg>
  );
}

export default function DeliveryTracker({ currentStage, animate = false, showDeliveredMessage = false }: DeliveryTrackerProps) {
  const [truckPos, setTruckPos] = useState(animate ? -1 : currentStage);
  const isDelivered = currentStage >= 4;

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setTruckPos(currentStage), 300);
      return () => clearTimeout(timer);
    }
    setTruckPos(currentStage);
  }, [currentStage, animate]);

  const progressPercent = truckPos >= 0 ? (truckPos / (STAGES.length - 1)) * 100 : 0;

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        position: 'relative',
        padding: '1.75rem 0 0',
        margin: '0 auto',
        maxWidth: '380px',
      }}>
        {/* Truck - positioned above the track, aligned to dots */}
        <div style={{
          position: 'absolute',
          top: '-4px',
          left: `calc(${progressPercent}% - 15px)`,
          transition: 'left 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          filter: 'drop-shadow(0 2px 4px rgba(59,46,36,0.15))',
          zIndex: 2,
        }}>
          <TruckSVG />
        </div>

        {/* Stage dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative',
          padding: '0',
        }}>
          {STAGES.map((stage, i) => {
            const isCompleted = i <= currentStage;
            const isCurrent = i === currentStage;

            return (
              <div key={stage.label} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                flex: '1',
                maxWidth: '76px',
              }}>
                <div style={{
                  width: isCurrent ? '12px' : '8px',
                  height: isCurrent ? '12px' : '8px',
                  borderRadius: '50%',
                  background: isCompleted ? 'var(--color-natural-dark)' : 'var(--color-border-soft)',
                  border: isCurrent ? '2.5px solid rgba(90, 122, 80, 0.25)' : 'none',
                  transition: 'all 0.4s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {isCompleted && (
                    <svg width="5" height="5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span style={{
                  fontSize: '0.6rem',
                  fontWeight: isCurrent ? 600 : 400,
                  color: isCompleted ? 'var(--color-text-dark)' : 'var(--color-text-muted)',
                  textAlign: 'center',
                  lineHeight: 1.3,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress track - drawn behind dots using absolute positioning */}
        <div style={{
          position: 'absolute',
          top: `calc(1.75rem + 4px)`,
          left: '4px',
          right: '4px',
          height: '3px',
          background: 'var(--color-border-soft)',
          borderRadius: '2px',
          zIndex: 0,
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progressPercent}%`,
            background: 'var(--color-natural-dark)',
            borderRadius: '2px',
            transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }} />
        </div>
      </div>

      {showDeliveredMessage && isDelivered && (
        <div style={{
          textAlign: 'center',
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          background: 'rgba(90, 122, 80, 0.08)',
          border: '1px solid rgba(90, 122, 80, 0.2)',
          borderRadius: '0.75rem',
          color: 'var(--color-natural-dark)',
          fontWeight: 600,
          fontSize: '0.8125rem',
          letterSpacing: '0.03em',
        }}>
          Order Delivered Successfully
        </div>
      )}
    </div>
  );
}
