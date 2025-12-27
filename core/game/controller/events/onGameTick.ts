import {gameState } from './gameState.js';

export function onGameTickListener(): void {
    const isBasketball = window.gameRoom.config._RUID === "basketball";
    if (isBasketball) {
        const ball = window.gameRoom._room.getBallPosition();

        if (!ball) return;
        if (!ball.x) return;
        let currentSide: "red" | "blue" | null = null;
        if (ball.x < 0) currentSide = "red";
        else if (ball.x > 0) currentSide = "blue";

        if (ball.x === 0) {
            gameState.ballSide = null;
            gameState.sideStartTime = null;
            return;
        }

        if (currentSide !== gameState.ballSide) {
            gameState.ballSide = currentSide;
            gameState.sideStartTime = Date.now();
        } else {
            if (gameState.sideStartTime && Date.now() - gameState.sideStartTime > 10000) {
                if (gameState.ballSide === "red") {
                    window.gameRoom._room.setDiscProperties(0, { x: 200, y: 100, xspeed: 0, yspeed: 0 });
                } else if (gameState.ballSide === "blue") {
                    window.gameRoom._room.setDiscProperties(0, { x: -200, y: 100, xspeed: 0, yspeed: 0 });
                }
                gameState.sideStartTime = null;
                gameState.ballSide = null;
            }
        }
    }
}
