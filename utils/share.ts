import { Platform, Share } from 'react-native';
import { GameScore } from '@/types/game';

// Format seconds into MM:SS
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Generate share text for score
export function generateShareText(score: GameScore, rank: number | null): string {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Choose emoji based on correct placements
  let emoji = '💀'; // 0-4 correct - dead
  if (score.correctPlacements >= 16) {
    emoji = '🤩'; // Perfect!
  } else if (score.correctPlacements >= 14) {
    emoji = '😎'; // Excellent
  } else if (score.correctPlacements >= 12) {
    emoji = '😊'; // Very good
  } else if (score.correctPlacements >= 10) {
    emoji = '🙂'; // Good
  } else if (score.correctPlacements >= 8) {
    emoji = '😅'; // Meh
  } else if (score.correctPlacements >= 5) {
    emoji = '😬'; // Yikes
  }

  let text = `✴️ 𝗜𝗡𝗧𝗘𝗥𝗦𝗘𝗖𝗧𝗜𝗢𝗡𝗦 — ${today}\n\n`;
  text += `📈 My score: ${score.score}\n`;
  text += `${emoji} ${score.correctPlacements}/16 correct in ${formatTime(score.timeSeconds)}\n`;

  if (rank !== null) {
    text += `🏆 Ranked #${rank} today\n`;
  }

  text += `\n➡️ Play at: stonefranklin.github.io/intersections`;

  return text;
}

// Share score function
export async function shareScore(score: GameScore, rank: number | null) {
  const text = generateShareText(score, rank);

  if (Platform.OS === 'web') {
    // Web share API or fallback to clipboard
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        await navigator.clipboard.writeText(text);
        alert('Score copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('Score copied to clipboard!');
    }
  } else {
    // Native share
    try {
      await Share.share({ message: text });
    } catch (e) {
      console.error('Share error:', e);
    }
  }
}

