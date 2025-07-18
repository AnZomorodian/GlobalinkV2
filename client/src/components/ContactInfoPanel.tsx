import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, MapPin, Building, Mail, Phone, Video, MessageCircle, X } from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface ContactInfoPanelProps {
  contact: UserType;
  onClose: () => void;
}

export default function ContactInfoPanel({ contact, onClose }: ContactInfoPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-black">Contact Info</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4 text-black" />
        </Button>
      </div>

      {/* Contact Profile */}
      <div className="p-6 text-center">
        <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-gray-100">
          <AvatarImage src={contact.profileImageUrl || ""} />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-corp-blue to-blue-600 text-white">
            {contact.firstName?.[0]}{contact.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        
        <h2 className="text-xl font-semibold text-black mb-2">
          {contact.firstName} {contact.lastName}
        </h2>
        
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(contact.status || 'offline')}`}></div>
          <span className="text-sm text-gray-600 capitalize">
            {contact.status || 'offline'}
          </span>
        </div>

        <Badge variant="outline" className="mb-4">
          ID: {contact.id}
        </Badge>
      </div>

      {/* Contact Details */}
      <div className="flex-1 px-4 pb-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <User className="w-4 h-4" />
              <span className="text-black">Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contact.email && (
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-black">{contact.email}</span>
              </div>
            )}
            
            {contact.bio && (
              <div className="flex items-start space-x-3">
                <MessageCircle className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Bio</p>
                  <p className="text-sm text-black">{contact.bio}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Building className="w-4 h-4" />
              <span className="text-black">Work Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contact.companyName && (
              <div className="flex items-center space-x-3">
                <Building className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Company</p>
                  <p className="text-sm text-black">{contact.companyName}</p>
                </div>
              </div>
            )}
            
            {contact.jobTitle && (
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Job Title</p>
                  <p className="text-sm text-black">{contact.jobTitle}</p>
                </div>
              </div>
            )}
            
            {contact.department && (
              <div className="flex items-center space-x-3">
                <Building className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="text-sm text-black">{contact.department}</p>
                </div>
              </div>
            )}
            
            {contact.location && (
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm text-black">{contact.location}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button className="w-full" variant="outline">
            <MessageCircle className="w-4 h-4 mr-2" />
            <span className="text-black">Send Message</span>
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <Phone className="w-4 h-4 mr-2" />
              <span className="text-black">Call</span>
            </Button>
            <Button variant="outline" size="sm">
              <Video className="w-4 h-4 mr-2" />
              <span className="text-black">Video</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}