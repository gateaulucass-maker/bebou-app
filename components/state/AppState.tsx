'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase, supabaseEnabled } from '@/lib/supabase';

const STORAGE_KEY = 'bebou.v1';
export { STORAGE_KEY as STORAGE_KEY_EXPORT };

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
  loading: boolean;
  addTx: (tx: Omit<Transaction, 'id' | 'ts'>) => Promise<void>;
  removeTx: (id: string) => Promise<void>;
  addRec: (r: Omit<Recurrent, 'id'>) => Promise<void>;
  removeRec: (id: string) => Promise<void>;
}

// ── Local cache helpers
function loadLocal(): { txs: Transaction[]; recs: Recurrent[] } {
  try {
    if (typeof window === 'undefined') return { txs: [], recs: [] };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { txs: [], recs: [] };
}

function saveLocal(s: { txs: Transaction[]; recs: Recurrent[] }) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

const AppStateCtx = createContext<AppStateShape | null>(null);

export function AppStateProvider({ children, userId }: { children: React.ReactNode; userId?: string }) {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [recs, setRecs] = useState<Recurrent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data: Supabase if connected, else localStorage
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (supabaseEnabled && supabase && userId) {
        const [{ data: txData }, { data: recData }] = await Promise.all([
          supabase.from('transactions').select('*').eq('user_id', userId).order('ts', { ascending: false }),
          supabase.from('recurrents').select('*').eq('user_id', userId),
        ]);
        if (cancelled) return;
        const loadedTxs: Transaction[] = (txData ?? []).map((r) => ({
          id: r.id, ts: Number(r.ts), label: r.label, cat: r.cat,
          amount: Number(r.amount), income: r.income, recurrent: r.recurrent,
        }));
        const loadedRecs: Recurrent[] = (recData ?? []).map((r) => ({
          id: r.id, label: r.label, amount: Number(r.amount), day: r.day, emoji: r.emoji,
        }));
        setTxs(loadedTxs);
        setRecs(loadedRecs);
        saveLocal({ txs: loadedTxs, recs: loadedRecs });
      } else {
        const local = loadLocal();
        if (!cancelled) { setTxs(local.txs); setRecs(local.recs); }
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  // Keep localStorage in sync
  useEffect(() => {
    if (!loading) saveLocal({ txs, recs });
  }, [txs, recs, loading]);

  const addTx = useCallback(async (tx: Omit<Transaction, 'id' | 'ts'>) => {
    const id = 't' + Date.now();
    const ts = Date.now();
    const newTx: Transaction = { ...tx, id, ts };
    setTxs((prev) => [newTx, ...prev]);
    if (supabaseEnabled && supabase && userId) {
      await supabase.from('transactions').insert({ ...newTx, user_id: userId });
    }
  }, [userId]);

  const removeTx = useCallback(async (id: string) => {
    setTxs((prev) => prev.filter((t) => t.id !== id));
    if (supabaseEnabled && supabase && userId) {
      await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId);
    }
  }, [userId]);

  const addRec = useCallback(async (r: Omit<Recurrent, 'id'>) => {
    const id = 'r' + Date.now();
    const newRec: Recurrent = { ...r, id };
    setRecs((prev) => [...prev, newRec]);
    if (supabaseEnabled && supabase && userId) {
      await supabase.from('recurrents').insert({ ...newRec, user_id: userId });
    }
  }, [userId]);

  const removeRec = useCallback(async (id: string) => {
    setRecs((prev) => prev.filter((r) => r.id !== id));
    if (supabaseEnabled && supabase && userId) {
      await supabase.from('recurrents').delete().eq('id', id).eq('user_id', userId);
    }
  }, [userId]);

  const value = useMemo<AppStateShape>(() => ({
    txs, recs, loading, addTx, removeTx, addRec, removeRec,
  }), [txs, recs, loading, addTx, removeTx, addRec, removeRec]);

  return <AppStateCtx.Provider value={value}>{children}</AppStateCtx.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppStateCtx);
  if (!ctx) throw new Error('useApp must be used within AppStateProvider');
  return ctx;
};

// ── Formatters
export const fmtEur = (n: number) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
export const fmtEurShort = (n: number) => Math.round(n).toLocaleString('fr-FR') + ' €';

export interface Totals {
  income: number; expense: number; balance: number; byCat: Record<string, number>;
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
