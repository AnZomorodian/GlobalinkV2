import { useRef, useState, useCallback } from 'react';

export function useWebRTC() {
  const [isConnected, setIsConnected] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  const initializePeerConnection = useCallback(() => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    };

    peerConnection.current = new RTCPeerConnection(configuration);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to the other peer via WebSocket
        // This would be handled by the WebSocket hook
      }
    };

    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.current.onconnectionstatechange = () => {
      const state = peerConnection.current?.connectionState;
      setIsConnected(state === 'connected');
      if (state === 'disconnected' || state === 'failed') {
        setIsCalling(false);
      }
    };
  }, []);

  const startCall = useCallback(async (video: boolean = true) => {
    try {
      setIsCalling(true);
      initializePeerConnection();

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video,
        audio: true,
      });

      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.current?.addTrack(track, stream);
      });

      // Create offer
      const offer = await peerConnection.current?.createOffer();
      await peerConnection.current?.setLocalDescription(offer);

      // Send offer to the other peer via WebSocket
      // This would be handled by the parent component

    } catch (error) {
      console.error('Error starting call:', error);
      setIsCalling(false);
    }
  }, [initializePeerConnection]);

  const acceptCall = useCallback(async () => {
    try {
      setIsCalling(true);
      initializePeerConnection();

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.current?.addTrack(track, stream);
      });

      // This would create an answer and send it back
      // Implementation would depend on the offer received

    } catch (error) {
      console.error('Error accepting call:', error);
      setIsCalling(false);
    }
  }, [initializePeerConnection]);

  const rejectCall = useCallback(() => {
    setIsCalling(false);
    setIsConnected(false);
  }, []);

  const endCall = useCallback(() => {
    // Stop all tracks
    localStream.current?.getTracks().forEach(track => track.stop());
    
    // Close peer connection
    peerConnection.current?.close();
    peerConnection.current = null;
    
    // Reset states
    setIsConnected(false);
    setIsCalling(false);
    setIsMuted(false);
    setIsVideoEnabled(true);
    
    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, []);

  const muteAudio = useCallback(() => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  return {
    localVideoRef,
    remoteVideoRef,
    isConnected,
    isCalling,
    isMuted,
    isVideoEnabled,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    muteAudio,
    toggleVideo,
  };
}
