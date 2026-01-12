import { User, Mail, Building, Key } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    name?: string;
    firstName?: string;
    email?: string;
    userId?: string;
    tenantId?: string;
  } | null;
}

export function UserProfileModal({ open, onOpenChange, user }: UserProfileModalProps) {
  if (!user) return null;

  const initials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.firstName?.[0]?.toUpperCase() || 'U';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="w-full space-y-4">
            {user.name && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm text-foreground break-words">{user.name}</p>
                </div>
              </div>
            )}
            
            {user.email && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground break-words">{user.email}</p>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}