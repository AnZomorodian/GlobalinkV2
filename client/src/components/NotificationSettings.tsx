import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Bell, MessageCircle, Phone, Mail, Smartphone, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationConfig {
  messages: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    email: boolean;
    mobile: boolean;
    soundType: string;
  };
  calls: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    vibration: boolean;
    soundType: string;
  };
  general: {
    doNotDisturb: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    showPreview: boolean;
  };
}

const defaultConfig: NotificationConfig = {
  messages: {
    enabled: true,
    sound: true,
    desktop: true,
    email: false,
    mobile: true,
    soundType: 'default'
  },
  calls: {
    enabled: true,
    sound: true,
    desktop: true,
    vibration: true,
    soundType: 'ringtone'
  },
  general: {
    doNotDisturb: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    showPreview: true
  }
};

export function NotificationSettings({ isOpen, onClose }: NotificationSettingsProps) {
  const [config, setConfig] = useState<NotificationConfig>(defaultConfig);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  useEffect(() => {
    // Load saved settings from localStorage
    const savedConfig = localStorage.getItem('notificationSettings');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }

    // Check notification permission
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const saveConfig = (newConfig: NotificationConfig) => {
    setConfig(newConfig);
    localStorage.setItem('notificationSettings', JSON.stringify(newConfig));
    toast({
      title: 'Settings Saved',
      description: 'Your notification preferences have been updated.',
    });
  };

  const requestPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);
        if (permission === 'granted') {
          toast({
            title: 'Notifications Enabled',
            description: 'You will now receive desktop notifications.',
          });
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  };

  const testNotification = (type: 'message' | 'call') => {
    if (permissionStatus !== 'granted') {
      toast({
        title: 'Permission Required',
        description: 'Please enable notifications first.',
        variant: 'destructive',
      });
      return;
    }

    const notification = new Notification(
      type === 'message' ? 'New Message' : 'Incoming Call',
      {
        body: type === 'message' ? 'Test message notification' : 'Test call notification',
        icon: '/favicon.ico',
        tag: 'test-notification'
      }
    );

    // Play sound if enabled
    if ((type === 'message' && config.messages.sound) || (type === 'call' && config.calls.sound)) {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(console.error);
    }

    setTimeout(() => notification.close(), 5000);
  };

  const updateMessageSettings = (key: keyof NotificationConfig['messages'], value: any) => {
    const newConfig = {
      ...config,
      messages: {
        ...config.messages,
        [key]: value
      }
    };
    saveConfig(newConfig);
  };

  const updateCallSettings = (key: keyof NotificationConfig['calls'], value: any) => {
    const newConfig = {
      ...config,
      calls: {
        ...config.calls,
        [key]: value
      }
    };
    saveConfig(newConfig);
  };

  const updateGeneralSettings = (key: keyof NotificationConfig['general'], value: any) => {
    const newConfig = {
      ...config,
      general: {
        ...config.general,
        [key]: value
      }
    };
    saveConfig(newConfig);
  };

  const updateQuietHours = (key: keyof NotificationConfig['general']['quietHours'], value: any) => {
    const newConfig = {
      ...config,
      general: {
        ...config.general,
        quietHours: {
          ...config.general.quietHours,
          [key]: value
        }
      }
    };
    saveConfig(newConfig);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notification Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Permission Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Browser Permissions</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Desktop Notifications</p>
                <p className="text-sm text-gray-600">
                  Status: {permissionStatus === 'granted' ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              {permissionStatus !== 'granted' && (
                <Button onClick={requestPermission} variant="outline">
                  Enable
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Message Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Message Notifications</span>
              </h3>
              <Button
                onClick={() => testNotification('message')}
                variant="outline"
                size="sm"
              >
                Test
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="messages-enabled">Enable message notifications</Label>
                <Switch
                  id="messages-enabled"
                  checked={config.messages.enabled}
                  onCheckedChange={(checked) => updateMessageSettings('enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="messages-sound">Play sound</Label>
                <Switch
                  id="messages-sound"
                  checked={config.messages.sound}
                  onCheckedChange={(checked) => updateMessageSettings('sound', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="messages-desktop">Desktop notifications</Label>
                <Switch
                  id="messages-desktop"
                  checked={config.messages.desktop}
                  onCheckedChange={(checked) => updateMessageSettings('desktop', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="messages-email">Email notifications</Label>
                <Switch
                  id="messages-email"
                  checked={config.messages.email}
                  onCheckedChange={(checked) => updateMessageSettings('email', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Sound type</Label>
                <Select
                  value={config.messages.soundType}
                  onValueChange={(value) => updateMessageSettings('soundType', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="chime">Chime</SelectItem>
                    <SelectItem value="ding">Ding</SelectItem>
                    <SelectItem value="pop">Pop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Call Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Call Notifications</span>
              </h3>
              <Button
                onClick={() => testNotification('call')}
                variant="outline"
                size="sm"
              >
                Test
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="calls-enabled">Enable call notifications</Label>
                <Switch
                  id="calls-enabled"
                  checked={config.calls.enabled}
                  onCheckedChange={(checked) => updateCallSettings('enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="calls-sound">Play ringtone</Label>
                <Switch
                  id="calls-sound"
                  checked={config.calls.sound}
                  onCheckedChange={(checked) => updateCallSettings('sound', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="calls-desktop">Desktop notifications</Label>
                <Switch
                  id="calls-desktop"
                  checked={config.calls.desktop}
                  onCheckedChange={(checked) => updateCallSettings('desktop', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="calls-vibration">Vibration (mobile)</Label>
                <Switch
                  id="calls-vibration"
                  checked={config.calls.vibration}
                  onCheckedChange={(checked) => updateCallSettings('vibration', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Ringtone</Label>
                <Select
                  value={config.calls.soundType}
                  onValueChange={(value) => updateCallSettings('soundType', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ringtone">Default</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">General Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="do-not-disturb">Do Not Disturb</Label>
                <Switch
                  id="do-not-disturb"
                  checked={config.general.doNotDisturb}
                  onCheckedChange={(checked) => updateGeneralSettings('doNotDisturb', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="quiet-hours">Quiet Hours</Label>
                <Switch
                  id="quiet-hours"
                  checked={config.general.quietHours.enabled}
                  onCheckedChange={(checked) => updateQuietHours('enabled', checked)}
                />
              </div>

              {config.general.quietHours.enabled && (
                <div className="flex items-center justify-between pl-4">
                  <Label>Time range</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={config.general.quietHours.start}
                      onChange={(e) => updateQuietHours('start', e.target.value)}
                      className="px-2 py-1 border rounded"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={config.general.quietHours.end}
                      onChange={(e) => updateQuietHours('end', e.target.value)}
                      className="px-2 py-1 border rounded"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="show-preview">Show message preview</Label>
                <Switch
                  id="show-preview"
                  checked={config.general.showPreview}
                  onCheckedChange={(checked) => updateGeneralSettings('showPreview', checked)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}