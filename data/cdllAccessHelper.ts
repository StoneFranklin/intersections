import type { IntersectionsCell, IntersectionsDailyPuzzle } from '@/types/game';

export const GRID_SIZE = 4;

export function rowColToIndex(row: number, col: number): number {
  return row * GRID_SIZE + col;
}

export function getCell(
  puzzle: IntersectionsDailyPuzzle,
  row: number,
  col: number
): IntersectionsCell | null {
  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
    return null;
  }
  const index = rowColToIndex(row, col);
  return puzzle.cells[index] ?? null;
}
