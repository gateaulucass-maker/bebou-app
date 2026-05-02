'use client';

import React, { useState, useEffect, useRef } from 'react';
import { T, SERIF, Theme } from './tokens';
import { useCountUp } from '../state/AppState';

// ── Tap (scale feedback)
interface TapProps extends React.HTMLAttributes<HTMLDivElement> {
  onClick?: () => void;
  style?: React.CSSProperties;
}
export function Tap({ children, onClick, style, ...rest }: TapProps) {
  const [down, setDown] = useState(false);
  return (
    <div
      onPointerDown={() => setDown(true)}
      onPointerUp={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      onClick={onClick}
      style={{ transform: down ? 'scale(0.97)' : 'scale(1)', transition: 'transform 120ms ease-out', cursor: 'pointer', ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

// ── Animated number
interface AnimNumProps {
  value: number;
  decimals?: number;
  style?: React.CSSProperties;
  prefix?: string;
  suffix?: string;
}
export function AnimNum({ value, decimals = 0, style, prefix = '', suffix = '' }: AnimNumProps) {
  const v = useCountUp(value, 600);
  const shown = decimals
    ? v.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(v).toLocaleString('fr-FR');
  return <span style={style}>{prefix}{shown}{suffix}</span>;
}

// ── Page transition
interface PageTransitionProps { pageKey: string; direction?: 'forward' | 'backward'; children: React.ReactNode; }
export function PageTransition({ pageKey, direction = 'forward', children }: PageTransitionProps) {
  const [phase, setPhase] = useState<'enter' | 'enter-from'>('enter');
  const [cur, setCur] = useState({ key: pageKey, children, direction });
  const prevKey = useRef(pageKey);

  useEffect(() => {
    if (pageKey === prevKey.current) { setCur((c) => ({ ...c, children })); return; }
    prevKey.current = pageKey;
    setCur({ key: pageKey, children, direction });
    setPhase('enter-from');
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setPhase('enter')));
    return () => cancelAnimationFrame(r);
  }, [pageKey, children, direction]);

  const tx = phase === 'enter-from' ? (cur.direction === 'forward' ? 'translateX(24px)' : 'translateX(-24px)') : 'translateX(0)';
  const op = phase === 'enter-from' ? 0 : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, transform: tx, opacity: op, transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease-out', willChange: 'transform, opacity' }}>
      {cur.children}
    </div>
  );
}

// ── Bottom sheet
interface SheetProps { open: boolean; onClose: () => void; children: React.ReactNode; th: Theme; }
export function Sheet({ open, onClose, children, th }: SheetProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const r = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      return () => cancelAnimationFrame(r);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 320);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;
  return (
    <div
      style={{ position: 'absolute', inset: 0, zIndex: 100, background: visible ? 'rgba(43,35,32,0.55)' : 'rgba(43,35,32,0)', transition: 'background 260ms ease-out', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: th.bg, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: '12px 0 0', color: th.ink, transform: visible ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 340ms cubic-bezier(0.22, 1, 0.36, 1)', willChange: 'transform', maxHeight: '92%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: th.faint, margin: '0 auto 6px' }} />
        {children}
      </div>
    </div>
  );
}

// ── Toast
interface ToastProps { msg: string; th: Theme; }
export function Toast({ msg, th }: ToastProps) {
  if (!msg) return null;
  return (
    <div style={{ position: 'absolute', top: 66, left: 0, right: 0, zIndex: 200, display: 'flex', justifyContent: 'center', pointerEvents: 'none', animation: 'bb-toast 2.4s ease-out forwards' }}>
      <div style={{ background: th.ink === T.ink ? T.ink : T.darkCard, color: T.cream, padding: '10px 18px', borderRadius: 999, fontSize: 13, fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>{msg}</div>
    </div>
  );
}

// ── NumPad (used in sheets)
interface NumPadProps { onKey: (k: string) => void; th: Theme; }
export function NumPad({ onKey, th }: NumPadProps) {
  const keys = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, padding: '6px 16px 0' }}>
      {keys.map((k) => (
        <Tap key={k} onClick={() => onKey(k)} style={{ background: 'transparent', padding: '14px', textAlign: 'center', fontSize: 24, fontWeight: 400, fontFamily: SERIF, color: th.ink, borderRadius: 16 }}>{k}</Tap>
      ))}
    </div>
  );
}

export function useNumPad(initial = '0') {
  const [v, setValue] = useState(initial);
  const press = (k: string) => setValue((cur) => {
    if (k === '⌫') return cur.length <= 1 ? '0' : cur.slice(0, -1);
    if (k === '.') return cur.includes(',') ? cur : cur + ',';
    if (cur === '0') return k;
    if (cur.includes(',') && cur.split(',')[1].length >= 2) return cur;
    return cur + k;
  });
  const reset = () => setValue('0');
  const num = parseFloat(v.replace(',', '.')) || 0;
  return { v, num, press, reset };
}
