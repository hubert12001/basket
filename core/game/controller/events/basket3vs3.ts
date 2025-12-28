import { TeamID } from "../../model/GameObject/TeamID";
import { Player } from "../../model/GameObject/Player";
import { gameState } from "./gameState";

const Team = { SPECTATORS: 0, RED: 1, BLUE: 2 } as const;

interface Draft {
    active: boolean;
    turn: TeamID;
    picksLeft: number;
    mode: any;
    pickerId: number | null;
}

const draft: Draft = {
    active: false,
    turn: Team.RED,
    picksLeft: 0,
    mode: null,
    pickerId: null
};

interface DraftState {
    pickTimer: ReturnType<typeof setTimeout> | null;
    pickCountdown: ReturnType<typeof setInterval> | null;
    lastWinner: number | null;
    gameRunning: boolean;
    postGameLock: boolean;
    justStarted: boolean;
    hardResetLock: boolean;
    afkKickInDraft: boolean;
    antiMacro: Record<string, any>;
}

const draftState: DraftState = {
    pickTimer: null,
    pickCountdown: null,
    lastWinner: null,
    gameRunning: false,
    postGameLock: false,
    justStarted: false,
    hardResetLock: false,
    afkKickInDraft: false,
    antiMacro: {}
};

function initAntiMacro(playerId: Player['id']) {
    draftState.antiMacro[playerId] = {
        kicks: [],
        warned: false
    };
}

function cleanupAntiMacro(playerId: Player['id']) {
    delete draftState.antiMacro[playerId];
}

function enforceDynamicMode() {
    var allPlayers = window.gameRoom._room.getPlayerList();
    var total = allPlayers.length;
    var limit = 3;

    if (total < 4) {
        limit = 1;
    } else if (total < 6) {
        limit = 2;
    } else {
        limit = 3;
    }

    var changed = false;

    [Team.RED, Team.BLUE].forEach(function (teamId) {
        var teamPlayers = allPlayers.filter(p => p.team === teamId);

        if (teamPlayers.length > limit) {
            for (var i = limit; i < teamPlayers.length; i++) {
                window.gameRoom._room.setPlayerTeam(teamPlayers[i].id, Team.SPECTATORS);
                changed = true;
            }
        }
    });

    return changed;
}

// ===== UTILS =====
function count(team: TeamID) {
    return window.gameRoom._room.getPlayerList().filter(p => p.team === team).length;
}

function spectators() {
    return window.gameRoom._room.getPlayerList().filter(p => p.team === 0 && !gameState.afkPlayers.includes(p.id));
}

function delayedStart() {
    setTimeout(() => window.gameRoom._room.startGame(), 100);
}

function getLastPlayer(team: TeamID) {
    var ps = window.gameRoom._room.getPlayerList().filter(p => p.team === team);
    return ps.length ? ps[ps.length - 1] : null;
}

function assignCaptain(team: TeamID) {
    var specs = spectators();
    if (specs.length > 0) window.gameRoom._room.setPlayerTeam(specs[0].id, team);
}

function ensureCaptain(team: TeamID) {
    if (count(team) === 0) assignCaptain(team);
}

function assignPicker(team: TeamID) {
    var ps = window.gameRoom._room.getPlayerList().filter(p => p.team === team);
    draft.pickerId = ps.length ? ps[0].id : null;
}

function canStartGame() {
    var red = count(Team.RED);
    var blue = count(Team.BLUE);
    var specs = spectators().length;

    if (red === 3 && blue === 3) return true;
    if (red === 2 && blue === 2 && specs < 2) return true;
    if (red === 1 && blue === 1) return true;

    return false;
}

function clearPickTimer() {
    if (draftState.pickTimer) {
        clearTimeout(draftState.pickTimer);
        draftState.pickTimer = null;
    }
    if (draftState.pickCountdown) {
        clearInterval(draftState.pickCountdown);
        draftState.pickCountdown = null;
    }
}

function startPickTimer(): void {
    clearPickTimer();

    if (!draft.active) return;

    const picker = window.gameRoom._room.getPlayerList().find(p => p.team === draft.turn);
    if (!picker) return;

    let timeLeft = 10;

    draftState.pickCountdown = setInterval(() => {
        if (!draft.active) {
            clearPickTimer();
            return;
        }

        timeLeft--;

        if (timeLeft <= 3 && timeLeft > 0) {
            window.gameRoom._room.sendAnnouncement(
                `⏱️ ${timeLeft}...`,
                picker.id,
                0xff4444,
                "bold", 1
            );
        }

        if (timeLeft === 0) {
            clearPickTimer();
            draftState.afkKickInDraft = true;

            if (picker) {
                window.gameRoom._room.kickPlayer(picker.id, "AFK", false);
            }

            resetDraftHard();
            enforceDynamicMode();

            setTimeout(() => {
                draftState.afkKickInDraft = false;
                ensureOnePlayerPerTeam();
                smartBalance();
                delayedDraftCheck();

                setTimeout(() => {
                    if (!draftState.gameRunning && !draft.active && canStartGame()) {
                        window.gameRoom._room.startGame();
                    }
                }, 150);
            }, 350);
        }
    }, 1000);
}

function isDraftStillValid() {
    if (!draft.active) return false;

    var specs = spectators().length;
    if (specs === 0) return false;
    if (specs < draft.picksLeft) return false;

    return true;
}

// ===== SMART BALANCE =====
function smartBalance() {
    if (draftState.hardResetLock) return;

    var red = count(Team.RED);
    var blue = count(Team.BLUE);
    var specs = spectators().length;

    if (red === 0 || blue === 0) return;
    if (red === 1 && blue === 1) return;

    if (red === 0 && blue > 0 && specs > 0) {
        window.gameRoom._room.setPlayerTeam(spectators()[0].id, Team.RED);
        return;
    }

    if (blue === 0 && red > 0 && specs > 0) {
        window.gameRoom._room.setPlayerTeam(spectators()[0].id, Team.BLUE);
        return;
    }

    var min = Math.min(red, blue);
    if (min < 3 && specs >= (3 - min) * 2) return;

    forceEvenTeams();
}

function rollbackIfNoSpecs() {
    var red = count(Team.RED);
    var blue = count(Team.BLUE);
    var specs = spectators().length;

    if (specs === 0 && red !== blue) {
        if (red > blue) {
            var p = getLastPlayer(Team.RED);
            if (p) window.gameRoom._room.setPlayerTeam(p.id, Team.SPECTATORS);
        }
        if (blue > red) {
            var p = getLastPlayer(Team.BLUE);
            if (p) window.gameRoom._room.setPlayerTeam(p.id, Team.SPECTATORS);
        }
        return true;
    }
    return false;
}

function forceEvenTeams() {
    var red = count(Team.RED);
    var blue = count(Team.BLUE);

    if (red === blue) return;

    if (red > blue) {
        var p = getLastPlayer(Team.RED);
        if (p) window.gameRoom._room.setPlayerTeam(p.id, Team.SPECTATORS);
    }

    if (blue > red) {
        var p = getLastPlayer(Team.BLUE);
        if (p) window.gameRoom._room.setPlayerTeam(p.id, Team.SPECTATORS);
    }
}

function resetDraftHard() {
    draft.active = false;
    draft.picksLeft = 0;
    draft.mode = null;
    draft.pickerId = null;
    clearPickTimer();
    draftState.hardResetLock = true;

    setTimeout(() => {
        draftState.hardResetLock = false;
    }, 300);
}

function ensureOnePlayerPerTeam() {
    var red = count(Team.RED);
    var blue = count(Team.BLUE);
    var specs = spectators();

    if (red === 0 && specs.length > 0) {
        window.gameRoom._room.setPlayerTeam(specs[0].id, Team.RED);
        return;
    }

    if (blue === 0 && specs.length > 0) {
        window.gameRoom._room.setPlayerTeam(specs[0].id, Team.BLUE);
        return;
    }
}

// ===== DRAFT CHECK =====
function checkDraft() {
    if (draftState.postGameLock) return;
    if (draft.active || draftState.justStarted) return;

    var red = count(Team.RED);
    var blue = count(Team.BLUE);
    var specs = spectators().length;

    if (red === 0 || blue === 0) return;

    if (red === blue && red < 3 && specs >= 2) {
        var maxFill = 3 - red;
        var possible = Math.floor(specs / 2);
        var fill = Math.min(maxFill, possible);

        if (fill > 0) {
            draft.active = true;
            draft.turn = Team.RED;
            draft.picksLeft = fill * 2;
            draft.mode = "FILL";
            if (draftState.gameRunning) window.gameRoom._room.stopGame();
            showDraft();
            return;
        }
    }

    var diff = Math.abs(red - blue);
    if (diff > 0 && specs >= diff) {
        draft.active = true;
        draft.turn = red < blue ? Team.RED : Team.BLUE;
        draft.picksLeft = diff;
        draft.mode = "BALANCE";
        if (draftState.gameRunning) window.gameRoom._room.stopGame();
        showDraft();
    }
}

function delayedDraftCheck() {
    setTimeout(checkDraft, 120);
}

// ===== UI =====
function showDraft() {
    var specs = spectators();
    
    if (specs.length === 0) {
        resetDraftHard();
        forceEvenTeams();
        setTimeout(() => {
            if (!draftState.gameRunning && !draft.active && canStartGame()) {
                window.gameRoom._room.startGame();
            }
        }, 150);
        return;
    }

    window.gameRoom._room.sendAnnouncement("📋 Wybierz zawodnika:", null, 0xaaaaaa, "bold", 1);

    specs.forEach((p, i) => {
        window.gameRoom._room.sendAnnouncement((i + 1) + ". " + p.name, null, 0xaaaaaa, null, 1);
    });

    window.gameRoom._room.sendAnnouncement(
        draft.turn === Team.RED ? "🔴 Wybiera Red" : "🔵 Wybiera Blue",
        null,
        draft.turn === Team.RED ? 0xff0000 : 0x0000ff,
        "bold", 1
    );

    assignPicker(draft.turn);
    startPickTimer();
}

// ===== PICK =====
function pickPlayer(index: number) {
    if (!isDraftStillValid()) {
        resetDraftHard();
        forceEvenTeams();
        
        setTimeout(() => {
            delayedDraftCheck();
            setTimeout(() => {
                if (!draftState.gameRunning && !draft.active && canStartGame()) {
                    window.gameRoom._room.startGame();
                }
            }, 200);
        }, 100);
        return;
    }

    clearPickTimer();
    if (!draft.active) return;

    var specs = spectators();
    var p = specs[index];
    if (!p) return;
    if (count(draft.turn) >= 3) return;

    window.gameRoom._room.setPlayerTeam(p.id, draft.turn);
    draft.picksLeft--;

    if (draft.picksLeft <= 0) {
        draft.active = false;
        draft.mode = null;

        delayedDraftCheck();

        setTimeout(() => {
            if (!draft.active && canStartGame()) {
                window.gameRoom._room.startGame();
            }
        }, 200);
        return;
    }

    if (draft.mode === "FILL") {
        draft.turn = draft.turn === Team.RED ? Team.BLUE : Team.RED;
    }

    setTimeout(showDraft, 50);
    clearPickTimer();
}

// ===== HANDLE AFK CHANGE DURING DRAFT =====
function handleAfkChange(playerId: number, isNowAfk: boolean): void {
    if (draft.active) {
        if (isNowAfk) {
            // Gracz poszedł AFK podczas draftu
            if (!isDraftStillValid()) {
                window.gameRoom._room.sendAnnouncement(
                    `⚠️ Draft przerwany - niewystarczająca liczba graczy`,
                    null,
                    0xFFFF00,
                    "bold",
                    1
                );

                resetDraftHard();

                setTimeout(() => {
                    forceEvenTeams();

                    setTimeout(() => {
                        delayedDraftCheck();

                        setTimeout(() => {
                            if (!draftState.gameRunning && !draft.active && canStartGame()) {
                                window.gameRoom._room.startGame();
                            }
                        }, 200);
                    }, 150);
                }, 100);
            } else {
                // Draft wciąż ważny, odśwież wyświetlanie
                clearPickTimer();
                setTimeout(showDraft, 100);
            }
        } else {
            // Gracz wrócił z AFK podczas draftu - odśwież listę do wyboru
            clearPickTimer();
            setTimeout(showDraft, 100);
        }
    } else {
        // Nie ma draftu
        if (!isNowAfk) {
            // Ktoś wrócił z AFK - sprawdź czy można coś wystartować
            setTimeout(() => {
                delayedDraftCheck();
                setTimeout(() => {
                    if (!draftState.gameRunning && !draft.active && canStartGame()) {
                        window.gameRoom._room.startGame();
                    }
                }, 250);
            }, 100);
        }
    }
}

export {
    draftState,
    draft,
    Team,
    pickPlayer,
    showDraft,
    enforceDynamicMode,
    count,
    delayedStart,
    delayedDraftCheck,
    canStartGame,
    spectators,
    clearPickTimer,
    ensureOnePlayerPerTeam,
    resetDraftHard,
    smartBalance,
    isDraftStillValid,
    rollbackIfNoSpecs,
    initAntiMacro,
    cleanupAntiMacro,
    handleAfkChange,
    forceEvenTeams
};