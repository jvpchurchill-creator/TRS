import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        toast.error('Authentication failed: ' + error);
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      if (token && userParam) {
        try {
          // Parse user data from URL
          const userData = JSON.parse(decodeURIComponent(userParam));
          
          // Store in localStorage
          localStorage.setItem('accessToken', token);
          localStorage.setItem('rivalSyndicateUser', JSON.stringify(userData));
          
          setStatus('success');
          toast.success(`Welcome, ${userData.username}!`);
          
          setTimeout(() => {
            // Force full page reload to update auth context
            window.location.href = '/dashboard';
          }, 1500);
        } catch (err) {
          console.error('Auth parsing error:', err);
          setStatus('error');
          toast.error('Authentication failed. Please try again.');
          setTimeout(() => navigate('/'), 2000);
        }
      } else {
        // No token, redirect home
        navigate('/');
      }
    };

    processCallback();
  }, [searchParams, navigate]);

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
