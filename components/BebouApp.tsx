'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppStateProvider, useApp, STORAGE_KEY_EXPORT } from './state/AppState';
import { theme, T, SANS } from './ui/tokens';
import { Icon } from './ui/Icons';
import { Tap, PageTransition, Toast } from './ui/Primitives';
import { IOSDevice } from './frame/IOSDevice';
import { ScDashboard } from './screens/Dashboard';
import { ScJournal } from './screens/Journal';
import { ScRecurrent } from './screens/Recurrent';
import { ScTxDetail } from './screens/TxDetail';
import { ScStats } from './stats/Stats';
import { SheetChoice, SheetAddExpense, SheetAddIncome, SheetAddRecurrent } from './sheets/Sheets';

type ScreenName = 'home' | 'journal' | 'stats' | 'rec' | 'tx-detail' | 'cat-detail';
type SheetName = 'choice' | 'expense' | 'income' | 'rec' | null;

// ── Tab bar
function TabBar({ tab, onTab, onFab, th }: { tab: string; onTab: (k: string) => void; onFab: () => void; th: ReturnType<typeof theme> }) {
  const tabs = [
    { k: 'home',    l: 'Accueil',    icon: Icon.home },
    { k: 'journal', l: 'Journal',    icon: Icon.journal },
    { k: 'fab' },
    { k: 'stats',   l: 'Stats',      icon: Icon.chart },
    { k: 'rec',     l: 'Récurrents', icon: Icon.repeat },
  ] as const;

  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50, background: th.bg === T.cream ? 'rgba(255,244,239,0.88)' : 'rgba(26,21,19,0.88)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', borderTop: `0.5px solid ${th.line}`, padding: '8px 12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
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

// ── Router
function Router({ dark, showChart }: { dark: boolean; showChart: boolean }) {
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

  const top = stack[stack.length - 1];
  const direction = stack.length >= prevDepth.current ? 'forward' : 'backward';
  useEffect(() => { prevDepth.current = stack.length; });
  const pageKey = stack.map(s => s.screen).join('>');

  const common = { th, nav, app, showChart };
  let page: React.ReactNode;
  if      (top.screen === 'home')       page = <ScDashboard {...common} />;
  else if (top.screen === 'journal')    page = <ScJournal {...common} params={top.params} />;
  else if (top.screen === 'stats')      page = <ScStats {...common} />;
  else if (top.screen === 'rec')        page = <ScRecurrent {...common} onAdd={() => setSheet('rec')} />;
  else if (top.screen === 'tx-detail')  page = <ScTxDetail {...common} params={top.params} />;
  else page = <ScDashboard {...common} />;

  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden', background: th.bg }}>
      <PageTransition pageKey={pageKey} direction={direction}>{page}</PageTransition>
      <TabBar tab={tab} onTab={onTab} onFab={() => setSheet('choice')} th={th} />
      <Toast msg={toast} th={th} />
      <SheetChoice open={sheet === 'choice'} onClose={() => setSheet(null)} onPick={(k) => setSheet(k === 'expense' ? 'expense' : k === 'income' ? 'income' : 'rec')} th={th} />
      <SheetAddExpense open={sheet === 'expense'} onClose={() => setSheet(null)} th={th} onSaved={showToast} />
      <SheetAddIncome  open={sheet === 'income'}  onClose={() => setSheet(null)} th={th} onSaved={showToast} />
      <SheetAddRecurrent open={sheet === 'rec'}   onClose={() => setSheet(null)} th={th} onSaved={showToast} />
    </div>
  );
}

// ── Root
export function BebouApp() {
  const [dark, setDark] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  const [scale, setScale] = useState(1);
  useEffect(() => {
    const compute = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      if (vw < 500) { setScale(vw / 402); return; }
      setScale(Math.min(vh / 874, 1));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#E8E3DC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Tweaks (dev panel) */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 14, padding: '14px 16px', minWidth: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)', fontFamily: SANS, fontSize: 13 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(0,0,0,0.5)', marginBottom: 10, fontWeight: 600 }}>Tweaks</div>
        <TweakRow label="Mode sombre" on={dark} onToggle={() => setDark(d => !d)} />
        <TweakRow label="Afficher graphiques" on={showChart} onToggle={() => setShowChart(c => !c)} />
        <div onClick={() => { localStorage.removeItem(STORAGE_KEY_EXPORT); setResetKey(k => k + 1); }} style={{ marginTop: 8, padding: '7px 10px', fontSize: 12, color: T.coral, cursor: 'pointer', borderRadius: 8, textAlign: 'center', fontWeight: 500 }}>
          Réinitialiser les données
        </div>
      </div>

      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <IOSDevice width={402} height={874} dark={dark}>
          <AppStateProvider key={resetKey}>
            <Router dark={dark} showChart={showChart} />
          </AppStateProvider>
        </IOSDevice>
      </div>
    </div>
  );
}

function TweakRow({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0' }}>
      <span style={{ fontWeight: 500, color: '#2B2320' }}>{label}</span>
      <div onClick={onToggle} style={{ width: 38, height: 22, background: on ? T.coral : '#e5ddd6', borderRadius: 11, position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
        <div style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 18, height: 18, borderRadius: 9, background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </div>
    </div>
  );
}
