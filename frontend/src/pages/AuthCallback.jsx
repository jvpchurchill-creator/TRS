import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleAuthCallback } = useAuth();
  const [status, setStatus] = useState('loading'); // loading, success, error

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        toast.error('Authentication failed: ' + error);
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      if (code) {
        try {
          const data = await handleAuthCallback(code);
          setStatus('success');
          toast.success(`Welcome, ${data.user.username}!`);
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } catch (err) {
          console.error('Auth error:', err);
          setStatus('error');
          toast.error('Authentication failed. Please try again.');
          setTimeout(() => navigate('/'), 2000);
        }
      } else {
        // No code, redirect home
        navigate('/');
      }
    };

    processCallback();
  }, [searchParams, navigate, handleAuthCallback]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-[#00FFD1] animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-2">Authenticating...</h2>
            <p className="text-white/60">Please wait while we verify your Discord account</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-[#00FFD1] mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-2">Success!</h2>
            <p className="text-white/60">Redirecting to dashboard...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-2">Authentication Failed</h2>
            <p className="text-white/60">Redirecting to home...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
