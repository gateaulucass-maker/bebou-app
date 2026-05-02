'use client';

import React, { useState } from 'react';
import { AppStateShape, fmtEur } from '../state/AppState';
import { T, SANS, SERIF, Theme } from '../ui/tokens';
import { Tap } from '../ui/Primitives';
import { Icon } from '../ui/Icons';
import { TxRow, groupByDay } from './TxRow';

interface Props { th: Theme; nav: (s: string | number, p?: Record<string, unknown>) => void; app: AppStateShape; showChart?: boolean; params?: Record<string, unknown>; }

export function ScJournal({ th, nav, app, params }: Props) {
  const [filter, setFilter] = useState<'all'|'income'|'expense'>((params?.filter as 'income'|'expense') || 'all');
  const [q, setQ] = useState('');
  const now = new Date();
  const curTxs = app.txs.filter(x => { const d = new Date(x.ts); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); });
  const filtered = curTxs.filter((t) => {
    if (filter === 'income' && t.amount <= 0) return false;
    if (filter === 'expense' && t.amount >= 0) return false;
    if (q && !t.label.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const total = filtered.reduce((s, x) => s + x.amount, 0);

  return (
    <div style={{ height: '100%', background: th.bg, color: th.ink, fontFamily: SANS, display: 'flex', flexDirection: 'column', paddingTop: 54 }}>
      <div style={{ padding: '10px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Tap onClick={() => nav(-1)} style={{ padding: 6 }}>{Icon.back(th.ink)}</Tap>
        <div style={{ fontSize: 13, color: th.muted, letterSpacing: 0.3 }}>JOURNAL</div>
      </div>
      <div style={{ padding: '8px 24px 4px' }}>
        <div style={{ fontFamily: SERIF, fontSize: 36, lineHeight: 1, letterSpacing: -0.5 }}>
          {filter === 'income' ? 'Rentrées' : filter === 'expense' ? 'Dépenses' : 'Tout'}
        </div>
        <div style={{ fontSize: 12, color: th.muted, marginTop: 4, fontStyle: 'italic' }}>
          {filtered.length} transactions · total {total>=0?'+':'−'} {fmtEur(Math.abs(total))}
        </div>
      </div>
      <div style={{ padding: '14px 24px 10px', display: 'flex', gap: 8 }}>
        {([['all','Tout'],['expense','Sorties'],['income','Entrées']] as const).map(([k,l]) => (
          <Tap key={k} onClick={() => setFilter(k)} style={{ padding: '7px 14px', borderRadius: 999, background: filter === k ? th.ink : th.card, color: filter === k ? th.bg : th.ink, fontSize: 13, fontWeight: 500 }}>{l}</Tap>
        ))}
      </div>
      <div style={{ padding: '0 24px 10px' }}>
        <div style={{ background: th.card, borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          {Icon.search(th.muted)}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher…" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, flex: 1, color: th.ink, fontFamily: SANS }}/>
        </div>
      </div>
      <div style={{ flex: 1, padding: '4px 24px 100px', overflow: 'auto' }} className="bb-stagger">
        {groupByDay(filtered).map((grp, gi) => (
          <div key={gi} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: th.muted, marginBottom: 2, fontStyle: 'italic' }}>{grp.d}</div>
            {grp.items.map((tx, i) => (
              <TxRow key={tx.id} tx={tx} th={th} isLast={i === grp.items.length - 1} onClick={() => nav('tx-detail', { id: tx.id })} />
            ))}
          </div>
        ))}
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: th.muted, fontStyle: 'italic' }}>Rien à afficher</div>}
      </div>
    </div>
  );
}
