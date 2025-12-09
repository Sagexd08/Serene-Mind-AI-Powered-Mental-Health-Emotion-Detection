import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Dimensions,
  useWindowDimensions,
} from 'react-native';

const ResourceHubScreen = ({ route }: any) => {
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 375;
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedTab, setSelectedTab] = useState(route?.params?.tab || 'articles');

  const filters = ['All', 'Stress', 'Anxiety', 'Depression', 'Bipolar'];

  const articles = [
    { id: 1, title: 'Understanding Stress & How to Manage It', category: 'Stress', duration: '8 min read', icon: '📚' },
    { id: 2, title: 'Anxiety: Causes, Symptoms & Solutions', category: 'Anxiety', duration: '10 min read', icon: '🧠' },
    { id: 3, title: 'Living with Depression: A Complete Guide', category: 'Depression', duration: '12 min read', icon: '💭' },
    { id: 4, title: 'Bipolar Disorder: What You Need to Know', category: 'Bipolar', duration: '15 min read', icon: '🔄' },
    { id: 5, title: 'Stress Relief Techniques for Students', category: 'Stress', duration: '6 min read', icon: '🎓' },
    { id: 6, title: 'Managing Social Anxiety in College', category: 'Anxiety', duration: '9 min read', icon: '👥' },
  ];

  const asrPlaylists = [
    {
      id: 1,
      name: 'Stress Release ASMR',
      tracks: 8,
      duration: '45 min',
      color: '#3B82F6',
      audios: ['Gentle Rain Sounds', 'Soft Whispers', 'Nature Ambience', 'Calming Voices']
    },
    {
      id: 2,
      name: 'Deep Sleep ASMR',
      tracks: 6,
      duration: '60 min',
      color: '#6366F1',
      audios: ['Ocean Waves', 'White Noise', 'Binaural Sleep', 'Night Forest']
    },
    {
      id: 3,
      name: 'Focus & Concentration',
      tracks: 10,
      duration: '50 min',
      color: '#06B6D4',
      audios: ['Study Music', 'Ambient Focus', 'Light Jazz', 'Flow State Sounds']
    },
    {
      id: 4,
      name: 'Anxiety Relief',
      tracks: 7,
      duration: '38 min',
      color: '#10B981',
      audios: ['Breathing Guides', 'Calm Piano', 'Meditation Bells', 'Peaceful Voices']
    },
  ];

  const exercises = [
    { id: 1, title: '4-7-8 Breathing Technique', type: 'Breathing', duration: '5 min', difficulty: 'Beginner', icon: '🫁' },
    { id: 2, title: 'Box Breathing Exercise', type: 'Breathing', duration: '3 min', difficulty: 'Beginner', icon: '📦' },
    { id: 3, title: 'Guided Body Scan Meditation', type: 'Meditation', duration: '15 min', difficulty: 'Intermediate', icon: '🧘' },
    { id: 4, title: 'Mindfulness for Beginners', type: 'Meditation', duration: '10 min', difficulty: 'Beginner', icon: '🌸' },
    { id: 5, title: 'Progressive Muscle Relaxation', type: 'Exercise', duration: '12 min', difficulty: 'Beginner', icon: '💪' },
    { id: 6, title: 'Walking Meditation Guide', type: 'Meditation', duration: '20 min', difficulty: 'Intermediate', icon: '🚶' },
  ];

  const filteredArticles = selectedFilter === 'All' 
    ? articles 
    : articles.filter(a => a.category === selectedFilter);

  const renderArticles = () => (
    <>
      {/* Filter Chips - Responsive Wrapper */}
      <View style={styles.filtersWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
          scrollEventThrottle={16}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}
                numberOfLines={1}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Articles List */}
      <FlatList
        data={filteredArticles}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.articleCard} activeOpacity={0.7}>
            <View style={styles.articleIcon}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            <View style={styles.articleContent}>
              <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.articleMeta}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText} numberOfLines={1}>{item.category}</Text>
                </View>
                <View style={styles.durationBadge}>
                  <Ionicons name="time" size={9} color="#999" />
                  <Text style={styles.durationText} numberOfLines={1}>{item.duration}</Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={12} color="#3B82F6" style={{ marginLeft: scaleSize(8) }} />
          </TouchableOpacity>
        )}
      />
    </>
  );

  const renderAudio = () => (
    <>
      <Text style={styles.sectionTitle}>ASMR Playlists</Text>
      <FlatList
        data={asrPlaylists}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={[styles.playlistCard, { borderTopColor: item.color, borderTopWidth: 4 }]}>
            <View style={styles.playlistHeader}>
              <View>
                <Text style={styles.playlistName}>{item.name}</Text>
                <Text style={styles.playlistInfo}>{item.tracks} tracks • {item.duration}</Text>
              </View>
              <Ionicons name="musical-notes" size={20} color={item.color} />
            </View>
            <Text style={styles.audiosLabel}>Included Audios:</Text>
            {item.audios.map((audio, idx) => (
              <View key={idx} style={styles.audioItem}>
                <Ionicons name="play" size={12} color={item.color} />
                <Text style={styles.audioName}>{audio}</Text>
                <Ionicons name="chevron-forward" size={12} color="#999" style={{ marginLeft: 'auto' }} />
              </View>
            ))}
            <TouchableOpacity style={[styles.playButton, { backgroundColor: item.color }]}>
              <Text style={styles.playButtonText}>Play Playlist</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </>
  );

  const renderExercises = () => (
    <>
      {/* Breathing Exercises */}
      <View>
        <Text style={styles.sectionTitle}>Breathing Exercises</Text>
        <FlatList
          data={exercises.filter(e => e.type === 'Breathing')}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.exerciseCard}>
              <View style={[styles.exerciseIcon, { backgroundColor: '#3B82F6' }]}>
                <Text style={styles.iconText}>{item.icon}</Text>
              </View>
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseTitle}>{item.title}</Text>
                <View style={styles.exerciseMeta}>
                  <View style={[styles.difficultyBadge, { backgroundColor: '#3B82F6' }]}>
                    <Text style={styles.difficultyText}>{item.difficulty}</Text>
                  </View>
                  <View style={styles.durationBadge}>
                    <Ionicons name="time" size={10} color="#999" />
                    <Text style={styles.durationText}>{item.duration}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity>
                <Ionicons name="play" size={16} color="#3B82F6" fill="#3B82F6" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      {/* Meditation */}
      <View style={{ marginTop: 20 }}>
        <Text style={styles.sectionTitle}>Guided Meditation</Text>
        <FlatList
          data={exercises.filter(e => e.type === 'Meditation')}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.exerciseCard}>
              <View style={[styles.exerciseIcon, { backgroundColor: '#A855F7' }]}>
                <Text style={styles.iconText}>{item.icon}</Text>
              </View>
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseTitle}>{item.title}</Text>
                <View style={styles.exerciseMeta}>
                  <View style={[styles.difficultyBadge, { backgroundColor: '#A855F7' }]}>
                    <Text style={styles.difficultyText}>{item.difficulty}</Text>
                  </View>
                  <View style={styles.durationBadge}>
                    <Ionicons name="time" size={10} color="#999" />
                    <Text style={styles.durationText}>{item.duration}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity>
                <Ionicons name="play" size={16} color="#A855F7" fill="#A855F7" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      {/* Physical Exercises */}
      <View style={{ marginTop: 20 }}>
        <Text style={styles.sectionTitle}>Physical Exercises</Text>
        <FlatList
          data={exercises.filter(e => e.type === 'Exercise')}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.exerciseCard}>
              <View style={[styles.exerciseIcon, { backgroundColor: '#10B981' }]}>
                <Text style={styles.iconText}>{item.icon}</Text>
              </View>
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseTitle}>{item.title}</Text>
                <View style={styles.exerciseMeta}>
                  <View style={[styles.difficultyBadge, { backgroundColor: '#10B981' }]}>
                    <Text style={styles.difficultyText}>{item.difficulty}</Text>
                  </View>
                  <View style={styles.durationBadge}>
                    <Ionicons name="time" size={10} color="#999" />
                    <Text style={styles.durationText}>{item.duration}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity>
                <Ionicons name="play" size={16} color="#10B981" fill="#10B981" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Resource Hub</Text>
          <Text style={styles.headerSubtitle}>Your wellness library</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#888"
          />
          <Ionicons name="options" size={18} color="#666" />
        </View>
      </View>

      {/* Tab Selector - Full Width */}
      <View style={styles.tabsWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.tabContainer}
          contentContainerStyle={styles.tabContent}
          scrollEventThrottle={16}
        >
          {['articles', 'audio', 'exercises'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                selectedTab === tab && styles.tabActive,
              ]}
              onPress={() => setSelectedTab(tab)}
              activeOpacity={0.6}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.tabTextActive,
                ]}
                numberOfLines={1}
              >
                {tab === 'articles' && '📚 Articles'}
                {tab === 'audio' && '🎧 Audio'}
                {tab === 'exercises' && '🧘 Exercises'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {selectedTab === 'articles' && renderArticles()}
        {selectedTab === 'audio' && renderAudio()}
        {selectedTab === 'exercises' && renderExercises()}
      </ScrollView>
    </View>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;

const scaleFont = (fontSize: number) => Math.round(fontSize * scale);
const scaleSize = (size: number) => Math.round(size * scale);

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
    fontWeight: '700',
    color: '#fff',
    marginBottom: scaleSize(2),
  },
  headerSubtitle: {
    fontSize: scaleFont(13),
    color: '#94A3B8',
    fontWeight: '500',
  },
  searchBarContainer: {
    paddingHorizontal: scaleSize(16),
    paddingVertical: scaleSize(12),
    backgroundColor: '#0F172A',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleSize(14),
    backgroundColor: '#1E293B',
    borderRadius: scaleSize(14),
    borderWidth: 1,
    borderColor: '#334155',
    height: scaleSize(44),
  },
  searchInput: {
    flex: 1,
    marginHorizontal: scaleSize(10),
    color: '#fff',
    fontSize: scaleFont(14),
    fontWeight: '500',
  },
  tabsWrapper: {
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tabContainer: {
    flexGrow: 0,
  },
  tabContent: {
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(8),
    gap: scaleSize(8),
  },
  tab: {
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(8),
    borderRadius: scaleSize(20),
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: scaleSize(95),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  tabText: {
    fontSize: scaleFont(12),
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  contentContainer: {
    paddingHorizontal: scaleSize(16),
    paddingVertical: scaleSize(12),
  },
  listContent: {
    paddingVertical: scaleSize(4),
  },
  filtersWrapper: {
    marginBottom: scaleSize(12),
  },
  filtersContainer: {
    flexGrow: 0,
  },
  filtersContent: {
    paddingVertical: scaleSize(6),
    gap: scaleSize(8),
  },
  filterChip: {
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(8),
    borderRadius: scaleSize(18),
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: scaleSize(70),
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterText: {
    fontSize: scaleFont(12),
    fontWeight: '600',
    color: '#94A3B8',
  },
  filterTextActive: {
    color: '#fff',
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: scaleSize(14),
    padding: scaleSize(14),
    marginBottom: scaleSize(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  articleIcon: {
    width: scaleSize(56),
    height: scaleSize(56),
    borderRadius: scaleSize(12),
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scaleSize(12),
    flexShrink: 0,
  },
  iconText: {
    fontSize: scaleFont(26),
  },
  articleContent: {
    flex: 1,
    marginRight: scaleSize(8),
  },
  articleTitle: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    color: '#fff',
    marginBottom: scaleSize(6),
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(6),
  },
  categoryBadge: {
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleSize(4),
    backgroundColor: '#334155',
    borderRadius: scaleSize(6),
  },
  categoryBadgeText: {
    fontSize: scaleFont(10),
    fontWeight: '600',
    color: '#94A3B8',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(3),
  },
  durationText: {
    fontSize: scaleFont(10),
    color: '#999',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: scaleFont(15),
    fontWeight: '700',
    color: '#fff',
    marginBottom: scaleSize(10),
    marginTop: scaleSize(6),
  },
  playlistCard: {
    backgroundColor: '#1E293B',
    borderRadius: scaleSize(14),
    padding: scaleSize(14),
    marginBottom: scaleSize(12),
    borderWidth: 1,
    borderColor: '#334155',
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleSize(10),
  },
  playlistName: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    color: '#fff',
    marginBottom: scaleSize(2),
    flex: 1,
  },
  playlistInfo: {
    fontSize: scaleFont(11),
    color: '#999',
    fontWeight: '500',
  },
  audiosLabel: {
    fontSize: scaleFont(11),
    color: '#999',
    fontWeight: '600',
    marginBottom: scaleSize(8),
    marginTop: scaleSize(6),
  },
  audioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleSize(6),
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  audioName: {
    fontSize: scaleFont(11),
    color: '#CBD5E1',
    fontWeight: '500',
    marginLeft: scaleSize(6),
    flex: 1,
  },
  playButton: {
    marginTop: scaleSize(12),
    paddingVertical: scaleSize(10),
    borderRadius: scaleSize(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    color: '#fff',
    fontSize: scaleFont(12),
    fontWeight: '700',
  },
  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: scaleSize(14),
    padding: scaleSize(14),
    marginBottom: scaleSize(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  exerciseIcon: {
    width: scaleSize(56),
    height: scaleSize(56),
    borderRadius: scaleSize(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scaleSize(12),
    opacity: 0.15,
    flexShrink: 0,
  },
  exerciseContent: {
    flex: 1,
    marginRight: scaleSize(8),
  },
  exerciseTitle: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    color: '#fff',
    marginBottom: scaleSize(6),
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(6),
  },
  difficultyBadge: {
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleSize(4),
    borderRadius: scaleSize(6),
    opacity: 0.2,
  },
  difficultyText: {
    fontSize: scaleFont(10),
    fontWeight: '600',
    color: '#fff',
  },
});

export default ResourceHubScreen;
