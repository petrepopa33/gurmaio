import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Warning, EnvelopeSimple, X } from '@phosphor-icons/react';
import { useState } from 'react';

interface EmailVerificationBannerProps {
  email: string;
  onVerifyClick: () => void;
}

export function EmailVerificationBanner({ email, onVerifyClick }: EmailVerificationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <Alert className="border-yellow-500/50 bg-yellow-50/50">
      <div className="flex items-start gap-3">
        <Warning size={20} className="text-yellow-600 shrink-0 mt-0.5" weight="fill" />
        <div className="flex-1 space-y-2">
          <AlertDescription className="text-sm text-yellow-900">
            <strong className="font-semibold">Verify your email to save meal plans</strong>
            <p className="mt-1">
              We sent a verification link to <strong>{email}</strong>. Verify your email to unlock saving meal plans and account recovery.
            </p>
          </AlertDescription>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onVerifyClick}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <EnvelopeSimple className="mr-2" size={16} />
              Verify Email
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsDismissed(true)}
              className="text-yellow-900 hover:text-yellow-950"
            >
              Dismiss
            </Button>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsDismissed(true)}
          className="shrink-0 h-6 w-6 p-0 text-yellow-900 hover:text-yellow-950"
        >
          <X size={16} />
        </Button>
      </div>
    </Alert>
  );
}
