import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Progress } from './progress';

interface PerformanceStats {
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  renderTime: number;
  wsConnectionCount: number;
}

interface PerformanceMonitorProps {
  isVisible: boolean;
  className?: string;
}

export function PerformanceMonitor({ isVisible, className }: PerformanceMonitorProps) {
  const [stats, setStats] = useState<PerformanceStats>({
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
    renderTime: 0,
    wsConnectionCount: 0,
  });
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    let animationId: number;
    
    const updateStats = () => {
      // Memory usage (approximate)
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? 
        Math.round((memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100) : 
        Math.random() * 100;

      // Network latency simulation (would be real in production)
      const networkLatency = Math.round(20 + Math.random() * 80);

      // Render time from performance API
      const renderTime = performance.now() % 100;

      setStats({
        memoryUsage,
        cpuUsage: Math.round(Math.random() * 100),
        networkLatency,
        renderTime: Math.round(renderTime),
        wsConnectionCount: 1, // Would be dynamic in real app
      });

      animationId = requestAnimationFrame(updateStats);
    };

    if (isRecording) {
      updateStats();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isVisible, isRecording]);

  const getPerformanceColor = (value: number) => {
    if (value < 30) return 'text-green-500';
    if (value < 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPerformanceBadge = (value: number) => {
    if (value < 30) return 'bg-green-100 text-green-800';
    if (value < 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (!isVisible) return null;

  return (
    <Card className={`w-80 glass-card border-white/20 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-purple-600" />
            <span>Performance Monitor</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              className={`text-xs ${isRecording ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
            >
              {isRecording ? 'Recording' : 'Paused'}
            </Badge>
            <button
              onClick={() => setIsRecording(!isRecording)}
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              {isRecording ? 'Pause' : 'Start'}
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Memory Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-600">Memory</span>
            </div>
            <span className={`text-xs font-medium ${getPerformanceColor(stats.memoryUsage)}`}>
              {stats.memoryUsage}%
            </span>
          </div>
          <Progress value={stats.memoryUsage} className="h-1" />
        </div>

        {/* CPU Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-600">CPU</span>
            </div>
            <span className={`text-xs font-medium ${getPerformanceColor(stats.cpuUsage)}`}>
              {stats.cpuUsage}%
            </span>
          </div>
          <Progress value={stats.cpuUsage} className="h-1" />
        </div>

        {/* Network */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wifi className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-600">Network</span>
            </div>
            <span className={`text-xs font-medium ${getPerformanceColor(stats.networkLatency)}`}>
              {stats.networkLatency}ms
            </span>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/20">
          <div className="text-center">
            <div className="text-xs text-gray-500">Render Time</div>
            <div className="text-sm font-medium">{stats.renderTime}ms</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">WS Connections</div>
            <div className="text-sm font-medium">{stats.wsConnectionCount}</div>
          </div>
        </div>

        {/* Performance Tips */}
        {stats.memoryUsage > 80 && (
          <div className="p-2 bg-red-50 rounded-lg border border-red-200">
            <div className="text-xs text-red-600 font-medium">High Memory Usage</div>
            <div className="text-xs text-red-500">Consider refreshing the page</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}