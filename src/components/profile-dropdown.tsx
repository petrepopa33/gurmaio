import { SignOut, ClockClockwise, Trash, Gear, Heart, CaretDown } from '@phosphor-icons/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserInfo {
  avatarUrl: string;
  email: string;
  id: string;
  isOwner: boolean;
  login: string;
}

interface ProfileDropdownProps {
  currentUser: UserInfo | null;
  savedPlansCount: number;
  preferencesCount: number;
  onProfileClick: () => void;
  onHistoryClick: () => void;
  onPreferencesClick: () => void;
  onAccountSettingsClick: () => void;
  onLogoutClick: () => void;
  onDeleteAccountClick: () => void;
  profileLabel: string;
  historyLabel: string;
  logoutLabel: string;
  deleteAccountLabel: string;
}

export function ProfileDropdown({
  currentUser,
  savedPlansCount,
  preferencesCount,
  onProfileClick,
  onHistoryClick,
  onPreferencesClick,
  onAccountSettingsClick,
  onLogoutClick,
  onDeleteAccountClick,
  profileLabel,
  historyLabel,
  logoutLabel,
  deleteAccountLabel,
}: ProfileDropdownProps) {
  if (!currentUser) {
    return null;
  }

  const initials = currentUser.login
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-10 w-10 rounded-full hover:bg-accent transition-colors ring-2 ring-transparent hover:ring-primary/20"
          title="Open profile menu"
        >
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.login} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm border">
            <CaretDown size={12} weight="bold" className="text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser.login}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {savedPlansCount > 0 && (
          <DropdownMenuItem onClick={onHistoryClick}>
            <ClockClockwise className="mr-2 h-4 w-4" />
            <span>{historyLabel} ({savedPlansCount}/5)</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onPreferencesClick}>
          <Heart className="mr-2 h-4 w-4" weight={preferencesCount > 0 ? 'fill' : 'regular'} />
          <span>Meal Preferences {preferencesCount > 0 && `(${preferencesCount})`}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAccountSettingsClick}>
          <Gear className="mr-2 h-4 w-4" />
          <span>Account Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogoutClick}>
          <SignOut className="mr-2 h-4 w-4" />
          <span>{logoutLabel}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onDeleteAccountClick}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash className="mr-2 h-4 w-4" />
          <span>{deleteAccountLabel}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
