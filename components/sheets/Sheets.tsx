'use client';

import React, { useState, useEffect } from 'react';
import { AppStateShape, CATS, INCOMES, fmtEur, useApp } from '../state/AppState';
import { T, SERIF, SANS, Theme } from '../ui/tokens';
import { Tap, Sheet, NumPad, useNumPad } from '../ui/Primitives';
import { Icon } from '../ui/Icons';

interface SheetProps { open: boolean; onClose: () => void; th: Theme; onSaved?: (msg: string) => void; }
interface ChoiceProps { open: boolean; onClose: () => void; th: Theme; onPick: (k: 'expense' | 'income' | 'rec') => void; }

export function SheetChoice({ open, onClose, th, onPick }: ChoiceProps) {
  return (
    <Sheet open={open} onClose={onClose} th={th}>
      <div style={{ padding: '10px 24px 20px' }}>
        <div style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1, marginBottom: 14 }}>Ajouter…</div>
        {([
          { k: 'expense', l: 'Une dépense',  s: 'Ce qui sort du compte', e: '🍷', c: T.coral },
          { k: 'income',  l: 'Une rentrée',  s: 'Ce qui rentre',          e: '💼', c: T.green },
          { k: 'rec',     l: 'Un récurrent', s: 'Abonnement, loyer…',     e: '🔁', c: th.ink },
        ] as const).map((o) => (
          <Tap key={o.k} onClick={() => { onClose(); setTimeout(() => onPick(o.k), 200); }}
            style={{ background: th.card, borderRadius: 18, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: th.bg === T.cream ? T.creamDeep : 'rgba(245,239,234,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{o.e}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{o.l}</div>
              <div style={{ fontSize: 12, color: th.muted, marginTop: 1 }}>{o.s}</div>
            </div>
            <div style={{ color: o.c, fontSize: 22 }}>→</div>
          </Tap>
        ))}
      </div>
    </Sheet>
  );
}

export function SheetAddExpense({ open, onClose, th, onSaved }: SheetProps & { app?: AppStateShape }) {
  const app = useApp();
  const pad = useNumPad('0');
  const [cat, setCat] = useState('alimentation');
  const [label, setLabel] = useState('');
  useEffect(() => { if (open) { pad.reset(); setCat('alimentation'); setLabel(''); } }, [open]);
  const canSave = pad.num > 0;
  const submit = () => {
    if (!canSave) return;
    app.addTx({ label: label || CATS[cat].label, cat, amount: -pad.num });
    onSaved && onSaved(`− ${fmtEur(pad.num)} ajouté`);
    onClose();
  };
  return (
    <Sheet open={open} onClose={onClose} th={th}>
      <div style={{ padding: '4px 24px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1 }}>Nouvelle dépense</div>
            <div style={{ fontSize: 12, color: th.muted, fontStyle: 'italic', marginTop: 2 }}>Ça part pour quoi ?</div>
          </div>
          <Tap onClick={onClose} style={{ padding: 6 }}>{Icon.close(th.muted)}</Tap>
        </div>
      </div>
      <div style={{ padding: '12px 24px 6px', textAlign: 'center' }}>
        <div style={{ fontFamily: SERIF, fontSize: 54, lineHeight: 1, letterSpacing: -2, color: pad.num > 0 ? th.ink : th.muted }}>
          <span style={{ color: T.coral }}>−</span> {pad.v.replace('.', ',')}
          <span style={{ color: th.muted, fontStyle: 'italic' }}> €</span>
        </div>
      </div>
      <NumPad onKey={pad.press} th={th} />
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{ fontSize: 11, color: th.muted, letterSpacing: 0.6, textTransform: 'uppercase', margin: '6px 4px' }}>Catégorie</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Object.values(CATS).filter(c => c.id !== 'recurrent').map((c) => (
            <Tap key={c.id} onClick={() => setCat(c.id)} style={{ padding: '8px 12px', borderRadius: 999, background: cat === c.id ? th.ink : th.card, color: cat === c.id ? th.bg : th.ink, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, transition: 'all 150ms' }}>
              <span>{c.emoji}</span><span>{c.label}</span>
            </Tap>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 20px 0' }}>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Intitulé (optionnel)" style={{ width: '100%', background: th.card, border: 'none', outline: 'none', padding: '13px 16px', borderRadius: 14, fontSize: 14, color: th.ink, fontFamily: SANS, boxSizing: 'border-box' }}/>
      </div>
      <div style={{ padding: '14px 20px 26px' }}>
        <Tap onClick={submit} style={{ background: canSave ? T.coral : th.faint, color: canSave ? '#fff' : th.muted, padding: '16px', borderRadius: 18, textAlign: 'center', fontSize: 15, fontWeight: 600, transition: 'background 200ms' }}>Ajouter la dépense</Tap>
      </div>
    </Sheet>
  );
}

export function SheetAddIncome({ open, onClose, th, onSaved }: SheetProps) {
  const app = useApp();
  const pad = useNumPad('0');
  const [type, setType] = useState('salaire');
  const [label, setLabel] = useState('');
  useEffect(() => { if (open) { pad.reset(); setType('salaire'); setLabel(''); } }, [open]);
  const canSave = pad.num > 0;
  const submit = () => {
    if (!canSave) return;
    app.addTx({ label: label || INCOMES[type].label, cat: type, amount: pad.num, income: true });
    onSaved && onSaved(`+ ${fmtEur(pad.num)} ajouté`);
    onClose();
  };
  return (
    <Sheet open={open} onClose={onClose} th={th}>
      <div style={{ padding: '4px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1 }}>Nouvelle rentrée</div>
          <div style={{ fontSize: 12, color: th.muted, fontStyle: 'italic', marginTop: 2 }}>Ça rentre d&apos;où ?</div>
        </div>
        <Tap onClick={onClose} style={{ padding: 6 }}>{Icon.close(th.muted)}</Tap>
      </div>
      <div style={{ padding: '12px 24px 6px', textAlign: 'center' }}>
        <div style={{ fontFamily: SERIF, fontSize: 54, lineHeight: 1, letterSpacing: -2, color: pad.num > 0 ? th.ink : th.muted }}>
          <span style={{ color: T.green }}>+</span> {pad.v.replace('.', ',')}
          <span style={{ color: th.muted, fontStyle: 'italic' }}> €</span>
        </div>
      </div>
      <NumPad onKey={pad.press} th={th} />
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{ fontSize: 11, color: th.muted, letterSpacing: 0.6, textTransform: 'uppercase', margin: '6px 4px' }}>Type</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Object.values(INCOMES).map((c) => (
            <Tap key={c.id} onClick={() => setType(c.id)} style={{ padding: '8px 12px', borderRadius: 999, background: type === c.id ? th.ink : th.card, color: type === c.id ? th.bg : th.ink, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>{c.emoji}</span><span>{c.label}</span>
            </Tap>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 20px 0' }}>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Intitulé (optionnel)" style={{ width: '100%', background: th.card, border: 'none', outline: 'none', padding: '13px 16px', borderRadius: 14, fontSize: 14, color: th.ink, fontFamily: SANS, boxSizing: 'border-box' }}/>
      </div>
      <div style={{ padding: '14px 20px 26px' }}>
        <Tap onClick={submit} style={{ background: canSave ? T.green : th.faint, color: canSave ? '#fff' : th.muted, padding: '16px', borderRadius: 18, textAlign: 'center', fontSize: 15, fontWeight: 600 }}>Ajouter la rentrée</Tap>
      </div>
    </Sheet>
  );
}

export function SheetAddRecurrent({ open, onClose, th, onSaved }: SheetProps) {
  const app = useApp();
  const pad = useNumPad('0');
  const [label, setLabel] = useState('');
  const [day, setDay] = useState(1);
  const [emoji, setEmoji] = useState('🔁');
  useEffect(() => { if (open) { pad.reset(); setLabel(''); setDay(1); setEmoji('🔁'); } }, [open]);
  const canSave = pad.num > 0 && label.length > 0;
  const submit = () => {
    if (!canSave) return;
    app.addRec({ label, amount: pad.num, day, emoji });
    onSaved && onSaved(`${label} ajouté aux récurrents`);
    onClose();
  };
  const emojis = ['🔁','🏠','📺','🎧','🏋️','📱','💳','🚗','💡','📡','🎮'];
  return (
    <Sheet open={open} onClose={onClose} th={th}>
      <div style={{ padding: '4px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1 }}>Nouveau récurrent</div>
          <div style={{ fontSize: 12, color: th.muted, fontStyle: 'italic', marginTop: 2 }}>Un abonnement, un loyer…</div>
        </div>
        <Tap onClick={onClose} style={{ padding: 6 }}>{Icon.close(th.muted)}</Tap>
      </div>
      <div style={{ padding: '12px 24px 6px', textAlign: 'center' }}>
        <div style={{ fontFamily: SERIF, fontSize: 46, lineHeight: 1, letterSpacing: -1.5, color: pad.num > 0 ? th.ink : th.muted }}>
          {pad.v.replace('.', ',')}<span style={{ color: th.muted, fontStyle: 'italic' }}> €</span>
        </div>
        <div style={{ fontSize: 11, color: th.muted, marginTop: 4 }}>par mois</div>
      </div>
      <NumPad onKey={pad.press} th={th} />
      <div style={{ padding: '12px 20px 0' }}>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nom (ex : Netflix)" style={{ width: '100%', background: th.card, border: 'none', outline: 'none', padding: '13px 16px', borderRadius: 14, fontSize: 14, color: th.ink, fontFamily: SANS, boxSizing: 'border-box' }}/>
      </div>
      <div style={{ padding: '10px 20px 0' }}>
        <div style={{ fontSize: 11, color: th.muted, letterSpacing: 0.6, textTransform: 'uppercase', margin: '6px 4px' }}>Icône</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {emojis.map(e => (
            <Tap key={e} onClick={() => setEmoji(e)} style={{ width: 36, height: 36, borderRadius: 18, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: emoji === e ? th.ink : th.card }}>{e}</Tap>
          ))}
        </div>
      </div>
      <div style={{ padding: '10px 20px 0' }}>
        <div style={{ fontSize: 11, color: th.muted, letterSpacing: 0.6, textTransform: 'uppercase', margin: '6px 4px' }}>Jour du prélèvement</div>
        <div style={{ background: th.card, borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="range" min="1" max="28" value={day} onChange={(e) => setDay(+e.target.value)} style={{ flex: 1, accentColor: T.coral }}/>
          <div style={{ fontFamily: SERIF, fontSize: 22, width: 36, textAlign: 'right' }}>{day}</div>
        </div>
      </div>
      <div style={{ padding: '14px 20px 26px' }}>
        <Tap onClick={submit} style={{ background: canSave ? T.coral : th.faint, color: canSave ? '#fff' : th.muted, padding: '16px', borderRadius: 18, textAlign: 'center', fontSize: 15, fontWeight: 600 }}>Enregistrer</Tap>
      </div>
    </Sheet>
  );
}
