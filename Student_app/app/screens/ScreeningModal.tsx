import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Linking,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import apiService from '../../services/api';

// Emergency helpline numbers by region
const EMERGENCY_CONTACTS = {
  INDIA: {
    name: 'AASRA (India)',
    number: '9820466726',
    sms: 'TEXT "AASRA" TO 223366',
  },
  MENTAL_HEALTH: {
    name: 'Mental Health First Aid',
    number: '1860 2662 345',
    region: 'India',
  },
  GLOBAL: {
    name: 'International Association for Suicide Prevention',
    number: '+1 403 245 0145',
    region: 'Global',
  },
  INDIA_CRISIS: {
    name: 'iCall (India Crisis Helpline)',
    number: '9152987821',
    region: 'India',
  },
};

type ScreeningType = 'PHQ9' | 'GAD7';

interface Question {
  id: string;
  text: string;
  options: { value: number; label: string }[];
}

const PHQ9_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'Little interest or pleasure in doing things',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'q2',
    text: 'Feeling down, depressed, or hopeless',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'q3',
    text: 'Trouble falling or staying asleep',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'q4',
    text: 'Feeling tired or having little energy',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'q5',
    text: 'Poor appetite or overeating',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'q6',
    text: 'Feeling bad about yourself',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'q7',
    text: 'Trouble concentrating on things',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'q8',
    text: 'Moving or speaking too slowly or too fast',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'q9',
    text: 'Thoughts that you would be better off dead',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
];

export default function ScreeningModal({
  type = 'PHQ9',
  onClose,
  onComplete,
}: {
  type?: ScreeningType;
  onClose: () => void;
  onComplete?: (result: any) => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const questions = PHQ9_QUESTIONS;
  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Fast calculation - sync operations only (instant results)
      const score = Object.values(answers).reduce((sum, val) => sum + val, 0);
      const riskLevel = calculateRiskLevel(score, type);
      const interpretation = getInterpretation(score, type);
      const recommendations = getRecommendations(riskLevel);

      // Set result immediately for instant display (no await)
      setResult({
        score,
        riskLevel,
        interpretation,
        recommendations,
      });
      setShowResult(true);

      // Async operations in background (non-blocking)
      apiService.submitScreening({
        questionnaire: type,
        answers,
        score,
        riskLevel,
        timestamp: new Date().toISOString(),
      }).catch((error) => {
        console.error('Screening submission error:', error);
      });

      if (riskLevel === 'high' || riskLevel === 'severe') {
        apiService.createCase({
          reason: `${type} screening: ${riskLevel} risk`,
          score,
        }).catch((error) => {
          console.error('Case creation error:', error);
        });
      }
    } catch (error) {
      console.error('Screening submission error:', error);
      Alert.alert('Error', 'Failed to submit screening. Please try again.');
    }
  };

  const currentQ = questions[currentQuestion];
  const isAnswered = answers[currentQ.id] !== undefined;

  if (showResult && result) {
    const scoreDetails = getScoreDetails(result.score, type);
    
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.resultContainer}>
            <View style={[styles.resultIcon, { backgroundColor: getRiskColor(result.riskLevel) }]}>
              <Ionicons
                name={getRiskIcon(result.riskLevel)}
                size={64}
                color="#fff"
              />
            </View>

            <Text style={styles.resultTitle}>Screening Complete</Text>
            
            {/* Enhanced Score Display */}
            <View style={styles.scoreDisplayCard}>
              <Text style={styles.scoreLabel}>{type} Score</Text>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreBig}>{result.score}</Text>
                <Text style={styles.scoreMax}>/ {type === 'PHQ9' ? '27' : '21'}</Text>
              </View>
              <Text style={styles.scorePercentage}>
                {Math.round((result.score / (type === 'PHQ9' ? 27 : 21)) * 100)}% severity
              </Text>
            </View>

            {/* Severity Level with Details */}
            <View style={[styles.severityCard, { borderLeftColor: getRiskColor(result.riskLevel), borderLeftWidth: 4 }]}>
              <Text style={styles.severityLevel}>{result.interpretation}</Text>
              <Text style={styles.severityDescription}>{scoreDetails.description}</Text>
            </View>

            {/* Score Range Context */}
            <View style={styles.scoreContextCard}>
              <Text style={styles.contextTitle}>Your Results Context</Text>
              <View style={styles.scoreRanges}>
                {scoreDetails.ranges.map((range, idx) => (
                  <View key={idx} style={[styles.rangeItem, result.score >= range.min && result.score <= range.max && styles.rangeItemActive]}>
                    <View style={[styles.rangeDot, { backgroundColor: range.color }]} />
                    <Text style={[styles.rangeLabel, result.score >= range.min && result.score <= range.max && styles.rangeTextActive]}>
                      {range.label} ({range.min}-{range.max})
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.recommendationsCard}>
              <Text style={styles.recommendationsTitle}>Recommended Actions</Text>
              {result.recommendations.map((rec: string, idx: number) => (
                <View key={idx} style={styles.recommendationItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>

            {result.riskLevel === 'high' || result.riskLevel === 'severe' ? (
              <View style={styles.emergencyCard}>
                <Ionicons name="warning" size={24} color="#FF3B30" />
                <Text style={styles.emergencyText}>
                  A counselor will be notified and will contact you within 24 hours.
                </Text>
                <TouchableOpacity 
                  style={styles.emergencyButton}
                  onPress={() => {
                    const phoneNumber = `tel:${EMERGENCY_CONTACTS.INDIA.number}`;
                    Linking.openURL(phoneNumber).catch(() => {
                      Alert.alert(
                        'Emergency Helpline',
                        `Call: ${EMERGENCY_CONTACTS.INDIA.number}\n\nOther helplines:\n\n${EMERGENCY_CONTACTS.INDIA_CRISIS.name}\n${EMERGENCY_CONTACTS.INDIA_CRISIS.number}\n\n${EMERGENCY_CONTACTS.MENTAL_HEALTH.name}\n${EMERGENCY_CONTACTS.MENTAL_HEALTH.number}`,
                        [{ text: 'Close', onPress: () => {} }]
                      );
                    });
                  }}
                >
                  <Ionicons name="call" size={20} color="#fff" />
                  <Text style={styles.emergencyButtonText}>Call Helpline Now</Text>
                </TouchableOpacity>
                <Text style={styles.emergencyContactsLabel}>Available helplines:</Text>
                <View style={styles.helplinesList}>
                  <Text style={styles.helplineItem}>📞 {EMERGENCY_CONTACTS.INDIA.name}: {EMERGENCY_CONTACTS.INDIA.number}</Text>
                  <Text style={styles.helplineItem}>📞 {EMERGENCY_CONTACTS.INDIA_CRISIS.name}: {EMERGENCY_CONTACTS.INDIA_CRISIS.number}</Text>
                </View>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.doneButton}
              onPress={async () => {
                try {
                  const tokens = await apiService.getStoredAuthTokens();
                  const userId = tokens?.user?.userId || 'anonymous';
                  
                  const { error } = await supabase.from('form_result').insert({
                    userId: userId,
                    score: result.score,
                  });

                  if (error) {
                    console.error('Supabase submission error:', error);
                  }
                } catch (err) {
                  console.error('Failed to submit screening result:', err);
                }
                
                onComplete?.(result);
                if (onClose) {
                  onClose();
                } else {
                  router.back();
                }
              }}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
            if (onClose) {
                onClose();
            } else {
                router.back();
            }
        }}>
          <Ionicons name="close" size={28} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>PHQ-9 Screening</Text>
          <Text style={styles.headerSubtitle}>
            Question {currentQuestion + 1} of {totalQuestions}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <ScrollView style={styles.content}>
        {currentQuestion === 0 && (
          <View style={styles.introCard}>
            <Ionicons name="clipboard" size={48} color="#007AFF" />
            <Text style={styles.introTitle}>Quick Check-In</Text>
            <Text style={styles.introText}>
              Over the last 2 weeks, how often have you been bothered by problems?
            </Text>
            <Text style={styles.introNote}>
              This screening is confidential and takes about 2-3 minutes.
            </Text>
          </View>
        )}

        <View style={styles.questionCard}>
          <Text style={styles.questionNumber}>Question {currentQuestion + 1}</Text>
          <Text style={styles.questionText}>{currentQ.text}</Text>

          <View style={styles.optionsContainer}>
            {currentQ.options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  answers[currentQ.id] === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => handleAnswer(currentQ.id, option.value)}
              >
                <View style={styles.optionRadio}>
                  {answers[currentQ.id] === option.value && (
                    <View style={styles.optionRadioSelected} />
                  )}
                </View>
                <Text
                  style={[
                    styles.optionText,
                    answers[currentQ.id] === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.privacyNotice}>
          <Ionicons name="shield-checkmark" size={16} color="#34C759" />
          <Text style={styles.privacyText}>
            Your responses are encrypted and confidential
          </Text>
        </View>
      </ScrollView>

      <View style={styles.navigation}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[styles.nextButton, !isAnswered && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!isAnswered}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestion === totalQuestions - 1 ? 'Submit' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getScoreDetails(score: number, type: ScreeningType): {
  description: string;
  ranges: Array<{ label: string; min: number; max: number; color: string }>;
} {
  if (type === 'PHQ9') {
    const ranges = [
      { label: 'Minimal', min: 0, max: 4, color: '#34C759' },
      { label: 'Mild', min: 5, max: 9, color: '#FF9500' },
      { label: 'Moderate', min: 10, max: 14, color: '#FF6B6B' },
      { label: 'Moderately Severe', min: 15, max: 19, color: '#D93026' },
      { label: 'Severe', min: 20, max: 27, color: '#7C2D12' },
    ];

    let description = '';
    if (score <= 4) {
      description = 'Minimal depressive symptoms. You are managing well emotionally. Continue regular self-care practices.';
    } else if (score <= 9) {
      description = 'Mild depressive symptoms. Some support through counseling or wellness activities may be beneficial.';
    } else if (score <= 14) {
      description = 'Moderate depressive symptoms. Professional support is recommended. Consider reaching out to a counselor.';
    } else if (score <= 19) {
      description = 'Moderately severe depressive symptoms. Professional mental health support is highly recommended.';
    } else {
      description = 'Severe depressive symptoms. Immediate professional intervention is needed. Please reach out for help today.';
    }

    return { description, ranges };
  }

  // GAD7 ranges
  const ranges = [
    { label: 'Minimal', min: 0, max: 4, color: '#34C759' },
    { label: 'Mild', min: 5, max: 9, color: '#FF9500' },
    { label: 'Moderate', min: 10, max: 14, color: '#FF6B6B' },
    { label: 'Severe', min: 15, max: 21, color: '#7C2D12' },
  ];

  let description = '';
  if (score <= 4) {
    description = 'Minimal anxiety symptoms. You are managing stress well. Keep up your healthy coping strategies.';
  } else if (score <= 9) {
    description = 'Mild anxiety symptoms. Relaxation techniques and self-care may help. Consider resources like meditation.';
  } else if (score <= 14) {
    description = 'Moderate anxiety symptoms. Professional support is recommended for better management.';
  } else {
    description = 'Severe anxiety symptoms. Immediate professional help is needed. Reach out to a counselor today.';
  }

  return { description, ranges };
}

function calculateRiskLevel(score: number, type: ScreeningType): string {
  if (type === 'PHQ9') {
    if (score <= 4) return 'minimal';
    if (score <= 9) return 'mild';
    if (score <= 14) return 'moderate';
    if (score <= 19) return 'moderately-severe';
    return 'severe';
  }
  if (score <= 4) return 'minimal';
  if (score <= 9) return 'mild';
  if (score <= 14) return 'moderate';
  return 'severe';
}

function getInterpretation(score: number, type: ScreeningType): string {
  const level = calculateRiskLevel(score, type);
  const interpretations: Record<string, string> = {
    minimal: 'Minimal symptoms - You\'re doing well',
    mild: 'Mild symptoms - Some support may help',
    moderate: 'Moderate symptoms - Professional support recommended',
    'moderately-severe': 'Moderately severe symptoms - Professional help needed',
    severe: 'Severe symptoms - Urgent professional help needed',
  };
  return interpretations[level] || '';
}

function getRecommendations(riskLevel: string): string[] {
  const recommendations: Record<string, string[]> = {
    minimal: [
      'Continue wellness practices',
      'Use resources when needed',
      'Check in regularly',
    ],
    mild: [
      'Try guided relaxation',
      'Maintain healthy habits',
      'Stay connected',
    ],
    moderate: [
      'Schedule counselor appointment',
      'Use daily resources',
      'Monitor symptoms',
    ],
    'moderately-severe': [
      'Speak with counselor soon',
      'Avoid isolation',
      'Follow up within one week',
    ],
    severe: [
      'Contact counselor immediately',
      'Reach out to support',
      'Use crisis resources',
    ],
  };
  return recommendations[riskLevel] || [];
}

function getRiskColor(riskLevel: string): string {
  const colors: Record<string, string> = {
    minimal: '#34C759',
    mild: '#34C759',
    moderate: '#FF9500',
    'moderately-severe': '#FF9500',
    severe: '#FF3B30',
  };
  return colors[riskLevel] || '#999';
}

function getRiskIcon(riskLevel: string): any {
  if (riskLevel === 'minimal' || riskLevel === 'mild') return 'checkmark-circle';
  if (riskLevel === 'moderate' || riskLevel === 'moderately-severe') return 'warning';
  return 'alert-circle';
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
    padding: 20,
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
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  placeholder: {
    width: 28,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#eee',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  introCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 12,
  },
  introText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  introNote: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    elevation: 3,
  },
  questionNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1a1a1a',
    lineHeight: 26,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#999',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  privacyText: {
    fontSize: 13,
    color: '#666',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  resultContainer: {
    padding: 24,
    alignItems: 'center',
  },
  scoreDisplayCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    marginTop: 12,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  scoreBig: {
    fontSize: 48,
    fontWeight: '800',
    color: '#007AFF',
  },
  scoreMax: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  scorePercentage: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  severityCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  severityLevel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  severityDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  scoreContextCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  contextTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  scoreRanges: {
    gap: 10,
  },
  rangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  rangeItemActive: {
    backgroundColor: '#F0F8FF',
    borderColor: '#007AFF',
  },
  rangeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  rangeLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  rangeTextActive: {
    color: '#007AFF',
    fontWeight: '700',
  },
  resultIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 20,
    color: '#666',
    marginBottom: 8,
  },
  resultLevel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 32,
  },
  recommendationsCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  emergencyCard: {
    width: '100%',
    backgroundColor: '#FFF3F3',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  emergencyText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emergencyContactsLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  helplinesList: {
    width: '100%',
    gap: 8,
  },
  helplineItem: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
    paddingVertical: 4,
  },
  doneButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
