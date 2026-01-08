interface GameState {
    isOvertime: false | true | null,
    ballSide: "red" | "blue" | null;
    sideStartTime: number | null;
    queue: number[];
    afkPlayers: number[];
    matchStartTimestamp: number | null;
}

const gameState: GameState = {
    isOvertime: null,
    ballSide: null,
    sideStartTime: null,
    queue: [],
    afkPlayers: [],
    matchStartTimestamp: null
};

let overtimeTimer: ReturnType<typeof setTimeout> | null = null;

let matchInterval: ReturnType<typeof setInterval> | null = null;

let matchStartGameTime = 0;
function resetAllTimers() {
    // Czyść interval meczu
    if (matchInterval) {
        clearInterval(matchInterval);
        matchInterval = null;
    }
    // Czyść timer overtime
    if (overtimeTimer) {
        clearTimeout(overtimeTimer);
        overtimeTimer = null;
    }
}

function startMatchTimer() {
    resetAllTimers();

    const scores = window.gameRoom._room.getScores();
    if (!scores) return;

    matchStartGameTime = scores.time; // CZAS Z GRY
    gameState.isOvertime = false;

    const isStrongball = window.gameRoom.config._RUID === "strongball";
    const matchDuration = isStrongball ? 120 : 60; // sekundy

    matchInterval = setInterval(() => {
        const currentScores = window.gameRoom._room.getScores();
        if (!currentScores) return;

        const elapsed = currentScores.time - matchStartGameTime;

        if (elapsed >= matchDuration) {
            resetAllTimers();

            if (currentScores.red === currentScores.blue) {
                window.gameRoom._room.sendAnnouncement(
                    "⏰ Time's up! Starting overtime.",
                    null, 0xFFD700, "bold", 2
                );
                startOvertimeTimer(currentScores.time);
            } else {
                window.gameRoom._room.sendAnnouncement(
                    "🏁 Time's up!",
                    null, 0xFFD700, "bold", 2
                );
                setTimeout(() => {
                    window.gameRoom._room.stopGame();
                    handleMatchEnd();
                }, 3000);
            }
        }
    }, 500); // może być częściej niż 1s
}

let overtimeStartGameTime = 0;

function startOvertimeTimer(startTime: number) {
    gameState.isOvertime = true;
    overtimeStartGameTime = startTime;

    matchInterval = setInterval(() => {
        const scores = window.gameRoom._room.getScores();
        if (!scores) return;

        const elapsed = scores.time - overtimeStartGameTime;

        if (elapsed >= 30) {
            resetAllTimers();

            window.gameRoom._room.sendAnnouncement(
                scores.red === scores.blue
                    ? "🤝 Overtime draw!"
                    : "🏁 Overtime over!",
                null, 0xFFD700, "bold", 2
            );

            setTimeout(() => {
                window.gameRoom._room.stopGame();
                handleMatchEnd();
            }, 3000);
        }
    }, 500);
}



function resetOvertimeTimer() {
    if (overtimeTimer) clearTimeout(overtimeTimer);
}


//auto operating

function updateQueue() {
    gameState.queue = window.gameRoom._room.getPlayerList()
        .filter(p => p.team === 0 && !gameState.afkPlayers.includes(p.id)) // pomijaj AFK
        .map(p => p.id);
}

// funkcja: rozpoczęcie meczu jeśli są 2 osoby
function tryStartMatch() {
    const reds = window.gameRoom._room.getPlayerList().filter(p => p.team === 1);
    const blues = window.gameRoom._room.getPlayerList().filter(p => p.team === 2);
    const need = 2 - (reds.length + blues.length);

    updateQueue();
    // komunikaty
    if (need === 1)
        window.gameRoom._room.sendAnnouncement("💬 We need one more player for the game!", null, 0xFFFF00, "bold", 1);
    else if (need === 2)
        window.gameRoom._room.sendAnnouncement("👥 We need two more players to start the match.", null, 0xFFFF00, "bold", 1);

    // przypadek 1: obie drużyny puste
    if (gameState.queue.length >= 2 && need === 2) {
        window.gameRoom._room.setPlayerTeam(gameState.queue[0], 1); // RED
        window.gameRoom._room.setPlayerTeam(gameState.queue[1], 2); // BLUE
        window.gameRoom._room.sendAnnouncement("🏀 The match has started!", null, 0x00FF00, "bold", 2);
        window.gameRoom._room.stopGame();
        window.gameRoom.config.rules.statsRecord = true;
        window.gameRoom.isStatRecord = true;
        window.gameRoom._room.startGame();
        return;
    }

    // przypadek 2: jedna drużyna już ma gracza
    if (gameState.queue.length >= 1 && need === 1) {
        if (reds.length === 1 && blues.length === 0) {
            window.gameRoom._room.setPlayerTeam(gameState.queue[0], 2); // dołącza do blue
        } else if (blues.length === 1 && reds.length === 0) {
            window.gameRoom._room.setPlayerTeam(gameState.queue[0], 1); // dołącza do red
        }

        window.gameRoom._room.sendAnnouncement("🏀 The match has started!", null, 0x00FF00, "bold", 2);
        window.gameRoom._room.stopGame();
        window.gameRoom.config.rules.statsRecord = true;
        window.gameRoom.isStatRecord = true;
        window.gameRoom._room.startGame();
        return;
    }
}


// funkcja: po zakończeniu meczu — obsługa wyników i kolejki
function handleMatchEnd() {
    gameState.isOvertime = false;
    const scores = window.gameRoom._room.getScores();
    if (!scores) return;

    const reds = window.gameRoom._room.getPlayerList().filter(p => p.team === 1);
    const blues = window.gameRoom._room.getPlayerList().filter(p => p.team === 2);

    if (reds.length === 0 || blues.length === 0) return;

    const red = reds[0];
    const blue = blues[0];
    updateQueue();
    // remis
    if (scores.red === scores.blue) {
        window.gameRoom._room.sendAnnouncement("🤝 Tie! New players are coming in.", null, 0xFFFFFF, "bold", 2);
        window.gameRoom._room.setPlayerTeam(red.id, 0);
        window.gameRoom._room.setPlayerTeam(blue.id, 0);

        // daj czas, żeby Haxball zaktualizował stan
        setTimeout(() => {
            updateQueue();

            const all = window.gameRoom._room.getPlayerList();
            if (gameState.queue.length >= 2) {
                window.gameRoom._room.setPlayerTeam(gameState.queue[0], 1);
                window.gameRoom._room.setPlayerTeam(gameState.queue[1], 2);
                setTimeout(() => window.gameRoom._room.startGame(), 2000);
            } else {
                window.gameRoom._room.sendAnnouncement("Not enough players", null, 0xFFFFFF, "bold", 2);
            }
        }, 200); // 200 ms wystarczy

    } else {
        // ktoś wygrał
        const winner = scores.red > scores.blue ? red : blue;
        const loser = scores.red > scores.blue ? blue : red;

        window.gameRoom._room.sendAnnouncement(`🏆 The winner is ${winner.name}!`, null, 0x00FF00, "bold", 2);

        window.gameRoom._room.setPlayerTeam(loser.id, 0); // przegrany na spect
        setTimeout(() => {
            updateQueue();

            const all = window.gameRoom._room.getPlayerList();
            if (gameState.queue.length >= 1) {
                const nextId = gameState.queue[0];
                const nextTeam = (winner.team === 1) ? 2 : 1; // przeciwna drużyna
                window.gameRoom._room.setPlayerTeam(nextId, nextTeam);
                setTimeout(() => window.gameRoom._room.startGame(), 2000);
            } else {
                window.gameRoom._room.sendAnnouncement("⌛ Waiting for a new player...", null, 0xFFFF00, "bold", 1);
            }
        }, 200);
    }
}


export { gameState, startOvertimeTimer, resetOvertimeTimer, tryStartMatch, handleMatchEnd, updateQueue, startMatchTimer, resetAllTimers };
