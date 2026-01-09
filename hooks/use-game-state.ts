import { shuffleWords } from '@/data/puzzles';
import {
    calculateScore,
    CellPosition,
    GameScore,
    GameState,
    isPlacementCorrect,
    isPuzzleSolved,
    PlacedWord,
    Puzzle,
    Word,
} from '@/types/game';
import { dailyGameStartKey } from '@/utils/dailyScoreStorage';
import { getTodayKey } from '@/utils/dateKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface UseGameStateReturn {
  /** Current game state */
  gameState: GameState;
  /** Shuffled words for display in the tray */
  shuffledWords: Word[];
  /** Words that haven't been placed yet */
  unplacedWords: Word[];
  /** Get the word placed at a specific cell, if any */
  getWordAtCell: (position: CellPosition) => Word | null;
  /** Select a word from the tray */
  selectWord: (wordId: string | null) => void;
  /** Place the selected word at a cell */
  placeWordAtCell: (position: CellPosition) => boolean;
  /** Remove a word from a cell (return it to tray) */
  removeWordFromCell: (position: CellPosition) => void;
  /** Reset the puzzle */
  resetGame: () => void;
  /** Check if a specific cell has the correct word */
  isCellCorrect: (position: CellPosition) => boolean | null;
  /** Grant an extra life (from rewarded ad) */
  grantExtraLife: () => void;
  /** Current elapsed time in seconds */
  elapsedTime: number;
  /** Number of mistakes made */
  mistakes: number;
  /** Number of correct placements */
  correctPlacements: number;
  /** Final score (valid when puzzle is solved OR game over) */
  finalScore: GameScore | null;
}

const STARTING_LIVES = 3;

export interface UseGameStateOptions {
  /** If true, timer state will be persisted to AsyncStorage (for daily puzzle only) */
  persistTimer?: boolean;
  /** If true, the timer will be paused (e.g., during ads) */
  isPaused?: boolean;
}

export function useGameState(puzzle: Puzzle, options?: UseGameStateOptions): UseGameStateReturn {
  const { persistTimer = true, isPaused = false } = options || {};
  const [shuffledWords, setShuffledWords] = useState(() => shuffleWords(puzzle));
  
  const [gameState, setGameState] = useState<GameState>(() => ({
    puzzle,
    placements: [],
    selectedWordId: null,
    isSolved: false,
    lives: STARTING_LIVES,
  }));

  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [finalScore, setFinalScore] = useState<GameScore | null>(null);
  const [timerInitialized, setTimerInitialized] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load persisted start time on mount (for timer persistence when leaving/returning)
  // Only for daily puzzle, not practice puzzles
  useEffect(() => {
    const loadStartTime = async () => {
      if (!persistTimer) {
        // Practice mode - don't use AsyncStorage, just start fresh
        setTimerInitialized(true);
        return;
      }

      try {
        const todayKey = getTodayKey();
        const storedElapsedTime = await AsyncStorage.getItem(dailyGameStartKey(todayKey));

        if (storedElapsedTime) {
          const parsedTime = parseInt(storedElapsedTime, 10);
          if (!isNaN(parsedTime) && parsedTime >= 0) {
            // Restore elapsed time from storage
            setElapsedTime(parsedTime);
          }
        }
      } catch (error) {
        // Silently fail - timer will just start fresh
      }
      setTimerInitialized(true);
    };

    loadStartTime();
  }, [persistTimer]);

  // Start/stop timer based on game state and pause state
  useEffect(() => {
    // Wait for timer to be initialized from storage
    if (!timerInitialized) return;

    // Clear any existing timer first to prevent memory leaks
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Start timer when game is active and not paused
    if (!gameState.isSolved && gameState.lives > 0 && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          // Persist timer for daily puzzle
          if (persistTimer) {
            const todayKey = getTodayKey();
            AsyncStorage.setItem(dailyGameStartKey(todayKey), newTime.toString()).catch(() => {});
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState.isSolved, gameState.lives, timerInitialized, isPaused, persistTimer]);

  // Calculate correct placements
  const correctPlacements = useMemo(() => {
    return gameState.placements.filter(placement => {
      const word = puzzle.words.find(w => w.id === placement.wordId);
      return word && isPlacementCorrect(word, placement.position, puzzle);
    }).length;
  }, [gameState.placements, puzzle]);

  const totalCells = puzzle.words.length;
  const isGameOver = gameState.lives <= 0;

  // Calculate final score when puzzle is solved OR game over
  useEffect(() => {
    const gameEnded = gameState.isSolved || isGameOver;
    if (gameEnded && !finalScore) {
      const score = calculateScore(elapsedTime, mistakes, correctPlacements, totalCells);
      setFinalScore({
        timeSeconds: elapsedTime,
        mistakes,
        score,
        correctPlacements,
        completed: gameState.isSolved,
      });
      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Clear the stored start time since game is complete (only for daily puzzle)
      if (persistTimer) {
        const todayKey = getTodayKey();
        AsyncStorage.removeItem(dailyGameStartKey(todayKey)).catch(() => {
          // Silently fail
        });
      }
    }
  }, [gameState.isSolved, isGameOver, elapsedTime, mistakes, correctPlacements, totalCells, finalScore, persistTimer]);

  // Track if this is the initial mount
  const isInitialMount = useRef(true);

  // Reset when puzzle changes (but not on initial mount - let the storage load handle that)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setShuffledWords(shuffleWords(puzzle));
    setGameState({
      puzzle,
      placements: [],
      selectedWordId: null,
      isSolved: false,
      lives: STARTING_LIVES,
    });
    setElapsedTime(0);
    setMistakes(0);
    setFinalScore(null);

    // Reset stored time for the new puzzle (only for daily puzzle)
    if (persistTimer) {
      const todayKey = getTodayKey();
      AsyncStorage.setItem(dailyGameStartKey(todayKey), '0').catch(() => {
        // Silently fail
      });
    }
  }, [puzzle, persistTimer]);

  const unplacedWords = useMemo(() => {
    const placedIds = new Set(gameState.placements.map(p => p.wordId));
    return shuffledWords.filter(w => !placedIds.has(w.id));
  }, [shuffledWords, gameState.placements]);

  const getWordAtCell = useCallback(
    (position: CellPosition): Word | null => {
      const placement = gameState.placements.find(
        p => p.position.rowIndex === position.rowIndex && 
             p.position.colIndex === position.colIndex
      );
      if (!placement) return null;
      return puzzle.words.find(w => w.id === placement.wordId) || null;
    },
    [gameState.placements, puzzle.words]
  );

  const selectWord = useCallback((wordId: string | null) => {
    setGameState(prev => ({
      ...prev,
      selectedWordId: wordId,
    }));
  }, []);

  const placeWordAtCell = useCallback(
    (position: CellPosition): boolean => {
      const { selectedWordId, placements } = gameState;
      if (!selectedWordId) return false;

      // Check if cell is already occupied
      const existingPlacement = placements.find(
        p => p.position.rowIndex === position.rowIndex && 
             p.position.colIndex === position.colIndex
      );
      if (existingPlacement) return false;

      const word = puzzle.words.find(w => w.id === selectedWordId);
      if (!word) return false;

      const newPlacement: PlacedWord = {
        wordId: selectedWordId,
        position,
      };

      const newPlacements = [...placements, newPlacement];
      const solved = isPuzzleSolved(newPlacements, puzzle);
      const isCorrect = isPlacementCorrect(word, position, puzzle);

      // Track mistakes
      if (!isCorrect) {
        setMistakes(prev => prev + 1);
      }

      setGameState(prev => ({
        ...prev,
        placements: newPlacements,
        selectedWordId: null,
        isSolved: solved,
        lives: isCorrect ? prev.lives : prev.lives - 1,  // Only lose lives on mistakes
      }));

      return true;
    },
    [gameState, puzzle]
  );

  const removeWordFromCell = useCallback((position: CellPosition) => {
    // Check if the word at this position is correct - if so, don't allow removal
    const placement = gameState.placements.find(
      p => p.position.rowIndex === position.rowIndex && 
           p.position.colIndex === position.colIndex
    );
    
    if (placement) {
      const word = puzzle.words.find(w => w.id === placement.wordId);
      if (word && isPlacementCorrect(word, position, puzzle)) {
        // Word is correctly placed, don't allow removal
        return;
      }
    }

    setGameState(prev => ({
      ...prev,
      placements: prev.placements.filter(
        p => !(p.position.rowIndex === position.rowIndex && 
               p.position.colIndex === position.colIndex)
      ),
      isSolved: false,
    }));
  }, [gameState.placements, puzzle]);

  const resetGame = useCallback(() => {
    setGameState({
      puzzle,
      placements: [],
      selectedWordId: null,
      isSolved: false,
      lives: STARTING_LIVES,
    });
  }, [puzzle]);

  const isCellCorrect = useCallback(
    (position: CellPosition): boolean | null => {
      const word = getWordAtCell(position);
      if (!word) return null;
      return isPlacementCorrect(word, position, puzzle);
    },
    [getWordAtCell, puzzle]
  );

  const grantExtraLife = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      lives: prev.lives + 1,
    }));
    // Reset final score if it was set due to game over
    // Timer will automatically resume when isPaused becomes false
    if (finalScore && !gameState.isSolved) {
      setFinalScore(null);
    }
  }, [finalScore, gameState.isSolved]);

  return {
    gameState,
    shuffledWords,
    unplacedWords,
    getWordAtCell,
    selectWord,
    placeWordAtCell,
    removeWordFromCell,
    resetGame,
    isCellCorrect,
    grantExtraLife,
    elapsedTime,
    mistakes,
    correctPlacements,
    finalScore,
  };
}
