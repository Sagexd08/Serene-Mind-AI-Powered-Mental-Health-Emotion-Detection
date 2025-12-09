import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
  View,
  Linking,
  Modal,
  Switch,
} from 'react-native';
import geminiService from '@/services/gemini';
import livekitService, { HandoffResponse } from '@/services/livekit';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  actions?: ChatAction[];
}

interface ChatAction {
  label: string;
  action: string;
  icon?: string;
}

const QUICK_PROMPTS = [
  { label: 'Feeling anxious', icon: 'alert-circle', query: 'I\'m feeling anxious' },
  { label: 'Can\'t sleep', icon: 'moon', query: 'I\'m having trouble sleeping' },
  { label: 'Stressed', icon: 'school', query: 'I\'m stressed about exams' },
  { label: 'Talk to counselor', icon: 'person', query: 'I want to talk to a counselor' },
];

export default function Chatbot() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m here to support your mental wellness. How are you feeling today?',
      timestamp: new Date(),
      actions: [
        { label: '5-min breathing', action: 'breathing', icon: 'leaf' },
        { label: 'Take screening', action: 'screening', icon: 'clipboard' },
        { label: 'View resources', action: 'resources', icon: 'library' },
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [mode, setMode] = useState<'chat' | 'ai_live'>('chat');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [handoffLoading, setHandoffLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    ephemeral: true,
    transcribe: false,
    record: false,
  });
  const [handoffStatus, setHandoffStatus] = useState<HandoffResponse | null>(null);
  const [handoffReason, setHandoffReason] = useState('I want to talk to a human');

  useEffect(() => {
    // Reset AI history when chat opens
    geminiService.startChat();
    
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []); // Run only once on mount

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await geminiService.generateResponse(messageText);
      
      const botMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: response.message,
        timestamp: new Date(),
        actions: response.actions,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: "I'm having trouble connecting to my brain right now. Please check your connection.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (prompt: typeof QUICK_PROMPTS[0]) => {
    handleSend(prompt.query);
  };

  const handleAction = (action: string) => {
    console.log("Handling action:", action);
    switch (action) {
      case 'breathing':
        router.push('/screens/Resources');
        break;
      case 'screening':
        router.push('/screens/ScreeningModal');
        break;
      case 'resources':
        router.push('/screens/Resources');
        break;
      case 'activities':
        router.push('/screens/MyActivity');
        break;
      case 'escalate':
        Alert.alert(
          'Emergency Support',
          'Would you like to call the crisis helpline?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Call Now', 
              style: 'destructive',
              onPress: () => Linking.openURL('tel:9152987821') 
            }
          ]
        );
        break;
      default:
        // Fallback for unknown actions
        if (action.includes('resource')) {
            router.push('/screens/Resources');
        } else {
            console.warn("Unknown action:", action);
        }
    }
  };

  const openLiveJoin = () => {
    setMode('ai_live');
    setShowJoinModal(true);
  };

  const openHumanHandoff = () => {
    setShowHandoffModal(true);
  };

  const joinLiveSession = async () => {
    setJoinLoading(true);
    try {
      const response = await livekitService.joinSession({
        roomType: 'ai_live',
        sessionPreferences: preferences,
      });
      if (!response.success) throw new Error(response.error || 'Unable to join');

      setShowJoinModal(false);
      router.push({
        pathname: '/screens/LiveKitVoiceChat',
        params: {
          token: response.livekitToken,
          url: response.url,
          roomName: response.roomName,
        },
      });
    } catch (err: any) {
      Alert.alert('Live session error', err.message || 'Could not start live session');
    } finally {
      setJoinLoading(false);
    }
  };

  const requestHandoff = async (preferredMode: 'immediate' | 'schedule' | 'callback') => {
    setHandoffLoading(true);
    try {
      const resp = await livekitService.requestHandoff({
        reason: handoffReason,
        preferredMode,
        includeTranscript: false,
      });
      setHandoffStatus(resp);
      if (!resp.handoffId) throw new Error(resp.error || 'Failed to create handoff');
    } catch (err: any) {
      Alert.alert('Handoff error', err.message || 'Could not start human handoff');
    } finally {
      setHandoffLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>AI Wellness Assistant</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={openLiveJoin} style={styles.voiceButton}>
            <Ionicons name="mic-circle" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={openHumanHandoff}>
            <Ionicons name="person" size={24} color="#d97706" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeChip, mode === 'ai_live' && styles.modeChipActive]}
          onPress={openLiveJoin}
        >
          <Text style={[styles.modeChipText, mode === 'ai_live' && styles.modeChipTextActive]}>Talk to AI Live</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeChip, mode === 'chat' && styles.modeChipActive]}
          onPress={() => setMode('chat')}
        >
          <Text style={[styles.modeChipText, mode === 'chat' && styles.modeChipTextActive]}>Continue in Chatbot</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modeChip}
          onPress={openHumanHandoff}
        >
          <Text style={styles.modeChipText}>Talk to Human</Text>
        </TouchableOpacity>
      </View>

      {messages.length === 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickPromptsScroll}
          contentContainerStyle={styles.quickPromptsContainer}
        >
          {QUICK_PROMPTS.map((prompt, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.quickPromptChip}
              onPress={() => handleQuickPrompt(prompt)}
            >
              <Ionicons name={prompt.icon as any} size={18} color="#007AFF" />
              <Text style={styles.quickPromptText}>{prompt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onAction={handleAction}
          />
        ))}

        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <View style={styles.typingDot} />
              <View style={[styles.typingDot, { marginLeft: 8 }]} />
              <View style={[styles.typingDot, { marginLeft: 8 }]} />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? '#fff' : '#ccc'}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.disclaimer}>
          For urgent help, contact emergency services.
        </Text>
      </View>

      {/* Live session join modal */}
      <Modal visible={showJoinModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Join Live AI Session</Text>
            <Text style={styles.modalSub}>Mic & camera stay off until you enable them. Recording and transcription are off unless you opt in.</Text>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Ephemeral mode (no transcript saved)</Text>
              <Switch
                value={preferences.ephemeral}
                onValueChange={(val) => setPreferences((p) => ({ ...p, ephemeral: val }))}
              />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Enable captions/transcription</Text>
              <Switch
                value={preferences.transcribe}
                onValueChange={(val) => setPreferences((p) => ({ ...p, transcribe: val }))}
              />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Allow recording</Text>
              <Switch
                value={preferences.record}
                onValueChange={(val) => setPreferences((p) => ({ ...p, record: val }))}
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowJoinModal(false)} disabled={joinLoading}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimary} onPress={joinLiveSession} disabled={joinLoading}>
                <Text style={styles.modalPrimaryText}>{joinLoading ? 'Joining...' : 'Join Live Session'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Human handoff modal */}
      <Modal visible={showHandoffModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Talk to a Human</Text>
            <Text style={styles.modalSub}>We can connect you to a counselor or schedule a time. Your transcript is not shared unless you consent later.</Text>
            <View style={{ gap: 8, marginTop: 12 }}>
              <TouchableOpacity style={styles.modalPrimary} onPress={() => requestHandoff('immediate')} disabled={handoffLoading}>
                <Text style={styles.modalPrimaryText}>{handoffLoading ? 'Connecting...' : 'Connect now'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSecondary} onPress={() => requestHandoff('schedule')} disabled={handoffLoading}>
                <Text style={styles.modalSecondaryText}>Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSecondary} onPress={() => requestHandoff('callback')} disabled={handoffLoading}>
                <Text style={styles.modalSecondaryText}>Request callback</Text>
              </TouchableOpacity>
            </View>
            {handoffStatus && (
              <View style={styles.handoffStatusBox}>
                <Text style={styles.handoffStatusTitle}>Status: {handoffStatus.status}</Text>
                {handoffStatus.estimatedWait ? (
                  <Text style={styles.handoffStatusSub}>Estimated wait: ~{handoffStatus.estimatedWait} seconds</Text>
                ) : null}
              </View>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowHandoffModal(false)} disabled={handoffLoading}>
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message, onAction }: { message: Message; onAction: (action: string) => void }) {
  const isUser = message.type === 'user';

  return (
    <View style={[styles.messageBubbleContainer, isUser && styles.messageBubbleContainerUser]}>
      {!isUser && (
        <View style={styles.botAvatar}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#007AFF" />
        </View>
      )}

      <View style={[styles.messageBubble, isUser && styles.messageBubbleUser]}>
        <Text style={[styles.messageText, isUser && styles.messageTextUser]}>
          {message.content}
        </Text>

        {message.actions && message.actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {message.actions.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.actionButton}
                onPress={() => onAction(action.action)}
              >
                {action.icon && (
                  <Ionicons name={action.icon as any} size={16} color="#007AFF" />
                )}
                <Text style={styles.actionButtonText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={[styles.timestamp, isUser && styles.timestampUser]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

// Removed static generateBotResponse function

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 13,
    color: '#34C759',
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 8,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
  },
  modeChipActive: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  modeChipText: {
    color: '#1e3a8a',
    fontWeight: '600',
    fontSize: 14,
  },
  modeChipTextActive: {
    color: '#0b63f6',
  },
  quickPromptsScroll: {
    maxHeight: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  quickPromptsContainer: {
    padding: 12,
    gap: 8,
  },
  quickPromptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  quickPromptText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageBubbleContainerUser: {
    flexDirection: 'row-reverse',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    elevation: 2,
  },
  messageBubbleUser: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  messageText: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22,
  },
  messageTextUser: {
    color: '#fff',
  },
  actionsContainer: {
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
  },
  timestampUser: {
    color: 'rgba(255,255,255,0.7)',
  },
  typingContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    paddingHorizontal: 16,
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 12,
    paddingBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  disclaimer: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalSub: {
    fontSize: 14,
    color: '#4b5563',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
    paddingRight: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  modalCancelText: {
    color: '#111827',
    fontWeight: '600',
  },
  modalPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  modalPrimaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  modalSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
  },
  modalSecondaryText: {
    color: '#3730a3',
    fontWeight: '600',
  },
  handoffStatusBox: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  handoffStatusTitle: {
    fontWeight: '700',
    color: '#111827',
  },
  handoffStatusSub: {
    color: '#4b5563',
    marginTop: 4,
  },
  voiceButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
