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
} from 'react-native';

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

    setTimeout(() => {
      const botResponse = generateBotResponse(messageText);
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickPrompt = (prompt: typeof QUICK_PROMPTS[0]) => {
    handleSend(prompt.query);
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'breathing':
        Alert.alert('Breathing Exercise', 'Starting 5-minute breathing exercise...');
        break;
      case 'screening':
        Alert.alert('Screening', 'Opening PHQ-9 screening form...');
        break;
      case 'resources':
        Alert.alert('Resources', 'Opening wellness resources...');
        break;
      case 'escalate':
        Alert.alert(
          'Connect with Counselor',
          'A counselor will contact you within 24 hours.'
        );
        break;
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
        <TouchableOpacity>
          <Ionicons name="information-circle-outline" size={24} color="#666" />
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

function generateBotResponse(userMessage: string): Message {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety')) {
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: 'I understand you\'re feeling anxious. That\'s a common experience. Would you like to try a breathing exercise or talk to a counselor?',
      timestamp: new Date(),
      actions: [
        { label: 'Start breathing', action: 'breathing', icon: 'leaf' },
        { label: 'Talk to counselor', action: 'escalate', icon: 'person' },
      ],
    };
  }

  if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia')) {
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: 'Sleep difficulties can affect your wellbeing. I can suggest sleep resources. What would help?',
      timestamp: new Date(),
      actions: [
        { label: 'Sleep resources', action: 'resources', icon: 'moon' },
        { label: 'Screening', action: 'screening', icon: 'clipboard' },
      ],
    };
  }

  if (lowerMessage.includes('counselor') || lowerMessage.includes('therapist')) {
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: 'I can help you connect with a professional counselor. Would you like to proceed?',
      timestamp: new Date(),
      actions: [
        { label: 'Yes, connect me', action: 'escalate', icon: 'checkmark' },
      ],
    };
  }

  if (lowerMessage.includes('stressed') || lowerMessage.includes('stress')) {
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: 'Stress is common. Would you like immediate relief techniques or long-term resources?',
      timestamp: new Date(),
      actions: [
        { label: 'Quick relief', action: 'breathing', icon: 'flash' },
        { label: 'Resources', action: 'resources', icon: 'library' },
      ],
    };
  }

  return {
    id: Date.now().toString(),
    type: 'bot',
    content: 'Thank you for sharing. I\'m here to help. Can you tell me more about what you\'re experiencing?',
    timestamp: new Date(),
    actions: [
      { label: 'Take screening', action: 'screening', icon: 'clipboard' },
      { label: 'View resources', action: 'resources', icon: 'library' },
    ],
  };
}

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
});
