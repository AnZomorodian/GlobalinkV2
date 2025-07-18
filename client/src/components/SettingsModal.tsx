import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Building, Bell, Palette, Camera, Save, X, Info } from "lucide-react";
import GlobalinkLogo from "./GlobalinkLogo";
import type { User as UserType } from "@shared/schema";

interface SettingsModalProps {
  user: UserType;
  onClose: () => void;
}

export default function SettingsModal({ user, onClose }: SettingsModalProps) {
  const [profileData, setProfileData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    department: user.department || "",
    bio: user.bio || "",
    companyName: user.companyName || "",
    jobTitle: user.jobTitle || "",
    location: user.location || "",
  });
  
  const [notifications, setNotifications] = useState({
    sound: true,
    desktop: true,
    email: false,
    duration: 2000, // notification duration in milliseconds
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    fontSize: 'medium',
    language: 'en',
  });

  const [privacy, setPrivacy] = useState({
    showOnlineStatus: true,
    allowDirectMessages: true,
    showLastSeen: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", "/api/auth/user", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleProfileSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Settings</DialogTitle>
        </DialogHeader>

        <div className="flex h-[calc(90vh-120px)]">
          <Tabs defaultValue="profile" className="w-full flex">
            <TabsList className="flex flex-col h-full w-64 bg-gray-50">
              <TabsTrigger value="profile" className="w-full justify-start">
                <i className="fas fa-user mr-3"></i>
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="w-full justify-start">
                <i className="fas fa-bell mr-3"></i>
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="w-full justify-start">
                <i className="fas fa-shield-alt mr-3"></i>
                Privacy
              </TabsTrigger>
              <TabsTrigger value="appearance" className="w-full justify-start">
                <i className="fas fa-palette mr-3"></i>
                Appearance
              </TabsTrigger>
              <TabsTrigger value="account" className="w-full justify-start">
                <i className="fas fa-cog mr-3"></i>
                Account
              </TabsTrigger>
              <TabsTrigger value="about" className="w-full justify-start">
                <Info className="w-4 h-4 mr-3 text-black" />
                About
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="profile" className="mt-0">
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold text-black mb-6">Profile Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={user.profileImageUrl || ""} />
                          <AvatarFallback className="text-lg">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          size="sm"
                          className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  const imageUrl = e.target?.result as string;
                                  updateProfileMutation.mutate({
                                    ...profileData,
                                    profileImageUrl: imageUrl
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            };
                            input.click();
                          }}
                        >
                          <Camera className="w-4 h-4 text-white" />
                        </Button>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Profile Picture</h4>
                        <p className="text-sm text-gray-500">Upload a professional photo for your profile</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={profileData.department}
                          onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="userId">User ID</Label>
                        <Input
                          id="userId"
                          value={user.id}
                          readOnly
                          className="bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        rows={3}
                        placeholder="Tell your colleagues about yourself..."
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={handleProfileSave}
                        disabled={updateProfileMutation.isPending}
                        className="bg-corp-blue hover:bg-blue-700"
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold text-black mb-6">Notification Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-black">Sound Notifications</h4>
                        <p className="text-sm text-gray-500">Play sound when receiving messages</p>
                      </div>
                      <Switch
                        checked={notifications.sound}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sound: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-black">Desktop Notifications</h4>
                        <p className="text-sm text-gray-500">Show desktop notifications for new messages</p>
                      </div>
                      <Switch
                        checked={notifications.desktop}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, desktop: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-black">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive email notifications for missed messages</p>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-black">Notification Duration</h4>
                      <p className="text-sm text-gray-500">How long notifications stay visible</p>
                      <Select 
                        value={notifications.duration.toString()}
                        onValueChange={(value) => setNotifications(prev => ({ ...prev, duration: parseInt(value) }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1000">1 second</SelectItem>
                          <SelectItem value="2000">2 seconds</SelectItem>
                          <SelectItem value="3000">3 seconds</SelectItem>
                          <SelectItem value="5000">5 seconds</SelectItem>
                          <SelectItem value="10000">10 seconds</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="privacy" className="mt-0">
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold text-black mb-6">Privacy Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-black">Show Online Status</h4>
                        <p className="text-sm text-gray-500">Let others see when you're online</p>
                      </div>
                      <Switch
                        checked={privacy.showOnlineStatus}
                        onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showOnlineStatus: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-black">Allow Direct Messages</h4>
                        <p className="text-sm text-gray-500">Allow anyone to send you direct messages</p>
                      </div>
                      <Switch
                        checked={privacy.allowDirectMessages}
                        onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, allowDirectMessages: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-black">Show Last Seen</h4>
                        <p className="text-sm text-gray-500">Let others see when you were last active</p>
                      </div>
                      <Switch
                        checked={privacy.showLastSeen}
                        onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showLastSeen: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="appearance" className="mt-0">
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold text-black mb-6">Appearance Settings</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="theme" className="text-black">Theme</Label>
                      <Select 
                        value={appearance.theme}
                        onValueChange={(value) => setAppearance(prev => ({ ...prev, theme: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="fontSize" className="text-black">Font Size</Label>
                      <Select 
                        value={appearance.fontSize}
                        onValueChange={(value) => setAppearance(prev => ({ ...prev, fontSize: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select font size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="language" className="text-black">Language</Label>
                      <Select 
                        value={appearance.language}
                        onValueChange={(value) => setAppearance(prev => ({ ...prev, language: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="zh">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-4 border-t">
                      <Button 
                        onClick={() => {
                          toast({
                            title: "Appearance Updated",
                            description: "Your appearance settings have been saved successfully.",
                          });
                        }}
                        className="w-full"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Appearance Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="account" className="mt-0">
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold text-black mb-6">Account Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-900 mb-2">Sign Out</h4>
                      <p className="text-sm text-red-700 mb-4">
                        Sign out of your account on this device
                      </p>
                      <Button variant="destructive" onClick={handleLogout}>
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="about" className="mt-0">
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold text-black mb-6">About Globalink</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-corp-blue to-blue-600 rounded-xl flex items-center justify-center">
                        <GlobalinkLogo className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-black">Globalink</h4>
                        <p className="text-sm text-gray-600">Corporate Messenger</p>
                        <p className="text-xs text-gray-500">Version 1.0.0</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <h5 className="font-medium text-black">Features</h5>
                      <ul className="text-sm text-black space-y-1">
                        <li>• Real-time messaging with WebSocket technology</li>
                        <li>• Voice and video calling capabilities</li>
                        <li>• File sharing and attachment support</li>
                        <li>• User status management and presence indicators</li>
                        <li>• Contact search and management</li>
                        <li>• Customizable notification settings</li>
                        <li>• Corporate profile management</li>
                        <li>• Message search and history</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                      <h5 className="font-medium text-black">Company Information</h5>
                      <div className="text-sm text-black space-y-1">
                        <p><strong>Developer:</strong> Globalink Communications</p>
                        <p><strong>Support:</strong> support@globalink.com</p>
                        <p><strong>Privacy Policy:</strong> Available on our website</p>
                        <p><strong>Terms of Service:</strong> Available on our website</p>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 space-y-3">
                      <h5 className="font-medium text-black">System Information</h5>
                      <div className="text-sm text-black space-y-1">
                        <p><strong>Platform:</strong> Web Application</p>
                        <p><strong>Technology:</strong> React + TypeScript</p>
                        <p><strong>Database:</strong> PostgreSQL</p>
                        <p><strong>Real-time:</strong> WebSocket</p>
                        <p><strong>Authentication:</strong> Secure OIDC</p>
                      </div>
                    </div>

                    <div className="text-center pt-4">
                      <p className="text-xs text-gray-500">
                        © 2024 Globalink Communications. All rights reserved.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
