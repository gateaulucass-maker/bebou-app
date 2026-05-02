'use client';

import React from 'react';
import { AppStateShape, fmtEurShort } from '../state/AppState';
import { T, SERIF, SANS, Theme } from '../ui/tokens';
import { Tap, AnimNum } from '../ui/Primitives';
import { Icon } from '../ui/Icons';

interface Props { th: Theme; nav: (s: string | number) => void; app: AppStateShape; onAdd: () => void; }

export function ScRecurrent({ th, app, onAdd }: Props) {
  const total = app.recs.reduce((s, r) => s + r.amount, 0);
  return (
    <div style={{ height: '100%', background: th.bg, color: th.ink, fontFamily: SANS, display: 'flex', flexDirection: 'column', paddingTop: 54 }}>
      <div style={{ padding: '10px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, color: th.muted, letterSpacing: 0.3 }}>RÉCURRENT</div>
        <Tap onClick={onAdd} style={{ fontSize: 13, color: T.coral, fontWeight: 500 }}>+ Ajouter</Tap>
      </div>
      <div style={{ padding: '14px 24px 4px' }}>
        <div style={{ fontSize: 13, color: th.muted, fontStyle: 'italic' }}>Ton engagement mensuel</div>
        <div style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, letterSpacing: -1.5, marginTop: 4 }}>
          − <AnimNum value={Math.round(total)} />
          <span style={{ color: th.muted, fontStyle: 'italic', fontSize: 26 }}>,{((total%1)*100).toFixed(0).padStart(2,'0')} €</span>
        </div>
        <div style={{ fontSize: 12, color: th.muted, marginTop: 6 }}>{app.recs.length} abonnements actifs</div>
      </div>
      <div style={{ flex: 1, padding: '18px 24px 100px', overflow: 'auto' }} className="bb-stagger">
        {app.recs.map((r) => (
          <div key={r.id} style={{ background: th.card, borderRadius: 16, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, background: th.bg === T.cream ? T.creamDeep : 'rgba(245,239,234,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{r.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{r.label}</div>
              <div style={{ fontSize: 11, color: th.muted, marginTop: 2 }}>Le {r.day} de chaque mois</div>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 19, marginRight: 8 }}>{fmtEurShort(r.amount)}</div>
            <Tap onClick={() => app.removeRec(r.id)} style={{ padding: 6, borderRadius: 8 }}>{Icon.trash(th.muted)}</Tap>
          </div>
        ))}
      </div>
    </div>
  );
}
