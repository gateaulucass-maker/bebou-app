'use client';

import React from 'react';
import { Transaction, CATS, INCOMES, fmtEur, timeOf, relDate } from '../state/AppState';
import { T, SERIF, SANS, Theme } from '../ui/tokens';
import { Tap } from '../ui/Primitives';

interface TxRowProps {
  tx: Transaction;
  th: Theme;
  isLast: boolean;
  onClick: () => void;
}

export function TxRow({ tx, th, isLast, onClick }: TxRowProps) {
  return (
    <Tap onClick={onClick} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: isLast ? 'none' : `0.5px solid ${th.line}` }}>
      <div style={{ width: 32, height: 32, borderRadius: 16, background: th.bg === T.cream ? T.creamDeep : 'rgba(245,239,234,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginRight: 12, flexShrink: 0 }}>
        {tx.income ? (INCOMES[tx.cat]?.emoji || '💰') : CATS[tx.cat]?.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: SANS }}>{tx.label}</div>
        <div style={{ fontSize: 11, color: th.muted, marginTop: 1, fontFamily: SANS }}>
          {CATS[tx.cat]?.label || INCOMES[tx.cat]?.label} · {timeOf(tx.ts)}
          {tx.recurrent && <span style={{ marginLeft: 6, color: T.coral }}>· récurrent</span>}
        </div>
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 19, color: tx.amount > 0 ? T.green : th.ink, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', marginLeft: 8 }}>
        {tx.amount > 0 ? '+' : '−'} {fmtEur(Math.abs(tx.amount)).replace(' €', '')}
        <span style={{ fontSize: 12, color: th.muted, marginLeft: 2 }}> €</span>
      </div>
    </Tap>
  );
}

export function groupByDay(txs: Transaction[]): { d: string; items: Transaction[] }[] {
  const out: { d: string; items: Transaction[] }[] = [];
  for (const tx of txs) {
    const d = relDate(tx.ts);
    const last = out[out.length - 1];
    if (last && last.d === d) last.items.push(tx);
    else out.push({ d, items: [tx] });
  }
  return out;
}
