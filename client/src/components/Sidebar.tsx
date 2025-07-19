import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UserPlus, 
  Settings, 
  Search, 
  LogOut, 
  Plus, 
  X, 
  AlertCircle, 
  MessageCircle, 
  Users, 
  MessageSquarePlus, 
  Bell,
  Hash,
  Calendar,
  TrendingUp,
  Activity,
  Zap,
  Info
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContactList } from "./ContactList";
import { GroupManager } from "./GroupManager";
import { GroupProfile } from "./GroupProfile";
import { NotificationSettings } from "./NotificationSettings";
import GlobalinkLogo from "./GlobalinkLogo";
import type { User } from "@shared/schema";

interface SidebarProps {
  currentUser: User;
  selectedContactId: string | null;
  onContactSelect: (contactId: string) => void;
  onSettingsOpen: () => void;
}

export default function Sidebar({ currentUser, selectedContactId, onContactSelect, onSettingsOpen }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [addContactId, setAddContactId] = useState("");
  const [showContactList, setShowContactList] = useState(false);
  const [showGroupManager, setShowGroupManager] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showGroupProfile, setShowGroupProfile] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('chats');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contacts
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ["/api/contacts"],
    retry: false,
  });

  // Fetch recent chats
  const { data: recentChats = [], isLoading: chatsLoading } = useQuery({
    queryKey: ["/api/chats"],
    retry: false,
  });

  // Search users
  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ["/api/users/search", searchQuery],
    enabled: searchQuery.length > 2,
    retry: false,
  });

  // Search user by ID for add contact
  const { data: userById, isLoading: userByIdLoading } = useQuery({
    queryKey: ["/api/users", addContactId],
    enabled: addContactId.length > 0,
    retry: false,
  });

  // Get discoverable users for enhanced add contact
  const { data: discoverableUsers = [], isLoading: discoverableLoading } = useQuery({
    queryKey: ["/api/users/discoverable"],
    retry: false,
  });

  // Fetch groups
  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["/api/groups"],
    retry: false,
  });

  // Add contact mutation
  const addContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      await apiRequest("POST", "/api/contacts", { contactId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setShowAddContact(false);
      toast({
        title: "Success",
        description: "Contact added successfully",
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
        description: "Failed to add contact",
        variant: "destructive",
      });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      await apiRequest("PUT", "/api/users/status", { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Status updated successfully",
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
        description: "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
    setShowGroupProfile(true);
  };

  return (
    <div className="w-80 glass-card border-r border-white/20 flex flex-col backdrop-blur-xl">
      {/* Header */}
      <div className="p-6 border-b border-white/10 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-teal-600/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <GlobalinkLogo size="sm" showText={false} className="shadow-lg" />
              <div>
                <h1 className="text-xl font-bold gradient-text">GLOBALINK</h1>
                <p className="text-xs text-gray-500">Next-Gen Messenger</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettingsOpen}
              className="h-10 w-10 p-0 hover:bg-white/10 rounded-xl floating-element"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-12 h-12 ring-3 ring-white/20 shadow-lg">
                <AvatarImage src={currentUser.profileImageUrl || ""} />
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold">
                  {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                currentUser.status === 'online' ? 'bg-green-500' :
                currentUser.status === 'away' ? 'bg-yellow-500' :
                currentUser.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
              }`}></div>
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-900">
                {currentUser.firstName} {currentUser.lastName}
              </h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-xs text-gray-500 hover:text-gray-700 capitalize transition-colors">
                    {currentUser.status || 'offline'} • Click to change
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-card">
                  <DropdownMenuItem onClick={() => updateStatusMutation.mutate('online')} className="hover:bg-green-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full status-online"></div>
                      <span className="text-gray-900">Online</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateStatusMutation.mutate('away')} className="hover:bg-yellow-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full status-away"></div>
                      <span className="text-gray-900">Away</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateStatusMutation.mutate('busy')} className="hover:bg-red-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full status-busy"></div>
                      <span className="text-gray-900">Busy</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateStatusMutation.mutate('offline')} className="hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full status-offline"></div>
                      <span className="text-gray-900">Offline</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="text-xs text-gray-400 font-mono">ID: {currentUser.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/50 border border-white/20 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Contact Actions */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between space-x-2">
          <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="flex-1 h-10 bg-white/20 hover:bg-white/30 border border-white/20 rounded-xl transition-all duration-200">
                <UserPlus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
          </Dialog>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowContactList(true)}
            className="h-10 w-10 bg-white/20 hover:bg-white/30 border border-white/20 rounded-xl transition-all duration-200"
            title="Contact List"
          >
            <Users className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowGroupManager(true)}
            className="h-10 w-10 bg-white/20 hover:bg-white/30 border border-white/20 rounded-xl transition-all duration-200"
            title="Groups"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowNotificationSettings(true)}
            className="h-10 w-10 bg-white/20 hover:bg-white/30 border border-white/20 rounded-xl transition-all duration-200"
            title="Notification Settings"
          >
            <Bell className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-1 mt-2 text-xs text-gray-400">
          <span className="text-center">Add Contact</span>
          <span className="text-center">Contacts</span>
          <span className="text-center">Groups</span>
          <span className="text-center">Notifications</span>
        </div>
      </div>

      {/* Add Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent className="glass-card animate-slide-up">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold gradient-text">Add New Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">Enter User ID</label>
              <Input
                placeholder="Enter user ID to search..."
                value={addContactId}
                onChange={(e) => {
                  setAddContactId(e.target.value);
                }}
                className="chat-input"
              />
            </div>
            
            {userByIdLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-corp-blue"></div>
              </div>
            )}
            
            {!userByIdLoading && !userById && addContactId.length > 0 && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm">I can't find the user with ID "{addContactId}"</span>
              </div>
            )}
            
            {userById && (
              <div className="max-h-60 overflow-y-auto">
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded border">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={userById.profileImageUrl || ""} />
                      <AvatarFallback>
                        {userById.firstName?.[0]}{userById.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-black">{userById.firstName} {userById.lastName}</p>
                      <p className="text-sm text-gray-500">{userById.email}</p>
                      <p className="text-xs text-gray-400">ID: {userById.id}</p>
                      {userById.zinCode && (
                        <p className="text-xs text-blue-600 font-mono">Zin: {userById.zinCode}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await addContactMutation.mutateAsync(userById.id);
                          setShowAddContact(false);
                          setAddContactId("");
                        } catch (error) {
                          console.error("Failed to add contact:", error);
                        }
                      }}
                      disabled={addContactMutation.isPending}
                      className="px-3"
                    >
                      Add Contact
                    </Button>
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          // Create initial message to start chat
                          await apiRequest("POST", "/api/messages", {
                            receiverId: userById.id,
                            content: "👋 Hello! Let's connect on GLOBALINK.",
                            messageType: "text",
                          });
                          
                          // Refresh chats and select the new contact
                          queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
                          onContactSelect(userById.id);
                          setShowAddContact(false);
                          setAddContactId("");
                          
                          toast({
                            title: "Chat Started",
                            description: `Started chatting with ${userById.firstName} ${userById.lastName}`,
                          });
                        } catch (error) {
                          console.error("Failed to start chat:", error);
                          toast({
                            title: "Error",
                            description: "Failed to start chat. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="px-3"
                    >
                      Start Chat
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Discoverable Users Section */}
            {!userByIdLoading && !userById && addContactId.length === 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Discover New Contacts</h3>
                  {discoverableLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {discoverableUsers.slice(0, 8).map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8 ring-2 ring-white shadow-sm">
                          <AvatarImage src={user.profileImageUrl || ""} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          {user.zinCode && (
                            <p className="text-xs text-blue-600 font-mono">Zin: {user.zinCode}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs px-2 py-1 h-7"
                          onClick={async () => {
                            try {
                              await addContactMutation.mutateAsync(user.id);
                              setShowAddContact(false);
                            } catch (error) {
                              console.error("Failed to add contact:", error);
                            }
                          }}
                          disabled={addContactMutation.isPending}
                        >
                          Add
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs px-2 py-1 h-7"
                          onClick={() => {
                            onContactSelect(user.id);
                            setShowAddContact(false);
                          }}
                        >
                          Chat
                        </Button>
                      </div>
                    </div>
                  ))}
                  {discoverableUsers.length === 0 && !discoverableLoading && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No new contacts to discover right now</p>
                      <p className="text-xs mt-1">Try searching by user ID above</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>



      {/* Tabbed Content Area */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4 mb-2 grid w-auto grid-cols-3 bg-white/10 backdrop-blur-sm h-10">
            <TabsTrigger value="chats" className="data-[state=active]:bg-white/20 text-xs flex items-center space-x-1">
              <MessageCircle className="w-3 h-3" />
              <span>Chats</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="data-[state=active]:bg-white/20 text-xs flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>Groups</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-white/20 text-xs flex items-center space-x-1">
              <Activity className="w-3 h-3" />
              <span>Activity</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="chats" className="h-full mt-0">
              <div className="h-full flex flex-col">
                <div className="px-4 py-2">
                  <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Recent Chats</h3>
                </div>
                <ScrollArea className="flex-1">
                  {chatsLoading ? (
                    <div className="px-4 py-8 text-center">
                      <div className="animate-pulse-soft">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mx-auto mb-3"></div>
                        <p className="text-gray-500">Loading chats...</p>
                      </div>
                    </div>
                  ) : recentChats.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-gray-500" />
                      </div>
                      <p className="text-gray-500 text-sm">No recent chats</p>
                      <p className="text-gray-400 text-xs mt-1">Start a new conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-1 px-2">
                      {recentChats.map((chat: any) => (
                        <div
                          key={chat.id}
                          onClick={() => onContactSelect(chat.id)}
                          className={`px-4 py-4 hover:bg-white/50 cursor-pointer rounded-xl transition-all duration-200 animate-fade-in ${
                            selectedContactId === chat.id ? 
                              'bg-gradient-to-r from-purple-100 to-blue-100 shadow-lg border border-purple-200' : 
                              'hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="w-12 h-12 ring-2 ring-white/50 shadow-sm">
                                <AvatarImage src={chat.profileImageUrl || ""} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                                  {chat.firstName?.[0]}{chat.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                chat.status === 'online' ? 'status-online' :
                                chat.status === 'away' ? 'status-away' :
                                chat.status === 'busy' ? 'status-busy' : 'status-offline'
                              }`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {chat.firstName} {chat.lastName}
                                </p>
                                {chat.lastMessage && (
                                  <span className="text-xs text-gray-400 font-medium">
                                    {formatTime(chat.lastMessage.createdAt)}
                                  </span>
                                )}
                              </div>
                              {chat.lastMessage && (
                                <p className="text-xs text-gray-500 truncate mt-1">
                                  {chat.lastMessage.content}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="groups" className="h-full mt-0">
              <div className="h-full flex flex-col">
                <div className="px-4 py-2 flex items-center justify-between">
                  <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Groups</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowGroupManager(true)}
                    className="h-6 w-6 p-0 hover:bg-white/20"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  {groupsLoading ? (
                    <div className="px-4 py-8 text-center">
                      <div className="animate-pulse-soft">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mx-auto mb-3"></div>
                        <p className="text-gray-500 text-sm">Loading groups...</p>
                      </div>
                    </div>
                  ) : (groups || []).length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-200 to-blue-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="text-gray-500 text-sm">No groups yet</p>
                      <p className="text-gray-400 text-xs mt-1">Create or join a group</p>
                      <Button
                        size="sm"
                        onClick={() => setShowGroupManager(true)}
                        className="mt-3 h-8 bg-gradient-to-r from-purple-500 to-blue-500"
                      >
                        <Plus className="w-3 h-3 mr-2" />
                        Create Group
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1 px-2">
                      {(groups || []).map((group: any) => (
                        <div
                          key={group.id}
                          onClick={() => handleGroupSelect(group.id)}
                          className="px-4 py-3 hover:bg-white/50 cursor-pointer rounded-xl transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="w-10 h-10 ring-2 ring-white/50 shadow-sm">
                                <AvatarImage src={group.avatar} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm">
                                  {group.name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1 p-0.5 bg-white rounded-full">
                                <Hash className="w-2 h-2 text-purple-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {group.name}
                                </p>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGroupSelect(group.id);
                                  }}
                                  className="h-6 w-6 p-0 hover:bg-white/20"
                                >
                                  <Info className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs bg-white/20">
                                  {group.members?.length || 0} members
                                </Badge>
                                <span className="text-xs text-gray-400 truncate">
                                  {group.description}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="h-full mt-0">
              <div className="h-full flex flex-col">
                <div className="px-4 py-2">
                  <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Activity Feed</h3>
                </div>
                <ScrollArea className="flex-1">
                  <div className="px-4 py-4 space-y-4">
                    <div className="glass-card p-4 rounded-xl border border-white/20">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">System Status</p>
                          <p className="text-xs text-gray-500">All systems operational</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold gradient-text">{recentChats.length}</div>
                          <div className="text-xs text-gray-500">Active Chats</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold gradient-text">{(groups || []).length}</div>
                          <div className="text-xs text-gray-500">Groups</div>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-4 rounded-xl border border-white/20">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Quick Actions</p>
                          <p className="text-xs text-gray-500">Frequently used features</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAddContact(true)}
                          className="bg-white/10 border-white/20 text-xs"
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Add Contact
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowGroupManager(true)}
                          className="bg-white/10 border-white/20 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          New Group
                        </Button>
                      </div>
                    </div>

                    <div className="glass-card p-4 rounded-xl border border-white/20">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Recent Activity</p>
                          <p className="text-xs text-gray-500">Last 24 hours</p>
                        </div>
                      </div>
                      <div className="text-center text-gray-500 text-xs py-4">
                        No recent activity to display
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
        
        {chatsLoading ? (
          <div className="px-4 py-8 text-center">
            <div className="animate-pulse-soft">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mx-auto mb-3"></div>
              <p className="text-gray-500">Loading chats...</p>
            </div>
          </div>
        ) : recentChats.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-gray-500">No recent chats</p>
          </div>
        ) : (
          <div className="space-y-1 px-2">
            {recentChats.map((chat: any) => (
              <div
                key={chat.id}
                onClick={() => onContactSelect(chat.id)}
                className={`px-4 py-4 hover:bg-white/50 cursor-pointer rounded-xl transition-all duration-200 animate-fade-in ${
                  selectedContactId === chat.id ? 
                    'bg-gradient-to-r from-purple-100 to-blue-100 shadow-lg border border-purple-200' : 
                    'hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12 ring-2 ring-white/50 shadow-sm">
                      <AvatarImage src={chat.profileImageUrl || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                        {chat.firstName?.[0]}{chat.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      chat.status === 'online' ? 'status-online' :
                      chat.status === 'away' ? 'status-away' :
                      chat.status === 'busy' ? 'status-busy' : 'status-offline'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {chat.firstName} {chat.lastName}
                      </p>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-400 font-medium">
                          {formatTime(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {chat.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Contact List Dialog */}
      <ContactList
        isOpen={showContactList}
        onClose={() => setShowContactList(false)}
        onContactSelect={onContactSelect}
        currentUser={currentUser}
      />

      {/* Group Manager Dialog */}
      <GroupManager
        isOpen={showGroupManager}
        onClose={() => setShowGroupManager(false)}
        onGroupSelect={(groupId) => {
          handleGroupSelect(groupId);
          setShowGroupManager(false);
        }}
        currentUser={currentUser}
      />

      {/* Group Profile Dialog */}
      {showGroupProfile && selectedGroupId && (
        <GroupProfile
          groupId={selectedGroupId}
          isOpen={showGroupProfile}
          onClose={() => {
            setShowGroupProfile(false);
            setSelectedGroupId(null);
          }}
          currentUser={currentUser}
        />
      )}

      {/* Notification Settings Dialog */}
      <NotificationSettings
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
