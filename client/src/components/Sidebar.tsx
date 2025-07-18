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

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-corp-blue rounded-lg flex items-center justify-center">
              <i className="fas fa-comments text-white text-sm"></i>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Corporate Messenger</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={onSettingsOpen}>
            <i className="fas fa-cog text-gray-500"></i>
          </Button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={currentUser.profileImageUrl || ""} />
            <AvatarFallback>
              {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {currentUser.firstName} {currentUser.lastName}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(currentUser.status || 'offline')}`}></div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => updateStatusMutation.mutate('online')}>
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    Online
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateStatusMutation.mutate('away')}>
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                    Away
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateStatusMutation.mutate('busy')}>
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                    Busy
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateStatusMutation.mutate('offline')}>
                    <div className="w-2 h-2 rounded-full bg-gray-300 mr-2"></div>
                    Offline
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-xs text-gray-500">ID: {currentUser.id}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search users by ID or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <i className="fas fa-search absolute left-3 top-2.5 text-gray-400 text-sm"></i>
        </div>
      </div>

      {/* Add Contact Button */}
      <div className="px-4 pb-2">
        <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <i className="fas fa-user-plus mr-2"></i>
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Search by ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchLoading && <p className="text-sm text-gray-500">Searching...</p>}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((user: User) => (
                  <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.profileImageUrl || ""} />
                        <AvatarFallback>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500">{user.id}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addContactMutation.mutate(user.id)}
                      disabled={addContactMutation.isPending}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recent Chats</h3>
        </div>
        
        {chatsLoading ? (
          <div className="px-4 py-8 text-center text-gray-500">
            Loading chats...
          </div>
        ) : recentChats.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            No recent chats
          </div>
        ) : (
          <div className="space-y-1">
            {recentChats.map((chat: any) => (
              <div
                key={chat.id}
                onClick={() => onContactSelect(chat.id)}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
                  selectedContactId === chat.id ? 'border-corp-blue bg-blue-50' : 'border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={chat.profileImageUrl || ""} />
                    <AvatarFallback>
                      {chat.firstName?.[0]}{chat.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {chat.firstName} {chat.lastName}
                      </p>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(chat.status || 'offline')}`}></div>
                        {chat.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTime(chat.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    {chat.lastMessage && (
                      <p className="text-xs text-gray-500 truncate">
                        {chat.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
