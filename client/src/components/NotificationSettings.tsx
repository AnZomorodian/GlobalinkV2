import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, MessageCircle, Phone, Mail, Smartphone, Volume2, VolumeX, Clock, Play } from 'lucide-react';
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

const soundOptions = [
  { value: 'default', label: 'Default', url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hVFApGn+DyvmUeBjuU2e3ZdSoG' },
  { value: 'chime', label: 'Chime', url: 'data:audio/wav;base64,UklGRjIEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQ4EAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hVFApGn+DyvmUeBjuU2e3ZdSoG' },
  { value: 'bell', label: 'Bell', url: 'data:audio/wav;base64,UklGRkgGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YSQGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hVFApGn+DyvmUeBjuU2e3ZdSoGIHLF6daLOAcTXLLm7alEDgpFn93vvWMaAzCH0ezi' },
  { value: 'soft', label: 'Soft Tone', url: 'data:audio/wav;base64,UklGRvoFAABXQVZFZm1AVDhQQU5DdGl0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hVFApGn+DyvmUeBjuU2e3ZdSoGI' }
];

const ringtoneOptions = [
  { value: 'ringtone', label: 'Default Ring', url: 'data:audio/wav;base64,UklGRsQGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YaAGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hVFApGn+DyvmUeBjuU2e3ZdSoGIHLF6daLOAcTXLLm' },
  { value: 'classic', label: 'Classic Ring', url: 'data:audio/wav;base64,UklGRvYDAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YdIDAAAAlIqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hVFApGn+DyvmUeBjuU2e3ZdSoGIHLF6daLOAcT' },
  { value: 'modern', label: 'Modern Ring', url: 'data:audio/wav;base64,UklGRsIEAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZ4EAAB4hYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hVFApGn+DyvmUeBjuU2e3ZdSoGI' }
];

export function NotificationSettings({ isOpen, onClose }: NotificationSettingsProps) {
  const [config, setConfig] = useState<NotificationConfig>(defaultConfig);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, [isOpen]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      if (permission === 'granted') {
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive desktop notifications.',
        });
      }
    }
  };

  const playSound = (soundType: string, category: 'messages' | 'calls') => {
    const soundList = category === 'calls' ? ringtoneOptions : soundOptions;
    const sound = soundList.find(s => s.value === soundType);
    
    if (sound) {
      const audio = new Audio(sound.url);
      audio.volume = 0.5;
      audio.play().catch(err => {
        console.log('Could not play sound:', err);
        toast({
          title: 'Sound Preview',
          description: `Playing ${sound.label} sound`,
        });
      });
    }
  };

  const updateConfig = (section: keyof NotificationConfig, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const updateQuietHours = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      general: {
        ...prev.general,
        quietHours: {
          ...prev.general.quietHours,
          [key]: value
        }
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] glass-card animate-slide-up border-0 shadow-2xl backdrop-blur-2xl bg-white/10">
        <DialogHeader className="border-b border-white/20 pb-4">
          <DialogTitle className="text-2xl font-bold gradient-text flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-600/20 backdrop-blur-sm">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            <span>Notification Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar p-2">
          {/* Browser Permissions */}
          {permissionStatus !== 'granted' && (
            <Card className="glass-card border-white/20 border-2 border-orange-200 bg-orange-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2 text-orange-800">
                  <Bell className="w-5 h-5" />
                  <span>Browser Permissions</span>
                </CardTitle>
                <CardDescription className="text-orange-700">
                  Enable browser notifications to receive desktop alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={requestNotificationPermission}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Enable Notifications
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Message Notifications */}
          <Card className="glass-card border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <span>Message Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="messages-enabled" className="font-medium">Enable message notifications</Label>
                <Switch
                  id="messages-enabled"
                  checked={config.messages.enabled}
                  onCheckedChange={(checked) => updateConfig('messages', 'enabled', checked)}
                />
              </div>

              {config.messages.enabled && (
                <>
                  <Separator className="bg-white/20" />
                  <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="messages-sound">Sound notifications</Label>
                      <Switch
                        id="messages-sound"
                        checked={config.messages.sound}
                        onCheckedChange={(checked) => updateConfig('messages', 'sound', checked)}
                      />
                    </div>

                    {config.messages.sound && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Notification Sound</Label>
                        <div className="flex items-center space-x-2">
                          <Select
                            value={config.messages.soundType}
                            onValueChange={(value) => updateConfig('messages', 'soundType', value)}
                          >
                            <SelectTrigger className="bg-white/20 border-white/30 backdrop-blur-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-card">
                              {soundOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => playSound(config.messages.soundType, 'messages')}
                            className="bg-white/20 border-white/30 hover:bg-white/30"
                            title="Test Sound"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Label htmlFor="messages-desktop">Desktop notifications</Label>
                      <Switch
                        id="messages-desktop"
                        checked={config.messages.desktop}
                        onCheckedChange={(checked) => updateConfig('messages', 'desktop', checked)}
                        disabled={permissionStatus !== 'granted'}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="messages-email">Email notifications</Label>
                      <Switch
                        id="messages-email"
                        checked={config.messages.email}
                        onCheckedChange={(checked) => updateConfig('messages', 'email', checked)}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Call Notifications */}
          <Card className="glass-card border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Phone className="w-5 h-5 text-green-600" />
                <span>Call Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="calls-enabled" className="font-medium">Enable call notifications</Label>
                <Switch
                  id="calls-enabled"
                  checked={config.calls.enabled}
                  onCheckedChange={(checked) => updateConfig('calls', 'enabled', checked)}
                />
              </div>

              {config.calls.enabled && (
                <>
                  <Separator className="bg-white/20" />
                  <div className="space-y-4 pl-4 border-l-2 border-green-200">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="calls-sound">Ringtone</Label>
                      <Switch
                        id="calls-sound"
                        checked={config.calls.sound}
                        onCheckedChange={(checked) => updateConfig('calls', 'sound', checked)}
                      />
                    </div>

                    {config.calls.sound && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Ringtone Sound</Label>
                        <div className="flex items-center space-x-2">
                          <Select
                            value={config.calls.soundType}
                            onValueChange={(value) => updateConfig('calls', 'soundType', value)}
                          >
                            <SelectTrigger className="bg-white/20 border-white/30 backdrop-blur-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-card">
                              {ringtoneOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => playSound(config.calls.soundType, 'calls')}
                            className="bg-white/20 border-white/30 hover:bg-white/30"
                            title="Test Ringtone"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Label htmlFor="calls-desktop">Desktop notifications</Label>
                      <Switch
                        id="calls-desktop"
                        checked={config.calls.desktop}
                        onCheckedChange={(checked) => updateConfig('calls', 'desktop', checked)}
                        disabled={permissionStatus !== 'granted'}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="calls-vibration">Vibration (mobile)</Label>
                      <Switch
                        id="calls-vibration"
                        checked={config.calls.vibration}
                        onCheckedChange={(checked) => updateConfig('calls', 'vibration', checked)}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card className="glass-card border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span>General Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="do-not-disturb" className="font-medium">Do Not Disturb</Label>
                <Switch
                  id="do-not-disturb"
                  checked={config.general.doNotDisturb}
                  onCheckedChange={(checked) => updateConfig('general', 'doNotDisturb', checked)}
                />
              </div>

              <Separator className="bg-white/20" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="quiet-hours" className="font-medium">Quiet Hours</Label>
                  <Switch
                    id="quiet-hours"
                    checked={config.general.quietHours.enabled}
                    onCheckedChange={(checked) => updateQuietHours('enabled', checked)}
                  />
                </div>

                {config.general.quietHours.enabled && (
                  <div className="pl-4 border-l-2 border-purple-200 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Start Time</Label>
                        <input
                          type="time"
                          value={config.general.quietHours.start}
                          onChange={(e) => updateQuietHours('start', e.target.value)}
                          className="w-full px-3 py-2 rounded-md bg-white/20 border border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-purple-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">End Time</Label>
                        <input
                          type="time"
                          value={config.general.quietHours.end}
                          onChange={(e) => updateQuietHours('end', e.target.value)}
                          className="w-full px-3 py-2 rounded-md bg-white/20 border border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-purple-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="bg-white/20" />

              <div className="flex items-center justify-between">
                <Label htmlFor="show-preview" className="font-medium">Show message preview</Label>
                <Switch
                  id="show-preview"
                  checked={config.general.showPreview}
                  onCheckedChange={(checked) => updateConfig('general', 'showPreview', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-white/20">
            <Button
              onClick={() => {
                toast({
                  title: 'Settings Saved',
                  description: 'Your notification preferences have been updated.',
                });
                onClose();
              }}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}