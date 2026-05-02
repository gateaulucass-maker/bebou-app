'use client';

import React, { useState } from 'react';
import { T, SERIF, SANS } from '../ui/tokens';

const PIN = '2407';

export function AuthScreen({ onAuth }: { onAuth: () => void }) {
  const [digits, setDigits] = useState('');
  const [shake, setShake] = useState(false);

  const press = (d: string) => {
    if (digits.length >= 4) return;
    const next = digits + d;
    setDigits(next);
    if (next.length === 4) {
      if (next === PIN) {
        sessionStorage.setItem('bebou.auth', '1');
        onAuth();
      } else {
        setShake(true);
        setTimeout(() => { setDigits(''); setShake(false); }, 600);
      }
    }
  };

  const del = () => setDigits((d) => d.slice(0, -1));

  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <div style={{ minHeight: '100vh', background: T.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS }}>
      <div style={{ width: '100%', maxWidth: 320, padding: 24, textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ fontFamily: SERIF, fontSize: 40, letterSpacing: -0.5, color: T.ink, marginBottom: 4 }}>Bébou</div>
        <div style={{ fontSize: 13, color: T.muted, fontStyle: 'italic', marginBottom: 48 }}>Entre ton code</div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 48, animation: shake ? 'bb-shake 500ms' : 'none' }}>
          {[0,1,2,3].map((i) => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: i < digits.length ? T.coral : T.faint, transition: 'background 150ms, transform 150ms', transform: i < digits.length ? 'scale(1.1)' : 'scale(1)' }} />
          ))}
        </div>

        {/* Keypad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {keys.map((k, i) => {
            if (k === '') return <div key={i} />;
            return (
              <button
                key={i}
                onClick={() => k === '⌫' ? del() : press(k)}
                style={{ height: 64, borderRadius: 18, border: 'none', background: k === '⌫' ? 'transparent' : T.card, color: k === '⌫' ? T.muted : T.ink, fontSize: k === '⌫' ? 22 : 26, fontFamily: SERIF, fontWeight: 400, cursor: 'pointer', boxShadow: k === '⌫' ? 'none' : '0 2px 8px rgba(43,35,32,0.08)', transition: 'transform 80ms, background 80ms', WebkitTapHighlightColor: 'transparent' }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.93)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {k}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
