'use client';

import React, { useState } from 'react';
import { AppStateShape, computeMonthly, MonthData, CATS } from '../state/AppState';
import { T, SERIF, SANS, Theme } from '../ui/tokens';
import { Tap, AnimNum } from '../ui/Primitives';

interface Props { th: Theme; app: AppStateShape; showChart: boolean; }

function BalanceCurve({ months, th, width = 320, height = 100 }: { months: MonthData[]; th: Theme; width?: number; height?: number }) {
  const vals = months.map(m => m.balance);
  const min = Math.min(...vals, 0);
  const max = Math.max(...vals, 0);
  const span = (max - min) || 1;
  const pad = 8;
  const stepX = (width - pad * 2) / (vals.length - 1);
  const sy = (v: number) => pad + (height - pad * 2) * (1 - (v - min) / span);
  const zeroY = sy(0);

  let d = `M ${pad} ${sy(vals[0])}`;
  for (let i = 1; i < vals.length; i++) {
    const x = pad + i * stepX, y = sy(vals[i]);
    const px = pad + (i - 1) * stepX, py = sy(vals[i - 1]);
    d += ` C ${px + stepX/2} ${py}, ${x - stepX/2} ${y}, ${x} ${y}`;
  }
  const fill = d + ` L ${pad + (vals.length - 1) * stepX} ${zeroY} L ${pad} ${zeroY} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height + 18}`} style={{ width: '100%', height: 118, display: 'block' }}>
      <defs>
        <linearGradient id="bgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.green} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={T.green} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <line x1={pad} x2={width - pad} y1={zeroY} y2={zeroY} stroke={th.faint} strokeWidth="1" strokeDasharray="2 3"/>
      <path d={fill} fill="url(#bgrad)" style={{ animation: 'bb-fade-in 500ms ease-out' }}/>
      <path d={d} fill="none" stroke={T.green} strokeWidth="2" strokeLinecap="round" strokeDasharray="800" style={{ animation: 'bb-draw-line 1200ms ease-out forwards' }}/>
      {months.map((m, i) => {
        const x = pad + i * stepX;
        const y = sy(vals[i]);
        return (
          <g key={m.key}>
            <circle cx={x} cy={y} r="3" fill={T.green} stroke={th.card} strokeWidth="2" style={{ animation: `bb-pop 400ms ${600 + i*60}ms both` }}/>
            <text x={x} y={height + 14} fontSize="9" textAnchor="middle" fill={th.muted}>{m.short}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function ScStats({ th, app, showChart }: Props) {
  const months = computeMonthly(app.txs);
  const [selIdx, setSelIdx] = useState(months.length - 1);
  const sel = months[selIdx];
  const prev = selIdx > 0 ? months[selIdx - 1] : null;
  const tail = months.slice(-6);
  const maxExp = Math.max(...tail.map(m => m.expense), 1);

  const deltaExp = prev ? sel.expense - prev.expense : 0;
  const deltaPct = prev && prev.expense > 0 ? ((sel.expense - prev.expense) / prev.expense) * 100 : 0;

  const allCats = new Set([...Object.keys(sel.byCat || {}), ...(prev ? Object.keys(prev.byCat) : [])]);
  const catRows = [...allCats]
    .map(c => ({ c, cur: sel.byCat[c] || 0, prev: prev ? (prev.byCat[c] || 0) : 0 }))
    .sort((a, b) => b.cur - a.cur);

  return (
    <div style={{ height: '100%', background: th.bg, color: th.ink, fontFamily: SANS, display: 'flex', flexDirection: 'column', paddingTop: 54 }}>
      <div style={{ padding: '10px 24px 0' }}>
        <div style={{ fontSize: 13, color: th.muted, letterSpacing: 0.3 }}>STATS</div>
        <div style={{ fontFamily: SERIF, fontSize: 36, lineHeight: 1, letterSpacing: -0.5, marginTop: 4 }}>Mois par mois</div>
        <div style={{ fontSize: 12, color: th.muted, marginTop: 4, fontStyle: 'italic' }}>Regarde où tes sous s&apos;envolent 🕊️</div>
      </div>

      <div style={{ flex: 1, padding: '18px 0 110px', overflow: 'auto' }}>
        {showChart && (
          <div style={{ padding: '0 24px 16px' }}>
            <div style={{ background: th.card, borderRadius: 22, padding: '16px 14px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, padding: '0 6px' }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Dépenses</div>
                <div style={{ fontSize: 10, color: th.muted }}>6 derniers mois</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, padding: '0 4px' }}>
                {tail.map((m, i) => {
                  const active = m.key === sel.key;
                  const h = (m.expense / maxExp) * 100;
                  return (
                    <Tap key={m.key} onClick={() => setSelIdx(months.indexOf(m))} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', width: '100%' }}>
                        <div style={{ fontSize: 10, color: active ? T.coral : th.muted, fontWeight: 600, textAlign: 'center', marginBottom: 4, opacity: active ? 1 : 0.6, transition: 'opacity 200ms' }}>
                          {Math.round(m.expense)}
                        </div>
                        <div style={{ width: '100%', height: `${h}%`, minHeight: 4, background: active ? T.coral : T.coralSoft, opacity: active ? 1 : 0.55, borderRadius: 8, transformOrigin: 'bottom', animation: `bb-grow-bar 600ms ${i*60}ms cubic-bezier(0.22,1,0.36,1) both`, transition: 'background 200ms, opacity 200ms' }} />
                      </div>
                      <div style={{ fontSize: 10, color: active ? th.ink : th.muted, fontWeight: active ? 600 : 500, letterSpacing: 0.2 }}>{m.short}</div>
                    </Tap>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div style={{ padding: '0 24px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontFamily: SERIF, fontSize: 28, lineHeight: 1 }}>
              {sel.label} <span style={{ color: th.muted, fontStyle: 'italic', fontSize: 20 }}>{sel.year}</span>
            </div>
            {prev && (
              <div style={{ fontSize: 11, color: deltaExp > 0 ? T.coral : T.green, background: deltaExp > 0 ? 'rgba(255,122,92,0.12)' : 'rgba(91,122,110,0.14)', padding: '4px 10px', borderRadius: 999, fontWeight: 500 }}>
                {deltaExp > 0 ? '+' : '−'}{Math.abs(Math.round(deltaPct))}% vs {prev.short.toLowerCase()}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {([['Entrées', sel.income, T.green, '+'], ['Sorties', sel.expense, T.coral, '−'], ['Solde', Math.abs(sel.balance), sel.balance >= 0 ? T.green : T.coral, sel.balance >= 0 ? '+' : '−']] as [string, number, string, string][]).map(([l, v, c, s]) => (
              <div key={l} style={{ flex: 1, background: th.card, borderRadius: 18, padding: '12px 14px' }}>
                <div style={{ fontSize: 9, color: th.muted, letterSpacing: 0.8, textTransform: 'uppercase' }}>{l}</div>
                <div style={{ fontFamily: SERIF, fontSize: 22, color: c, marginTop: 3 }}>{s} <AnimNum value={Math.round(v)} /> €</div>
              </div>
            ))}
          </div>
        </div>

        {showChart && (
          <div style={{ padding: '0 24px 16px' }}>
            <div style={{ background: th.card, borderRadius: 22, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Évolution du solde</div>
                <div style={{ fontSize: 10, color: th.muted }}>solde mensuel</div>
              </div>
              <BalanceCurve months={tail} th={th} />
            </div>
          </div>
        )}

        <div style={{ padding: '0 24px 20px' }}>
          <div style={{ fontSize: 11, color: th.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>
            Par catégorie{prev ? ` · ${sel.short} vs ${prev.short}` : ''}
          </div>
          <div className="bb-stagger">
            {catRows.filter(r => r.cur > 0 || r.prev > 0).map(({ c, cur, prev: p }) => {
              const cat = CATS[c] || { label: c, emoji: '•' };
              const maxRow = Math.max(cur, p, 1);
              const delta = cur - p;
              return (
                <div key={c} style={{ background: th.card, borderRadius: 16, padding: '12px 14px', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 14, background: th.bg === T.cream ? T.creamDeep : 'rgba(245,239,234,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{cat.emoji}</div>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{cat.label}</div>
                    {prev && p > 0 && <div style={{ fontSize: 10, fontWeight: 500, color: delta > 0 ? T.coral : T.green }}>{delta > 0 ? '↑' : '↓'} {Math.abs(Math.round(p ? (delta/p)*100 : 0))}%</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 9, color: th.muted, width: 28 }}>{sel.short}</div>
                    <div style={{ flex: 1, height: 8, background: th.faint, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${(cur/maxRow)*100}%`, height: '100%', background: T.coral, borderRadius: 4, transition: 'width 700ms cubic-bezier(0.22,1,0.36,1)' }} />
                    </div>
                    <div style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums', width: 52, textAlign: 'right', fontFamily: SERIF }}>{Math.round(cur)} €</div>
                  </div>
                  {prev && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 9, color: th.muted, width: 28 }}>{prev.short}</div>
                      <div style={{ flex: 1, height: 8, background: th.faint, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${(p/maxRow)*100}%`, height: '100%', background: T.coralSoft, opacity: 0.8, borderRadius: 4, transition: 'width 700ms cubic-bezier(0.22,1,0.36,1)' }} />
                      </div>
                      <div style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums', width: 52, textAlign: 'right', fontFamily: SERIF, color: th.muted }}>{Math.round(p)} €</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
