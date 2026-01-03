import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';

interface EmailVerificationState {
  isVerified: boolean;
  email?: string;
  verifiedAt?: string;
  provider?: string;
}

export function useEmailVerification(userId?: string) {
  const [verificationState, setVerificationState] = useKV<EmailVerificationState | null>(
    userId ? `email_verification_${userId}` : 'email_verification_guest',
    null
  );
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    if (userId && verificationState === null) {
      setNeedsVerification(true);
    } else if (verificationState && !verificationState.isVerified) {
      setNeedsVerification(true);
    } else {
      setNeedsVerification(false);
    }
  }, [userId, verificationState]);

  const markAsVerified = (email: string, provider?: string) => {
    setVerificationState(() => ({
      isVerified: true,
      email,
      verifiedAt: new Date().toISOString(),
      provider,
    }));
    setNeedsVerification(false);
  };

  const markAsSkipped = (email: string, provider?: string) => {
    setVerificationState(() => ({
      isVerified: false,
      email,
      provider,
    }));
    setNeedsVerification(false);
  };

  const resetVerification = () => {
    setVerificationState(() => null);
    setNeedsVerification(false);
  };

  const checkEmailVerified = (email?: string): boolean => {
    if (!verificationState) return false;
    if (!email) return verificationState.isVerified;
    return verificationState.isVerified && verificationState.email === email;
  };

  return {
    needsVerification,
    isVerified: verificationState?.isVerified ?? false,
    verifiedEmail: verificationState?.email,
    verificationProvider: verificationState?.provider,
    verifiedAt: verificationState?.verifiedAt,
    markAsVerified,
    markAsSkipped,
    resetVerification,
    checkEmailVerified,
  };
}
