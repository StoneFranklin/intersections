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

export function useGameState(puzzle: Puzzle): UseGameStateReturn {
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
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start/stop timer based on game state
  useEffect(() => {
    // Clear any existing timer first to prevent memory leaks
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Start timer when game begins
    if (!gameState.isSolved && gameState.lives > 0) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState.isSolved, gameState.lives]);

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
    }
  }, [gameState.isSolved, isGameOver, elapsedTime, mistakes, correctPlacements, totalCells, finalScore]);

  // Reset when puzzle changes
  useEffect(() => {
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
    startTimeRef.current = Date.now();
  }, [puzzle]);

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
    if (finalScore && !gameState.isSolved) {
      setFinalScore(null);
      // Restart the timer
      startTimeRef.current = Date.now() - (elapsedTime * 1000);
    }
  }, [finalScore, gameState.isSolved, elapsedTime]);

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
