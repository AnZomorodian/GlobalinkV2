import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Settings, 
  UserPlus, 
  UserMinus, 
  Crown, 
  Shield, 
  MoreVertical,
  Edit,
  Trash2,
  MessageSquare,
  Calendar,
  Hash,
  Globe,
  Lock,
  Building
} from 'lucide-react';

interface GroupProfileProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

interface GroupMember {
  id: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
    status: string;
    jobTitle?: string;
    company?: string;
  };
}

interface GroupDetails {
  id: string;
  name: string;
  description: string;
  type: 'private' | 'public' | 'department';
  avatar?: string;
  createdBy: string;
  createdAt: string;
  memberCount: number;
  messageCount: number;
  members: GroupMember[];
}

export function GroupProfile({ groupId, isOpen, onClose, currentUser }: GroupProfileProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch group details with members
  const { data: groupDetails, isLoading: groupLoading } = useQuery<GroupDetails>({
    queryKey: ['/api/groups', groupId, 'details'],
    enabled: isOpen && !!groupId,
    retry: false,
  });

  // Initialize form when group data loads
  useEffect(() => {
    if (groupDetails) {
      setGroupName(groupDetails.name);
      setGroupDescription(groupDetails.description);
    }
  }, [groupDetails]);

  // Update group mutation
  const updateGroupMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      return apiRequest('PUT', `/api/groups/${groupId}`, data);
    },
    onSuccess: () => {
      toast({
        title: 'Group Updated',
        description: 'Group details have been updated successfully.',
      });
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ['/api/groups', groupId, 'details'] });
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error?.message || 'Failed to update group details.',
        variant: 'destructive',
      });
    },
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest('POST', `/api/groups/${groupId}/members`, { email });
    },
    onSuccess: () => {
      toast({
        title: 'Member Added',
        description: 'New member has been added to the group.',
      });
      setInviteEmail('');
      queryClient.invalidateQueries({ queryKey: ['/api/groups', groupId, 'details'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Add Member',
        description: error?.message || 'Could not add member to group.',
        variant: 'destructive',
      });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest('DELETE', `/api/groups/${groupId}/members/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Member Removed',
        description: 'Member has been removed from the group.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups', groupId, 'details'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Remove Member',
        description: error?.message || 'Could not remove member from group.',
        variant: 'destructive',
      });
    },
  });

  // Update member role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return apiRequest('PUT', `/api/groups/${groupId}/members/${userId}/role`, { role });
    },
    onSuccess: () => {
      toast({
        title: 'Role Updated',
        description: 'Member role has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups', groupId, 'details'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Update Role',
        description: error?.message || 'Could not update member role.',
        variant: 'destructive',
      });
    },
  });

  const handleUpdateGroup = () => {
    if (!groupName.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Group name is required.',
        variant: 'destructive',
      });
      return;
    }
    
    updateGroupMutation.mutate({
      name: groupName,
      description: groupDescription,
    });
  };

  const handleAddMember = () => {
    if (!inviteEmail.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Email address is required.',
        variant: 'destructive',
      });
      return;
    }
    
    addMemberMutation.mutate(inviteEmail);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'private': return <Lock className="w-4 h-4" />;
      case 'public': return <Globe className="w-4 h-4" />;
      case 'department': return <Building className="w-4 h-4" />;
      default: return <Hash className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'private': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'public': return 'bg-green-100 text-green-800 border-green-200';
      case 'department': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'admin': return <Shield className="w-4 h-4 text-blue-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canManageMembers = groupDetails?.members?.some(
    member => member.userId === currentUser?.id && ['owner', 'admin'].includes(member.role)
  );

  const canEditGroup = groupDetails?.createdBy === currentUser?.id;

  if (groupLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] glass-card">
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse-soft">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading group details...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!groupDetails) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] glass-card">
          <div className="text-center py-20">
            <p className="text-gray-600">Group not found</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] glass-card animate-slide-up border-0 shadow-2xl">
        <DialogHeader className="border-b border-white/20 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-16 h-16 ring-4 ring-white/20 shadow-lg">
                  <AvatarImage src={groupDetails.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-lg font-bold">
                    {groupDetails.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-md">
                  {getTypeIcon(groupDetails.type)}
                </div>
              </div>
              
              <div className="flex-1">
                {editMode ? (
                  <div className="space-y-3">
                    <Input
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="text-xl font-bold bg-white/20 border-white/30"
                      placeholder="Group name"
                    />
                    <Textarea
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      className="bg-white/20 border-white/30"
                      placeholder="Group description"
                      rows={2}
                    />
                  </div>
                ) : (
                  <>
                    <DialogTitle className="text-2xl font-bold gradient-text">
                      {groupDetails.name}
                    </DialogTitle>
                    <p className="text-gray-600 mt-1">{groupDetails.description}</p>
                  </>
                )}
                
                <div className="flex items-center space-x-2 mt-3">
                  <Badge className={`${getTypeColor(groupDetails.type)} flex items-center space-x-1`}>
                    {getTypeIcon(groupDetails.type)}
                    <span>{groupDetails.type}</span>
                  </Badge>
                  <Badge variant="outline" className="bg-white/20">
                    {groupDetails.memberCount} members
                  </Badge>
                  <Badge variant="outline" className="bg-white/20">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {groupDetails.messageCount || 0} messages
                  </Badge>
                </div>
              </div>
            </div>
            
            {canEditGroup && (
              <div className="flex items-center space-x-2">
                {editMode ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditMode(false)}
                      className="bg-white/20"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleUpdateGroup}
                      disabled={updateGroupMutation.isPending}
                      className="bg-gradient-to-r from-purple-500 to-blue-500"
                    >
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditMode(true)}
                    className="bg-white/20"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3 bg-white/20 backdrop-blur-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/30">
              <Hash className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-white/30">
              <Users className="w-4 h-4 mr-2" />
              Members ({groupDetails.memberCount})
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white/30">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 flex-1">
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card border-white/20">
                  <CardContent className="p-6 text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold gradient-text">{groupDetails.memberCount}</div>
                    <p className="text-sm text-gray-600">Total Members</p>
                  </CardContent>
                </Card>
                
                <Card className="glass-card border-white/20">
                  <CardContent className="p-6 text-center">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold gradient-text">{groupDetails.messageCount || 0}</div>
                    <p className="text-sm text-gray-600">Messages Sent</p>
                  </CardContent>
                </Card>
                
                <Card className="glass-card border-white/20">
                  <CardContent className="p-6 text-center">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold gradient-text">
                      {new Date(groupDetails.createdAt).toLocaleDateString()}
                    </div>
                    <p className="text-sm text-gray-600">Created</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-card border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="w-5 h-5 text-yellow-600" />
                    <span>Recent Active Members</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(groupDetails.members || []).slice(0, 6).map((member) => (
                      <div key={member.id} className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                        <Avatar className="w-10 h-10 ring-2 ring-white/20">
                          <AvatarImage src={member.user?.profileImageUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm">
                            {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {member.user?.firstName} {member.user?.lastName}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={`${getRoleColor(member.role)} text-xs`}>
                              {member.role}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {member.user?.status === 'online' ? '🟢' : '⚫'} {member.user?.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="space-y-6">
              {canManageMembers && (
                <Card className="glass-card border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <UserPlus className="w-5 h-5 text-green-600" />
                      <span>Invite New Member</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter email address..."
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="bg-white/20 border-white/30"
                      />
                      <Button
                        onClick={handleAddMember}
                        disabled={addMemberMutation.isPending || !inviteEmail.trim()}
                        className="bg-gradient-to-r from-green-500 to-blue-500"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="glass-card border-white/20">
                <CardHeader>
                  <CardTitle>All Members</CardTitle>
                  <CardDescription>
                    Manage group members and their roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {(groupDetails.members || []).map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <Avatar className="w-12 h-12 ring-2 ring-white/20">
                                <AvatarImage src={member.user?.profileImageUrl} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                                  {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                member.user?.status === 'online' ? 'bg-green-500' :
                                member.user?.status === 'away' ? 'bg-yellow-500' :
                                member.user?.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                              }`}></div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900">
                                  {member.user?.firstName} {member.user?.lastName}
                                </p>
                                {getRoleIcon(member.role)}
                              </div>
                              <p className="text-sm text-gray-500">{member.user?.email}</p>
                              {member.user?.jobTitle && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {member.user.jobTitle} {member.user.company && `at ${member.user.company}`}
                                </p>
                              )}
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge className={getRoleColor(member.role)}>
                                  {member.role}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {canManageMembers && member.userId !== currentUser?.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="glass-card border-white/20">
                                {member.role !== 'admin' && member.role !== 'owner' && (
                                  <DropdownMenuItem
                                    onClick={() => updateRoleMutation.mutate({ userId: member.userId, role: 'admin' })}
                                    className="text-blue-600"
                                  >
                                    <Shield className="w-4 h-4 mr-2" />
                                    Make Admin
                                  </DropdownMenuItem>
                                )}
                                {member.role === 'admin' && (
                                  <DropdownMenuItem
                                    onClick={() => updateRoleMutation.mutate({ userId: member.userId, role: 'member' })}
                                    className="text-gray-600"
                                  >
                                    <Users className="w-4 h-4 mr-2" />
                                    Make Member
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => removeMemberMutation.mutate(member.userId)}
                                  className="text-red-600"
                                >
                                  <UserMinus className="w-4 h-4 mr-2" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="glass-card border-white/20">
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  <CardDescription>
                    These actions cannot be undone
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {canEditGroup && (
                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/50">
                      <div>
                        <h4 className="font-medium text-red-900">Delete Group</h4>
                        <p className="text-sm text-red-700">Permanently delete this group and all its messages.</p>
                      </div>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                    <div>
                      <h4 className="font-medium text-gray-900">Leave Group</h4>
                      <p className="text-sm text-gray-700">Remove yourself from this group.</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                      <UserMinus className="w-4 h-4 mr-2" />
                      Leave
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}