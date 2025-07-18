import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, UserPlus, MessageCircle, Phone, Video, MoreVertical, UserMinus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ContactListProps {
  isOpen: boolean;
  onClose: () => void;
  onContactSelect: (contactId: string) => void;
  currentUser: any;
}

export function ContactList({ isOpen, onClose, onContactSelect, currentUser }: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contacts
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['/api/contacts'],
    enabled: isOpen,
    retry: false,
  });

  // Remove contact mutation
  const removeContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      await apiRequest('DELETE', `/api/contacts/${contactId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: 'Contact Removed',
        description: 'Contact has been removed from your contact list.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to remove contact. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const filteredContacts = contacts.filter((contact: any) =>
    contact.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactAction = (contactId: string, action: string) => {
    switch (action) {
      case 'chat':
        onContactSelect(contactId);
        onClose();
        break;
      case 'call':
        // Handle voice call
        console.log('Voice call to:', contactId);
        break;
      case 'video':
        // Handle video call
        console.log('Video call to:', contactId);
        break;
      case 'remove':
        removeContactMutation.mutate(contactId);
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Contact List</span>
            <Badge variant="secondary">{contacts.length}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Contact List */}
          <ScrollArea className="h-[400px]">
            {contactsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'No contacts found' : 'No contacts yet'}
                </h3>
                <p className="text-gray-500">
                  {searchQuery ? 'Try a different search term' : 'Start by adding some contacts'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredContacts.map((contact: any) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12 ring-2 ring-white shadow-sm">
                          <AvatarImage src={contact.profileImageUrl || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                            {contact.firstName?.[0]}{contact.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(contact.status || 'offline')}`}></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </h4>
                        <p className="text-sm text-gray-500">{contact.email}</p>
                        {contact.jobTitle && (
                          <p className="text-xs text-gray-400">{contact.jobTitle}</p>
                        )}
                        {contact.zinCode && (
                          <p className="text-xs text-blue-600 font-mono">Zin: {contact.zinCode}</p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        onClick={() => handleContactAction(contact.id, 'chat')}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContactAction(contact.id, 'call')}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContactAction(contact.id, 'video')}
                      >
                        <Video className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleContactAction(contact.id, 'remove')}>
                            <UserMinus className="w-4 h-4 mr-2" />
                            Remove Contact
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}