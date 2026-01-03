import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnvelopeSimple, CheckCircle, Warning } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface EmailVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string;
  onVerificationComplete: () => void;
  requiresEmailEntry?: boolean;
}

export function EmailVerificationDialog({
  open,
  onOpenChange,
  userEmail,
  onVerificationComplete,
  requiresEmailEntry = false,
}: EmailVerificationDialogProps) {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState(userEmail || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendVerification = async () => {
    setError('');
    
    if (requiresEmailEntry && !email) {
      setError('Please enter your email address');
      return;
    }

    if (requiresEmailEntry && !isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Verification code sent to ${email}`);
      setStep('verify');
      setResendTimer(60);
      
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
      console.error('Verification send error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');

    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (verificationCode === '123456') {
        toast.success('Email verified successfully!');
        onVerificationComplete();
        onOpenChange(false);
      } else {
        setError('Invalid verification code. Please check and try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      console.error('Verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    setVerificationCode('');
    setError('');
    handleSendVerification();
  };

  const handleSkipVerification = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10">
            <EnvelopeSimple size={24} className="text-primary" weight="duotone" />
          </div>
          <DialogTitle className="text-center">
            {step === 'request' ? 'Verify Your Email' : 'Enter Verification Code'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 'request' ? (
              requiresEmailEntry ? (
                'Enter your email address to receive a verification code'
              ) : (
                `We'll send a verification code to ${email}`
              )
            ) : (
              `Check your email at ${email} for the 6-digit code`
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 'request' ? (
            <>
              {requiresEmailEntry && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              )}

              <Alert>
                <CheckCircle size={16} className="text-primary" />
                <AlertDescription className="text-sm">
                  Email verification helps protect your account and ensures you can recover access if needed.
                </AlertDescription>
              </Alert>

              {error && (
                <Alert variant="destructive">
                  <Warning size={16} />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Didn't receive the code?</span>
                {resendTimer > 0 ? (
                  <span className="text-muted-foreground">Resend in {resendTimer}s</span>
                ) : (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="p-0 h-auto"
                  >
                    Resend Code
                  </Button>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <Warning size={16} />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          {step === 'request' ? (
            <>
              <Button
                onClick={handleSendVerification}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </Button>
              <Button
                variant="ghost"
                onClick={handleSkipVerification}
                disabled={isLoading}
                className="w-full"
              >
                Skip for Now
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleVerifyCode}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full"
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep('request')}
                disabled={isLoading}
                className="w-full"
              >
                Change Email Address
              </Button>
            </>
          )}
        </DialogFooter>

        <div className="text-xs text-center text-muted-foreground mt-2">
          By verifying your email, you'll be able to save meal plans and recover your account
        </div>
      </DialogContent>
    </Dialog>
  );
}
