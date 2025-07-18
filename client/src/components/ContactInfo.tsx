import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { User } from "@shared/schema";

interface ContactInfoProps {
  contactId: string;
  onClose: () => void;
}

export default function ContactInfo({ contactId, onClose }: ContactInfoProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contact details - first try from contacts list, then fetch user directly
  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/contacts"],
    retry: false,
  });

  const contactFromList = contacts.find((c: any) => c.contactId === contactId)?.contact;

  // If not found in contacts, fetch user directly by ID
  const { data: userContact } = useQuery({
    queryKey: ["/api/users", contactId],
    enabled: !contactFromList && !!contactId,
    retry: false,
  });

  const contact = contactFromList || userContact;

  // Block contact mutation
  const blockContactMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/contacts/${contactId}/block`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Success",
        description: "Contact blocked successfully",
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
        description: "Failed to block contact",
        variant: "destructive",
      });
    },
  });

  // Remove contact mutation
  const removeContactMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/contacts/${contactId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      onClose();
      toast({
        title: "Success",
        description: "Contact removed successfully",
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
        description: "Failed to remove contact",
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'busy': return 'Busy';
      default: return 'Offline';
    }
  };

  if (!contact) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="text-center text-gray-500">
          Contact not found
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Contact Info</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <i className="fas fa-times text-gray-500"></i>
        </Button>
      </div>

      {/* Contact Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-3">
            <AvatarImage src={contact.profileImageUrl || ""} />
            <AvatarFallback className="text-2xl">
              {contact.firstName?.[0]}{contact.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold text-gray-900">
            {contact.firstName} {contact.lastName}
          </h3>
          <p className="text-sm text-gray-500 mb-2">{contact.department}</p>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(contact.status || 'offline')}`}></div>
            <span className="text-sm text-gray-600">{getStatusText(contact.status || 'offline')}</span>
          </div>
          <p className="text-xs text-gray-400">ID: {contact.id}</p>
        </div>
      </div>

      {/* Bio */}
      {contact.bio && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">About</h4>
          <p className="text-sm text-gray-600">{contact.bio}</p>
        </div>
      )}

      {/* Contact Details */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Details</h4>
        <div className="space-y-2">
          {contact.email && (
            <div className="flex items-center space-x-2">
              <i className="fas fa-envelope text-gray-400 w-4"></i>
              <span className="text-sm text-gray-600">{contact.email}</span>
            </div>
          )}
          {contact.department && (
            <div className="flex items-center space-x-2">
              <i className="fas fa-building text-gray-400 w-4"></i>
              <span className="text-sm text-gray-600">{contact.department}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-3">
        <Button className="w-full bg-corp-blue hover:bg-blue-700">
          <i className="fas fa-phone mr-2"></i>
          Voice Call
        </Button>
        <Button className="w-full bg-green-600 hover:bg-green-700">
          <i className="fas fa-video mr-2"></i>
          Video Call
        </Button>
        
        <Separator />
        
        <Button
          variant="outline"
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => blockContactMutation.mutate()}
          disabled={blockContactMutation.isPending}
        >
          <i className="fas fa-user-slash mr-2"></i>
          Block Contact
        </Button>
        <Button
          variant="outline"
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => removeContactMutation.mutate()}
          disabled={removeContactMutation.isPending}
        >
          <i className="fas fa-user-minus mr-2"></i>
          Remove Contact
        </Button>
      </div>
    </div>
  );
}
