/**
 * CONFIGURATION & CONSTANTS
 */

// Grid System
export const COLS = 20; 
export const ROWS = 20;
// We'll export a mutable object for BLOCK_SIZE since it changes on resize, 
// or simpler: just export a function to calculate it or a state object.
// For now, let's keep it simple. BLOCK_SIZE is dynamic, so it should be part of the game state or a getter.
// However, the original code had it as a global 'let'.
// Best approach for modules: Export a state object for dynamic values.
export const GameConfig = {
    BLOCK_SIZE: 25,
    SPEED: 40
};

// NEON PALETTE
export const COLORS = {
    BG_DARK: '#050505',
    BG_LIGHT: '#121212',
    GRID: 'rgba(255, 255, 255, 0.03)',
    HEAD: '#FFFFFF',
    BODY: '#bc13fe', // Neon Purple
    BODY_GLOW: 'rgba(188, 19, 254, 0.6)',
    FOOD_NORMAL: '#00f3ff', // Neon Cyan
    FOOD_BONUS: '#ffd700'  // Neon Gold
};

export const MAX_MOVES_WITHOUT_EAT = 500;
