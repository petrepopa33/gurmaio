import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { EnvelopeSimple, Warning, CheckCircle, Check, X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface CreateAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
  { label: 'Contains uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
  { label: 'Contains lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
  { label: 'Contains number', test: (pwd) => /[0-9]/.test(pwd) },
  { label: 'Contains special character (!@#$%^&*)', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
];

export function CreateAccountDialog({ open, onOpenChange }: CreateAccountDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };

    const metRequirements = passwordRequirements.filter(req => req.test(password)).length;
    const percentage = (metRequirements / passwordRequirements.length) * 100;

    if (metRequirements <= 1) {
      return { score: percentage, label: 'Weak', color: 'text-destructive' };
    } else if (metRequirements <= 3) {
      return { score: percentage, label: 'Fair', color: 'text-orange-500' };
    } else if (metRequirements <= 4) {
      return { score: percentage, label: 'Good', color: 'text-yellow-500' };
    } else {
      return { score: percentage, label: 'Strong', color: 'text-accent' };
    }
  }, [password]);

  const requirementsMet = useMemo(() => {
    return passwordRequirements.map(req => ({
      ...req,
      met: req.test(password)
    }));
  }, [password]);

  const handleCreateAccount = async () => {
    setError('');
    setSuccess(false);

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    const unmetRequirements = passwordRequirements.filter(req => !req.test(password));
    if (unmetRequirements.length > 0) {
      setError('Password does not meet all requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsCreating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      
      setTimeout(() => {
        window.location.href = '/.spark/login';
      }, 1500);
    } catch (err) {
      setError('Failed to create account. Please try again.');
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess(false);
      setShowPassword(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <EnvelopeSimple size={24} className="text-primary" />
            Create Account
          </DialogTitle>
          <DialogDescription>
            Create an account to save your meal plans and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <Warning className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-accent/10 border-accent text-accent-foreground">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Account created successfully! Redirecting to login...
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isCreating || success}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isCreating || success}
              autoComplete="new-password"
            />
            
            {password && (
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Password strength:</span>
                    <span className={cn("font-medium", passwordStrength.color)}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <Progress 
                    value={passwordStrength.score} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-1.5 bg-muted/50 rounded-lg p-3 border">
                  <p className="text-xs font-medium text-foreground mb-2">Password must contain:</p>
                  {requirementsMet.map((req, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "flex items-center gap-2 text-xs transition-colors",
                        req.met ? "text-accent" : "text-muted-foreground"
                      )}
                    >
                      {req.met ? (
                        <Check size={14} weight="bold" className="text-accent" />
                      ) : (
                        <X size={14} className="text-muted-foreground" />
                      )}
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isCreating || success}
              autoComplete="new-password"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <X size={14} weight="bold" />
                Passwords do not match
              </p>
            )}
            {confirmPassword && password === confirmPassword && (
              <p className="text-xs text-accent flex items-center gap-1">
                <Check size={14} weight="bold" />
                Passwords match
              </p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCreating || success}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateAccount}
            disabled={isCreating || success}
          >
            {isCreating ? 'Creating Account...' : 'Create Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
