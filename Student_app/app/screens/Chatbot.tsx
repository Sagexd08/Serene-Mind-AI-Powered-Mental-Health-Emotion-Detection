import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';
import { chatService, Counselor as CounselorType } from '@/services/chatService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Types
interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  actions?: ChatAction[];
  mood?: MoodType;
  isVoiceMessage?: boolean;
}

interface ChatAction {
  label: string;
  action: string;
  icon?: string;
  color?: string;
}

type MoodType = 'happy' | 'calm' | 'anxious' | 'sad' | 'stressed' | 'neutral';

type ChatMode = 'ai' | 'human';

interface MoodOption {
  type: MoodType;
  emoji: string;
  label: string;
  color: string;
}

// Constants
const MOOD_OPTIONS: MoodOption[] = [
  { type: 'happy', emoji: '😊', label: 'Happy', color: '#4CAF50' },
  { type: 'calm', emoji: '😌', label: 'Calm', color: '#2196F3' },
  { type: 'neutral', emoji: '😐', label: 'Neutral', color: '#9E9E9E' },
  { type: 'anxious', emoji: '😰', label: 'Anxious', color: '#FF9800' },
  { type: 'stressed', emoji: '😤', label: 'Stressed', color: '#F44336' },
  { type: 'sad', emoji: '😢', label: 'Sad', color: '#673AB7' },
];

const QUICK_PROMPTS = [
  { label: 'Feeling anxious', icon: 'alert-circle', query: "I'm feeling anxious", color: '#FF9800' },
  { label: "Can't sleep", icon: 'moon', query: "I'm having trouble sleeping", color: '#673AB7' },
  { label: 'Stressed', icon: 'school', query: "I'm stressed about exams", color: '#F44336' },
  { label: 'Need to talk', icon: 'person', query: 'I want to talk to a counselor', color: '#2196F3' },
  { label: 'Feeling down', icon: 'sad', query: "I'm feeling down today", color: '#9C27B0' },
  { label: 'Breathing exercise', icon: 'leaf', query: 'Guide me through breathing', color: '#4CAF50' },
];

const WELLNESS_TIPS = [
  "Remember: It's okay to take breaks. Your mental health matters.",
  "Try the 5-4-3-2-1 grounding technique when feeling overwhelmed.",
  "Drinking water and taking deep breaths can help reduce anxiety.",
  "You're not alone. Many students experience similar challenges.",
  "Small steps lead to big changes. Celebrate your progress!",
];

export default function Chatbot() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentMood, setCurrentMood] = useState<MoodType | null>(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showChatModeSelector, setShowChatModeSelector] = useState(true);
  const [chatMode, setChatMode] = useState<ChatMode>('ai');
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [humanChatStatus, setHumanChatStatus] = useState<'waiting' | 'connected' | 'offline'>('offline');
  const [counselorName, setCounselorName] = useState<string | null>(null);
  const [showSwitchModeModal, setShowSwitchModeModal] = useState(false);
  
  // Animations
  const recordingAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Initialize chat
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Recording animation
  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnim, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isRecording]);

  // Handle chat mode selection
  const handleChatModeSelect = useCallback((mode: ChatMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setChatMode(mode);
    setShowChatModeSelector(false);
    
    if (mode === 'ai') {
      setShowMoodPicker(true);
    } else {
      // Human chat mode
      setHumanChatStatus('waiting');
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: '🔄 Connecting you to a counselor... Please wait.',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      
      // Simulate connection (in production, this would be a real WebSocket connection)
      setTimeout(() => {
        setHumanChatStatus('connected');
        setCounselorName('Dr. Sarah Johnson');
        const connectedMessage: Message = {
          id: `connected-${Date.now()}`,
          type: 'bot',
          content: "Hello! I'm Dr. Sarah Johnson, your wellness counselor. 👋\n\nI'm here to listen and support you. Everything you share is confidential.\n\nHow can I help you today?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, connectedMessage]);
      }, 2000);
    }
  }, []);

  // Switch chat mode
  const handleSwitchMode = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowSwitchModeModal(true);
  }, []);

  const confirmSwitchMode = useCallback((newMode: ChatMode) => {
    setShowSwitchModeModal(false);
    setChatMode(newMode);
    setMessages([]);
    
    if (newMode === 'ai') {
      setHumanChatStatus('offline');
      setCounselorName(null);
      setShowMoodPicker(true);
    } else {
      setHumanChatStatus('waiting');
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: '🔄 Connecting you to a counselor... Please wait.',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      
      setTimeout(() => {
        setHumanChatStatus('connected');
        setCounselorName('Dr. Sarah Johnson');
        const connectedMessage: Message = {
          id: `connected-${Date.now()}`,
          type: 'bot',
          content: "Hello! I'm Dr. Sarah Johnson, your wellness counselor. 👋\n\nI'm here to listen and support you. Everything you share is confidential.\n\nHow can I help you today?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, connectedMessage]);
      }, 2000);
    }
  }, []);

  // Handle mood selection
  const handleMoodSelect = useCallback((mood: MoodType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentMood(mood);
    setShowMoodPicker(false);
    
    const moodMessages: Record<MoodType, string> = {
      happy: "That's wonderful! 😊 I'm glad you're feeling good. Is there anything you'd like to share or explore today?",
      calm: "It's great that you're feeling calm. 😌 Would you like to maintain this feeling with a mindfulness exercise?",
      neutral: "Thanks for checking in. How can I support you today? Feel free to share what's on your mind.",
      anxious: "I understand you're feeling anxious. 😰 That's okay - let's work through this together. Would you like to try a calming technique?",
      stressed: "I hear that you're stressed. 😤 You're not alone in this. Let's find some ways to help you feel better.",
      sad: "I'm sorry you're feeling sad. 😢 I'm here to listen and support you. Would you like to talk about it?",
    };

    const moodActions: Record<MoodType, ChatAction[]> = {
      happy: [
        { label: 'Share gratitude', action: 'gratitude', icon: 'heart', color: '#E91E63' },
        { label: 'Set a goal', action: 'goal', icon: 'flag', color: '#4CAF50' },
      ],
      calm: [
        { label: 'Meditation', action: 'meditation', icon: 'leaf', color: '#4CAF50' },
        { label: 'Journal', action: 'journal', icon: 'book', color: '#2196F3' },
      ],
      neutral: [
        { label: 'Check-in quiz', action: 'screening', icon: 'clipboard', color: '#9C27B0' },
        { label: 'Explore resources', action: 'resources', icon: 'library', color: '#FF9800' },
      ],
      anxious: [
        { label: '🫁 Breathing exercise', action: 'breathing', icon: 'leaf', color: '#4CAF50' },
        { label: 'Grounding technique', action: 'grounding', icon: 'earth', color: '#795548' },
        { label: 'Talk to someone', action: 'escalate', icon: 'person', color: '#2196F3' },
      ],
      stressed: [
        { label: 'Quick relaxation', action: 'breathing', icon: 'flash', color: '#FF9800' },
        { label: 'Break timer', action: 'break', icon: 'timer', color: '#9C27B0' },
        { label: 'Talk to counselor', action: 'escalate', icon: 'person', color: '#2196F3' },
      ],
      sad: [
        { label: 'Supportive resources', action: 'resources', icon: 'heart', color: '#E91E63' },
        { label: 'Connect with counselor', action: 'escalate', icon: 'person', color: '#2196F3' },
        { label: 'Self-care tips', action: 'selfcare', icon: 'sunny', color: '#FFC107' },
      ],
    };

    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: moodMessages[mood],
      timestamp: new Date(),
      actions: moodActions[mood],
      mood: mood,
    };

    setMessages([welcomeMessage]);
  }, []);

  // Send message
  const handleSend = useCallback(async (text?: string, isVoice = false) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date(),
      isVoiceMessage: isVoice,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setMessageCount((prev) => prev + 1);
    setIsTyping(true);

    // Check for crisis keywords
    if (checkForCrisis(messageText)) {
      setShowEmergencyModal(true);
    }

    if (chatMode === 'ai') {
      // AI response
      const delay = 1000 + Math.random() * 1500;
      setTimeout(() => {
        const botResponse = generateEnhancedBotResponse(messageText, currentMood);
        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
        
        // Periodic wellness tips
        if (messageCount > 0 && messageCount % 5 === 0) {
          setTimeout(() => {
            const tipMessage: Message = {
              id: `tip-${Date.now()}`,
              type: 'system',
              content: `💡 Tip: ${WELLNESS_TIPS[Math.floor(Math.random() * WELLNESS_TIPS.length)]}`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, tipMessage]);
          }, 1000);
        }
      }, delay);
    } else {
      // Human counselor response (simulated - in production this would use WebSocket)
      const delay = 2000 + Math.random() * 3000;
      setTimeout(() => {
        const humanResponses = [
          "I hear you. That sounds like it's been really challenging. Can you tell me more about when you started feeling this way?",
          "Thank you for sharing that with me. It takes courage to open up. What do you think triggered these feelings?",
          "I understand. Many students go through similar experiences. Let's work through this together. What would help you feel better right now?",
          "That's a valid concern. Let's explore some coping strategies that might work for you. Have you tried any before?",
          "I appreciate you trusting me with this. Your feelings are completely valid. What support do you feel you need most right now?",
        ];
        
        const botResponse: Message = {
          id: Date.now().toString(),
          type: 'bot',
          content: humanResponses[Math.floor(Math.random() * humanResponses.length)],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
      }, delay);
    }
  }, [inputText, currentMood, messageCount, chatMode]);

  // Voice recording
  const handleVoicePress = useCallback(async () => {
    if (isRecording) {
      setIsRecording(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Voice Message',
        'Voice recording feature requires expo-av package. Install it with:\n\npnpm add expo-av',
        [{ text: 'OK' }]
      );
    } else {
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Vibration.vibrate(50);
    }
  }, [isRecording]);

  // Handle actions
  const handleAction = useCallback((action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    switch (action) {
      case 'breathing':
        setShowBreathingExercise(true);
        break;
      case 'grounding':
        Alert.alert(
          '5-4-3-2-1 Grounding',
          'Look around and find:\n\n👁️ 5 things you can SEE\n✋ 4 things you can TOUCH\n👂 3 things you can HEAR\n👃 2 things you can SMELL\n👅 1 thing you can TASTE\n\nTake your time with each one.',
          [{ text: 'Got it!' }]
        );
        break;
      case 'screening':
        router.push('/screens/MentalHealthScreening' as any);
        break;
      case 'resources':
        Alert.alert(
          'Wellness Resources',
          '📚 Available Resources:\n\n• Meditation guides\n• Sleep hygiene tips\n• Stress management\n• Academic support\n• Peer support groups',
          [{ text: 'OK' }]
        );
        break;
      case 'escalate':
        Alert.alert(
          'Connect with Counselor',
          'Would you like to schedule a session with a professional counselor?\n\nYour conversation summary will be shared to help them understand your situation better.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Yes, connect me',
              onPress: () => Alert.alert('Request Sent', 'A counselor will contact you within 24 hours. Stay strong! 💪'),
            },
          ]
        );
        break;
      case 'meditation':
        Alert.alert('Guided Meditation', 'Starting 5-minute guided meditation...');
        break;
      case 'journal':
        Alert.alert('Journal', 'Opening wellness journal...');
        break;
      case 'gratitude':
        const gratitudeMessage: Message = {
          id: Date.now().toString(),
          type: 'bot',
          content: "Let's practice gratitude! 🙏 Can you share 3 things you're grateful for today, no matter how small?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, gratitudeMessage]);
        break;
      case 'selfcare':
        const tips = ['🌅 Get some sunlight', '💧 Stay hydrated', '🚶 Take a short walk', '📵 Social media break', '🎵 Listen to music', '💤 Prioritize sleep'];
        const tipMessage: Message = {
          id: Date.now().toString(),
          type: 'bot',
          content: `Here are some self-care ideas:\n\n${tips.join('\n')}\n\nWhich one would you like to try?`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, tipMessage]);
        break;
      case 'break':
        Alert.alert('Break Timer', "Choose duration:", [
          { text: '5 min', onPress: () => Alert.alert('Timer Set', "I'll remind you in 5 minutes!") },
          { text: '15 min', onPress: () => Alert.alert('Timer Set', "I'll remind you in 15 minutes!") },
          { text: '30 min', onPress: () => Alert.alert('Timer Set', "I'll remind you in 30 minutes!") },
        ]);
        break;
      case 'goal':
        const goalMessage: Message = {
          id: Date.now().toString(),
          type: 'bot',
          content: "Setting goals can boost your mood! 🎯\n\nWhat's one small, achievable goal you'd like to accomplish today?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, goalMessage]);
        break;
      default:
        Alert.alert('Feature', `${action} feature coming soon!`);
    }
  }, [router]);

  // Breathing Exercise Modal
  const BreathingExercise = () => {
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [count, setCount] = useState(4);
    const [cycles, setCycles] = useState(0);
    const breathScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      const phases = {
        inhale: { next: 'hold' as const, duration: 4000, scale: 1.5 },
        hold: { next: 'exhale' as const, duration: 4000, scale: 1.5 },
        exhale: { next: 'inhale' as const, duration: 6000, scale: 1 },
      };

      const currentPhase = phases[phase];
      
      Animated.timing(breathScale, {
        toValue: currentPhase.scale,
        duration: currentPhase.duration,
        useNativeDriver: true,
      }).start();

      const countInterval = setInterval(() => {
        setCount((prev) => {
          if (prev <= 1) {
            if (phase === 'exhale') setCycles((c) => c + 1);
            setPhase(currentPhase.next);
            return phase === 'exhale' ? 4 : phase === 'inhale' ? 4 : 6;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countInterval);
    }, [phase]);

    return (
      <Modal visible={showBreathingExercise} animationType="fade" transparent onRequestClose={() => setShowBreathingExercise(false)}>
        <View style={styles.breathingOverlay}>
          <View style={styles.breathingContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => { setShowBreathingExercise(false); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>

            <Text style={styles.breathingTitle}>Breathing Exercise</Text>
            <Text style={styles.breathingSubtitle}>4-4-6 Technique</Text>

            <Animated.View style={[styles.breathingCircle, { transform: [{ scale: breathScale }] }]}>
              <Text style={styles.breathingPhase}>
                {phase === 'inhale' ? 'Breathe In' : phase === 'hold' ? 'Hold' : 'Breathe Out'}
              </Text>
              <Text style={styles.breathingCount}>{count}</Text>
            </Animated.View>

            <Text style={styles.cyclesText}>Cycles completed: {cycles}</Text>

            <View style={styles.breathingInstructions}>
              <Text style={styles.instructionText}>🫁 Inhale slowly through your nose for 4 seconds</Text>
              <Text style={styles.instructionText}>⏸️ Hold your breath for 4 seconds</Text>
              <Text style={styles.instructionText}>💨 Exhale slowly through your mouth for 6 seconds</Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Emergency Modal
  const EmergencyModal = () => (
    <Modal visible={showEmergencyModal} animationType="slide" transparent onRequestClose={() => setShowEmergencyModal(false)}>
      <View style={styles.emergencyOverlay}>
        <View style={styles.emergencyContainer}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="heart" size={40} color="#E91E63" />
            <Text style={styles.emergencyTitle}>We're Here For You</Text>
          </View>

          <Text style={styles.emergencyText}>
            It sounds like you might be going through a difficult time. You're not alone, and help is available.
          </Text>

          <View style={styles.emergencyActions}>
            <TouchableOpacity style={[styles.emergencyButton, { backgroundColor: '#E91E63' }]} onPress={() => { Alert.alert('Crisis Line', 'Connecting to crisis helpline...'); setShowEmergencyModal(false); }}>
              <Ionicons name="call" size={24} color="#fff" />
              <Text style={styles.emergencyButtonText}>Crisis Helpline</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.emergencyButton, { backgroundColor: '#2196F3' }]} onPress={() => { Alert.alert('Counselor', 'A counselor will contact you within 1 hour.'); setShowEmergencyModal(false); }}>
              <Ionicons name="person" size={24} color="#fff" />
              <Text style={styles.emergencyButtonText}>Talk to Counselor</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.emergencyButton, { backgroundColor: '#4CAF50' }]} onPress={() => setShowEmergencyModal(false)}>
              <Ionicons name="chatbubbles" size={24} color="#fff" />
              <Text style={styles.emergencyButtonText}>Continue Chatting</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.emergencyFooter}>🆘 Emergency: Call 911 or your local emergency number</Text>
        </View>
      </View>
    </Modal>
  );

  // Switch Mode Modal
  const SwitchModeModal = () => (
    <Modal visible={showSwitchModeModal} animationType="fade" transparent onRequestClose={() => setShowSwitchModeModal(false)}>
      <View style={styles.switchModeOverlay}>
        <View style={styles.switchModeContainer}>
          <Text style={styles.switchModeTitle}>Switch Chat Mode</Text>
          <Text style={styles.switchModeSubtitle}>
            {chatMode === 'ai' 
              ? 'Would you like to talk to a real counselor instead?' 
              : 'Would you like to switch to AI assistant?'}
          </Text>

          <View style={styles.switchModeOptions}>
            <TouchableOpacity 
              style={[styles.switchModeOption, chatMode === 'ai' && styles.switchModeOptionActive]}
              onPress={() => confirmSwitchMode('ai')}
            >
              <View style={[styles.switchModeIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="hardware-chip" size={32} color="#2196F3" />
              </View>
              <Text style={styles.switchModeOptionTitle}>AI Assistant</Text>
              <Text style={styles.switchModeOptionDesc}>Instant responses, 24/7</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.switchModeOption, chatMode === 'human' && styles.switchModeOptionActive]}
              onPress={() => confirmSwitchMode('human')}
            >
              <View style={[styles.switchModeIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="person" size={32} color="#4CAF50" />
              </View>
              <Text style={styles.switchModeOptionTitle}>Human Counselor</Text>
              <Text style={styles.switchModeOptionDesc}>Professional support</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.switchModeCancelButton} onPress={() => setShowSwitchModeModal(false)}>
            <Text style={styles.switchModeCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Chat Mode Selector Screen
  if (showChatModeSelector) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Wellness Support</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Choose your support</Text>
            </View>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <Animated.View style={[styles.chatModeSelectorContainer, { opacity: fadeAnim }]}>
          <View style={styles.chatModeSelectorHeader}>
            <Text style={styles.chatModeSelectorTitle}>How would you like to chat?</Text>
            <Text style={styles.chatModeSelectorSubtitle}>Choose the type of support that works best for you</Text>
          </View>

          <View style={styles.chatModeCards}>
            {/* AI Chat Option */}
            <TouchableOpacity 
              style={styles.chatModeCard}
              onPress={() => handleChatModeSelect('ai')}
            >
              <View style={[styles.chatModeIconWrapper, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="hardware-chip" size={48} color="#2196F3" />
              </View>
              <Text style={styles.chatModeCardTitle}>Talk to AI</Text>
              <Text style={styles.chatModeCardDesc}>
                Get instant support from our AI wellness assistant. Available 24/7 with immediate responses.
              </Text>
              <View style={styles.chatModeFeatures}>
                <View style={styles.chatModeFeature}>
                  <Ionicons name="flash" size={16} color="#2196F3" />
                  <Text style={styles.chatModeFeatureText}>Instant responses</Text>
                </View>
                <View style={styles.chatModeFeature}>
                  <Ionicons name="time" size={16} color="#2196F3" />
                  <Text style={styles.chatModeFeatureText}>Available 24/7</Text>
                </View>
                <View style={styles.chatModeFeature}>
                  <Ionicons name="leaf" size={16} color="#2196F3" />
                  <Text style={styles.chatModeFeatureText}>Guided exercises</Text>
                </View>
              </View>
              <View style={[styles.chatModeButton, { backgroundColor: '#2196F3' }]}>
                <Text style={styles.chatModeButtonText}>Start AI Chat</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </View>
            </TouchableOpacity>

            {/* Human Chat Option */}
            <TouchableOpacity 
              style={styles.chatModeCard}
              onPress={() => handleChatModeSelect('human')}
            >
              <View style={[styles.chatModeIconWrapper, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="person" size={48} color="#4CAF50" />
              </View>
              <Text style={styles.chatModeCardTitle}>Talk to Human</Text>
              <Text style={styles.chatModeCardDesc}>
                Connect with a professional counselor for personalized support and guidance.
              </Text>
              <View style={styles.chatModeFeatures}>
                <View style={styles.chatModeFeature}>
                  <Ionicons name="heart" size={16} color="#4CAF50" />
                  <Text style={styles.chatModeFeatureText}>Empathetic support</Text>
                </View>
                <View style={styles.chatModeFeature}>
                  <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
                  <Text style={styles.chatModeFeatureText}>Confidential</Text>
                </View>
                <View style={styles.chatModeFeature}>
                  <Ionicons name="school" size={16} color="#4CAF50" />
                  <Text style={styles.chatModeFeatureText}>Professional guidance</Text>
                </View>
              </View>
              <View style={[styles.chatModeButton, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.chatModeButtonText}>Connect Now</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  }

  // Mood Picker Screen
  if (showMoodPicker) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowChatModeSelector(true)}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>AI Wellness Assistant</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Ready to help</Text>
            </View>
          </View>
          <View style={{ width: 24 }} />
        </View>
        
        <Animated.View style={[styles.moodPickerContainer, { opacity: fadeAnim }]}>
          <View style={styles.moodPickerHeader}>
            <Text style={styles.moodPickerTitle}>How are you feeling today?</Text>
            <Text style={styles.moodPickerSubtitle}>This helps me provide better support for you</Text>
          </View>

          <View style={styles.moodGrid}>
            {MOOD_OPTIONS.map((mood) => (
              <TouchableOpacity key={mood.type} style={[styles.moodOption, { borderColor: mood.color }]} onPress={() => handleMoodSelect(mood.type)}>
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[styles.moodLabel, { color: mood.color }]}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.skipButton} onPress={() => { setShowMoodPicker(false); handleMoodSelect('neutral'); }}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // Main Chat Screen
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>
              {chatMode === 'ai' ? 'AI Wellness Assistant' : counselorInfo?.name || 'Counselor'}
            </Text>
            <View style={[styles.modeBadge, chatMode === 'human' ? styles.modeBadgeHuman : styles.modeBadgeAI]}>
              <Ionicons name={chatMode === 'ai' ? 'flash' : 'person'} size={10} color="#fff" />
              <Text style={styles.modeBadgeText}>{chatMode === 'ai' ? 'AI' : 'Human'}</Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, chatMode === 'human' && isWaitingForCounselor && styles.statusDotWaiting]} />
            <Text style={styles.statusText}>
              {chatMode === 'ai' 
                ? 'Online' 
                : isWaitingForCounselor 
                  ? 'Connecting...' 
                  : counselorInfo?.available 
                    ? 'Available' 
                    : 'Away'}
            </Text>
            {currentMood && (
              <View style={styles.currentMoodBadge}>
                <Text>{MOOD_OPTIONS.find((m) => m.type === currentMood)?.emoji}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowSwitchModeModal(true)} style={styles.switchModeButton}>
            <Ionicons name="swap-horizontal" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowMoodPicker(true)}>
            <Ionicons name="happy-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickPromptsScroll} contentContainerStyle={styles.quickPromptsContainer}>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <TouchableOpacity key={idx} style={[styles.quickPromptChip, { borderColor: prompt.color }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleSend(prompt.query); }}>
              <Ionicons name={prompt.icon as any} size={18} color={prompt.color} />
              <Text style={[styles.quickPromptText, { color: prompt.color }]}>{prompt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Messages */}
      <ScrollView ref={scrollViewRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false}>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} onAction={handleAction} />
        ))}

        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.botAvatar}>
              <Ionicons name="chatbubble-ellipses" size={16} color="#007AFF" />
            </View>
            <View style={styles.typingBubble}>
              <TypingIndicator />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input area */}
      <View style={styles.inputContainer}>
        {/* Waiting for counselor indicator */}
        {chatMode === 'human' && isWaitingForCounselor && (
          <View style={styles.waitingBanner}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.waitingText}>Connecting you to a counselor...</Text>
          </View>
        )}
        
        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.attachButton} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Attachments', 'You can share images or files with your counselor.'); }}>
            <Ionicons name="add-circle-outline" size={26} color="#666" />
          </TouchableOpacity>

          <TextInput 
            ref={inputRef} 
            style={styles.input} 
            placeholder={chatMode === 'ai' ? "Ask me anything..." : "Message your counselor..."} 
            value={inputText} 
            onChangeText={setInputText} 
            multiline 
            maxLength={500} 
            placeholderTextColor="#999" 
            onSubmitEditing={() => handleSend()} 
            editable={!(chatMode === 'human' && isWaitingForCounselor)}
          />

          {inputText.trim() ? (
            <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()} disabled={chatMode === 'human' && isWaitingForCounselor}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <Animated.View style={{ transform: [{ scale: recordingAnim }] }}>
              <TouchableOpacity style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]} onPress={handleVoicePress}>
                <Ionicons name={isRecording ? 'stop' : 'mic'} size={22} color={isRecording ? '#fff' : '#007AFF'} />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <View style={styles.inputFooter}>
          <Text style={styles.disclaimer}>🔒 Your conversations are confidential</Text>
          <TouchableOpacity onPress={() => setShowEmergencyModal(true)}>
            <Text style={styles.emergencyLink}>Need urgent help?</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modals */}
      <BreathingExercise />
      <EmergencyModal />
      <ChatModeSelector />
      <SwitchModeModal />
    </KeyboardAvoidingView>
  );
}

// Message Bubble Component
function MessageBubble({ message, onAction }: { message: Message; onAction: (action: string) => void }) {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  if (isSystem) {
    return (
      <View style={styles.systemMessageContainer}>
        <Text style={styles.systemMessageText}>{message.content}</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.messageBubbleContainer, isUser && styles.messageBubbleContainerUser]}>
      {!isUser && (
        <View style={styles.botAvatar}>
          <Ionicons name="chatbubble-ellipses" size={16} color="#007AFF" />
        </View>
      )}

      <View style={[styles.messageBubble, isUser && styles.messageBubbleUser]}>
        {message.isVoiceMessage && (
          <View style={styles.voiceMessageBadge}>
            <Ionicons name="mic" size={12} color={isUser ? '#fff' : '#007AFF'} />
            <Text style={[styles.voiceMessageText, isUser && { color: '#fff' }]}>Voice message</Text>
          </View>
        )}

        <Text style={[styles.messageText, isUser && styles.messageTextUser]}>{message.content}</Text>

        {message.actions && message.actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {message.actions.map((action, idx) => (
              <TouchableOpacity key={idx} style={[styles.actionButton, action.color && { borderColor: action.color }]} onPress={() => onAction(action.action)}>
                {action.icon && <Ionicons name={action.icon as any} size={16} color={action.color || '#007AFF'} />}
                <Text style={[styles.actionButtonText, action.color && { color: action.color }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={[styles.timestamp, isUser && styles.timestampUser]}>{formatTime(message.timestamp)}</Text>
      </View>
    </Animated.View>
  );
}

// Typing Indicator Component
function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -5, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={styles.typingDots}>
      <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot1 }] }]} />
      <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot2 }] }]} />
      <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot3 }] }]} />
    </View>
  );
}

// Enhanced bot response generator
function generateEnhancedBotResponse(userMessage: string, mood: MoodType | null): Message {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: "Hello! 👋 I'm here to support you. How can I help you today?",
      timestamp: new Date(),
      actions: [
        { label: 'Check my mood', action: 'mood', icon: 'happy', color: '#4CAF50' },
        { label: 'Breathing exercise', action: 'breathing', icon: 'leaf', color: '#2196F3' },
      ],
    };
  }

  if (lowerMessage.match(/anxious|anxiety|nervous|worried|panic/)) {
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: "I hear you, and I want you to know that feeling anxious is completely valid. 💙\n\nAnxiety can feel overwhelming, but there are techniques that can help. Would you like to try one now?",
      timestamp: new Date(),
      actions: [
        { label: '🫁 4-4-6 Breathing', action: 'breathing', icon: 'leaf', color: '#4CAF50' },
        { label: '🌍 Grounding (5-4-3-2-1)', action: 'grounding', icon: 'earth', color: '#795548' },
        { label: '👤 Talk to counselor', action: 'escalate', icon: 'person', color: '#2196F3' },
      ],
    };
  }

  if (lowerMessage.match(/sleep|insomnia|tired|exhausted|can't rest/)) {
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: "Sleep difficulties can really affect how we feel. 🌙\n\nHere are some things that might help:\n• Avoid screens 1 hour before bed\n• Keep a consistent sleep schedule\n• Try relaxation techniques",
      timestamp: new Date(),
      actions: [
        { label: 'Sleep meditation', action: 'meditation', icon: 'moon', color: '#673AB7' },
        { label: 'Sleep tips', action: 'resources', icon: 'book', color: '#FF9800' },
        { label: 'Talk to someone', action: 'escalate', icon: 'person', color: '#2196F3' },
      ],
    };
  }

  if (lowerMessage.match(/stress|stressed|overwhelmed|too much|pressure/)) {
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: "I understand you're feeling stressed. That's a lot to carry. 💪\n\nRemember: You don't have to handle everything at once. Breaking things down into smaller steps can help.",
      timestamp: new Date(),
      actions: [
        { label: 'Quick calm down', action: 'breathing', icon: 'flash', color: '#FF9800' },
        { label: 'Set a break timer', action: 'break', icon: 'timer', color: '#9C27B0' },
        { label: 'Talk it through', action: 'escalate', icon: 'person', color: '#2196F3' },
      ],
    };
  }

  if (lowerMessage.match(/sad|depressed|hopeless|down|unhappy|lonely/)) {
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: "I'm really sorry you're feeling this way. 💙 Your feelings are valid, and it takes courage to share them.\n\nYou don't have to go through this alone.",
      timestamp: new Date(),
      actions: [
        { label: '💗 Self-care tips', action: 'selfcare', icon: 'heart', color: '#E91E63' },
        { label: '📋 Wellbeing check', action: 'screening', icon: 'clipboard', color: '#9C27B0' },
        { label: '👤 Talk to counselor', action: 'escalate', icon: 'person', color: '#2196F3' },
      ],
    };
  }

  if (lowerMessage.match(/counselor|therapist|professional|help me|talk to someone/)) {
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: "It's great that you're reaching out for professional support. That's a really positive step! 🌟\n\nI can help connect you with a counselor who can provide personalized support.",
      timestamp: new Date(),
      actions: [
        { label: '✓ Yes, connect me', action: 'escalate', icon: 'checkmark-circle', color: '#4CAF50' },
        { label: 'Learn more first', action: 'resources', icon: 'information-circle', color: '#2196F3' },
      ],
    };
  }

  if (lowerMessage.match(/grateful|thankful|appreciate|gratitude/)) {
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: "That's wonderful! 🙏 Practicing gratitude has been shown to improve mental wellbeing.\n\nWould you like to continue sharing what you're grateful for?",
      timestamp: new Date(),
    };
  }

  if (lowerMessage.match(/breath|breathing|calm down|relax/)) {
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: "Great choice! Breathing exercises are one of the quickest ways to activate your body's relaxation response. 🫁",
      timestamp: new Date(),
      actions: [
        { label: 'Start 4-4-6 breathing', action: 'breathing', icon: 'play-circle', color: '#4CAF50' },
      ],
    };
  }

  // Default response based on mood
  const moodResponses: Record<MoodType, string> = {
    happy: "I'm glad to hear you're feeling good! 😊 Is there anything specific you'd like to explore?",
    calm: "It's nice that you're feeling calm. Would you like to try a mindfulness exercise?",
    neutral: "Thanks for sharing. I'm here whenever you need support. What's on your mind?",
    anxious: "Would you like to try a calming technique, or talk more about what's making you anxious?",
    stressed: "Remember, it's okay to take things one step at a time. How can I best support you?",
    sad: "Would you like to talk more about how you're feeling, or try something to lift your spirits?",
  };

  return {
    id: Date.now().toString(),
    type: 'bot',
    content: mood ? moodResponses[mood] : "Thank you for sharing. I'm here to listen and support you. 💙 Can you tell me more?",
    timestamp: new Date(),
    actions: [
      { label: 'Wellness check', action: 'screening', icon: 'clipboard', color: '#9C27B0' },
      { label: 'Explore resources', action: 'resources', icon: 'library', color: '#FF9800' },
      { label: 'Talk to counselor', action: 'escalate', icon: 'person', color: '#2196F3' },
    ],
  };
}

// Crisis detection
function checkForCrisis(message: string): boolean {
  const crisisKeywords = ['suicide', 'kill myself', 'end my life', 'want to die', 'hurt myself', 'self harm', 'cutting', 'no reason to live', 'better off dead', "can't go on", 'give up'];
  const lowerMessage = message.toLowerCase();
  return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
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
  typingDots: {
    flexDirection: 'row',
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
  breathingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '85%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  breathingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  breathingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  breathingPhase: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  breathingCount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#007AFF',
    marginTop: 8,
  },
  cyclesText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  breathingInstructions: {
    width: '100%',
    gap: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emergencyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  emergencyContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  emergencyHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emergencyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 12,
  },
  emergencyText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  emergencyActions: {
    gap: 12,
    marginBottom: 20,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emergencyFooter: {
    fontSize: 13,
    color: '#E91E63',
    fontWeight: '600',
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currentMoodBadge: {
    marginLeft: 8,
  },
  moodPickerContainer: {
    flex: 1,
    padding: 24,
  },
  moodPickerHeader: {
    marginBottom: 32,
  },
  moodPickerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  moodPickerSubtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  moodOption: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: '#f5f5f5',
  },
  moodEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },
  attachButton: {
    padding: 8,
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  voiceButtonRecording: {
    backgroundColor: '#F44336',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emergencyLink: {
    fontSize: 13,
    color: '#E91E63',
    fontWeight: '600',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  systemMessageText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  voiceMessageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 122, 255, 0.2)',
  },
  voiceMessageText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  // Chat Mode Styles
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  modeBadgeAI: {
    backgroundColor: '#007AFF',
  },
  modeBadgeHuman: {
    backgroundColor: '#34C759',
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchModeButton: {
    padding: 4,
  },
  statusDotWaiting: {
    backgroundColor: '#FF9500',
  },
  waitingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 8,
    gap: 8,
  },
  waitingText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  // Chat Mode Selector Screen Styles
  chatModeSelectorContainer: {
    flex: 1,
    padding: 24,
  },
  chatModeHeader: {
    marginBottom: 40,
  },
  chatModeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  chatModeSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  chatModeOptions: {
    gap: 16,
  },
  chatModeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chatModeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chatModeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  chatModeCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  chatModeCardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  chatModeCardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  chatModeFeatures: {
    gap: 8,
  },
  chatModeFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatModeFeatureText: {
    fontSize: 13,
    color: '#666',
  },
  // Switch Mode Modal Styles
  switchModeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  switchModeContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  switchModeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  switchModeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  switchModeOptions: {
    gap: 12,
    marginBottom: 16,
  },
  switchModeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  switchModeOptionContent: {
    marginLeft: 12,
    flex: 1,
  },
  switchModeOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  switchModeOptionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  switchModeCancel: {
    paddingVertical: 12,
  },
  switchModeCancelText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
});
