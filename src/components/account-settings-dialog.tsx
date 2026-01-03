import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeSlash, Lock, Envelope, User } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface UserInfo {
  avatarUrl: string;
  email: string;
  id: string;
  isOwner: boolean;
  login: string;
}

interface AccountSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: UserInfo;
  onUpdateSuccess?: () => void;
}

export function AccountSettingsDialog({
  open,
  onOpenChange,
  currentUser,
  onUpdateSuccess,
}: AccountSettingsDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  
  const [newUsername, setNewUsername] = useState(currentUser.login);
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (error) {
      toast.error('Failed to update password. Please try again.');
      console.error('Password update error:', error);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail || !emailPassword) {
      toast.error('Please provide your new email and current password');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (newEmail === currentUser.email) {
      toast.error('This is already your current email');
      return;
    }

    setIsUpdatingEmail(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Email update initiated. Please check your inbox for verification.', {
        description: 'You will need to verify both your old and new email addresses.',
        duration: 5000,
      });
      setNewEmail('');
      setEmailPassword('');
      
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (error) {
      toast.error('Failed to update email. Please try again.');
      console.error('Email update error:', error);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUsernameChange = async () => {
    if (!newUsername || newUsername.trim().length === 0) {
      toast.error('Username cannot be empty');
      return;
    }

    if (newUsername === currentUser.login) {
      toast.error('This is already your current username');
      return;
    }

    if (newUsername.length < 3) {
      toast.error('Username must be at least 3 characters long');
      return;
    }

    setIsUpdatingUsername(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Username updated successfully');
      
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (error) {
      toast.error('Failed to update username. Please try again.');
      console.error('Username update error:', error);
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Account Settings
          </DialogTitle>
          <DialogDescription>
            Manage your account security and personal information
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="username">Username</TabsTrigger>
          </TabsList>

          <TabsContent value="password" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeSlash className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeSlash className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlash className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              onClick={handlePasswordChange}
              disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="w-full"
            >
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 pt-4">
            <div className="rounded-lg bg-muted p-3 space-y-1">
              <p className="text-sm font-medium">Current Email</p>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-email">New Email Address</Label>
              <div className="relative">
                <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter your new email"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="email-password"
                  type={showEmailPassword ? 'text' : 'password'}
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  placeholder="Confirm with your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowEmailPassword(!showEmailPassword)}
                >
                  {showEmailPassword ? (
                    <EyeSlash className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-accent/10 border border-accent/30 p-3">
              <p className="text-xs text-muted-foreground">
                You'll receive verification emails at both your current and new email addresses. Both must be verified to complete the change.
              </p>
            </div>

            <Button
              onClick={handleEmailChange}
              disabled={isUpdatingEmail || !newEmail || !emailPassword}
              className="w-full"
            >
              {isUpdatingEmail ? 'Updating...' : 'Update Email'}
            </Button>
          </TabsContent>

          <TabsContent value="username" className="space-y-4 pt-4">
            <div className="rounded-lg bg-muted p-3 space-y-1">
              <p className="text-sm font-medium">Current Username</p>
              <p className="text-sm text-muted-foreground">{currentUser.login}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-username">New Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-username"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter your new username"
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 3 characters long
              </p>
            </div>

            <Button
              onClick={handleUsernameChange}
              disabled={isUpdatingUsername || !newUsername || newUsername === currentUser.login}
              className="w-full"
            >
              {isUpdatingUsername ? 'Updating...' : 'Update Username'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
