import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { Button } from './Button';

interface PasscodeGateProps {
  onSuccess: () => void;
}

export const PasscodeGate: React.FC<PasscodeGateProps> = ({ onSuccess }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Try server-side verification first
      const response = await fetch('/api/verify-passcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passcode }),
      });

      // Handle 404 (Likely running on Static Server/Live Server without backend)
      if (response.status === 404) {
        throw new Error('BACKEND_NOT_FOUND');
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (response.ok && data.success) {
          onSuccess();
          return;
        } else {
          setError('請輸入正確的通關密語');
          setPasscode('');
          return;
        }
      } else {
         // Non-JSON response (e.g., 500 error page or HTML)
         throw new Error('INVALID_RESPONSE');
      }
    } catch (err: any) {
      console.warn("Passcode verification API failed, trying fallback:", err.message);
      
      // 2. Fallback for Static Server / Dev Mode
      // If the backend is unreachable (404/Network Error), we allow the default 'jimmyliao'
      // This ensures the app works for users running purely static setups (e.g. VS Code Live Server).
      if (passcode === 'jimmyliao') {
         onSuccess();
      } else {
         // If we are in fallback mode and password is wrong, show error.
         setError('請輸入正確的通關密語');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fadeIn">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mb-6 border-2 border-banana-yellow shadow-[0_0_30px_rgba(255,225,53,0.2)]">
            <Lock className="w-10 h-10 text-banana-yellow" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tighter text-center">
            NANO <span className="text-banana-yellow">BANANA</span>
          </h1>
          <p className="mt-2 text-gray-500 text-sm tracking-widest uppercase">安全存取協議</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="passcode" className="block text-sm font-medium text-gray-400 mb-2">
                請輸入通關密語
              </label>
              <div className="relative">
                <input
                  id="passcode"
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className={`block w-full px-4 py-4 bg-black border rounded-lg focus:ring-2 focus:outline-none transition-all text-center text-lg tracking-widest ${
                    error 
                      ? 'border-red-500 text-red-500 focus:ring-red-500 placeholder-red-500/50' 
                      : 'border-gray-700 text-white focus:border-banana-yellow focus:ring-banana-yellow placeholder-gray-600'
                  }`}
                  placeholder="PASSCODE"
                  autoFocus
                />
              </div>
              {error && (
                <div className="mt-3 flex items-center justify-center text-sm text-red-500 gap-2 animate-pulse">
                  <ShieldAlert size={16} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full" 
              isLoading={loading}
            >
              進入實驗室 <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </div>
        
        <p className="text-center text-xs text-gray-600">
          系統受 Nano Banana 視覺 DNA 協議保護
        </p>
      </div>
    </div>
  );
};