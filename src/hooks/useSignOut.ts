import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sleep, useSessionOverlay } from '../context/SessionOverlayContext';
import { useToast } from '../context/ToastContext';
import { runWithSlowNotice, withTimeout } from '../utils/asyncRequest';

export function useSignOut(onNavigate?: () => void) {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const { showLogout, hide } = useSessionOverlay();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const slowToastShown = useRef(false);
  const inFlight = useRef(false);

  const signOut = useCallback(async () => {
    if (inFlight.current) {
      return;
    }

    inFlight.current = true;
    setSigningOut(true);
    slowToastShown.current = false;
    showLogout('Signing you out…');

    try {
      await runWithSlowNotice(withTimeout(logout()), () => {
        if (!slowToastShown.current) {
          slowToastShown.current = true;
          showToast('info', 'Server is waking up… This may take up to a minute.');
        }
      });

      showToast('success', 'Signed out successfully.');
      await sleep(850);
      onNavigate?.();
      navigate('/login', { replace: true });
      await sleep(200);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Sign out failed. Please try again.';
      showToast('error', message);
      inFlight.current = false;
      setSigningOut(false);
    } finally {
      hide();
      inFlight.current = false;
      setSigningOut(false);
    }
  }, [logout, navigate, onNavigate, showToast, showLogout, hide]);

  return { signOut, signingOut };
}
