import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Zap, 
  Shield, 
  Globe, 
  Users, 
  Bell, 
  Palette, 
  Eye, 
  EyeOff,
  Lock,
  Unlock,
  Sparkles,
  Cpu,
  Wifi,
  WifiOff,
  Battery,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';

interface AdvancedFeaturesPackProps {
  user: any;
  onFeatureToggle: (feature: string, enabled: boolean) => void;
  onSettingChange: (setting: string, value: any) => void;
}

export default function AdvancedFeaturesPack({ 
  user, 
  onFeatureToggle, 
  onSettingChange 
}: AdvancedFeaturesPackProps) {
  const [features, setFeatures] = useState({
    smartNotifications: true,
    aiAssistant: false,
    advancedSecurity: true,
    realTimeCollaboration: true,
    voiceEnhancement: false,
    darkMode: false,
    focusMode: false,
    autoTranslate: false,
    smartScheduling: true,
    encryptedMessages: true,
    gestureControls: false,
    voiceCommands: false,
    biometricAuth: false,
    offlineMode: true,
    batteryOptimization: true,
    networkOptimization: true,
    customThemes: true,
    advancedSearch: true,
    messageScheduling: false,
    readReceipts: true,
    typingIndicators: true,
    presenceUpdates: true,
    fileCompression: true,
    cloudSync: true,
    crossPlatformSync: true
  });

  const [settings, setSettings] = useState({
    notificationVolume: [80],
    animationSpeed: [1],
    fontSize: [14],
    messageRetention: [30],
    autoBackup: [7],
    syncFrequency: [5],
    batteryThreshold: [20],
    networkTimeout: [10],
    theme: 'auto',
    language: 'en',
    timezone: 'auto'
  });

  const [connectionStatus, setConnectionStatus] = useState({
    online: true,
    server: 'Connected',
    latency: 45,
    quality: 'Excellent'
  });

  const [systemStats, setSystemStats] = useState({
    cpu: 23,
    memory: 45,
    storage: 67,
    battery: 89,
    network: 'WiFi'
  });

  useEffect(() => {
    // Simulate real-time system monitoring
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        cpu: Math.max(10, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(20, Math.min(80, prev.memory + (Math.random() - 0.5) * 5)),
        latency: Math.max(20, Math.min(200, 45 + (Math.random() - 0.5) * 30))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleFeature = (feature: string) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
    onFeatureToggle(feature, !features[feature]);
  };

  const updateSetting = (setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    onSettingChange(setting, value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Connected': return 'text-green-600';
      case 'Connecting': return 'text-yellow-600';
      case 'Disconnected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="features" className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass-card">
          <TabsTrigger value="features" className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Features</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2">
            <Cpu className="w-4 h-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Monitor className="w-4 h-4" />
            <span>System</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Advanced Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(features).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-white/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={() => toggleFeature(key)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-blue-500" />
                <span>Performance Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Notification Volume</label>
                    <span className="text-sm text-gray-500">{settings.notificationVolume[0]}%</span>
                  </div>
                  <Slider
                    value={settings.notificationVolume}
                    onValueChange={(value) => updateSetting('notificationVolume', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Animation Speed</label>
                    <span className="text-sm text-gray-500">{settings.animationSpeed[0]}x</span>
                  </div>
                  <Slider
                    value={settings.animationSpeed}
                    onValueChange={(value) => updateSetting('animationSpeed', value)}
                    max={3}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Font Size</label>
                    <span className="text-sm text-gray-500">{settings.fontSize[0]}px</span>
                  </div>
                  <Slider
                    value={settings.fontSize}
                    onValueChange={(value) => updateSetting('fontSize', value)}
                    max={24}
                    min={10}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span>Security & Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Lock className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">End-to-End Encryption</span>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    Active
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Read Receipts</span>
                  </div>
                  <Switch
                    checked={features.readReceipts}
                    onCheckedChange={() => toggleFeature('readReceipts')}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium">Presence Updates</span>
                  </div>
                  <Switch
                    checked={features.presenceUpdates}
                    onCheckedChange={() => toggleFeature('presenceUpdates')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="w-5 h-5 text-gray-600" />
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm text-gray-500">{systemStats.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${systemStats.cpu}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory</span>
                    <span className="text-sm text-gray-500">{systemStats.memory}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${systemStats.memory}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Storage</span>
                    <span className="text-sm text-gray-500">{systemStats.storage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${systemStats.storage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Battery</span>
                    <span className="text-sm text-gray-500">{systemStats.battery}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${systemStats.battery}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Connection Status</span>
                  <Badge variant="outline" className={getStatusColor(connectionStatus.server)}>
                    {connectionStatus.server}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Latency: {connectionStatus.latency}ms</span>
                  <span>Quality: {connectionStatus.quality}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}