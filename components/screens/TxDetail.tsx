'use client';

import React from 'react';
import { AppStateShape, CATS, INCOMES, fmtEur, relDate, timeOf } from '../state/AppState';
import { T, SERIF, SANS, Theme } from '../ui/tokens';
import { Tap } from '../ui/Primitives';
import { Icon } from '../ui/Icons';

interface Props { th: Theme; nav: (s: string | number) => void; app: AppStateShape; params?: Record<string, unknown>; }

export function ScTxDetail({ th, nav, app, params }: Props) {
  const tx = app.txs.find((t) => t.id === params?.id);
  if (!tx) return <div style={{ padding: 80 }}>—</div>;
  const c = CATS[tx.cat] || INCOMES[tx.cat];

  const rows: [string, string][] = [
    ['Date', relDate(tx.ts) + ' · ' + timeOf(tx.ts)],
    ['Catégorie', c?.label || '—'],
    ['Type', tx.amount > 0 ? 'Rentrée' : 'Dépense'],
    ...(tx.recurrent ? [['Récurrent', 'Oui'] as [string, string]] : []),
  ];

  return (
    <div style={{ height: '100%', background: th.bg, color: th.ink, fontFamily: SANS }}>
      <div style={{ padding: '10px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Tap onClick={() => nav(-1)} style={{ padding: 6 }}>{Icon.back(th.ink)}</Tap>
        <Tap onClick={() => { app.removeTx(tx.id); nav(-1); }} style={{ padding: 8, borderRadius: 10 }}>{Icon.trash(T.coral)}</Tap>
      </div>
      <div style={{ padding: '24px 24px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 52, animation: 'bb-pop 500ms' }}>{c?.emoji}</div>
        <div style={{ fontFamily: SERIF, fontSize: 64, lineHeight: 1, letterSpacing: -2, marginTop: 12 }}>
          <span style={{ color: tx.amount > 0 ? T.green : T.coral }}>{tx.amount > 0 ? '+' : '−'}</span>
          {' '}{fmtEur(Math.abs(tx.amount)).replace(' €', '')}
          <span style={{ color: th.muted, fontStyle: 'italic', fontSize: 32 }}> €</span>
        </div>
        <div style={{ fontSize: 15, marginTop: 10, fontWeight: 500 }}>{tx.label}</div>
        <div style={{ fontSize: 12, color: th.muted, marginTop: 4, fontStyle: 'italic' }}>{c?.label}</div>
      </div>
      <div style={{ padding: '32px 24px 0' }}>
        <div style={{ background: th.card, borderRadius: 18, padding: '2px 18px' }}>
          {rows.map(([k, v], i) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: i === rows.length - 1 ? 'none' : `0.5px solid ${th.line}`, fontSize: 14 }}>
              <div style={{ color: th.muted }}>{k}</div>
              <div>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
