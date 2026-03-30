import { GameScore } from '@/types/game';
import { formatTime } from '@/utils/share';
import React, { forwardRef } from 'react';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import ViewShot from 'react-native-view-shot';

interface ShareCardProps {
  score: GameScore;
  rank: number | null;
}

export const ShareCard = forwardRef<ViewShot, ShareCardProps>(({ score, rank }, ref) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.offscreen} pointerEvents="none" collapsable={false}>
      <ViewShot
        ref={ref}
        options={{ format: 'png', quality: 1, result: 'tmpfile' }}
      >
        <ImageBackground
          source={require('@/assets/images/background_full.png')}
          style={styles.card}
          imageStyle={styles.bgImage}
        >
          {/* Logo */}
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/intersections-splash.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.date}>{today}</Text>
          </View>

          {/* Rank Badge */}
          {rank !== null && (
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>🏆 #{rank} in the world</Text>
            </View>
          )}

          {/* Score Grid */}
          <View style={styles.scoreGrid}>
            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>{score.score}</Text>
                <Text style={styles.scoreLabel}>SCORE</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>
                  {score.correctPlacements}/16
                </Text>
                <Text style={styles.scoreLabel}>CORRECT</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>
                  {formatTime(score.timeSeconds)}
                </Text>
                <Text style={styles.scoreLabel}>TIME</Text>
              </View>
            </View>
          </View>

          {/* Call to Action */}
          <View style={styles.ctaContainer}>
            <Text style={styles.ctaText}>🤔 Can you beat my score?</Text>
          </View>

          {/* Store Badges */}
          <View style={styles.badgeRow}>
            <Image
              source={require('@/assets/images/app-store-badge.png')}
              style={styles.storeBadge}
              resizeMode="contain"
            />
            <Image
              source={require('@/assets/images/google-play-badge.png')}
              style={styles.storeBadge}
              resizeMode="contain"
            />
          </View>
        </ImageBackground>
      </ViewShot>
    </View>
  );
});

ShareCard.displayName = 'ShareCard';

const GOLD = '#FFD700';

const styles = StyleSheet.create({
  offscreen: {
    position: 'absolute',
    left: -1000,
    top: 0,
  },
  card: {
    width: 360,
    borderRadius: 20,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  bgImage: {
    borderRadius: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  logo: {
    width: 320,
    height: 200,
  },
  date: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 0,
    color: 'rgba(255,255,255,0.7)',
  },
  rankBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '800',
    color: GOLD,
  },
  scoreGrid: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  ctaContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    gap: 12,
  },
  storeBadge: {
    height: 40,
    width: 130,
  },
});
