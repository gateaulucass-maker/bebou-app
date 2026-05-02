'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { T, SERIF, SANS } from '../ui/tokens';

type Step = 'email' | 'otp';

export function AuthScreen() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function sendOtp() {
    if (!supabase) return;
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setStep('otp');
  }

  async function verifyOtp() {
    if (!supabase) return;
    setLoading(true); setError('');
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    setLoading(false);
    if (error) setError('Code incorrect, réessaie.');
  }

  return (
    <div style={{ minHeight: '100vh', background: T.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧡</div>
          <div style={{ fontFamily: SERIF, fontSize: 36, letterSpacing: -0.5, color: T.ink }}>Bébou</div>
          <div style={{ fontSize: 14, color: T.muted, marginTop: 6, fontStyle: 'italic' }}>ton suivi de dépenses perso</div>
        </div>

        {step === 'email' ? (
          <div>
            <label style={{ display: 'block', fontSize: 12, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              Ton adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
              placeholder="toi@exemple.fr"
              autoFocus
              style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: `1.5px solid ${T.faint}`, outline: 'none', fontSize: 15, fontFamily: SANS, color: T.ink, background: T.card, boxSizing: 'border-box' }}
            />
            {error && <div style={{ fontSize: 13, color: T.coral, marginTop: 8 }}>{error}</div>}
            <button
              onClick={sendOtp}
              disabled={!email.includes('@') || loading}
              style={{ marginTop: 16, width: '100%', padding: 16, borderRadius: 16, border: 'none', background: email.includes('@') ? T.coral : T.faint, color: email.includes('@') ? '#fff' : T.muted, fontSize: 15, fontWeight: 600, cursor: email.includes('@') ? 'pointer' : 'default', fontFamily: SANS, transition: 'background 200ms' }}
            >
              {loading ? 'Envoi…' : 'Recevoir un code →'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 14, color: T.muted, marginBottom: 20 }}>
              Code envoyé à <strong style={{ color: T.ink }}>{email}</strong>.<br/>
              <span style={{ fontStyle: 'italic' }}>Vérifie ta boîte mail.</span>
            </div>
            <label style={{ display: 'block', fontSize: 12, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              Code à 6 chiffres
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && otp.length === 6 && verifyOtp()}
              placeholder="123456"
              autoFocus
              style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: `1.5px solid ${T.faint}`, outline: 'none', fontSize: 24, fontFamily: SERIF, letterSpacing: 6, textAlign: 'center', color: T.ink, background: T.card, boxSizing: 'border-box' }}
            />
            {error && <div style={{ fontSize: 13, color: T.coral, marginTop: 8 }}>{error}</div>}
            <button
              onClick={verifyOtp}
              disabled={otp.length !== 6 || loading}
              style={{ marginTop: 16, width: '100%', padding: 16, borderRadius: 16, border: 'none', background: otp.length === 6 ? T.coral : T.faint, color: otp.length === 6 ? '#fff' : T.muted, fontSize: 15, fontWeight: 600, cursor: otp.length === 6 ? 'pointer' : 'default', fontFamily: SANS, transition: 'background 200ms' }}
            >
              {loading ? 'Vérification…' : 'Connexion →'}
            </button>
            <div onClick={() => { setStep('email'); setOtp(''); setError(''); }} style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: T.muted, cursor: 'pointer', textDecoration: 'underline' }}>
              Changer d&apos;email
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
