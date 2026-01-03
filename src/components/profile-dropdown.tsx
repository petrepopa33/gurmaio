import { User, UserCircleGear, SignOut, ClockClockwise, Trash } from '@phosphor-icons/react';
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
  onProfileClick: () => void;
  onHistoryClick: () => void;
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
  onProfileClick,
  onHistoryClick,
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
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.login} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
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
        <DropdownMenuItem onClick={onProfileClick}>
          <UserCircleGear className="mr-2 h-4 w-4" />
          <span>{profileLabel}</span>
        </DropdownMenuItem>
        {savedPlansCount > 0 && (
          <DropdownMenuItem onClick={onHistoryClick}>
            <ClockClockwise className="mr-2 h-4 w-4" />
            <span>{historyLabel} ({savedPlansCount}/5)</span>
          </DropdownMenuItem>
        )}
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
