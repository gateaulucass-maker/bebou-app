'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppStateProvider, useApp } from './state/AppState';
import { theme, T, SANS, SERIF } from './ui/tokens';
import { Icon } from './ui/Icons';
import { Tap, PageTransition, Toast } from './ui/Primitives';
import { AuthScreen } from './auth/AuthScreen';
import { ScDashboard } from './screens/Dashboard';
import { ScJournal } from './screens/Journal';
import { ScRecurrent } from './screens/Recurrent';
import { ScTxDetail } from './screens/TxDetail';
import { ScStats } from './stats/Stats';
import { SheetChoice, SheetAddExpense, SheetAddIncome, SheetAddRecurrent } from './sheets/Sheets';

type ScreenName = 'home' | 'journal' | 'stats' | 'rec' | 'tx-detail';
type SheetName = 'choice' | 'expense' | 'income' | 'rec' | null;

const NAV_ITEMS = [
  { k: 'home',    l: 'Accueil',    icon: Icon.home },
  { k: 'journal', l: 'Journal',    icon: Icon.journal },
  { k: 'stats',   l: 'Stats',      icon: Icon.chart },
  { k: 'rec',     l: 'Récurrents', icon: Icon.repeat },
] as const;

// ── Desktop Sidebar
function Sidebar({ tab, onTab, onFab, dark, onToggleDark, onLogout, userId, th }: {
  tab: string; onTab: (k: string) => void; onFab: () => void;
  dark: boolean; onToggleDark: () => void; onLogout: () => void;
  userId?: string; th: ReturnType<typeof theme>;
}) {
  return (
    <div style={{ width: 240, height: '100vh', background: th.card, borderRight: `1px solid ${th.line}`, display: 'flex', flexDirection: 'column', padding: '28px 16px 24px', flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: '0 8px 32px' }}>
        <div style={{ fontFamily: SERIF, fontSize: 30, letterSpacing: -0.5, color: th.ink }}>Bébou</div>
        <div style={{ fontSize: 12, color: th.muted, fontStyle: 'italic', marginTop: 2 }}>ton suivi de dépenses</div>
      </div>

      {/* Nav items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(({ k, l, icon }) => {
          const active = tab === k;
          return (
            <Tap key={k} onClick={() => onTab(k)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: active ? T.coral + '20' : 'transparent', color: active ? T.coral : th.ink, fontFamily: SANS, fontSize: 14, fontWeight: active ? 600 : 500, transition: 'background 150ms, color 150ms' }}>
              {icon(active ? T.coral : th.ink)}
              {l}
            </Tap>
          );
        })}
      </div>

      {/* FAB */}
      <Tap onClick={onFab} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, padding: '12px 16px', borderRadius: 14, background: T.coral, color: '#fff', fontFamily: SANS, fontSize: 14, fontWeight: 600, boxShadow: '0 4px 14px rgba(255,122,92,0.4)' }}>
        {Icon.plus('#fff')}
        Ajouter
      </Tap>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${th.line}`, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Tap onClick={onToggleDark} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, color: th.ink, fontSize: 13, fontFamily: SANS }}>
          <span>Mode sombre</span>
          <div style={{ width: 36, height: 20, background: dark ? T.coral : th.faint, borderRadius: 10, position: 'relative', transition: 'background 200ms' }}>
            <div style={{ position: 'absolute', top: 2, left: dark ? 18 : 2, width: 16, height: 16, borderRadius: 8, background: '#fff', transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </div>
        </Tap>

        <Tap onClick={onLogout} style={{ padding: '8px 12px', borderRadius: 10, color: th.muted, fontSize: 13, fontFamily: SANS, textAlign: 'left' }}>
          Verrouiller
        </Tap>
      </div>
    </div>
  );
}

// ── Mobile Tab Bar
function TabBar({ tab, onTab, onFab, th }: { tab: string; onTab: (k: string) => void; onFab: () => void; th: ReturnType<typeof theme> }) {
  const tabs = [
    { k: 'home',    l: 'Accueil',    icon: Icon.home },
    { k: 'journal', l: 'Journal',    icon: Icon.journal },
    { k: 'fab' },
    { k: 'stats',   l: 'Stats',      icon: Icon.chart },
    { k: 'rec',     l: 'Récurrents', icon: Icon.repeat },
  ] as const;

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: th.bg === T.cream ? 'rgba(255,244,239,0.92)' : 'rgba(26,21,19,0.92)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', borderTop: `0.5px solid ${th.line}`, padding: '8px 12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
      {tabs.map((t) => {
        if (t.k === 'fab') return (
          <Tap key="fab" onClick={onFab} style={{ width: 52, height: 52, borderRadius: 26, background: T.coral, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(255,122,92,0.5)', marginTop: -20 }}>
            {Icon.plus('#fff')}
          </Tap>
        );
        const active = tab === t.k;
        return (
          <Tap key={t.k} onClick={() => onTab(t.k)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 0', opacity: active ? 1 : 0.5, color: active ? T.coral : th.ink, transition: 'opacity 180ms, color 180ms' }}>
            {t.icon(active ? T.coral : th.ink)}
            <div style={{ fontSize: 10, fontWeight: active ? 600 : 500, fontFamily: SANS }}>{t.l}</div>
          </Tap>
        );
      })}
    </div>
  );
}

// ── Inner app (needs AppState context)
function AppInner({ dark, setDark, isDesktop }: {
  dark: boolean; setDark: (d: boolean) => void; isDesktop: boolean;
}) {
  const th = theme(dark);
  const app = useApp();

  const [stack, setStack] = useState<{ screen: ScreenName; params: Record<string, unknown> }[]>([{ screen: 'home', params: {} }]);
  const [tab, setTab] = useState<string>('home');
  const [sheet, setSheet] = useState<SheetName>(null);
  const [toast, setToast] = useState('');
  const toastT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDepth = useRef(stack.length);

  const showToast = (m: string) => {
    setToast(m);
    if (toastT.current) clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(''), 2400);
  };

  const nav = (screenOrN: string | number, params: Record<string, unknown> = {}) => {
    if (screenOrN === -1) { setStack((s) => s.length > 1 ? s.slice(0, -1) : s); return; }
    const s = screenOrN as ScreenName;
    if (['home', 'journal', 'stats', 'rec'].includes(s)) {
      setTab(s); setStack([{ screen: s, params }]); return;
    }
    setStack((prev) => [...prev, { screen: s, params }]);
  };

  const onTab = (k: string) => { setTab(k); setStack([{ screen: k as ScreenName, params: {} }]); };
  const onFab = () => setSheet('choice');

  const top = stack[stack.length - 1];
  const direction = stack.length >= prevDepth.current ? 'forward' : 'backward';
  useEffect(() => { prevDepth.current = stack.length; });
  const pageKey = stack.map(s => s.screen).join('>');

  const common = { th, nav, app, showChart: true };
  let page: React.ReactNode;
  if      (top.screen === 'home')      page = <ScDashboard {...common} />;
  else if (top.screen === 'journal')   page = <ScJournal {...common} params={top.params} />;
  else if (top.screen === 'stats')     page = <ScStats {...common} />;
  else if (top.screen === 'rec')       page = <ScRecurrent {...common} onAdd={() => setSheet('rec')} />;
  else if (top.screen === 'tx-detail') page = <ScTxDetail {...common} params={top.params} />;
  else page = <ScDashboard {...common} />;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: th.bg }}>
      {/* Sidebar — desktop only */}
      {isDesktop && (
        <Sidebar tab={tab} onTab={onTab} onFab={onFab} dark={dark} onToggleDark={() => setDark(!dark)} onLogout={() => { sessionStorage.removeItem('bebou.auth'); window.location.reload(); }} userId={undefined} th={th} />
      )}

      {/* Main content */}
      <div style={{ flex: 1, height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <PageTransition pageKey={pageKey} direction={direction}>{page}</PageTransition>

        {/* Mobile tab bar */}
        {!isDesktop && <TabBar tab={tab} onTab={onTab} onFab={onFab} th={th} />}

        <Toast msg={toast} th={th} />
        <SheetChoice open={sheet === 'choice'} onClose={() => setSheet(null)} onPick={(k) => setSheet(k === 'expense' ? 'expense' : k === 'income' ? 'income' : 'rec')} th={th} />
        <SheetAddExpense    open={sheet === 'expense'} onClose={() => setSheet(null)} th={th} onSaved={showToast} />
        <SheetAddIncome     open={sheet === 'income'}  onClose={() => setSheet(null)} th={th} onSaved={showToast} />
        <SheetAddRecurrent  open={sheet === 'rec'}     onClose={() => setSheet(null)} th={th} onSaved={showToast} />
      </div>
    </div>
  );
}

// ── Root
export function BebouApp() {
  const [dark, setDark] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Responsive breakpoint
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Check existing session
  useEffect(() => {
    if (sessionStorage.getItem('bebou.auth') === '1') setAuthed(true);
  }, []);

  if (!authed) {
    return <AuthScreen onAuth={() => setAuthed(true)} />;
  }

  return (
    <AppStateProvider>
      <AppInner dark={dark} setDark={setDark} isDesktop={isDesktop} />
    </AppStateProvider>
  );
}
