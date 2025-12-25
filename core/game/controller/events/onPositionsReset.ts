import { gameState } from './gameState.js';

export function onPositionsResetListener(): void {
    gameState.ballSide = null;
    gameState.sideStartTime = null;
}
