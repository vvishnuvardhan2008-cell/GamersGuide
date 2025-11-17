import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getLibrary } from '../../config/api.js';

type LibraryItem = {
  guideId: string;
  title: string;
  gameTitle: string;
  content: string;
  ratingSum: number;
  ratingCount: number;
};

type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
};

// Hero images for the GAMES (Recommended Games list)
const GAME_IMAGES: Record<string, any> = {
  'Elden Ring': require('../../assets/games/elden.jpg'),
  'League of Legends': require('../../assets/games/league.jpg'),
  'Overwatch 2': require('../../assets/games/ow.jpg'),
  // fallback if a game title isn’t in the map
  __default: require('../../assets/games/starwars.png'),
};

// Guide-specific images (shown on the full guide page)
const GUIDE_IMAGES: Record<string, any> = {
  'How to beat Malenia': require('../../assets/games/malenia.jpg'),
  'Beginner Midlane Tips': require('../../assets/games/midlane.jpg'),
  'How to Make Strength Builds' : require('../../assets/games/builds.jpg'),
  'Renger Guide': require('../../assets/games/renger.jpg'),
  'Tank Rundown': require('../../assets/games/ow.jpg'),
  // fallback if a guide title isn’t in the map
  __default: require('../../assets/games/midlane.jpg'),
};

function renderStars(average: number): string {
  if (!Number.isFinite(average) || average <= 0) {
    return '☆☆☆☆☆';
  }
  const fullStars = Math.round(average);
  return Array.from({ length: 5 }, (_, i) =>
    i < fullStars ? '⭐' : '☆'
  ).join('');
}

export default function LibraryScreen() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<LibraryItem | null>(null);

  const [gameSearch, setGameSearch] = useState('');   // search in game list
  const [search, setSearch] = useState('');           // search in guides

  const [reviewsByGuide, setReviewsByGuide] = useState<
    Record<string, Review[]>
  >({
    demo1: [
      {
        id: 'r1',
        author: 'User1',
        rating: 5,
        text: 'Absolute game changer, thank you!',
      },
      {
        id: 'r2',
        author: 'User2',
        rating: 4,
        text: 'Amazing guide for those trying to learn the fight.',
      },
    ],
  });
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // temp user info to match other screens
  const userName = 'Andbaonguyen';
  const avatarUri: string | null = null;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getLibrary();
        setItems(data);
      } catch (e) {
        console.log(e);
        setError('Unable to load your library.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Unique list of games from guides
  const games = Array.from(new Set(items.map((i) => i.gameTitle)));

  // Apply game search filter
  const filteredGames = games.filter((title) =>
    title.toLowerCase().includes(gameSearch.trim().toLowerCase())
  );

  // Guides visible in the detail view
  const guidesForSelectedGame =
    selectedGame == null
      ? []
      : items.filter((i) => {
          if (i.gameTitle !== selectedGame) return false;
          if (!search.trim()) return true;
          return i.title
            .toLowerCase()
            .includes(search.trim().toLowerCase());
        });

  const handleSubmitReview = () => {
    if (!selectedGuide) return;
    const text = newReviewText.trim();
    if (!text || newReviewRating === 0) return;

    const guideId = selectedGuide.guideId;
    const existing = reviewsByGuide[guideId] || [];
    const newReview: Review = {
      id: Date.now().toString(),
      author: 'You',
      rating: newReviewRating,
      text,
    };

    // 1) update local review list
    setReviewsByGuide({
      ...reviewsByGuide,
      [guideId]: [newReview, ...existing],
    });

    // 2) update ratingSum / ratingCount on the main items array
    setItems((prev) =>
      prev.map((g) =>
        g.guideId === guideId
          ? {
              ...g,
              ratingSum: g.ratingSum + newReviewRating,
              ratingCount: g.ratingCount + 1,
            }
          : g
      )
    );

    // 3) update the currently selected guide so the header card updates
    setSelectedGuide((prev) =>
      prev && prev.guideId === guideId
        ? {
            ...prev,
            ratingSum: prev.ratingSum + newReviewRating,
            ratingCount: prev.ratingCount + 1,
          }
        : prev
    );

    setNewReviewText('');
    setNewReviewRating(0);
  };

  const renderListContent = () => {
    // Loading state
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
          <Text style={styles.subtitle}>Loading your library...</Text>
        </View>
      );
    }

    // Error state
    if (error) {
      return (
        <View style={styles.centerContent}>
          <Ionicons name="warning" size={64} color="#e74c3c" />
          <Text style={styles.title}>Oops!</Text>
          <Text style={styles.subtitle}>{error}</Text>
        </View>
      );
    }

    // Empty state
    if (!items || items.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Ionicons name="library" size={80} color="#ccc" />
          <Text style={styles.title}>Your Library</Text>
          <Text style={styles.subtitle}>
            Your saved games will appear here
          </Text>
        </View>
      );
    }

    // 🟣 VIEW 3: Selected guide → full guide + review flow
    if (selectedGame != null && selectedGuide != null) {
      const guide = selectedGuide;
      const guideImage =
        GUIDE_IMAGES[guide.title] ?? GUIDE_IMAGES.__default;
      const avg =
        guide.ratingCount && guide.ratingCount > 0
          ? guide.ratingSum / guide.ratingCount
          : 0;
      const guideReviews = reviewsByGuide[guide.guideId] || [];

      return (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Back to guide list */}
          <TouchableOpacity
            style={styles.backRow}
            onPress={() => {
              setSelectedGuide(null);
              setShowReviewForm(false);
              setNewReviewText('');
              setNewReviewRating(0);
            }}
          >
            <Ionicons name="chevron-back" size={20} color="#111827" />
            <Text style={styles.backText}>Back to guides</Text>
          </TouchableOpacity>

          {/* Title card */}
          <View style={styles.reviewHeaderCard}>
            <View style={styles.reviewTitleRow}>
              <Text style={styles.reviewTitleText}>{guide.title}</Text>
            </View>
            <View style={styles.reviewMetaRow}>
              <Text style={styles.gameMeta}>Created by: User1</Text>
              <Text style={styles.gameMeta}>
                {guide.ratingCount > 0
                  ? `${avg.toFixed(1)}/5 stars\n${guide.ratingCount} reviews`
                  : 'No ratings yet'}
              </Text>
            </View>
          </View>

          {/* Guide content card with creator’s image */}
          <View style={styles.reviewContentCard}>
            <Image
              source={guideImage}
              style={styles.reviewHeroImage}
              resizeMode="cover"
            />
            <Text style={styles.reviewBodyText}>{guide.content}</Text>
          </View>

          {/* "Submit a review" link */}
          {!showReviewForm && (
            <TouchableOpacity
              style={styles.reviewLinkButton}
              onPress={() => setShowReviewForm(true)}
            >
              <Text style={styles.reviewLinkText}>Submit a review</Text>
            </TouchableOpacity>
          )}

          {/* Review form + list */}
          {showReviewForm && (
            <>
              <View style={styles.reviewForm}>
                <Text style={styles.sectionTitle}>Submit a review</Text>
                <View style={styles.reviewTextareaWrapper}>
                  <TextInput
                    style={styles.reviewTextarea}
                    placeholder="Enter your review here"
                    placeholderTextColor="#9ca3af"
                    value={newReviewText}
                    onChangeText={setNewReviewText}
                    multiline
                  />
                </View>

                {/* star selector */}
                <View style={styles.reviewStarsRow}>
                  {([1, 2, 3, 4, 5] as const).map((n) => (
                    <TouchableOpacity
                      key={n}
                      onPress={() => setNewReviewRating(n)}
                    >
                      <Text style={styles.reviewStar}>
                        {n <= newReviewRating ? '⭐' : '☆'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <Text style={styles.reviewStarLabel}>
                    {newReviewRating === 0
                      ? 'Tap to rate'
                      : `${newReviewRating}/5`}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.reviewSubmitButton}
                  onPress={handleSubmitReview}
                >
                  <Text style={styles.reviewSubmitText}>Submit</Text>
                </TouchableOpacity>
              </View>

              {/* Existing reviews list */}
              <View style={{ marginTop: 16 }}>
                <View style={styles.sortRow}>
                  <Ionicons
                    name="swap-vertical"
                    size={16}
                    color="#4b5563"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.sortText}>
                    Sort by: Most helpful
                  </Text>
                </View>

                {guideReviews.map((r) => (
                  <View key={r.id} style={styles.reviewItem}>
                    <Text style={styles.reviewItemText}>{r.text}</Text>
                    <View style={styles.reviewItemMetaRow}>
                      <Text style={styles.reviewItemStars}>
                        {renderStars(r.rating)}
                      </Text>
                      <Text style={styles.reviewItemAuthor}>
                        By: {r.author}
                      </Text>
                    </View>
                  </View>
                ))}

                {guideReviews.length === 0 && (
                  <Text style={styles.gameMeta}>
                    No reviews yet. Be the first to leave one!
                  </Text>
                )}
              </View>
            </>
          )}
        </ScrollView>
      );
    }

    // 🟡 VIEW 1: Recommended games list (no game selected)
    if (selectedGame == null) {
      return (
        <>
          <Text style={styles.sectionTitle}>Recommended Games</Text>

          {/* Game search bar */}
          <View style={styles.searchRow}>
            <View style={styles.searchInputWrapper}>
              <Ionicons
                name="search"
                size={16}
                color="#9ca3af"
                style={{ marginRight: 4 }}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for games here"
                value={gameSearch}
                onChangeText={setGameSearch}
              />
            </View>

            <View style={styles.sortRow}>
              <Ionicons
                name="swap-vertical"
                size={16}
                color="#4b5563"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.sortText}>Sort by: Relevance</Text>
            </View>
          </View>

          <FlatList
            data={filteredGames}
            keyExtractor={(title) => title}
            contentContainerStyle={styles.recommendedList}
            renderItem={({ item: title }) => {
              const gameImage =
                GAME_IMAGES[title] ?? GAME_IMAGES.__default;

              return (
                <TouchableOpacity
                  style={styles.recommendedCard}
                  onPress={() => {
                    setSelectedGame(title);
                    setSelectedGuide(null);
                    setSearch('');
                  }}
                >
                  <Image
                    source={gameImage}
                    style={styles.recommendedImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.recommendedTitle}>{title}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </>
      );
    }

    // 🟢 VIEW 2: Selected game detail + list of guides
    return (
      <>
        {/* Back to games */}
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => {
            setSelectedGame(null);
            setSelectedGuide(null);
            setShowReviewForm(false);
            setSearch('');
          }}
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
          <Text style={styles.backText}>Back to Recommended Games</Text>
        </TouchableOpacity>

        {/* Search + sort row for guides */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Ionicons
              name="search"
              size={16}
              color="#9ca3af"
              style={{ marginRight: 4 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for games guides here"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <View style={styles.sortRow}>
            <Ionicons
              name="swap-vertical"
              size={16}
              color="#4b5563"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.sortText}>Sort by: Relevance</Text>
          </View>
        </View>

        {/* Guides list for this game */}
        <FlatList
          data={guidesForSelectedGame}
          keyExtractor={(item) =>
            item.guideId || Math.random().toString()
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const avg =
              item.ratingCount && item.ratingCount > 0
                ? item.ratingSum / item.ratingCount
                : 0;

            return (
              <TouchableOpacity
                onPress={() => {
                  setSelectedGuide(item);
                  setShowReviewForm(false);
                  setNewReviewText('');
                  setNewReviewRating(0);
                }}
              >
                <View style={styles.card}>
                  <Text style={styles.gameTitle}>{item.title}</Text>
                  <Text style={styles.gameMeta}>Created by: User1</Text>
                  <Text style={styles.gameMeta}>
                    Rating: {renderStars(avg)}{' '}
                    {item.ratingCount > 0
                      ? `(${avg.toFixed(1)} stars, ${
                          item.ratingCount
                        } reviews)`
                      : '(no ratings yet)'}
                  </Text>
                  <Text style={styles.gameMeta}>
                    {item.content.slice(0, 70)}...
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header matching Home / Gammy */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>GamersGui{'\n'}de</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.profileContainer}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons name="person-circle" size={40} color="#333" />
            )}
          </TouchableOpacity>

          <View>
            <Text style={styles.userName}>{userName}</Text>
            <TouchableOpacity>
              <Text style={styles.reportText}>Report a problem</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main library content */}
      <View style={styles.content}>{renderListContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 26,
  },
  profileContainer: {
    width: 40,
    height: 40,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  reportText: {
    fontSize: 12,
    color: '#6366f1',
  },

  content: {
    flex: 1,
    padding: 20,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },

  recommendedList: {
    paddingBottom: 20,
  },
  recommendedCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  recommendedImage: {
    width: '100%',
    height: 150,
  },
  recommendedTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backText: {
    fontSize: 14,
    color: '#111827',
  },

  // Shared search row (used for games + guides)
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 12,
    color: '#4b5563',
  },

  listContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  gameMeta: {
    marginTop: 2,
    color: '#555',
    fontSize: 13,
  },

  // Review detail styles
  reviewHeaderCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
  reviewTitleRow: {
    marginBottom: 8,
  },
  reviewTitleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewContentCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  reviewHeroImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewBodyText: {
    fontSize: 14,
    color: '#374151',
  },

  reviewLinkButton: {
    marginTop: 8,
    marginLeft: 4,
    marginBottom: 4,
  },
  reviewLinkText: {
    fontSize: 14,
    color: '#2563eb',
    textDecorationLine: 'underline',
  },

  reviewForm: {
    marginTop: 8,
    marginBottom: 8,
  },
  reviewTextareaWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    padding: 8,
    marginBottom: 8,
  },
  reviewTextarea: {
    minHeight: 90,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  reviewStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewStar: {
    fontSize: 24,
    marginRight: 4,
  },
  reviewStarLabel: {
    marginLeft: 8,
    fontSize: 13,
    color: '#4b5563',
  },
  reviewSubmitButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#2563eb',
  },
  reviewSubmitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  reviewItem: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reviewItemText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#111827',
  },
  reviewItemMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewItemStars: {
    fontSize: 14,
  },
  reviewItemAuthor: {
    fontSize: 12,
    color: '#4b5563',
  },
});
