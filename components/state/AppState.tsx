'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';

const STORAGE_KEY = 'bebou.v1';

export const CATS: Record<string, { id: string; label: string; emoji: string }> = {
  alimentation: { id: 'alimentation', label: 'Alimentation', emoji: '🥑' },
  sorties:      { id: 'sorties',      label: 'Sorties',      emoji: '🍷' },
  courses:      { id: 'courses',      label: 'Courses',      emoji: '🛍️' },
  cadeaux:      { id: 'cadeaux',      label: 'Cadeaux',      emoji: '🎁' },
  recurrent:    { id: 'recurrent',    label: 'Récurrent',    emoji: '🔁' },
};

export const INCOMES: Record<string, { id: string; label: string; emoji: string }> = {
  salaire: { id: 'salaire', label: 'Salaire', emoji: '💼' },
  cadeau:  { id: 'cadeau',  label: 'Cadeau',  emoji: '🎀' },
  autre:   { id: 'autre',   label: 'Autre',   emoji: '✨' },
};

export interface Transaction {
  id: string;
  ts: number;
  label: string;
  cat: string;
  amount: number;
  income?: boolean;
  recurrent?: boolean;
}

export interface Recurrent {
  id: string;
  label: string;
  amount: number;
  day: number;
  emoji: string;
}

export interface AppStateShape {
  txs: Transaction[];
  recs: Recurrent[];
  addTx: (tx: Omit<Transaction, 'id' | 'ts'>) => void;
  removeTx: (id: string) => void;
  addRec: (r: Omit<Recurrent, 'id'>) => void;
  removeRec: (id: string) => void;
  reset: () => void;
}

// ── Seed data
const SEED_TX: Transaction[] = [
  { id: 't1',  ts: Date.now() - 3*3600e3,      label: 'Déjeuner Big Mamma',    cat: 'sorties',      amount: -38.50 },
  { id: 't2',  ts: Date.now() - 7*3600e3,      label: 'Café & croissant',      cat: 'alimentation', amount: -4.80  },
  { id: 't3',  ts: Date.now() - 1*86400e3,     label: 'Monoprix',              cat: 'alimentation', amount: -42.17 },
  { id: 't4',  ts: Date.now() - 1*86400e3-4e6, label: 'Anniv copine — cadeau', cat: 'cadeaux',      amount: -55.00 },
  { id: 't5',  ts: Date.now() - 3*86400e3,     label: 'Bar Le Perchoir',       cat: 'sorties',      amount: -24.00 },
  { id: 't6',  ts: Date.now() - 3*86400e3-3e6, label: 'Zara',                  cat: 'courses',      amount: -79.90 },
  { id: 't7',  ts: Date.now() - 4*86400e3,     label: 'Salaire Avril',         cat: 'salaire',      amount: 2450.00, income: true },
  { id: 't8',  ts: Date.now() - 5*86400e3,     label: 'Resto Indien',          cat: 'sorties',      amount: -32.40 },
  { id: 't9',  ts: Date.now() - 6*86400e3,     label: 'Netflix',               cat: 'recurrent',    amount: -13.49, recurrent: true },
  { id: 't10', ts: Date.now() - 7*86400e3,     label: 'Carrefour',             cat: 'alimentation', amount: -61.22 },
  { id: 't11', ts: Date.now() - 8*86400e3,     label: 'Loyer',                 cat: 'recurrent',    amount: -820.00, recurrent: true },
  { id: 't12', ts: Date.now() - 9*86400e3,     label: 'Cadeau fête des mères', cat: 'cadeaux',      amount: -42.00 },
  { id: 't13', ts: Date.now() - 10*86400e3,    label: 'Clubbing',              cat: 'sorties',      amount: -48.00 },
  { id: 't14', ts: Date.now() - 11*86400e3,    label: 'Sézane',                cat: 'courses',      amount: -120.00 },
  { id: 't15', ts: Date.now() - 13*86400e3,    label: 'Spotify',               cat: 'recurrent',    amount: -9.99,  recurrent: true },
  { id: 't16', ts: Date.now() - 14*86400e3,    label: 'Cadeau mariage Tom',    cat: 'cadeau',       amount: 200.00, income: true },
  { id: 't17', ts: Date.now() - 15*86400e3,    label: 'Boulangerie Utopie',    cat: 'alimentation', amount: -6.40  },
  { id: 't18', ts: Date.now() - 17*86400e3,    label: 'Diner chez Pink',       cat: 'sorties',      amount: -45.80 },
];

const PAST_MONTHS_TX: Transaction[] = (() => {
  const out: Transaction[] = [];
  const now = new Date();
  const monthPlans = [
    { off: 1, sal: 2450, expBase: [
      ['Loyer','recurrent',-820,5,true],['Netflix','recurrent',-13.49,15,true],
      ['Spotify','recurrent',-9.99,8,true],['Salle de sport','recurrent',-29.90,1,true],
      ['Forfait mobile','recurrent',-19.99,3,true],
      ['Monoprix','alimentation',-56.20,6],['Carrefour','alimentation',-72.40,12],
      ['Picard','alimentation',-31.50,18],['Boulangerie','alimentation',-14.20,22],
      ['Brunch Holybelly','sorties',-28.00,7],['Bar à vin','sorties',-42.00,14],
      ['Resto sushi','sorties',-36.00,21],['Ciné','sorties',-14.50,25],
      ['Zara','courses',-64.00,9],['Pharmacie','courses',-23.70,17],
      ['Cadeau Maman','cadeaux',-45.00,20],
    ] as [string,string,number,number,boolean?][]},
    { off: 2, sal: 2450, expBase: [
      ['Loyer','recurrent',-820,5,true],['Netflix','recurrent',-13.49,15,true],
      ['Spotify','recurrent',-9.99,8,true],['Salle de sport','recurrent',-29.90,1,true],
      ['Forfait mobile','recurrent',-19.99,3,true],
      ['Monoprix','alimentation',-48.90,4],['Franprix','alimentation',-34.20,11],
      ['Traiteur libanais','alimentation',-22.40,19],['Boulangerie','alimentation',-12.80,23],
      ['Dîner Saint-Valentin','sorties',-88.00,14],['Bar cocktails','sorties',-52.00,10],
      ['Restaurant thai','sorties',-29.00,18],
      ['Uniqlo','courses',-78.00,12],['Sephora','courses',-45.00,7],
      ['Cadeau anniv Tom','cadeaux',-60.00,16],['Cadeau fleurs','cadeaux',-28.00,13],
    ] as [string,string,number,number,boolean?][]},
    { off: 3, sal: 2450, expBase: [
      ['Loyer','recurrent',-820,5,true],['Netflix','recurrent',-13.49,15,true],
      ['Spotify','recurrent',-9.99,8,true],['Salle de sport','recurrent',-29.90,1,true],
      ['Forfait mobile','recurrent',-19.99,3,true],
      ['Monoprix','alimentation',-62.30,8],['Carrefour','alimentation',-81.20,14],
      ['Naturalia','alimentation',-42.60,20],
      ['Galette des rois','sorties',-18.00,6],['Soldes dîner','sorties',-34.00,17],
      ['Brunch copines','sorties',-26.50,21],
      ['Soldes Sézane','courses',-140.00,11],['Soldes Uniqlo','courses',-95.00,12],
      ['Soldes Nike','courses',-89.00,13],['Pharmacie','courses',-18.40,24],
      ['Cadeau retard Noël','cadeaux',-35.00,4],
    ] as [string,string,number,number,boolean?][]},
    { off: 4, sal: 2450, expBase: [
      ['Loyer','recurrent',-820,5,true],['Netflix','recurrent',-13.49,15,true],
      ['Spotify','recurrent',-9.99,8,true],['Salle de sport','recurrent',-29.90,1,true],
      ['Forfait mobile','recurrent',-19.99,3,true],
      ['Courses Noël','alimentation',-145.00,22],['Monoprix','alimentation',-58.00,10],
      ['Picard','alimentation',-42.00,18],['Champagne','alimentation',-68.00,24],
      ['Dîner entreprise','sorties',-45.00,12],['Nouvel An','sorties',-95.00,31],
      ['Bar Noël','sorties',-48.00,20],['Resto copines','sorties',-52.00,15],
      ['Cadeau Maman','cadeaux',-120.00,20],['Cadeau Papa','cadeaux',-85.00,20],
      ['Cadeau Tom','cadeaux',-60.00,21],['Cadeau copines','cadeaux',-95.00,18],
      ['Cadeau neveu','cadeaux',-42.00,19],['Cadeau collègue','cadeaux',-25.00,17],
      ['Manteau hiver','courses',-180.00,8],['Bottines','courses',-110.00,14],
    ] as [string,string,number,number,boolean?][]},
    { off: 5, sal: 2450, expBase: [
      ['Loyer','recurrent',-820,5,true],['Netflix','recurrent',-13.49,15,true],
      ['Spotify','recurrent',-9.99,8,true],['Salle de sport','recurrent',-29.90,1,true],
      ['Forfait mobile','recurrent',-19.99,3,true],
      ['Monoprix','alimentation',-54.00,9],['Carrefour','alimentation',-68.20,16],
      ['Boulangerie','alimentation',-16.40,22],
      ['Black Friday resto','sorties',-42.00,28],['Bar Le Perchoir','sorties',-36.00,12],
      ['Brunch','sorties',-24.00,19],
      ['Black Friday Apple','courses',-220.00,29],['& Other Stories','courses',-88.00,15],
      ['Cadeau anniv Manon','cadeaux',-50.00,11],
    ] as [string,string,number,number,boolean?][]},
  ];

  monthPlans.forEach((plan) => {
    const salaryDate = new Date(now.getFullYear(), now.getMonth() - plan.off, 1, 9, 30);
    out.push({ id: `past-sal-${plan.off}`, ts: salaryDate.getTime(), label: 'Salaire', cat: 'salaire', amount: plan.sal, income: true });
    plan.expBase.forEach((item, i) => {
      const [label, cat, amt, day, rec] = item;
      const d = new Date(now.getFullYear(), now.getMonth() - plan.off, day as number, 12 + (i % 10), (i * 7) % 60);
      out.push({ id: `past-${plan.off}-${i}`, ts: d.getTime(), label: label as string, cat: cat as string, amount: amt as number, ...(rec ? { recurrent: true } : {}) });
    });
  });
  return out;
})();

const ALL_SEED_TX = [...SEED_TX, ...PAST_MONTHS_TX];

export const SEED_REC: Recurrent[] = [
  { id: 'r1', label: 'Loyer',          amount: 820.00, day: 5,  emoji: '🏠' },
  { id: 'r2', label: 'Netflix',        amount: 13.49,  day: 15, emoji: '📺' },
  { id: 'r3', label: 'Spotify',        amount: 9.99,   day: 8,  emoji: '🎧' },
  { id: 'r4', label: 'Salle de sport', amount: 29.90,  day: 1,  emoji: '🏋️' },
  { id: 'r5', label: 'Forfait mobile', amount: 19.99,  day: 3,  emoji: '📱' },
];

function loadState(): { txs: Transaction[]; recs: Recurrent[] } {
  try {
    if (typeof window === 'undefined') return { txs: ALL_SEED_TX, recs: SEED_REC };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { txs: ALL_SEED_TX, recs: SEED_REC };
}

function saveState(s: { txs: Transaction[]; recs: Recurrent[] }) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

const AppStateCtx = createContext<AppStateShape | null>(null);

export function AppStateProvider({ children, resetKey }: { children: React.ReactNode; resetKey?: number }) {
  const [state, setState] = useState(() => loadState());

  useEffect(() => { saveState(state); }, [state]);

  const api = useMemo<AppStateShape>(() => ({
    txs: state.txs,
    recs: state.recs,
    addTx: (tx) => setState((s) => ({ ...s, txs: [{ ...tx, id: 't' + Date.now(), ts: Date.now() }, ...s.txs] })),
    removeTx: (id) => setState((s) => ({ ...s, txs: s.txs.filter((t) => t.id !== id) })),
    addRec: (r) => setState((s) => ({ ...s, recs: [...s.recs, { ...r, id: 'r' + Date.now() }] })),
    removeRec: (id) => setState((s) => ({ ...s, recs: s.recs.filter((r) => r.id !== id) })),
    reset: () => setState({ txs: ALL_SEED_TX, recs: SEED_REC }),
  }), [state]);

  return <AppStateCtx.Provider value={api}>{children}</AppStateCtx.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppStateCtx);
  if (!ctx) throw new Error('useApp must be used within AppStateProvider');
  return ctx;
};

// ── Helpers
export const fmtEur = (n: number) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
export const fmtEurShort = (n: number) => Math.round(n).toLocaleString('fr-FR') + ' €';

export interface Totals {
  income: number;
  expense: number;
  balance: number;
  byCat: Record<string, number>;
}

export function computeTotals(txs: Transaction[]): Totals {
  let income = 0, expense = 0;
  const byCat: Record<string, number> = {};
  for (const t of txs) {
    if (t.amount > 0) income += t.amount;
    else { expense += -t.amount; byCat[t.cat] = (byCat[t.cat] || 0) + -t.amount; }
  }
  return { income, expense, balance: income - expense, byCat };
}

export interface MonthData {
  key: string; year: number; month: number;
  label: string; short: string;
  txs: Transaction[];
  income: number; expense: number; balance: number;
  byCat: Record<string, number>;
}

export function computeMonthly(txs: Transaction[]): MonthData[] {
  const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const SHORT   = ['Janv','Févr','Mars','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc'];
  const buckets: Record<string, MonthData> = {};
  for (const tx of txs) {
    const d = new Date(tx.ts);
    const y = d.getFullYear(), m = d.getMonth();
    const key = `${y}-${String(m).padStart(2,'0')}`;
    if (!buckets[key]) buckets[key] = { key, year: y, month: m, label: MONTHS[m], short: SHORT[m], txs: [], income: 0, expense: 0, balance: 0, byCat: {} };
    buckets[key].txs.push(tx);
  }
  const arr = Object.values(buckets).sort((a,b) => (a.year - b.year) || (a.month - b.month));
  for (const b of arr) {
    const t = computeTotals(b.txs);
    b.income = t.income; b.expense = t.expense; b.balance = t.balance; b.byCat = t.byCat;
  }
  return arr;
}

export function relDate(ts: number): string {
  const now = new Date();
  const d = new Date(ts);
  const diffDays = Math.floor((new Date(now.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 86400e3);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) {
    const names = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
    return names[d.getDay()] + ' ' + d.getDate();
  }
  return d.getDate() + ' ' + ['janv','févr','mars','avr','mai','juin','juil','août','sept','oct','nov','déc'][d.getMonth()];
}

export function timeOf(ts: number): string {
  const d = new Date(ts);
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}

export function useCountUp(target: number, dur = 700): number {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const f = from.current;
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(f + (target - f) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}

export const STORAGE_KEY_EXPORT = STORAGE_KEY;
