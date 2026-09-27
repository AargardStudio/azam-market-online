import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface AdminLoginProps {
  onAdminAuthenticated: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onAdminAuthenticated,
  onCancel,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide admin credentials');
      return;
    }

    setLoading(true);
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError || !signInData.user) {
        setError(signInError?.message || 'Invalid email or password.');
        return;
      }

      // Being a valid Supabase Auth user is not enough — confirm this account
      // is actually registered as an Aargard operator.
      const { data: adminRow, error: adminLookupError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', signInData.user.id)
        .maybeSingle();

      if (adminLookupError || !adminRow) {
        await supabase.auth.signOut();
        setError('This account is not registered as an Aargard admin.');
        return;
      }

      onAdminAuthenticated();
    } catch (err) {
      setError('Something went wrong signing in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] text-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-800 space-y-6">
        <div className="text-center space-y-2">
          <img
            src="/icon-192.png"
            alt="Azam Market Online"
            className="w-14 h-14 rounded-2xl mx-auto"
          />
          <h2 className="font-serif text-2xl font-bold text-white">
            Aargard Admin Login
          </h2>
          <p className="text-xs text-gray-400">
            Platform Operator Portal for Azam Market Online.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-200 border border-red-500/30 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-300 block mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#C9952A]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#C9952A]"
              />
            </div>
          </div>

          <div className="flex justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 font-semibold text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#C9952A] hover:bg-[#b58322] disabled:opacity-60 text-gray-900 font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Access Operator Suite</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
