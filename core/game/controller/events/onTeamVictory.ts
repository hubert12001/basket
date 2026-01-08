import * as Tst from "../Translator";
import * as LangRes from "../../resource/strings";
import { ScoresObject } from "../../model/GameObject/ScoresObject";
import { PlayerObject } from "../../model/GameObject/PlayerObject";
import { convertTeamID2Name, TeamID } from "../../model/GameObject/TeamID";
import { shuffleArray } from "../RoomTools";
import { fetchActiveSpecPlayers, roomActivePlayersNumberCheck } from "../../model/OperateHelper/Quorum";
import { HElo, MatchResult, StatsRecord } from "../../model/Statistics/HElo";
import { convertToPlayerStorage, setPlayerDataToDB } from "../Storage";
import { draftState, stopAFKCheck, Team } from "./basket3vs3";

function updatePlayerRatingsCache() {
    for (const [id, player] of window.gameRoom.playerList) {
        if (player && player.stats && typeof player.stats.rating === "number") {
            (player as any).rating = player.stats.rating; // aktualizacja dla czatu
        }
    }
}
export async function onTeamVictoryListener(scores: ScoresObject): Promise<void> {
    // Event called when a team 'wins'. not just when game ended.
    // records vicotry in stats. total games also counted in this event.
    // Haxball developer Basro said, The game will be stopped automatically after a team victory. (victory -> stop)
    let placeholderVictory = {
        teamID: TeamID.Spec,
        teamName: '',
        redScore: scores.red,
        blueScore: scores.blue,
        gameRuleName: window.gameRoom.config.rules.ruleName,
        gameRuleLimitTime: window.gameRoom.config.rules.requisite.timeLimit,
        gameRuleLimitScore: window.gameRoom.config.rules.requisite.scoreLimit,
        gameRuleNeedMin: window.gameRoom.config.rules.requisite.minimumPlayers,
        possTeamRed: window.gameRoom.ballStack.possCalculate(TeamID.Red),
        possTeamBlue: window.gameRoom.ballStack.possCalculate(TeamID.Blue),
        streakTeamName: convertTeamID2Name(window.gameRoom.winningStreak.teamID),
        streakTeamCount: window.gameRoom.winningStreak.count
    };

    let ratingHelper: HElo = HElo.getInstance(); // get HElo instance for calc rating

    let winningMessage: string = '';

    let allActivePlayers: PlayerObject[] = window.gameRoom._room.getPlayerList().filter((player: PlayerObject) => player.id !== 0 && window.gameRoom.playerList.get(player.id)!.permissions.afkmode === false); // non afk players
    let teamPlayers: PlayerObject[] = allActivePlayers.filter((eachPlayer: PlayerObject) => eachPlayer.team !== TeamID.Spec); // except Spectators players
    let redTeamPlayers: PlayerObject[] = teamPlayers.filter((eachPlayer: PlayerObject) => eachPlayer.team === TeamID.Red);
    let blueTeamPlayers: PlayerObject[] = teamPlayers.filter((eachPlayer: PlayerObject) => eachPlayer.team === TeamID.Blue);

    let winnerTeamID: TeamID;
    let loserTeamID: TeamID;

    if (scores.red > scores.blue) {
        winnerTeamID = TeamID.Red;
        loserTeamID = TeamID.Blue;
        placeholderVictory.teamName = 'Red';
    } else {
        winnerTeamID = TeamID.Blue;
        loserTeamID = TeamID.Red;
        placeholderVictory.teamName = 'Blue';
    }
    placeholderVictory.teamID = winnerTeamID;
    winningMessage = Tst.maketext(LangRes.onVictory.victory, placeholderVictory);

    window.gameRoom.isGamingNow = false; // turn off

    if (window.gameRoom.config.rules.statsRecord === true && window.gameRoom.isStatRecord === true) {

        try {
            // =================== HElo rating part ===================
            const redStatsRecords: StatsRecord[] = ratingHelper.makeStasRecord(
                winnerTeamID === TeamID.Red ? MatchResult.Win : MatchResult.Lose,
                redTeamPlayers
            );
            const blueStatsRecords: StatsRecord[] = ratingHelper.makeStasRecord(
                winnerTeamID === TeamID.Blue ? MatchResult.Win : MatchResult.Lose,
                blueTeamPlayers
            );

            const winTeamRatingsMean: number = ratingHelper.calcTeamRatingsMean(
                winnerTeamID === TeamID.Red ? redTeamPlayers : blueTeamPlayers
            );
            const loseTeamRatingsMean: number = ratingHelper.calcTeamRatingsMean(
                loserTeamID === TeamID.Red ? redTeamPlayers : blueTeamPlayers
            );

            // ===== RED TEAM RATING UPDATE + powiadomienie =====
            redStatsRecords.forEach((eachItem: StatsRecord, idx: number) => {
                const player = window.gameRoom.playerList.get(redTeamPlayers[idx].id);
                if (!player) {
                    window.gameRoom.logger.e('onTeamVictory', `ERROR: Red player index ${idx} not found in playerList`);
                    return;
                }
                let diffArray: number[] = [];
                const oldRating = player.stats.rating;
                for (let i = 0; i < blueStatsRecords.length; i++) {
                    diffArray.push(ratingHelper.calcBothDiff(eachItem, blueStatsRecords[i], winTeamRatingsMean, loseTeamRatingsMean, eachItem.matchKFactor));
                }
                const newRating = ratingHelper.calcNewRating(eachItem.rating, diffArray);
                player.stats.rating = newRating;

                // 🔹 Powiadomienie o zmianie punktów
                const ratingDiff = newRating - oldRating;
                const sign = ratingDiff >= 0 ? "+" : "";
                window.gameRoom._room.sendAnnouncement(
                    `⚡ ${player.name} got ${sign}${ratingDiff.toFixed(2)} ranking points.`,
                    player.id, 0xFFD700, "bold", 1
                );
            });

            // ===== BLUE TEAM RATING UPDATE + powiadomienie =====
            blueStatsRecords.forEach((eachItem: StatsRecord, idx: number) => {
                const player = window.gameRoom.playerList.get(blueTeamPlayers[idx].id);
                if (!player) {
                    window.gameRoom.logger.e('onTeamVictory', `ERROR: Blue player index ${idx} not found in playerList`);
                    return;
                }
                let diffArray: number[] = [];
                const oldRating = player.stats.rating;
                for (let i = 0; i < redStatsRecords.length; i++) {
                    diffArray.push(ratingHelper.calcBothDiff(eachItem, redStatsRecords[i], winTeamRatingsMean, loseTeamRatingsMean, eachItem.matchKFactor));
                }
                const newRating = ratingHelper.calcNewRating(eachItem.rating, diffArray);
                player.stats.rating = newRating;

                // 🔹 Powiadomienie o zmianie punktów
                const ratingDiff = newRating - oldRating;
                const sign = ratingDiff >= 0 ? "+" : "";
                window.gameRoom._room.sendAnnouncement(
                    `⚡ ${player.name} got ${sign}${ratingDiff.toFixed(2)} ranking points.`,
                    player.id, 0xFFD700, "bold", 1
                );
            });


            // =================== STATS RECORD PART ===================
            for (const eachPlayer of teamPlayers) {
                const playerObj = window.gameRoom.playerList.get(eachPlayer.id);
                if (!playerObj) {
                    window.gameRoom.logger.e('onTeamVictory', `ERROR: Player ${eachPlayer.name} not found in playerList`);
                    continue;
                }

                if (eachPlayer.team === winnerTeamID) playerObj.stats.wins++;
                playerObj.stats.totals++;
                playerObj.stats.goals += playerObj.matchRecord.goals;
                playerObj.stats.assists += playerObj.matchRecord.assists;
                playerObj.stats.ogs += playerObj.matchRecord.ogs;
                playerObj.stats.losePoints += playerObj.matchRecord.losePoints;
                playerObj.stats.balltouch += playerObj.matchRecord.balltouch;
                playerObj.stats.passed += playerObj.matchRecord.passed;

                // reset match record
                playerObj.matchRecord = {
                    goals: 0,
                    assists: 0,
                    ogs: 0,
                    losePoints: 0,
                    balltouch: 0,
                    passed: 0,
                    factorK: window.gameRoom.config.HElo.factor.factor_k_normal,
                };

                try {
                    await setPlayerDataToDB(convertToPlayerStorage(playerObj));
                } catch (err) {
                    window.gameRoom.logger.e('onTeamVictory', `ERROR saving ${playerObj.name}: ${err}`);
                }
            }

            // =================== WIN STREAK PART ===================
            if (winnerTeamID !== window.gameRoom.winningStreak.teamID) {
                window.gameRoom.winningStreak.count = 1;
            } else {
                window.gameRoom.winningStreak.count++;
            }
            window.gameRoom.winningStreak.teamID = winnerTeamID;

            placeholderVictory.streakTeamName = convertTeamID2Name(window.gameRoom.winningStreak.teamID);
            placeholderVictory.streakTeamCount = window.gameRoom.winningStreak.count;

            window.gameRoom.logger.i('onTeamVictory', `${placeholderVictory.streakTeamName} team wins streak ${placeholderVictory.streakTeamCount} games.`);

            if (window.gameRoom.winningStreak.count >= 3) {
                winningMessage += '\n' + Tst.maketext(LangRes.onVictory.burning, placeholderVictory);
            }

        } catch (err) {
            window.gameRoom.logger.e('onTeamVictory', `ERROR main block: ${err}`);
        }
    }


    // when auto emcee mode is enabled
    if (window.gameRoom.config.rules.autoOperating === true) {
        if (window.gameRoom.winningStreak.count >= window.gameRoom.config.settings.rerollWinstreakCriterion) {
            // if winning streak count has reached limit
            if (window.gameRoom.config.settings.rerollWinStreak === true && roomActivePlayersNumberCheck() >= window.gameRoom.config.rules.requisite.minimumPlayers) {
                // if rerolling option is enabled, then reroll randomly

                window.gameRoom.winningStreak.count = 0; // init count

                // reroll randomly
                // get new active players list and shuffle it randomly
                let allPlayersList: PlayerObject[] = window.gameRoom._room.getPlayerList();
                let shuffledIDList: number[] = shuffleArray(allPlayersList
                    .filter((eachPlayer: PlayerObject) => eachPlayer.id !== 0 && window.gameRoom.playerList.get(eachPlayer.id)!.permissions.afkmode === false)
                    .map((eachPlayer: PlayerObject) => eachPlayer.id)
                );

                allPlayersList.forEach((eachPlayer: PlayerObject) => {
                    window.gameRoom._room.setPlayerTeam(eachPlayer.id, TeamID.Spec); // move all to spec
                });

                for (let i: number = 0; i < shuffledIDList.length; i++) {
                    if (i < window.gameRoom.config.rules.requisite.eachTeamPlayers) window.gameRoom._room.setPlayerTeam(shuffledIDList[i], TeamID.Red);
                    if (i >= window.gameRoom.config.rules.requisite.eachTeamPlayers && i < window.gameRoom.config.rules.requisite.eachTeamPlayers * 2) window.gameRoom._room.setPlayerTeam(shuffledIDList[i], TeamID.Blue);
                }

                winningMessage += '\n' + Tst.maketext(LangRes.onVictory.reroll, placeholderVictory);
                window.gameRoom.logger.i('onTeamVictory', `Whole players are shuffled. (${shuffledIDList.toString()})`);
            }
        } else { // or still under the limit, then change spec and loser team
            window.gameRoom._room.getPlayerList()
                .filter((player: PlayerObject) => player.team === loserTeamID)
                .forEach((player: PlayerObject) => {
                    if (window.gameRoom.config.settings.guaranteePlayingTime === false || (scores.time - window.gameRoom.playerList.get(player.id)!.entrytime.matchEntryTime) > window.gameRoom.config.settings.guaranteedPlayingTimeSeconds) {
                        window.gameRoom._room.setPlayerTeam(player.id, TeamID.Spec); // just move all losers to Spec team
                    }
                });

            const specPlayers: PlayerObject[] = fetchActiveSpecPlayers();
            const insufficiency: number = window.gameRoom.config.rules.requisite.eachTeamPlayers - window.gameRoom._room.getPlayerList().filter((player: PlayerObject) => player.team === loserTeamID).length;
            for (let i = 0; i < insufficiency && i < specPlayers.length; i++) {
                window.gameRoom._room.setPlayerTeam(specPlayers[i].id, loserTeamID);
            }
        }
    }

    // notify victory
    updatePlayerRatingsCache();

    const isBasket3vs3 =
        window.gameRoom.config._RUID === "basket3vs3";

    window.gameRoom.logger.i('onTeamVictory', `The game has ended. Scores ${scores.red}:${scores.blue}.`);
    window.gameRoom._room.sendAnnouncement(winningMessage, null, 0xFFD700, "bold", 1);

    if (isBasket3vs3) {
        draftState.lastWinner = scores.red > scores.blue ? Team.RED : Team.BLUE;
        draftState.gameInProgress = false;
        stopAFKCheck();
    }
}
