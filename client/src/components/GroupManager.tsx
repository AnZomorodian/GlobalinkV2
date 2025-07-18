import React, { useState } from 'react';
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
import { Users, Plus, Search, Edit, Trash2, UserPlus, UserMinus } from 'lucide-react';
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
}

export function GroupManager({ isOpen, onClose, onGroupSelect, currentUser }: GroupManagerProps) {
  const [activeTab, setActiveTab] = useState('existing');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing groups (mock data for now)
  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['/api/groups'],
    enabled: isOpen,
    retry: false,
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        {
          id: '1',
          name: 'Marketing Team',
          description: 'Marketing department collaboration',
          members: ['user1', 'user2', 'user3'],
          createdBy: currentUser.id,
          createdAt: '2025-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Development Team',
          description: 'Software development team',
          members: ['user4', 'user5', 'user6'],
          createdBy: currentUser.id,
          createdAt: '2025-01-10T14:30:00Z'
        }
      ];
    },
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
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        id: Date.now().toString(),
        ...groupData,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString()
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      setGroupName('');
      setGroupDescription('');
      setSelectedMembers([]);
      setActiveTab('existing');
      toast({
        title: 'Group Created',
        description: 'Your group has been created successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create group. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      toast({
        title: 'Group Deleted',
        description: 'Group has been deleted successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete group. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Group name is required.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedMembers.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one member.',
        variant: 'destructive',
      });
      return;
    }

    createGroupMutation.mutate({
      name: groupName,
      description: groupDescription,
      members: selectedMembers,
    });
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleGroupAction = (groupId: string, action: string) => {
    switch (action) {
      case 'select':
        onGroupSelect(groupId);
        onClose();
        break;
      case 'delete':
        deleteGroupMutation.mutate(groupId);
        break;
    }
  };

  const filteredGroups = groups.filter((group: Group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Group Manager</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Existing Groups</TabsTrigger>
            <TabsTrigger value="create">Create Group</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Groups List */}
            <ScrollArea className="h-[400px]">
              {groupsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? 'No groups found' : 'No groups yet'}
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery ? 'Try a different search term' : 'Create your first group to get started'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredGroups.map((group: Group) => (
                    <Card key={group.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{group.name}</CardTitle>
                              <CardDescription>{group.description}</CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary">{group.members.length} members</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              Created {new Date(group.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleGroupAction(group.id, 'select')}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              Select
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGroupAction(group.id, 'delete')}
                              disabled={deleteGroupMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  placeholder="Enter group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="group-description">Description (optional)</Label>
                <Textarea
                  id="group-description"
                  placeholder="Describe the purpose of this group..."
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Select Members</Label>
                <ScrollArea className="h-[200px] mt-2 border rounded-md p-2">
                  {contactsLoading ? (
                    <div className="flex items-center justify-center h-20">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  ) : contacts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No contacts available</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {contacts.map((contact: any) => (
                        <div key={contact.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                          <Checkbox
                            id={contact.id}
                            checked={selectedMembers.includes(contact.id)}
                            onCheckedChange={() => handleMemberToggle(contact.id)}
                          />
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={contact.profileImageUrl || ''} />
                            <AvatarFallback className="text-xs">
                              {contact.firstName?.[0]}{contact.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{contact.firstName} {contact.lastName}</p>
                            <p className="text-xs text-gray-500">{contact.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('existing')}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateGroup}
                  disabled={createGroupMutation.isPending}
                >
                  {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}