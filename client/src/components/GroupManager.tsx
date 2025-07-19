import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Plus, Search, Edit, Trash2, UserPlus, UserMinus, Users2, Hash, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GroupManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupSelect: (groupId: string) => void;
  currentUser: any;
}

interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  createdBy: string;
  createdAt: string;
  type: 'private' | 'public' | 'department';
  avatar?: string;
}

export function GroupManager({ isOpen, onClose, onGroupSelect, currentUser }: GroupManagerProps) {
  const [activeTab, setActiveTab] = useState('create');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupType, setGroupType] = useState<'private' | 'public' | 'department'>('private');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setGroupName('');
      setGroupDescription('');
      setGroupType('private');
      setSelectedMembers([]);
      setSearchQuery('');
    }
  }, [isOpen]);

  // Fetch existing groups
  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['/api/groups'],
    enabled: isOpen,
    retry: false,
  });

  // Fetch contacts for member selection
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['/api/contacts'],
    enabled: isOpen && activeTab === 'create',
    retry: false,
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (groupData: any) => {
      return await apiRequest('POST', '/api/groups', groupData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      toast({
        title: 'Group Created',
        description: 'Your group has been created successfully.',
      });
      setActiveTab('existing');
      // Reset form
      setGroupName('');
      setGroupDescription('');
      setSelectedMembers([]);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create group. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast({
        title: 'Group Name Required',
        description: 'Please enter a name for your group.',
        variant: 'destructive',
      });
      return;
    }

    const groupData = {
      name: groupName,
      description: groupDescription,
      isPrivate: groupType === 'private',
      maxMembers: 100,
    };

    createGroupMutation.mutate(groupData);
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const filteredContacts = contacts.filter((contact: any) => {
    const contactData = contact.contact || contact;
    return (
      contactData.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contactData.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contactData.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getGroupTypeColor = (type: string) => {
    switch (type) {
      case 'private': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'public': return 'bg-green-100 text-green-800 border-green-200';
      case 'department': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] glass-card animate-slide-up border-0 shadow-2xl backdrop-blur-2xl bg-white/10">
        <DialogHeader className="border-b border-white/20 pb-4">
          <DialogTitle className="text-2xl font-bold gradient-text flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-sm">
              <Users2 className="w-6 h-6 text-purple-600" />
            </div>
            <span>Group Manager</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/20 backdrop-blur-sm">
            <TabsTrigger 
              value="create" 
              className="data-[state=active]:bg-white/30 data-[state=active]:text-purple-700 font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </TabsTrigger>
            <TabsTrigger 
              value="existing" 
              className="data-[state=active]:bg-white/30 data-[state=active]:text-purple-700 font-medium"
            >
              <Users className="w-4 h-4 mr-2" />
              My Groups ({groups.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6 mt-6">
            <div className="space-y-4">
              {/* Group Basic Info */}
              <Card className="glass-card border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Hash className="w-5 h-5 text-purple-600" />
                    <span>Group Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="groupName" className="text-sm font-medium text-gray-700">
                        Group Name *
                      </Label>
                      <Input
                        id="groupName"
                        placeholder="Enter group name..."
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-purple-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="groupType" className="text-sm font-medium text-gray-700">
                        Group Type
                      </Label>
                      <select
                        id="groupType"
                        value={groupType}
                        onChange={(e) => setGroupType(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-md bg-white/20 border border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-purple-400 focus:outline-none"
                      >
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                        <option value="department">Department</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="groupDescription" className="text-sm font-medium text-gray-700">
                      Description
                    </Label>
                    <Textarea
                      id="groupDescription"
                      placeholder="Describe your group..."
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      className="bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-purple-400 min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Member Selection */}
              <Card className="glass-card border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    <span>Add Members</span>
                    <Badge className="ml-auto bg-blue-100 text-blue-800">
                      {selectedMembers.length} selected
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search contacts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-blue-400"
                    />
                  </div>

                  <ScrollArea className="h-64 w-full">
                    {contactsLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-pulse-soft">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-3"></div>
                          <p className="text-gray-600 text-sm">Loading contacts...</p>
                        </div>
                      </div>
                    ) : filteredContacts.length === 0 ? (
                      <div className="text-center py-8">
                        <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No contacts available</p>
                        <p className="text-gray-500 text-sm">Add some contacts first to create groups</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredContacts.map((contact: any) => {
                          const contactData = contact.contact || contact;
                          const isSelected = selectedMembers.includes(contactData.id);
                          return (
                            <div
                              key={contactData.id}
                              className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                                isSelected 
                                  ? 'bg-purple-100/50 border-2 border-purple-300' 
                                  : 'hover:bg-white/20 border-2 border-transparent'
                              }`}
                              onClick={() => handleMemberToggle(contactData.id)}
                            >
                              <Checkbox
                                checked={isSelected}
                                onChange={() => handleMemberToggle(contactData.id)}
                                className="border-purple-300"
                              />
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={contactData.profileImageUrl || ""} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                                  {contactData.firstName?.[0]}{contactData.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {contactData.firstName} {contactData.lastName}
                                </p>
                                <p className="text-sm text-gray-600">{contactData.email}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Create Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || createGroupMutation.isPending}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {createGroupMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Create Group</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="existing" className="space-y-6 mt-6">
            <div className="space-y-4">
              {groupsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-pulse-soft">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-3"></div>
                    <p className="text-gray-600 text-sm">Loading groups...</p>
                  </div>
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-200 to-blue-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Users2 className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Groups Yet</h3>
                  <p className="text-gray-600 mb-6">Create your first group to start collaborating with your team</p>
                  <Button
                    onClick={() => setActiveTab('create')}
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Group
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.map((group: Group) => (
                    <Card key={group.id} className="glass-card border-white/20 hover:bg-white/20 transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={group.avatar || ""} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white font-semibold">
                                {group.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">{group.name}</h3>
                              <p className="text-sm text-gray-600">{group.description}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getGroupTypeColor(group.type)}>
                                  {group.type}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {group.members.length} members
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => onGroupSelect(group.id)}
                            variant="outline"
                            className="border-purple-200 text-purple-600 hover:bg-purple-50"
                          >
                            Open Chat
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}