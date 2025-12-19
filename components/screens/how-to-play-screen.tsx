import { styles } from '@/app/(tabs)/index.styles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HowToPlayScreenProps {
  onBack: () => void;
}

export function HowToPlayScreen({ onBack }: HowToPlayScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.leaderboardScreenHeader}>
        <TouchableOpacity onPress={onBack} style={styles.leaderboardScreenBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.leaderboardScreenTitleContainer}>
          <Text style={styles.leaderboardScreenTitle}>How to Play</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.tutorialScreenContent} showsVerticalScrollIndicator={true}>
        <Text style={styles.tutorialHeading}>Goal</Text>
        <Text style={styles.tutorialText}>
          Place each word in the grid where its two categories intersect.
        </Text>

        <Text style={styles.tutorialHeading}>Example</Text>
        <Text style={styles.tutorialText}>
          If the row is &quot;Fruits&quot; and the column is &quot;Red Things&quot;, the correct
          word might be &quot;Apple&quot; — it belongs to both categories!
        </Text>

        <Text style={styles.tutorialHeading}>How to Play</Text>
        <Text style={styles.tutorialText}>
          1. Tap a word from the tray below the grid{'\n'}
          2. Tap a cell in the grid to place it{'\n'}
          3. Tap a placed word to remove it{'\n'}
          4. Fill all 16 cells correctly to win!
        </Text>

        <Text style={styles.tutorialHeading}>Lives</Text>
        <Text style={styles.tutorialText}>
          You have 3 lives. Each incorrect placement costs one life. Lose all lives and the game
          ends.
        </Text>

        <Text style={styles.tutorialHeading}>Scoring</Text>
        <Text style={styles.tutorialText}>
          • Complete the puzzle: up to 1000 points{'\n'}
          • Faster = higher score{'\n'}
          • Fewer mistakes = higher score{'\n'}
          • Compare your score with other players!
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

