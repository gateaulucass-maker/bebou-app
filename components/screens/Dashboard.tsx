'use client';

import React from 'react';
import { AppStateShape, computeTotals, fmtEur } from '../state/AppState';
import { T, SERIF, SANS, Theme, MONTHS_UPPER } from '../ui/tokens';
import { Tap, AnimNum } from '../ui/Primitives';
import { Icon } from '../ui/Icons';
import { TxRow, groupByDay } from './TxRow';

interface Props { th: Theme; nav: (s: string | number, p?: Record<string, unknown>) => void; app: AppStateShape; showChart: boolean; }

function SoldeCurve({ txs, th, width = 300, height = 88 }: { txs: AppStateShape['txs']; th: Theme; width?: number; height?: number }) {
  const days = 30;
  const now = new Date(); now.setHours(0,0,0,0);
  const series = new Array(days).fill(0);
  const sorted = [...txs].sort((a,b) => a.ts - b.ts);
  let run = 0;
  for (let i = 0; i < days; i++) {
    const dayStart = now.getTime() - (days - 1 - i) * 86400e3;
    const dayEnd = dayStart + 86400e3;
    for (const tx of sorted) { if (tx.ts >= dayStart && tx.ts < dayEnd) run += tx.amount; }
    series[i] = run;
  }
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = (max - min) || 1;
  const pad = 4;
  const stepX = (width - pad*2) / (series.length - 1);
  const sy = (v: number) => pad + (height - pad*2) * (1 - (v - min) / span);

  let d = `M ${pad} ${sy(series[0])}`;
  for (let i = 1; i < series.length; i++) {
    const x = pad + i*stepX, y = sy(series[i]);
    const px = pad + (i-1)*stepX, py = sy(series[i-1]);
    d += ` C ${px+stepX/2} ${py}, ${x-stepX/2} ${y}, ${x} ${y}`;
  }
  const fill = d + ` L ${pad + (series.length-1)*stepX} ${height-pad} L ${pad} ${height-pad} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 88, display: 'block' }}>
      <defs>
        <linearGradient id="sgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.coral} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={T.coral} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#sgrad)" style={{ animation: 'bb-fade-in 500ms ease-out' }}/>
      <path d={d} fill="none" stroke={T.coral} strokeWidth="2" strokeLinecap="round" strokeDasharray="800" style={{ animation: 'bb-draw-line 1200ms ease-out forwards' }}/>
      <circle cx={pad + (series.length-1)*stepX} cy={sy(series[series.length-1])} r="4" fill={T.coral} stroke={th.card} strokeWidth="2" style={{ animation: 'bb-pop 600ms 900ms both' }}/>
    </svg>
  );
}

export function ScDashboard({ th, nav, app, showChart }: Props) {
  const now = new Date();
  const curTxs = app.txs.filter(x => { const d = new Date(x.ts); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); });
  const t = computeTotals(curTxs);

  return (
    <div style={{ height: '100%', background: th.bg, color: th.ink, fontFamily: SANS, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: th.muted, letterSpacing: 0.3 }}>{MONTHS_UPPER[now.getMonth()]} · {now.getFullYear()}</div>
        <Tap onClick={() => nav('journal')} style={{ padding: 6, borderRadius: 10 }}>{Icon.search(th.ink)}</Tap>
      </div>

      <div style={{ padding: '18px 24px 14px' }}>
        <div style={{ fontSize: 15, color: th.muted, marginBottom: 4 }}>Salut Bébou, il te reste</div>
        <div style={{ fontFamily: SERIF, fontSize: 68, lineHeight: 0.95, letterSpacing: -2, color: th.ink }}>
          <AnimNum value={Math.floor(Math.abs(t.balance))} />
          <span style={{ fontSize: 30, marginLeft: 2, color: th.muted, fontStyle: 'italic' }}>,{(Math.abs(t.balance % 1) * 100).toFixed(0).padStart(2,'0')} €</span>
        </div>
        <div style={{ fontSize: 13, color: th.muted, marginTop: 8, fontStyle: 'italic' }}>
          {t.balance >= 0
            ? <span>T&apos;es dans le vert ce mois-ci <span style={{ color: T.green }}>✌</span></span>
            : <span>Aïe, tu as débordé ce mois-ci</span>}
        </div>
      </div>

      <div style={{ padding: '0 24px', display: 'flex', gap: 10, marginBottom: 16 }}>
        <Tap onClick={() => nav('journal', { filter: 'income' })} style={{ flex: 1, background: th.card, borderRadius: 20, padding: '14px 16px' }}>
          <div style={{ fontSize: 10, color: th.muted, letterSpacing: 0.8, textTransform: 'uppercase' }}>Entrées</div>
          <div style={{ fontFamily: SERIF, fontSize: 26, marginTop: 4, color: T.green }}>+ <AnimNum value={Math.round(t.income)} /> €</div>
          <div style={{ fontSize: 11, color: th.muted, marginTop: 2 }}>{curTxs.filter(x=>x.amount>0).length} rentrées</div>
        </Tap>
        <Tap onClick={() => nav('journal', { filter: 'expense' })} style={{ flex: 1, background: th.card, borderRadius: 20, padding: '14px 16px' }}>
          <div style={{ fontSize: 10, color: th.muted, letterSpacing: 0.8, textTransform: 'uppercase' }}>Sorties</div>
          <div style={{ fontFamily: SERIF, fontSize: 26, marginTop: 4, color: T.coral }}>− <AnimNum value={Math.round(t.expense)} /> €</div>
          <div style={{ fontSize: 11, color: th.muted, marginTop: 2 }}>{curTxs.filter(x=>x.amount<0).length} dépenses</div>
        </Tap>
      </div>

      {showChart && (
        <div style={{ padding: '0 24px 14px' }}>
          <div style={{ background: th.card, borderRadius: 20, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Évolution du solde</div>
              <div style={{ fontSize: 10, color: th.muted }}>30 derniers jours</div>
            </div>
            <SoldeCurve txs={app.txs} th={th} />
          </div>
        </div>
      )}

      <div style={{ flex: 1, padding: '0 24px 110px', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: th.muted, letterSpacing: 0.8, textTransform: 'uppercase' }}>Journal</div>
          <Tap onClick={() => nav('journal')} style={{ fontSize: 12, color: T.coral }}>Tout voir →</Tap>
        </div>
        <div className="bb-stagger">
          {groupByDay(curTxs.slice(0, 6)).map((grp, gi) => (
            <div key={gi} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: th.muted, marginBottom: 2, fontStyle: 'italic' }}>{grp.d}</div>
              {grp.items.map((tx, i) => (
                <TxRow key={tx.id} tx={tx} th={th} isLast={i === grp.items.length - 1} onClick={() => nav('tx-detail', { id: tx.id })} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
