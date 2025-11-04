import {gameState } from './gameState.js';

export function onGameTickListener(): void {
    const ball = window.gameRoom._room.getBallPosition();

    if (!ball) return;
    if (!ball.x) return;
    // Sprawdzenie po której stronie jest piłka
    let currentSide: "red" | "blue" | null = null;
    if (ball.x < 0) currentSide = "red";
    else if (ball.x > 0) currentSide = "blue";

    // Jeśli piłka dokładnie na linii środkowej
    if (ball.x === 0) {
        gameState.ballSide = null;
        gameState.sideStartTime = null;
        return;
    }

    // Jeśli piłka zmieniła stronę
    if (currentSide !== gameState.ballSide) {
        gameState.ballSide = currentSide;
        gameState.sideStartTime = Date.now();
    } else {
        // Jeśli piłka na tej samej stronie zbyt długo
        if (gameState.sideStartTime && Date.now() - gameState.sideStartTime > 10000) {
            if (gameState.ballSide === "red") {
                // przenosi piłkę na stronę blue
                window.gameRoom._room.setDiscProperties(0, { x: 200, y: 100, xspeed: 0, yspeed: 0 });
            } else if (gameState.ballSide === "blue") {
                // przenosi piłkę na stronę red
                window.gameRoom._room.setDiscProperties(0, { x: -200, y: 100, xspeed: 0, yspeed: 0 });
            }
            // Reset czasu po teleportacji
            gameState.sideStartTime = null;
            gameState.ballSide = null;
        }
    }
}
