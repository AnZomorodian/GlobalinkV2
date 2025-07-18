import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { OnlineIndicator } from '@/components/ui/online-indicator';
import { X, Users } from 'lucide-react';
import type { User, ChatWithMembers } from '@shared/schema';

interface RightSidebarProps {
  selectedChatId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RightSidebar({ selectedChatId, isOpen, onClose }: RightSidebarProps) {
  const { data: chat } = useQuery<ChatWithMembers>({
    queryKey: ['/api/chats', selectedChatId],
    enabled: !!selectedChatId,
  });

  const { data: members = [] } = useQuery<User[]>({
    queryKey: ['/api/chats', selectedChatId, 'members'],
    enabled: !!selectedChatId,
  });

  if (!isOpen || !selectedChatId) return null;

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Chat Information</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2 hover:bg-gray-100">
            <X className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Chat Details */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <img 
              src={chat?.avatarUrl || `https://ui-avatars.com/api/?name=${chat?.name}&background=2563eb&color=fff`}
              alt={chat?.name || 'Chat'}
              className={`w-16 h-16 object-cover ${
                chat?.type === 'direct' ? 'rounded-full' : 'rounded-lg'
              }`}
            />
            <div>
              <h4 className="font-medium text-gray-900">{chat?.name}</h4>
              <p className="text-sm text-gray-500">
                {chat?.type === 'direct' ? 'Direct message' : `${members.length} members`}
              </p>
            </div>
          </div>
          
          {chat?.description && (
            <p className="text-sm text-gray-600 mb-4">{chat.description}</p>
          )}
        </div>

        {/* Members */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">
            Members ({members.length})
          </h4>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src={member.profileImageUrl || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=2563eb&color=fff`}
                    alt={`${member.firstName} ${member.lastName}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <OnlineIndicator 
                    status={member.status as any || 'offline'} 
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{member.companyRole}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="p-4 space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Notifications</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">All messages</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Mentions only</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Sound</span>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Privacy</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Read receipts</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Typing indicators</span>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
