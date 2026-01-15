"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AchievementNotificationService } from "@/lib/achievementNotificationService";
import { triggerAchievementPolling } from "@/hooks/useAchievementPolling";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Settings, Trash2 } from "lucide-react";
import { CharacterCounter } from "@/components/ui/CharacterCounter";

// Character limits for profile fields
const CHAR_LIMITS = {
  name: 50,
  username: 30,
  bio: 300,
  location: 100,
  languagesSpoken: 200,
};

interface EditProfileModalProps {
  user: {
    name: string | null;
    username: string | null;
    bio: string | null;
    location: string | null;
    languagesSpoken: string[];
  };
}

export default function EditProfileModal({ user }: EditProfileModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    username: user.username || "",
    bio: user.bio || "",
    location: user.location || "",
    languagesSpoken: user.languagesSpoken.join(", "),
  });
  const [error, setError] = useState("");
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  
  const { update } = useSession();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          languagesSpoken: formData.languagesSpoken
            .split(",")
            .map(lang => lang.trim())
            .filter(lang => lang.length > 0),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const data = await response.json();
      
      // Handle achievements from profile update
      if (data.achievements && data.achievements.length > 0) {
        AchievementNotificationService.handleServerActionAchievements(data.achievements);
      }
      
      // Trigger achievement polling for any background achievements
      triggerAchievementPolling();

      await update();
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleteLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete account");
      }

      // Properly sign out and redirect to home
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
          <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>
                <strong>Privacy Notice:</strong> All profile information is public and visible to other users. 
                Do not share personal information like phone numbers, email addresses, or home addresses.
              </span>
            </p>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your display name"
              maxLength={CHAR_LIMITS.name}
            />
            <CharacterCounter
              current={formData.name.length}
              max={CHAR_LIMITS.name}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <p className="text-sm text-muted-foreground">
              Profile pictures are managed through your Google account. 
              Update your Google profile picture to change it here.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Your username"
              maxLength={CHAR_LIMITS.username}
            />
            <CharacterCounter
              current={formData.username.length}
              max={CHAR_LIMITS.username}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself"
              rows={3}
              maxLength={CHAR_LIMITS.bio}
            />
            <CharacterCounter
              current={formData.bio.length}
              max={CHAR_LIMITS.bio}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">
              Location
              <span className="text-xs text-muted-foreground ml-2">(Public)</span>
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Your location (optional)"
              maxLength={CHAR_LIMITS.location}
            />
            <CharacterCounter
              current={formData.location.length}
              max={CHAR_LIMITS.location}
            />
            <p className="text-xs text-muted-foreground">
              ⚠️ This information will be visible on your public profile. Only share what you're comfortable with.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="languages">Languages Spoken</Label>
            <Input
              id="languages"
              value={formData.languagesSpoken}
              onChange={(e) => setFormData({ ...formData, languagesSpoken: e.target.value })}
              placeholder="English, Spanish, French (comma-separated)"
              maxLength={CHAR_LIMITS.languagesSpoken}
            />
            <CharacterCounter
              current={formData.languagesSpoken.length}
              max={CHAR_LIMITS.languagesSpoken}
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" type="button">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all your data from our servers, including all
                    your phrases, definitions, and examples.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleteLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleteLoading ? "Deleting..." : "Delete Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}