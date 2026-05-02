import React from 'react';

export const Icon = {
  home: (c: string) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z"/></svg>,
  journal: (c: string) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h13a2 2 0 012 2v14H7a2 2 0 01-2-2z"/><path d="M9 8h8M9 12h8M9 16h5"/></svg>,
  repeat: (c: string) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2l4 4-4 4M3 12V8a2 2 0 012-2h16M7 22l-4-4 4-4M21 12v4a2 2 0 01-2 2H3"/></svg>,
  plus: (c: string) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  close: (c: string) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>,
  back: (c: string) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>,
  trash: (c: string) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14"/></svg>,
  search: (c: string) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>,
  chart: (c: string) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 21V10M10 21V4M16 21v-8M22 21H2"/></svg>,
};
