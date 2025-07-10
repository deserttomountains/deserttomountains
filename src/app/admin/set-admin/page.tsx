'use client';

import { useState } from 'react';
import { AuthService, auth } from '@/lib/firebase';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SetAdminPage() {
  const [uid, setUid] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSetAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid.trim()) {
      setMessage({ type: 'error', text: 'Please enter a user UID' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await AuthService.updateUserRole(uid.trim(), 'admin');
      setMessage({ type: 'success', text: 'User role updated to admin successfully!' });
      setUid('');
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentUserUid = () => {
    const currentUser = auth.currentUser;
    return currentUser ? currentUser.uid : 'Not logged in';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <Link 
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Set User as Admin</h1>
          <p className="text-gray-600">Enter a user UID to grant admin privileges</p>
        </div>

        <form onSubmit={handleSetAdmin} className="space-y-6">
          <div>
            <label htmlFor="uid" className="block text-sm font-medium text-gray-700 mb-2">
              User UID
            </label>
            <input
              type="text"
              id="uid"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="Enter user UID"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Current User UID:</h3>
            <p className="text-sm text-gray-600 font-mono break-all">{getCurrentUserUid()}</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Updating...' : 'Set as Admin'}
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={`text-sm font-medium ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message.text}
            </span>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-xl">
          <h3 className="text-sm font-medium text-blue-800 mb-2">How to use:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Sign up or log in with the user account</li>
            <li>2. Copy the user's UID from the field above</li>
            <li>3. Paste it in the input field</li>
            <li>4. Click "Set as Admin"</li>
            <li>5. Log out and log back in to test the redirect</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 