import { shuffleWords } from '@/data/puzzles';
import {
    CellPosition,
    GameState,
    isPlacementCorrect,
    isPuzzleSolved,
    PlacedWord,
    Puzzle,
    Word,
} from '@/types/game';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
}

export function useGameState(puzzle: Puzzle): UseGameStateReturn {
  const [shuffledWords, setShuffledWords] = useState(() => shuffleWords(puzzle));
  
  const [gameState, setGameState] = useState<GameState>(() => ({
    puzzle,
    placements: [],
    selectedWordId: null,
    isSolved: false,
    mistakes: 0,
  }));

  // Reset when puzzle changes
  useEffect(() => {
    setShuffledWords(shuffleWords(puzzle));
    setGameState({
      puzzle,
      placements: [],
      selectedWordId: null,
      isSolved: false,
      mistakes: 0,
    });
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

      setGameState(prev => ({
        ...prev,
        placements: newPlacements,
        selectedWordId: null,
        isSolved: solved,
      }));

      return true;
    },
    [gameState, puzzle]
  );

  const removeWordFromCell = useCallback((position: CellPosition) => {
    setGameState(prev => ({
      ...prev,
      placements: prev.placements.filter(
        p => !(p.position.rowIndex === position.rowIndex && 
               p.position.colIndex === position.colIndex)
      ),
      isSolved: false,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      puzzle,
      placements: [],
      selectedWordId: null,
      isSolved: false,
      mistakes: 0,
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
  };
}
