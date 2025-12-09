'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { livekitService } from '@/services/livekit';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Check if LiveKit is available
const LIVEKIT_AVAILABLE = (() => {
  try {
    require('@livekit/react-native');
    return true;
  } catch {
    return false;
  }
})();

interface VoiceMessage {
  id: string;
  content: string;
  timestamp: Date;
  isAI: boolean;
}

export default function LiveKitVoiceChat() {
  const router = useRouter();

  // State
  const [token, setToken] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiState, setAiState] = useState<'listening' | 'thinking' | 'speaking' | 'idle'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  // Initialize voice chat
  useEffect(() => {
    const initializeVoiceChat = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        // Generate room name and username
        const room = livekitService.createRoomName('ai-wellness');
        const username = livekitService.createUsername('student-001');

        // Get LiveKit token
        const tokenResponse = await livekitService.generateToken(room, username);

        if (!tokenResponse.success) {
          setError(tokenResponse.error || 'Failed to connect to voice chat');
          setIsConnecting(false);
          return;
        }

        setToken(tokenResponse.token);
        setUrl(tokenResponse.url);
        setRoomName(tokenResponse.room);
        setIsConnecting(false);
        
        // Simulate connection for demo mode if LiveKit not available
        if (!LIVEKIT_AVAILABLE) {
          setTimeout(() => {
            setIsConnected(true);
            setAiState('listening');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }, 1500);
        }
      } catch (err: any) {
        console.error('Error initializing voice chat:', err);
        setError(err.message || 'Failed to initialize voice chat');
        setIsConnecting(false);
      }
    };

    initializeVoiceChat();
  }, []);

  // Animation effects based on AI state
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (aiState === 'listening') {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else if (aiState === 'speaking') {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
    }

    return () => {
      if (animation) animation.stop();
    };
  }, [aiState, pulseAnim, waveAnim]);

  const handleToggleMute = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleToggleTranscript = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowTranscript(!showTranscript);
  }, [showTranscript]);

  const handleEndCall = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('End Voice Chat', 'Are you sure you want to end this conversation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Call',
        style: 'destructive',
        onPress: () => router.back(),
      },
    ]);
  }, [router]);

  // Demo mode: cycle through AI states
  const handleDemoStateChange = useCallback(() => {
    if (!LIVEKIT_AVAILABLE) {
      const states: Array<'listening' | 'thinking' | 'speaking' | 'idle'> = ['listening', 'thinking', 'speaking', 'idle'];
      const currentIndex = states.indexOf(aiState);
      const nextIndex = (currentIndex + 1) % states.length;
      setAiState(states[nextIndex]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [aiState]);

  // Loading screen
  if (isConnecting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Connecting to AI Wellness Assistant...</Text>
          <Text style={styles.loadingSubtext}>Setting up secure voice connection</Text>
          {!LIVEKIT_AVAILABLE && (
            <Text style={styles.demoModeText}>Demo Mode - LiveKit SDK not installed</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Error screen
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.errorTitle}>Connection Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Voice Chat with AI</Text>
          <Text style={styles.headerSubtitle}>Gemini Live Assistant</Text>
        </View>
        <View style={styles.headerButton} />
      </View>

      {/* Voice Chat Content */}
      <View style={styles.voiceContainer}>
        {/* Connection Status */}
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#34C759' : '#999' }]} />
          <Text style={styles.statusText}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </Text>
          {!LIVEKIT_AVAILABLE && (
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>DEMO</Text>
            </View>
          )}
        </View>

        {/* AI Visualizer */}
        <TouchableOpacity 
          style={styles.visualizerContainer} 
          onPress={handleDemoStateChange}
          activeOpacity={LIVEKIT_AVAILABLE ? 1 : 0.7}
        >
          {aiState === 'listening' && (
            <Animated.View style={[styles.stateIcon, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="mic-circle" size={120} color="#007AFF" />
              <Text style={styles.stateLabel}>Listening...</Text>
            </Animated.View>
          )}

          {aiState === 'thinking' && (
            <View style={styles.stateIcon}>
              <Ionicons name="bulb" size={100} color="#FF9500" />
              <Text style={styles.stateLabel}>Thinking...</Text>
            </View>
          )}

          {aiState === 'speaking' && (
            <Animated.View style={[styles.stateIcon, { opacity: Animated.add(0.5, Animated.multiply(waveAnim, 0.5)) }]}>
              <Ionicons name="volume-high" size={100} color="#34C759" />
              <Text style={styles.stateLabel}>Speaking...</Text>
            </Animated.View>
          )}

          {aiState === 'idle' && (
            <View style={styles.stateIcon}>
              <Ionicons name="chatbubbles" size={100} color="#666" />
              <Text style={styles.stateLabel}>Ready to chat</Text>
            </View>
          )}

          {!LIVEKIT_AVAILABLE && (
            <Text style={styles.tapHint}>Tap to simulate state changes</Text>
          )}
        </TouchableOpacity>

        {/* Transcript */}
        {showTranscript && (
          <View style={styles.transcriptContainer}>
            <View style={styles.transcriptHeader}>
              <Text style={styles.transcriptTitle}>Live Transcript</Text>
              <TouchableOpacity onPress={handleToggleTranscript}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.transcriptText}>
              {transcript || 'Waiting for speech...'}
            </Text>
          </View>
        )}

        {/* AI State Badge */}
        <View style={styles.stateIndicator}>
          <View style={[
            styles.stateBadge,
            aiState === 'listening' && styles.stateBadgeListening,
            aiState === 'thinking' && styles.stateBadgeThinking,
            aiState === 'speaking' && styles.stateBadgeSpeaking,
          ]}>
            <Text style={styles.stateBadgeText}>
              {aiState === 'listening' ? '👂 Listening' :
               aiState === 'thinking' ? '🧠 Thinking' :
               aiState === 'speaking' ? '🗣️ Speaking' : '😊 Ready'}
            </Text>
          </View>
        </View>
      </View>

      {/* Control Panel */}
      <View style={styles.controlPanel}>
        <View style={styles.mainControls}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={handleToggleMute}
          >
            <View style={[styles.controlIconBg, isMuted && styles.controlIconBgMuted]}>
              <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color="#fff" />
            </View>
            <Text style={styles.controlLabel}>{isMuted ? 'Muted' : 'Mic On'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={handleToggleTranscript}>
            <View style={[styles.controlIconBg, showTranscript && styles.controlIconBgActive]}>
              <Ionicons name="text" size={24} color="#fff" />
            </View>
            <Text style={styles.controlLabel}>Transcript</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={handleEndCall}>
            <View style={[styles.controlIconBg, styles.controlIconBgEnd]}>
              <Ionicons name="call" size={24} color="#fff" />
            </View>
            <Text style={styles.controlLabel}>End Call</Text>
          </TouchableOpacity>
        </View>

        {/* Room Info */}
        <View style={styles.roomInfo}>
          <Text style={styles.roomInfoText}>Room: {roomName || 'N/A'}</Text>
          <Text style={styles.roomInfoText}>Server: {url ? '✓ Connected' : 'Connecting...'}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  demoModeText: {
    fontSize: 12,
    color: '#FF9500',
    marginTop: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 15,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  errorButton: {
    marginTop: 24,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  voiceContainer: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#f9f9f9',
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  demoBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  demoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  visualizerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 40,
  },
  stateIcon: {
    alignItems: 'center',
  },
  stateLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
  },
  tapHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 24,
    fontStyle: 'italic',
  },
  transcriptContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    maxHeight: 120,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transcriptTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  transcriptText: {
    fontSize: 13,
    color: '#1a1a1a',
    lineHeight: 18,
  },
  stateIndicator: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  stateBadge: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  stateBadgeListening: {
    backgroundColor: '#E3F2FD',
  },
  stateBadgeThinking: {
    backgroundColor: '#FFF3E0',
  },
  stateBadgeSpeaking: {
    backgroundColor: '#E8F5E9',
  },
  stateBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  controlPanel: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlButton: {
    alignItems: 'center',
    gap: 8,
  },
  controlButtonActive: {
    opacity: 0.8,
  },
  controlIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIconBgMuted: {
    backgroundColor: '#999',
  },
  controlIconBgActive: {
    backgroundColor: '#34C759',
  },
  controlIconBgEnd: {
    backgroundColor: '#FF3B30',
  },
  controlLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  roomInfo: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 4,
  },
  roomInfoText: {
    fontSize: 11,
    color: '#999',
  },
});
