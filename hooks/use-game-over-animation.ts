import { CellPosition, isPlacementCorrect, PlacedWord, Puzzle, Word } from '@/types/game';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseGameOverAnimationOptions {
  puzzle: Puzzle;
  placements: PlacedWord[];
  isActive: boolean;
  onComplete: () => void;
  /** Delay between each word reveal in ms */
  staggerDelay?: number;
  /** Delay before starting the reveal in ms */
  initialDelay?: number;
}

interface UseGameOverAnimationReturn {
  getWordAtCell: (position: CellPosition) => Word | null;
  isCellCorrect: (position: CellPosition) => boolean | null;
  isAnimating: boolean;
}

export function useGameOverAnimation({
  puzzle,
  placements,
  isActive,
  onComplete,
  staggerDelay = 400,
  initialDelay = 800,
}: UseGameOverAnimationOptions): UseGameOverAnimationReturn {
  const [revealedPlacements, setRevealedPlacements] = useState<PlacedWord[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasStarted = useRef(false);

  // Calculate which placements are correct from the user's placements
  const correctUserPlacements = useCallback(() => {
    return placements.filter(p => {
      const word = puzzle.words.find(w => w.id === p.wordId);
      return word && isPlacementCorrect(word, p.position, puzzle);
    });
  }, [placements, puzzle]);

  // Calculate which words still need to be revealed
  const missingPlacements = useCallback(() => {
    const correctIds = new Set(
      correctUserPlacements().map(p => p.wordId)
    );

    const missing: PlacedWord[] = [];
    for (const word of puzzle.words) {
      if (correctIds.has(word.id)) continue;

      // Find the correct position for this word
      const rowIndex = puzzle.rowCategories.findIndex(c => c.id === word.correctRowId);
      const colIndex = puzzle.colCategories.findIndex(c => c.id === word.correctColId);
      if (rowIndex >= 0 && colIndex >= 0) {
        missing.push({ wordId: word.id, position: { rowIndex, colIndex } });
      }
    }
    return missing;
  }, [puzzle, correctUserPlacements]);

  useEffect(() => {
    if (!isActive || hasStarted.current) return;
    hasStarted.current = true;

    const correct = correctUserPlacements();
    const missing = missingPlacements();

    // Start with only the user's correct placements
    setRevealedPlacements([...correct]);
    setIsAnimating(true);

    if (missing.length === 0) {
      // Nothing to reveal
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onComplete();
      }, 500);
      timersRef.current.push(timer);
      return;
    }

    // Stagger reveal of missing words
    missing.forEach((placement, index) => {
      const timer = setTimeout(() => {
        setRevealedPlacements(prev => [...prev, placement]);

        // After the last word is revealed, wait a beat then complete
        if (index === missing.length - 1) {
          const finalTimer = setTimeout(() => {
            setIsAnimating(false);
            onComplete();
          }, 1000);
          timersRef.current.push(finalTimer);
        }
      }, initialDelay + index * staggerDelay);
      timersRef.current.push(timer);
    });

    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
    };
  }, [isActive, correctUserPlacements, missingPlacements, onComplete, staggerDelay, initialDelay]);

  // Reset when not active
  useEffect(() => {
    if (!isActive) {
      hasStarted.current = false;
      setRevealedPlacements([]);
      setIsAnimating(false);
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
    }
  }, [isActive]);

  const getWordAtCell = useCallback((position: CellPosition): Word | null => {
    const placement = revealedPlacements.find(
      p => p.position.rowIndex === position.rowIndex && p.position.colIndex === position.colIndex
    );
    if (!placement) return null;
    return puzzle.words.find(w => w.id === placement.wordId) || null;
  }, [revealedPlacements, puzzle]);

  const isCellCorrect = useCallback((position: CellPosition): boolean | null => {
    const word = getWordAtCell(position);
    if (!word) return null;
    return true; // All revealed words are correct
  }, [getWordAtCell]);

  return { getWordAtCell, isCellCorrect, isAnimating };
}
