import { GameScore } from '@/types/game';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform, Share } from 'react-native';
import ViewShot from 'react-native-view-shot';

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
  const mistakeEmoji = score.mistakes === 0 ? '✅' : '❌';
  text += `${mistakeEmoji} ${score.mistakes} mistake${score.mistakes === 1 ? '' : 's'}\n`;

  if (rank !== null) {
    text += `🏆 Ranked #${rank} today\n`;
  }

  text += `\n📲 Download free:\n`;
  text += `iOS: apps.apple.com/us/app/intersections-daily-trivia/id6756741688\n`;
  text += `Android: play.google.com/store/apps/details?id=com.stonefranklin.intersections`;

  return text;
}

// Capture the share card as an image and save to a shareable file
async function captureShareCard(viewShotRef: React.RefObject<ViewShot | null>): Promise<string | null> {
  try {
    if (!viewShotRef.current?.capture) {
      console.warn('ShareCard ref not available for capture');
      return null;
    }
    const uri = await viewShotRef.current.capture();
    console.log('ViewShot captured:', uri);

    // Copy to a well-known path so the file has a proper .png extension for sharing.
    const dest = new File(Paths.cache, 'intersections-score.png');
    const source = new File(uri);
    source.copy(dest);
    return dest.uri;
  } catch (e) {
    console.error('Failed to capture share card:', e);
    return null;
  }
}

// Share score with image (native) or text fallback (web)
export async function shareScore(
  score: GameScore,
  rank: number | null,
  viewShotRef?: React.RefObject<ViewShot | null>,
) {
  const text = generateShareText(score, rank);

  if (Platform.OS === 'web') {
    // Web: use text-based sharing (view-shot doesn't work on web)
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
    // Native: try to share with image
    try {
      const imageUri = viewShotRef ? await captureShareCard(viewShotRef) : null;

      if (imageUri) {
        if (Platform.OS === 'android') {
          // Android: use expo-sharing which properly handles file URIs
          await Sharing.shareAsync(imageUri, {
            mimeType: 'image/png',
            dialogTitle: text,
          });
        } else {
          // iOS: Share API supports url for images
          await Share.share({
            message: text,
            url: imageUri,
          });
        }
      } else {
        // Fallback to text-only
        await Share.share({ message: text });
      }
    } catch (e) {
      console.error('Share error:', e);
    }
  }
}
