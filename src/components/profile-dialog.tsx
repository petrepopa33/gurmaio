import { UserCircleGear, SignOut, ClockClockwise, Trash, Gear, Heart, PencilSimple } from '@phosphor-icons/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface UserInfo {
  avatarUrl: string;
  email: string;
  id: string;
  isOwner: boolean;
  login: string;
}

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: UserInfo | null;
  savedPlansCount: number;
  preferencesCount: number;
  onEditMealProfile: () => void;
  onHistoryClick: () => void;
  onPreferencesClick: () => void;
  onAccountSettingsClick: () => void;
  onLogoutClick: () => void;
  onDeleteAccountClick: () => void;
}

export function ProfileDialog({
  open,
  onOpenChange,
  currentUser,
  savedPlansCount,
  preferencesCount,
  onEditMealProfile,
  onHistoryClick,
  onPreferencesClick,
  onAccountSettingsClick,
  onLogoutClick,
  onDeleteAccountClick,
}: ProfileDialogProps) {
  if (!currentUser) {
    return null;
  }

  const initials = currentUser.login
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleAction = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircleGear className="h-5 w-5" />
            Profile
          </DialogTitle>
          <DialogDescription>
            Manage your profile, preferences, and account settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.login} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-base font-semibold leading-none">{currentUser.login}</p>
              <p className="text-sm text-muted-foreground">
                {currentUser.email}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleAction(onEditMealProfile)}
            >
              <PencilSimple className="mr-2 h-4 w-4" />
              Edit Meal Profile
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleAction(onAccountSettingsClick)}
            >
              <Gear className="mr-2 h-4 w-4" />
              Account Settings
            </Button>

            {savedPlansCount > 0 && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAction(onHistoryClick)}
              >
                <ClockClockwise className="mr-2 h-4 w-4" />
                Saved Plans ({savedPlansCount}/5)
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleAction(onPreferencesClick)}
            >
              <Heart className="mr-2 h-4 w-4" weight={preferencesCount > 0 ? 'fill' : 'regular'} />
              Meal Preferences {preferencesCount > 0 && `(${preferencesCount})`}
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleAction(onLogoutClick)}
            >
              <SignOut className="mr-2 h-4 w-4" />
              Logout
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => handleAction(onDeleteAccountClick)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
