import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, UserPlus, MessageCircle, Phone, Video, MoreVertical, UserMinus, Users2, Mail } from 'lucide-react';
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

  // Fetch contacts and refetch when dialog opens
  const { data: contacts = [], isLoading: contactsLoading, refetch } = useQuery({
    queryKey: ['/api/contacts'],
    enabled: isOpen,
    retry: false,
  });

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

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

  const filteredContacts = contacts.filter((contact: any) => {
    const contactData = contact.contact || contact;
    return (
      contactData.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contactData.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contactData.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contactData.id?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleContactAction = (contactId: string, action: string) => {
    switch (action) {
      case 'chat':
        onContactSelect(contactId);
        onClose();
        break;
      case 'call':
        console.log('Voice call to:', contactId);
        break;
      case 'video':
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
      <DialogContent className="sm:max-w-2xl max-h-[80vh] glass-card animate-slide-up border-0 shadow-2xl backdrop-blur-2xl bg-white/10">
        <DialogHeader className="border-b border-white/20 pb-4">
          <DialogTitle className="text-2xl font-bold gradient-text flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm">
              <Users2 className="w-6 h-6 text-blue-600" />
            </div>
            <span>My Contacts</span>
            <Badge className="ml-auto bg-blue-100 text-blue-800 border-blue-200">
              {filteredContacts.length}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-blue-400 transition-all duration-200"
            />
          </div>

          {/* Contacts List */}
          <ScrollArea className="h-[400px] w-full">
            {contactsLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-pulse-soft">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3"></div>
                  <p className="text-gray-600 text-sm">Loading contacts...</p>
                </div>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users2 className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-600 font-medium">No contacts found</p>
                <p className="text-gray-500 text-sm mt-1">
                  {searchQuery ? 'Try a different search term' : 'Add some contacts to get started'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredContacts.map((contact: any) => {
                  const contactData = contact.contact || contact;
                  return (
                    <div
                      key={contactData.id}
                      className="p-4 rounded-2xl glass-card hover:bg-white/20 transition-all duration-200 border border-white/10 animate-fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12 ring-2 ring-white/30">
                              <AvatarImage src={contactData.profileImageUrl || ""} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                {contactData.firstName?.[0]}{contactData.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(contactData.status)}`}></div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {contactData.firstName} {contactData.lastName}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Mail className="w-3 h-3" />
                              <span>{contactData.email}</span>
                            </div>
                            {contactData.jobTitle && (
                              <p className="text-xs text-gray-500 mt-1">
                                {contactData.jobTitle} {contactData.company && `at ${contactData.company}`}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleContactAction(contactData.id, 'chat')}
                            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                            title="Start Chat"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleContactAction(contactData.id, 'call')}
                            className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600 transition-colors"
                            title="Voice Call"
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleContactAction(contactData.id, 'video')}
                            className="h-8 w-8 p-0 hover:bg-purple-100 hover:text-purple-600 transition-colors"
                            title="Video Call"
                          >
                            <Video className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="glass-card">
                              <DropdownMenuItem 
                                onClick={() => handleContactAction(contactData.id, 'remove')}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <UserMinus className="w-4 h-4 mr-2" />
                                Remove Contact
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}