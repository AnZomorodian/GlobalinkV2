import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OnlineIndicator } from '@/components/ui/online-indicator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Search, X, Plus, MessageCircle } from 'lucide-react';
import type { User, ContactWithUser } from '@shared/schema';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddContactModal({ isOpen, onClose }: AddContactModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: searchResults = [], isLoading: isSearching } = useQuery<User[]>({
    queryKey: ['/api/users/search', searchQuery],
    enabled: !!searchQuery && searchQuery.length > 2,
    staleTime: 30000,
  });

  const { data: existingContacts = [] } = useQuery<ContactWithUser[]>({
    queryKey: ['/api/contacts'],
    enabled: isOpen,
  });

  const addContactMutation = useMutation({
    mutationFn: async (contactUserId: string) => {
      return await apiRequest('POST', '/api/contacts', {
        contactUserId,
        status: 'pending',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: "Contact request sent",
        description: "Your contact request has been sent successfully.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send contact request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createDirectChatMutation = useMutation({
    mutationFn: async (user: User) => {
      return await apiRequest('POST', '/api/chats', {
        name: `${user.firstName} ${user.lastName}`,
        type: 'direct',
        description: `Direct message with ${user.firstName} ${user.lastName}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
      toast({
        title: "Chat created",
        description: "Direct chat has been created successfully.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create chat. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddContact = (user: User) => {
    setSelectedUser(user);
    addContactMutation.mutate(user.id);
  };

  const handleStartChat = (user: User) => {
    setSelectedUser(user);
    createDirectChatMutation.mutate(user);
  };

  const isExistingContact = (userId: string) => {
    return existingContacts.some(contact => contact.contactUserId === userId);
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedUser(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-xl font-semibold text-gray-900">
            Add New Contact
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Search for people</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {searchQuery && (
            <ScrollArea className="h-64">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Searching...</div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Search className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No users found</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img 
                            src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=2563eb&color=fff`}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <OnlineIndicator 
                            status={user.status as any || 'offline'} 
                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{user.companyRole}</p>
                          <p className="text-xs text-gray-400">{user.company}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartChat(user)}
                            disabled={createDirectChatMutation.isPending && selectedUser?.id === user.id}
                            className="p-2 h-8 w-8 hover:bg-blue-50"
                            title="Start Chat"
                          >
                            <MessageCircle className="h-4 w-4 text-blue-600" />
                          </Button>
                          {!isExistingContact(user.id) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddContact(user)}
                              disabled={addContactMutation.isPending && selectedUser?.id === user.id}
                              className="p-2 h-8 w-8 bg-blue-50 border-blue-200 hover:bg-blue-100"
                              title="Add Contact"
                            >
                              <Plus className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}

          {!searchQuery && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-gray-500">Start typing to search for people</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}