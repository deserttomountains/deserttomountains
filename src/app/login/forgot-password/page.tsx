'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { AuthService } from '@/lib/firebase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await AuthService.sendPasswordResetEmail(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-[#F5F2E8] to-[#E6DCC0] flex items-center justify-center px-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-8 md:p-10 max-w-md w-full animate-fade-in">
        <Link href="/login" className="flex items-center gap-2 text-[#8B7A1A] font-bold mb-6 hover:text-[#5E4E06] transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Login
        </Link>
        <h2 className="text-3xl font-black text-[#5E4E06] mb-2">Forgot Password?</h2>
        <p className="text-[#8B7A1A] mb-8 font-medium">Enter your email address and we'll send you a link to reset your password.</p>
        {submitted ? (
          <div className="text-green-700 text-center font-semibold py-8">
            If an account exists for <span className="font-bold">{email}</span>, a password reset link has been sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-lg font-bold text-[#5E4E06] mb-3">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail className="w-6 h-6 text-[#8B7A1A]" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`w-full pl-14 pr-5 py-5 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-offset-0 transition-all duration-300 placeholder:text-[#8B7A1A] placeholder:font-medium text-[#5E4E06] font-medium text-lg
                    ${error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50' : 'border-[#D4AF37] focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] hover:border-[#8B7A1A] hover:shadow-xl bg-white/90 backdrop-blur-sm'}
                  `}
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>
              {error && <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white font-bold rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 