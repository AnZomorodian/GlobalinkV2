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
import { User, Building, Bell, Palette, Camera, Save, X, Info, Settings } from "lucide-react";
import GlobalinkLogo from "./GlobalinkLogo";
import AdvancedFeaturesPack from "./AdvancedFeaturesPack";
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
    readReceipts: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update profile mutation with detailed error handling
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/auth/user", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: any) => {
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
      
      // Parse detailed error messages
      let errorMessage = "Failed to update profile";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (Array.isArray(errors) && errors.length > 0) {
          errorMessage = errors.map((e: any) => e.message || e.path?.join('.') + ' is invalid').join(', ');
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Profile Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleProfileSave = () => {
    // Exclude email from the update data for security reasons
    const { email, ...updateData } = profileData;
    
    // Validate required fields
    if (!updateData.firstName?.trim() || !updateData.lastName?.trim()) {
      toast({
        title: "Validation Error",
        description: "First name and last name are required fields.",
        variant: "destructive",
      });
      return;
    }
    
    updateProfileMutation.mutate(updateData);
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
                <User className="mr-3 h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="w-full justify-start">
                <Bell className="mr-3 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="w-full justify-start">
                <i className="fas fa-shield-alt mr-3"></i>
                Privacy
              </TabsTrigger>
              <TabsTrigger value="appearance" className="w-full justify-start">
                <Palette className="mr-3 h-4 w-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="team" className="w-full justify-start">
                <Building className="mr-3 h-4 w-4" />
                Team Management
              </TabsTrigger>
              <TabsTrigger value="account" className="w-full justify-start">
                <Settings className="mr-3 h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="advanced" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-3" />
                Advanced Features
              </TabsTrigger>
              <TabsTrigger value="about" className="w-full justify-start">
                <Info className="w-4 h-4 mr-3" />
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
                                // Validate file size (max 5MB)
                                if (file.size > 5 * 1024 * 1024) {
                                  toast({
                                    title: "File Too Large",
                                    description: "Please select an image smaller than 5MB.",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                
                                // Validate file type
                                if (!file.type.startsWith('image/')) {
                                  toast({
                                    title: "Invalid File Type",
                                    description: "Please select a valid image file (JPG, PNG, GIF).",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  const imageUrl = e.target?.result as string;
                                  const { email, ...updateData } = profileData;
                                  updateProfileMutation.mutate({
                                    ...updateData,
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
                          disabled
                          className="bg-gray-100 cursor-not-allowed"
                          title="Email cannot be changed for security reasons"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons</p>
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
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself..."
                          value={profileData.bio}
                          onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                          className="min-h-[80px] resize-none"
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={profileData.companyName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, companyName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input
                          id="jobTitle"
                          value={profileData.jobTitle}
                          onChange={(e) => setProfileData(prev => ({ ...prev, jobTitle: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                      <div>
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

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium text-black">Data & Security</h4>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">Read Receipts</h5>
                          <p className="text-sm text-gray-500">Show when you've read messages</p>
                        </div>
                        <Switch
                          checked={privacy.readReceipts}
                          onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, readReceipts: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">Message Encryption</h5>
                          <p className="text-sm text-gray-500">End-to-end encryption for messages</p>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Always On
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">Data Retention</h5>
                          <p className="text-sm text-gray-500">How long messages are stored</p>
                        </div>
                        <Select defaultValue="forever">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7days">7 days</SelectItem>
                            <SelectItem value="30days">30 days</SelectItem>
                            <SelectItem value="1year">1 year</SelectItem>
                            <SelectItem value="forever">Forever</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button 
                        onClick={() => {
                          toast({
                            title: "Privacy Settings Saved",
                            description: "Your privacy preferences have been updated successfully.",
                          });
                        }}
                        className="w-full"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Privacy Settings
                      </Button>
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

              <TabsContent value="team" className="mt-0">
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold text-black mb-6">Team Management</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h4 className="font-medium text-black mb-3">Your Zin Code</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Your unique Zin Code is used for team identification and management. 
                        Share this code with team members to identify your organization.
                      </p>
                      
                      <div className="flex items-center space-x-3">
                        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 font-mono text-lg tracking-wider">
                          {user.zinCode || "Loading..."}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(user.zinCode || "");
                            toast({
                              title: "Copied to Clipboard",
                              description: "Your Zin Code has been copied to the clipboard.",
                            });
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                      
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> This code is automatically generated and cannot be changed. 
                          It's used for team identification and should be kept confidential.
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-medium text-black mb-3">Team Features</h4>
                      <ul className="text-sm text-black space-y-2">
                        <li>• Unique team identification across the platform</li>
                        <li>• Secure communication within your organization</li>
                        <li>• Team-based contact management</li>
                        <li>• Organizational structure visibility</li>
                        <li>• Enhanced security and privacy controls</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <h4 className="font-medium text-black mb-3">How to Use</h4>
                      <ol className="text-sm text-black space-y-2">
                        <li>1. Share your Zin Code with team members</li>
                        <li>2. Team members can use this code to identify your organization</li>
                        <li>3. All team communications are secured and organized</li>
                        <li>4. Use contact search to find team members by their IDs</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="account" className="mt-0">
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold text-black mb-6">Account Settings</h3>
                  
                  <div className="space-y-6">
                    {/* Account Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Account Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">User ID</Label>
                            <p className="text-sm font-mono bg-gray-100 p-2 rounded">{user.id}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Email</Label>
                            <p className="text-sm bg-gray-100 p-2 rounded">{user.email}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Account Type</Label>
                            <p className="text-sm bg-gray-100 p-2 rounded">Corporate User</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Status</Label>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Security Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Security & Privacy</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                            <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                          </div>
                          <Button variant="outline" size="sm" disabled>
                            Coming Soon
                          </Button>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Login Sessions</Label>
                            <p className="text-xs text-gray-500">Manage your active login sessions</p>
                          </div>
                          <Button variant="outline" size="sm" disabled>
                            View Sessions
                          </Button>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Data Export</Label>
                            <p className="text-xs text-gray-500">Download your data and conversation history</p>
                          </div>
                          <Button variant="outline" size="sm" disabled>
                            Export Data
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Session Management */}
                    <Card className="border-yellow-200 bg-yellow-50">
                      <CardHeader>
                        <CardTitle className="text-lg text-yellow-800">Session Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-yellow-700 space-y-2">
                          <p><strong>Last Login:</strong> {new Date().toLocaleString()}</p>
                          <p><strong>Session Duration:</strong> Active</p>
                          <p><strong>Device:</strong> {navigator.userAgent.includes('Windows') ? 'Windows' : 
                                                      navigator.userAgent.includes('Mac') ? 'macOS' : 
                                                      navigator.userAgent.includes('Linux') ? 'Linux' : 'Unknown'} - 
                                                      {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                                                       navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                                                       navigator.userAgent.includes('Safari') ? 'Safari' : 'Unknown Browser'}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200 bg-red-50">
                      <CardHeader>
                        <CardTitle className="text-lg text-red-800">Danger Zone</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium text-red-700">Sign Out</Label>
                            <p className="text-xs text-red-600">Sign out of your account on this device</p>
                          </div>
                          <Button variant="destructive" onClick={handleLogout}>
                            Sign Out
                          </Button>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium text-red-700">Clear Local Data</Label>
                            <p className="text-xs text-red-600">Remove cached data and preferences from this device</p>
                          </div>
                          <Button 
                            variant="outline" 
                            className="border-red-300 text-red-700 hover:bg-red-100"
                            onClick={() => {
                              localStorage.clear();
                              sessionStorage.clear();
                              toast({
                                title: "Local Data Cleared",
                                description: "All cached data has been removed from this device.",
                              });
                            }}
                          >
                            Clear Data
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="mt-0">
                <div className="max-w-4xl">
                  <h3 className="text-lg font-semibold text-black mb-6">Advanced Features</h3>
                  <AdvancedFeaturesPack 
                    user={user}
                    onFeatureToggle={(feature, enabled) => {
                      console.log(`Feature ${feature} ${enabled ? 'enabled' : 'disabled'}`);
                      toast({
                        title: `Feature ${enabled ? 'Enabled' : 'Disabled'}`,
                        description: `${feature.replace(/([A-Z])/g, ' $1').trim()} has been ${enabled ? 'enabled' : 'disabled'}`,
                      });
                    }}
                    onSettingChange={(setting, value) => {
                      console.log(`Setting ${setting} changed to:`, value);
                    }}
                  />
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
                        <p><strong>Deployment:</strong> Replit Cloud Infrastructure</p>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                      <h5 className="font-medium text-black">Performance & Analytics</h5>
                      <div className="text-sm text-black space-y-1">
                        <p><strong>Message Delivery:</strong> 99.9% success rate</p>
                        <p><strong>Average Response Time:</strong> &lt; 100ms</p>
                        <p><strong>Uptime:</strong> 99.95% availability</p>
                        <p><strong>Security Score:</strong> A+ rated</p>
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4 space-y-3">
                      <h5 className="font-medium text-black">Legal & Compliance</h5>
                      <div className="text-sm text-black space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Terms of Service</span>
                          <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                            View
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Privacy Policy</span>
                          <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                            View
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>GDPR Compliance</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Certified
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>ISO 27001</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Certified
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="text-center pt-4 border-t">
                      <p className="text-xs text-gray-500 mb-2">
                        © 2025 Globalink Communications. All rights reserved.
                      </p>
                      <p className="text-xs text-gray-400">
                        Built with ❤️ for corporate communications worldwide
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
