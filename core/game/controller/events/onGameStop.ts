import * as Tst from "../Translator";
import * as LangRes from "../../resource/strings";
import { PlayerObject } from "../../model/GameObject/PlayerObject";
import { convertTeamID2Name, TeamID } from "../../model/GameObject/TeamID";
import { recuritBothTeamFully } from "../../model/OperateHelper/Quorum";
import { setDefaultRoomLimitation, setDefaultStadiums } from "../RoomTools";
import { resetOvertimeTimer, handleMatchEnd, resetAllTimers } from './gameState.js';
import { draftState, draft, Team, clearPickTimer, enforceDynamicMode, delayedDraftCheck, canStartGame, spectators, stopAFKCheck } from "./basket3vs3";

export function onGameStopListener(byPlayer: PlayerObject): void {
    /*
    Event called when a game stops.
    byPlayer is the player which caused the event (can be null if the event wasn't caused by a player).
    Haxball developer Basro said, The game will be stopped automatically after a team victory. (victory -> stop)
    */
    var placeholderStop = {
        playerID: 0,
        playerName: '',
        gameRuleName: window.gameRoom.config.rules.ruleName,
        gameRuleLimitTime: window.gameRoom.config.rules.requisite.timeLimit,
        gameRuleLimitScore: window.gameRoom.config.rules.requisite.scoreLimit,
        gameRuleNeedMin: window.gameRoom.config.rules.requisite.minimumPlayers,
        possTeamRed: window.gameRoom.ballStack.possCalculate(TeamID.Red),
        possTeamBlue: window.gameRoom.ballStack.possCalculate(TeamID.Blue),
        streakTeamName: convertTeamID2Name(window.gameRoom.winningStreak.teamID),
        streakTeamCount: window.gameRoom.winningStreak.count
    };
    if (byPlayer !== null) {
        placeholderStop.playerID = byPlayer.id;
        placeholderStop.playerName = byPlayer.name;
    }

    window.gameRoom.isGamingNow = false; // turn off

    let msg = "The game has been stopped.";
    if (byPlayer !== null && byPlayer.id != 0) {
        msg += `(by ${byPlayer.name}#${byPlayer.id})`;
    }
    window.gameRoom.logger.i('onGameStop', msg);

    setDefaultStadiums(); // check number of players and auto-set stadium
    setDefaultRoomLimitation(); // score, time, teamlock set

    window.gameRoom.ballStack.initTouchInfo(); // clear touch info
    window.gameRoom.ballStack.clear(); // clear the stack.
    window.gameRoom.ballStack.possClear(); // clear possession count

    // stop replay record and send it
    const replay = window.gameRoom._room.stopRecording();

    if (replay && window.gameRoom.social.discordWebhook.feed && window.gameRoom.social.discordWebhook.replayUpload && window.gameRoom.social.discordWebhook.id && window.gameRoom.social.discordWebhook.token) {
        const placeholder = {
            roomName: window.gameRoom.config._config.roomName
            , replayDate: Date().toLocaleString()
        }

        window._feedSocialDiscordWebhook(window.gameRoom.social.discordWebhook.id, window.gameRoom.social.discordWebhook.token, "replay", {
            message: Tst.maketext(LangRes.onStop.feedSocialDiscordWebhook.replayMessage, placeholder)
            , data: JSON.stringify(Array.from(replay))
        });
    }

    // when auto emcee mode is enabled
    if (window.gameRoom.config.rules.autoOperating === true) {
        recuritBothTeamFully();
        window.gameRoom._room.startGame(); // start next new game
    }

    const isBasketball =
        window.gameRoom.config._RUID === "basketball";

    const isBasket3vs3 =
        window.gameRoom.config._RUID === "basket3vs3";
    const isStrongball = window.gameRoom.config._RUID === "strongball";
    if (isBasketball || isStrongball) {
        resetAllTimers();
    }
    if (isBasket3vs3) {
        draftState.gameRunning = false;
        draftState.gameInProgress = false;
        stopAFKCheck();
        if (draftState.lastWinner === null) {
            // [FIX] Fix for manual stop (e.g. reduction)
            setTimeout(() => {
                enforceDynamicMode();
                delayedDraftCheck();

                setTimeout(() => {
                    if (!draftState.gameRunning && !draft.active && canStartGame()) {
                        window.gameRoom._room.startGame();
                    }
                }, 150);
            }, 100);
            return;
        }

        draftState.postGameLock = true;

        var winner = draftState.lastWinner;
        var loser = winner === Team.RED ? Team.BLUE : Team.RED;

        window.gameRoom._room.getPlayerList()
            .filter(p => p.team === loser)
            .forEach(p => window.gameRoom._room.setPlayerTeam(p.id, Team.SPECTATORS));

        setTimeout(() => {
            var specs = spectators();
            if (specs.length > 0) {
                window.gameRoom._room.setPlayerTeam(specs[0].id, loser);
            }

            draft.active = false;
            draft.mode = null;
            draft.picksLeft = 0;
            draft.turn = loser;
            draft.pickerId = null;

            draftState.postGameLock = false;
            draftState.lastWinner = null;

            enforceDynamicMode();
            delayedDraftCheck();
            clearPickTimer();

            setTimeout(() => {
                if (!draftState.gameRunning && !draft.active && canStartGame()) {
                    window.gameRoom._room.startGame();
                }
            }, 150);

        }, 300);
    }
}
