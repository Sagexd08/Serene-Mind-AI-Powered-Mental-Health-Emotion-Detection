import React, { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
} from 'react-native';

const NeuromodulationScreen = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState('3');
  const [intensity, setIntensity] = useState('Standard');
  const [selectedSession, setSelectedSession] = useState('alpha');
  const [savedAsRoutine, setSavedAsRoutine] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const sessions = [
    {
      id: 'delta',
      name: 'Delta Deep Sleep',
      freq: '0.5–4 Hz',
      badge: 'δ',
      desc: 'Deep restorative sleep & healing',
      color: '#7C3AED',
      benefit: 'Sleep Enhancement',
      waveSpeed: 0.008,
      waveAmplitude: 20,
    },
    {
      id: 'theta',
      name: 'Theta Meditation',
      freq: '4–8 Hz',
      badge: 'θ',
      desc: 'Deep meditation & memory consolidation',
      color: '#6366F1',
      benefit: 'Deep Relaxation',
      waveSpeed: 0.012,
      waveAmplitude: 25,
    },
    {
      id: 'alpha',
      name: 'Alpha Focus',
      freq: '8–12 Hz',
      badge: 'α',
      desc: 'Calm, relaxed focus & creative thinking',
      color: '#3B82F6',
      benefit: 'Calm Focus',
      waveSpeed: 0.018,
      waveAmplitude: 30,
    },
  ];

  const sessionData = [
    { day: 'Mon', sessions: 1 },
    { day: 'Tue', sessions: 2 },
    { day: 'Wed', sessions: 1 },
    { day: 'Thu', sessions: 3 },
    { day: 'Fri', sessions: 2 },
    { day: 'Sat', sessions: 0 },
    { day: 'Sun', sessions: 1 },
  ];

  const currentSessionData = sessions.find((s) => s.id === selectedSession);
  const maxSessions = Math.max(...sessionData.map((d) => d.sessions));

  const SCREEN_WIDTH = Dimensions.get('window').width;
  const scale = SCREEN_WIDTH / 375;

  const scaleFont = (fontSize: number) => Math.round(fontSize * scale);
  const scaleSize = (size: number) => Math.round(size * scale);

  // Timer effect for active sessions
  useEffect(() => {
    if (sessionActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [sessionActive, timeRemaining]);

  const handleStartSession = () => {
    const durationMinutes = parseInt(duration);
    const totalSeconds = durationMinutes * 60;
    
    setSessionActive(true);
    setIsPlaying(true);
    setTimeRemaining(totalSeconds);
  };

  const handlePauseSession = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleResumeSession = () => {
    setIsPlaying(true);
  };

  const handleStopSession = () => {
    setSessionActive(false);
    setIsPlaying(false);
    setTimeRemaining(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleSessionComplete = () => {
    setSessionActive(false);
    setIsPlaying(false);
    setTimeRemaining(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    Alert.alert('🎉 Session Complete!', `You've completed a ${duration}-minute ${currentSessionData?.name} session.`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveRoutine = () => {
    setSavedAsRoutine(true);
    setTimeout(() => setSavedAsRoutine(false), 2000);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0F172A',
    },
    header: {
      paddingHorizontal: scaleSize(20),
      paddingVertical: scaleSize(14),
      paddingTop: scaleSize(16),
      backgroundColor: '#0F172A',
      borderBottomWidth: 1,
      borderBottomColor: '#1E293B',
    },
    headerTitle: {
      fontSize: scaleFont(28),
      fontWeight: '700' as const,
      color: '#fff',
      marginBottom: scaleSize(2),
    },
    headerSubtitle: {
      fontSize: scaleFont(13),
      color: '#94A3B8',
      fontWeight: '500' as const,
    },
    content: {
      flex: 1,
      backgroundColor: '#0F172A',
    },
    contentContainer: {
      paddingHorizontal: scaleSize(16),
      paddingVertical: scaleSize(16),
      paddingBottom: scaleSize(40),
    },
    waveformContainer: {
      borderRadius: scaleSize(24),
      padding: scaleSize(24),
      marginBottom: scaleSize(24),
      alignItems: 'center' as const,
      overflow: 'hidden' as const,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    waveformVisualization: {
      flexDirection: 'row' as const,
      alignItems: 'flex-end' as const,
      justifyContent: 'center' as const,
      gap: scaleSize(4),
      height: scaleSize(80),
      marginBottom: scaleSize(16),
    },
    waveBar: {
      width: scaleSize(6),
      backgroundColor: '#fff',
      borderRadius: scaleSize(3),
      opacity: 0.8,
    },
    frequencyBadge: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: scaleSize(8),
      marginBottom: scaleSize(12),
    },
    frequencyLabel: {
      fontSize: scaleFont(24),
      color: '#fff',
      fontWeight: '300' as const,
    },
    frequencyContent: {
      alignItems: 'center' as const,
    },
    badgeText: {
      fontSize: scaleFont(28),
      fontWeight: '700' as const,
      color: '#fff',
    },
    freqText: {
      fontSize: scaleFont(10),
      color: '#fff',
      fontWeight: '600' as const,
      marginTop: scaleSize(2),
      opacity: 0.9,
    },
    benefitText: {
      fontSize: scaleFont(14),
      fontWeight: '700' as const,
      color: '#fff',
      textAlign: 'center' as const,
    },
    timerDisplay: {
      marginTop: scaleSize(24),
      alignItems: 'center' as const,
    },
    timerCircle: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: scaleSize(16),
      paddingVertical: scaleSize(16),
      paddingHorizontal: scaleSize(32),
    },
    timerText: {
      fontSize: scaleFont(32),
      fontWeight: '700' as const,
      color: '#fff',
      fontFamily: 'monospace',
    },
    timerLabel: {
      fontSize: scaleFont(12),
      color: '#fff',
      opacity: 0.8,
      marginTop: scaleSize(4),
    },
    pulsingIndicator: {
      position: 'absolute' as const,
      top: scaleSize(20),
      right: scaleSize(20),
      width: scaleSize(12),
      height: scaleSize(12),
      borderRadius: scaleSize(6),
      backgroundColor: '#fff',
    },
    playButtonContainer: {
      alignItems: 'center' as const,
      marginBottom: scaleSize(28),
    },
    activeSessionControls: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: scaleSize(16),
    },
    playButton: {
      width: scaleSize(96),
      height: scaleSize(96),
      borderRadius: scaleSize(48),
      backgroundColor: '#1E293B',
      borderWidth: 2,
      borderColor: '#334155',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    playButtonActive: {
      borderColor: '#fff',
    },
    stopButton: {
      paddingVertical: scaleSize(12),
      paddingHorizontal: scaleSize(24),
      borderRadius: scaleSize(12),
      backgroundColor: '#EF4444',
    },
    stopButtonText: {
      color: '#fff',
      fontSize: scaleFont(14),
      fontWeight: '600' as const,
    },
    controlSection: {
      marginBottom: scaleSize(20),
    },
    controlLabel: {
      fontSize: scaleFont(14),
      fontWeight: '700' as const,
      color: '#E2E8F0',
      marginBottom: scaleSize(10),
    },
    controlsGrid: {
      flexDirection: 'row' as const,
      gap: scaleSize(10),
    },
    controlButton: {
      flex: 1,
      paddingVertical: scaleSize(12),
      paddingHorizontal: scaleSize(8),
      borderRadius: scaleSize(12),
      backgroundColor: '#1E293B',
      borderWidth: 1,
      borderColor: '#334155',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    controlButtonActive: {
      borderColor: '#fff',
    },
    controlButtonText: {
      fontSize: scaleFont(12),
      fontWeight: '600' as const,
      color: '#94A3B8',
    },
    controlButtonTextActive: {
      color: '#fff',
      fontWeight: '700' as const,
    },
    sessionSection: {
      marginBottom: scaleSize(24),
    },
    sessionCard: {
      backgroundColor: '#1E293B',
      borderRadius: scaleSize(16),
      padding: scaleSize(14),
      marginBottom: scaleSize(12),
      borderWidth: 2,
      borderColor: '#334155',
    },
    sessionCardActive: {
      borderColor: '#3B82F6',
    },
    sessionBadgeContainer: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      marginBottom: scaleSize(10),
    },
    sessionBadge: {
      width: scaleSize(56),
      height: scaleSize(56),
      borderRadius: scaleSize(14),
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginRight: scaleSize(12),
    },
    sessionBadgeText: {
      fontSize: scaleFont(24),
      fontWeight: '700' as const,
      color: '#fff',
    },
    sessionInfo: {
      flex: 1,
    },
    sessionName: {
      fontSize: scaleFont(14),
      fontWeight: '700' as const,
      color: '#fff',
      marginBottom: scaleSize(2),
    },
    sessionFreq: {
      fontSize: scaleFont(11),
      color: '#94A3B8',
    },
    activeIndicator: {
      width: scaleSize(12),
      height: scaleSize(12),
      borderRadius: scaleSize(6),
      marginTop: scaleSize(4),
    },
    sessionDesc: {
      fontSize: scaleFont(12),
      color: '#CBD5E1',
      fontWeight: '500' as const,
      marginBottom: scaleSize(10),
      lineHeight: scaleSize(18),
    },
    sessionFooter: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingTop: scaleSize(10),
      borderTopWidth: 1,
    },
    sessionFooterLeft: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: scaleSize(6),
    },
    sessionFooterText: {
      fontSize: scaleFont(11),
      color: '#E2E8F0',
      fontWeight: '600' as const,
    },
    sessionBenefit: {
      fontSize: scaleFont(10),
      color: '#94A3B8',
      fontWeight: '500' as const,
    },
    progressSection: {
      marginBottom: scaleSize(24),
    },
    progressHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: scaleSize(12),
    },
    sessionCount: {
      fontSize: scaleFont(11),
      color: '#94A3B8',
      fontWeight: '600' as const,
    },
    chartContainer: {
      backgroundColor: '#1E293B',
      borderRadius: scaleSize(16),
      padding: scaleSize(16),
      borderWidth: 1,
      borderColor: '#334155',
    },
    chartBars: {
      flexDirection: 'row' as const,
      alignItems: 'flex-end' as const,
      justifyContent: 'space-between' as const,
      gap: scaleSize(6),
      height: scaleSize(100),
    },
    barWrapper: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'flex-end' as const,
    },
    bar: {
      width: '100%',
      borderRadius: scaleSize(4),
      marginBottom: scaleSize(8),
    },
    dayLabel: {
      fontSize: scaleFont(10),
      color: '#94A3B8',
      fontWeight: '600' as const,
    },
    startButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: scaleSize(16),
      paddingHorizontal: scaleSize(16),
      borderRadius: scaleSize(14),
      marginBottom: scaleSize(12),
      gap: scaleSize(10),
    },
    startButtonText: {
      fontSize: scaleFont(14),
      fontWeight: '700' as const,
      color: '#fff',
    },
    saveButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: scaleSize(12),
      paddingHorizontal: scaleSize(16),
      borderRadius: scaleSize(14),
      backgroundColor: '#10B981',
      marginBottom: scaleSize(20),
      gap: scaleSize(8),
    },
    saveButtonSaved: {
      backgroundColor: '#059669',
    },
    saveButtonText: {
      fontSize: scaleFont(13),
      fontWeight: '700' as const,
      color: '#fff',
    },
    sessionInfoRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingVertical: scaleSize(12),
      borderBottomWidth: 1,
      borderBottomColor: '#334155',
    },
    sessionInfoLabel: {
      fontSize: scaleFont(14),
      color: '#94A3B8',
      fontWeight: '500' as const,
    },
    sessionInfoValue: {
      fontSize: scaleFont(14),
      color: '#E2E8F0',
      fontWeight: '700' as const,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Neuromodulation</Text>
          <Text style={styles.headerSubtitle}>Guided Self Healing Technology</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Waveform Section */}
        <View style={[styles.waveformContainer, { backgroundColor: currentSessionData?.color }]}>
          {/* Animated Waveform visualization */}
          <View style={styles.waveformVisualization}>
            <View style={[styles.waveBar, { height: '40%' }]} />
            <View style={[styles.waveBar, { height: '70%', opacity: 0.8 }]} />
            <View style={[styles.waveBar, { height: '100%', opacity: 0.9 }]} />
            <View style={[styles.waveBar, { height: '70%', opacity: 0.8 }]} />
            <View style={[styles.waveBar, { height: '40%' }]} />
            <View style={[styles.waveBar, { height: '50%', opacity: 0.8 }]} />
            <View style={[styles.waveBar, { height: '85%', opacity: 0.9 }]} />
            <View style={[styles.waveBar, { height: '50%', opacity: 0.8 }]} />
          </View>

          {/* Frequency Badge */}
          <View style={styles.frequencyBadge}>
            <Text style={styles.frequencyLabel}>[</Text>
            <View style={styles.frequencyContent}>
              <Text style={styles.badgeText}>{currentSessionData?.badge}</Text>
              <Text style={styles.freqText}>{currentSessionData?.freq}</Text>
            </View>
            <Text style={styles.frequencyLabel}>]</Text>
          </View>

          {/* Benefit Text */}
          <Text style={styles.benefitText}>{currentSessionData?.benefit}</Text>

          {/* Timer Display when session is active */}
          {sessionActive && (
            <View style={styles.timerDisplay}>
              <View style={styles.timerCircle}>
                <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
                <Text style={styles.timerLabel}>remaining</Text>
              </View>
            </View>
          )}

          {/* Pulsing indicator when playing */}
          {isPlaying && (
            <View style={styles.pulsingIndicator} />
          )}
        </View>

        {/* Play/Pause Button */}
        <View style={styles.playButtonContainer}>
          {sessionActive ? (
            <View style={styles.activeSessionControls}>
              <TouchableOpacity
                style={[
                  styles.playButton,
                  isPlaying && styles.playButtonActive,
                ]}
                onPress={() => isPlaying ? handlePauseSession() : handleResumeSession()}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={scaleSize(36)}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.stopButton}
                onPress={handleStopSession}
                activeOpacity={0.8}
              >
                <Text style={styles.stopButtonText}>Stop Session</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.playButton,
                isPlaying && styles.playButtonActive,
              ]}
              onPress={() => setIsPlaying(!isPlaying)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={scaleSize(36)}
                color="#fff"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Duration Presets */}
        <View style={styles.controlSection}>
          <Text style={styles.controlLabel}>Duration</Text>
          <View style={styles.controlsGrid}>
            {['1', '3', '10'].map((dur) => (
              <TouchableOpacity
                key={dur}
                style={[
                  styles.controlButton,
                  duration === dur && [styles.controlButtonActive, { backgroundColor: currentSessionData?.color }],
                ]}
                onPress={() => setDuration(dur)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.controlButtonText,
                    duration === dur && styles.controlButtonTextActive,
                  ]}
                >
                  {dur} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Intensity Level */}
        <View style={styles.controlSection}>
          <Text style={styles.controlLabel}>Intensity Level</Text>
          <View style={styles.controlsGrid}>
            {['Gentle', 'Standard', 'Deep'].map((int) => (
              <TouchableOpacity
                key={int}
                style={[
                  styles.controlButton,
                  intensity === int && [styles.controlButtonActive, { backgroundColor: currentSessionData?.color }],
                ]}
                onPress={() => setIntensity(int)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.controlButtonText,
                    intensity === int && styles.controlButtonTextActive,
                  ]}
                >
                  {int}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Session Cards */}
        <View style={styles.sessionSection}>
          <Text style={styles.controlLabel}>Available Sessions</Text>
          {sessions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.sessionCard,
                { borderColor: item.color },
                selectedSession === item.id && styles.sessionCardActive,
              ]}
              onPress={() => {
                setSelectedSession(item.id);
                setIsPlaying(false);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.sessionBadgeContainer}>
                <View
                  style={[
                    styles.sessionBadge,
                    { backgroundColor: item.color },
                  ]}
                >
                  <Text style={styles.sessionBadgeText}>{item.badge}</Text>
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionName}>{item.name}</Text>
                  <Text style={styles.sessionFreq}>{item.freq}</Text>
                </View>
                {selectedSession === item.id && (
                  <View
                    style={[
                      styles.activeIndicator,
                      { backgroundColor: item.color },
                    ]}
                  />
                )}
              </View>
              <Text style={styles.sessionDesc}>{item.desc}</Text>
              <View style={[styles.sessionFooter, { borderTopColor: `${item.color}20` }]}>
                <View style={styles.sessionFooterLeft}>
                  <Ionicons name="play" size={scaleSize(12)} color={item.color} />
                  <Text style={styles.sessionFooterText}>
                    {selectedSession === item.id ? 'Selected Session' : 'Start Session'}
                  </Text>
                </View>
                <Text style={styles.sessionBenefit}>{item.benefit}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress Chart */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.controlLabel}>Last 7 Days</Text>
            <Text style={styles.sessionCount}>
              {sessionData.reduce((sum, day) => sum + day.sessions, 0)} sessions
            </Text>
          </View>
          <View style={styles.chartContainer}>
            <View style={styles.chartBars}>
              {sessionData.map((data, idx) => (
                <View key={idx} style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height:
                          data.sessions === 0
                            ? scaleSize(8)
                            : scaleSize(80) * (data.sessions / maxSessions),
                        backgroundColor:
                          data.sessions === 0 ? '#334155' : currentSessionData?.color,
                      },
                    ]}
                  />
                  <Text style={styles.dayLabel}>{data.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {!sessionActive && (
          <>
            <TouchableOpacity
              style={[
                styles.startButton,
                { backgroundColor: currentSessionData?.color },
              ]}
              onPress={handleStartSession}
              activeOpacity={0.8}
            >
              <Ionicons name="play" size={scaleSize(18)} color="#fff" />
              <Text style={styles.startButtonText}>Start {duration} Min Session</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                savedAsRoutine && styles.saveButtonSaved,
              ]}
              onPress={handleSaveRoutine}
              activeOpacity={0.8}
            >
              <Ionicons
                name={savedAsRoutine ? 'checkmark' : 'heart'}
                size={scaleSize(16)}
                color="#fff"
              />
              <Text style={styles.saveButtonText}>
                {savedAsRoutine ? 'Saved to Daily Routine!' : 'Save as Daily Routine'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Active Session Info */}
        {sessionActive && (
          <View style={styles.sessionInfo}>
            <View style={styles.sessionInfoRow}>
              <Text style={styles.sessionInfoLabel}>Session Type:</Text>
              <Text style={styles.sessionInfoValue}>{currentSessionData?.name}</Text>
            </View>
            <View style={styles.sessionInfoRow}>
              <Text style={styles.sessionInfoLabel}>Intensity:</Text>
              <Text style={styles.sessionInfoValue}>{intensity}</Text>
            </View>
            <View style={[styles.sessionInfoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.sessionInfoLabel}>Duration:</Text>
              <Text style={styles.sessionInfoValue}>{duration} minutes</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default NeuromodulationScreen;
