import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OnlineIndicator } from '@/components/ui/online-indicator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { UserPlus, MessageCircle, Check, X, Phone, Video } from 'lucide-react';
import type { ContactWithUser } from '@shared/schema';

interface ContactsListProps {
  onStartChat: (contactId: string, contactName: string) => void;
  onAddContactClick: () => void;
  onVideoCall: (contactId: string) => void;
  onVoiceCall: (contactId: string) => void;
}

export function ContactsList({ onStartChat, onAddContactClick, onVideoCall, onVoiceCall }: ContactsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery<ContactWithUser[]>({
    queryKey: ['/api/contacts'],
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ contactId, status }: { contactId: string; status: string }) => {
      return await apiRequest('PATCH', `/api/contacts/${contactId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: "Contact updated",
        description: "Contact status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAcceptContact = (contactId: string) => {
    updateContactMutation.mutate({ contactId, status: 'accepted' });
  };

  const handleDeclineContact = (contactId: string) => {
    updateContactMutation.mutate({ contactId, status: 'blocked' });
  };

  const handleStartChat = (contact: ContactWithUser) => {
    onStartChat(contact.contactUserId, `${contact.contactUser.firstName} ${contact.contactUser.lastName}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Connected';
      case 'pending': return 'Pending';
      case 'blocked': return 'Blocked';
      default: return status;
    }
  };

  const acceptedContacts = contacts.filter(contact => contact.status === 'accepted');
  const pendingContacts = contacts.filter(contact => contact.status === 'pending');

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-blue-600 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Contacts</h3>
          <Button 
            onClick={onAddContactClick}
            size="sm"
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading contacts...</div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Pending Contacts */}
            {pendingContacts.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Pending Requests</h4>
                <div className="space-y-2">
                  {pendingContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-3 mx-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img 
                            src={contact.contactUser.profileImageUrl || `https://ui-avatars.com/api/?name=${contact.contactUser.firstName}+${contact.contactUser.lastName}&background=2563eb&color=fff`}
                            alt={`${contact.contactUser.firstName} ${contact.contactUser.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <OnlineIndicator 
                            status={contact.contactUser.status as any || 'offline'} 
                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {contact.contactUser.firstName} {contact.contactUser.lastName}
                            </span>
                            <Badge className={getStatusColor(contact.status)}>
                              {getStatusText(contact.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{contact.contactUser.companyRole}</p>
                          <p className="text-xs text-gray-400">{contact.contactUser.company}</p>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAcceptContact(contact.id)}
                            disabled={updateContactMutation.isPending}
                            className="p-2 h-8 bg-green-50 border-green-200 hover:bg-green-100"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeclineContact(contact.id)}
                            disabled={updateContactMutation.isPending}
                            className="p-2 h-8 bg-red-50 border-red-200 hover:bg-red-100"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accepted Contacts */}
            {acceptedContacts.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  My Contacts ({acceptedContacts.length})
                </h4>
                <div className="space-y-2">
                  {acceptedContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-3 mx-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img 
                            src={contact.contactUser.profileImageUrl || `https://ui-avatars.com/api/?name=${contact.contactUser.firstName}+${contact.contactUser.lastName}&background=2563eb&color=fff`}
                            alt={`${contact.contactUser.firstName} ${contact.contactUser.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <OnlineIndicator 
                            status={contact.contactUser.status as any || 'offline'} 
                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {contact.contactUser.firstName} {contact.contactUser.lastName}
                            </span>
                            <Badge className={getStatusColor(contact.status)}>
                              {getStatusText(contact.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{contact.contactUser.companyRole}</p>
                          <p className="text-xs text-gray-400">{contact.contactUser.company}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onVoiceCall(contact.contactUserId)}
                            className="p-2 h-8 w-8 hover:bg-blue-50"
                            title="Voice Call"
                          >
                            <Phone className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onVideoCall(contact.contactUserId)}
                            className="p-2 h-8 w-8 hover:bg-blue-50"
                            title="Video Call"
                          >
                            <Video className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartChat(contact)}
                            className="p-2 h-8 w-8 bg-blue-50 border-blue-200 hover:bg-blue-100"
                            title="Start Chat"
                          >
                            <MessageCircle className="h-4 w-4 text-blue-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {contacts.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <UserPlus className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-2">No contacts yet</p>
                  <Button 
                    onClick={onAddContactClick}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add Your First Contact
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}