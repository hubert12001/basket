import { PlayerObject } from "../../model/GameObject/PlayerObject";
import { convertTeamID2Name, TeamID } from "../../model/GameObject/TeamID";
import { draftState, initAntiMacro, cleanupAntiMacro } from "./basket3vs3";

export function onPlayerBallKickListener(player: PlayerObject): void {
    // Event called when a player kicks the ball.
    // records player's id, team when the ball was kicked
    var placeholderBall = {
        playerID: player.id,
        playerName: player.name,
        gameRuleName: window.gameRoom.config.rules.ruleName,
        gameRuleLimitTime: window.gameRoom.config.rules.requisite.timeLimit,
        gameRuleLimitScore: window.gameRoom.config.rules.requisite.scoreLimit,
        gameRuleNeedMin: window.gameRoom.config.rules.requisite.minimumPlayers,
        possTeamRed: window.gameRoom.ballStack.possCalculate(TeamID.Red),
        possTeamBlue: window.gameRoom.ballStack.possCalculate(TeamID.Blue),
        streakTeamName: convertTeamID2Name(window.gameRoom.winningStreak.teamID),
        streakTeamCount: window.gameRoom.winningStreak.count
    };

    if (window.gameRoom.config.rules.statsRecord === true && window.gameRoom.isStatRecord === true) { // record only when stat record mode

        window.gameRoom.playerList.get(player.id)!.matchRecord.balltouch++; // add count of ball touch in match record

        if (window.gameRoom.ballStack.passJudgment(player.team) === true && window.gameRoom.playerList.has(window.gameRoom.ballStack.getLastTouchPlayerID()) === true) {
            window.gameRoom.playerList.get(window.gameRoom.ballStack.getLastTouchPlayerID())!.matchRecord.passed++; // add count of pass success in match record
        }

        window.gameRoom.ballStack.touchTeamSubmit(player.team);
        window.gameRoom.ballStack.touchPlayerSubmit(player.id); // refresh who touched the ball in last

        window.gameRoom.ballStack.push(player.id);
        window.gameRoom.ballStack.possCount(player.team); // 1: red team, 2: blue team

    }

    const isBasket3vs3 =
    window.gameRoom.config._RUID === "basket3vs3";

    if (isBasket3vs3) {
        if (!draftState.antiMacro[player.id]) {
        initAntiMacro(player.id);
        }

        var data = draftState.antiMacro[player.id];
        var now = Date.now();

        // Dodaj czas kopnięcia
        data.kicks.push(now);

        // Usuń stare kopnięcia (starsze niż 0.5s = 500ms)
        data.kicks = data.kicks.filter(function(t : number) {
            return now - t < 500;
        });

        // Sprawdź czy 3+ kopnięć w 0.3s
        if (data.kicks.length >= 3) {
            data.kicks = [];

            if (!data.warned) {
                // Pierwsze wykrycie - ostrzeżenie
                data.warned = true;
                window.gameRoom._room.sendAnnouncement("⚠️ " + player.name + " - WARNING! Macro detected. Next time = kick!", null, 0xFFAA00, "bold", 1);
            } else {
                // Drugie wykrycie - kick
                window.gameRoom._room.kickPlayer(player.id, "MACRO", false);
            }
        }
    }
}
