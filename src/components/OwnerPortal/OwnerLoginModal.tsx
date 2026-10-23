import React, { useState } from 'react';
import { Lock, X, KeyRound, AlertCircle, Shield } from 'lucide-react';
import { PortalStorage } from '../../data/portalStore.ts';
import { COMPANY_DETAILS } from '../../data/companyData.ts';
import { verifyOwnerCredentials } from '../../utils/auth.ts';

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const OwnerLoginModal: React.FC<OwnerLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsVerifying(true);

    try {
      const isValid = await verifyOwnerCredentials(passcode.trim());

      if (isValid) {
        PortalStorage.setOwnerAuthenticated(true);
        setPasscode('');
        setIsVerifying(false);
        onLoginSuccess();
      } else {
        setIsVerifying(false);
        setErrorMsg('Invalid authorization credentials. Access is restricted to authorized personnel.');
      }
    } catch {
      setIsVerifying(false);
      setErrorMsg('Authentication error. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div
        className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl relative my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base">
                Owner & Management Portal
              </h3>
              <p className="text-[11px] text-slate-400">
                Authorized Personnel Access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close login modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minimal, Premium Login Form */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Owner Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  autoFocus
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter authorized password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm bg-slate-50 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isVerifying ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-slate-400" />
              Encrypted Session
            </span>
            <span>{COMPANY_DETAILS.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
