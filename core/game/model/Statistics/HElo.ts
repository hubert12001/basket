import { PlayerObject } from "../GameObject/PlayerObject";

export class HElo {
    private static instance: HElo = new HElo();
    private constructor() {}

    public static getInstance(): HElo {
        if (this.instance == null) this.instance = new HElo();
        return this.instance;
    }

    // --- Parametry systemu HTX ---
    private readonly D = 400; // skala jak w Elo
    private readonly BASE_XP_WIN = 20;
    private readonly BASE_XP_LOSE = 8;
    private readonly UNDERDOG_SCALE = 1.8;
    private readonly PLACEMENT_MATCHES = 10;
    private readonly PLACEMENT_BONUS = 1.25;
    private readonly MAX_XP_PER_MATCH = 40;
    private readonly RATING_CAP = 3000;

    private expectedResult(rA: number, rB: number): number {
        return 1 / (1 + Math.pow(10, (rB - rA) / this.D));
    }

    // --- dynamiczny mnożnik w zależności od ratingu i różnicy ---
    private dynamicMultiplier(playerRating: number, opponentRating: number): number {
        // Wyższy rating -> wolniejszy progres
        const ratingFactor = Math.max(0.2, 1 - playerRating / 2000);
        // Duża różnica -> większy bonus dla underdoga i większa kara dla faworyta
        const diffFactor = 1 + Math.min(1.5, Math.abs(playerRating - opponentRating) / 1000);
        return ratingFactor * diffFactor;
    }

    // --- NOWA LOGIKA PRZYZNAWANIA PUNKTÓW ELO ---
    private calcXPChange(
        player: StatsRecord,
        opponent: StatsRecord,
        gamesPlayed: number
    ): number {
        const result = player.realResult;

        const playerRating = player.rating;
        const opponentRating = opponent.rating;
        const diff = Math.abs(playerRating - opponentRating);

        // Znormalizowana różnica 0–1 (powyżej 1000 traktujemy jak 1000)
        const normDiff = Math.min(diff, 1000) / 1000;

        // Underdog = gracz z niższym ratingiem
        const isUnderdog = playerRating < opponentRating;

        let xpChange = 0;

        if (result === MatchResult.Win) {
            if (isUnderdog) {
                // Im większa różnica, tym bliżej 40
                xpChange = 25 + (40 - 25) * normDiff;
            } else {
                // Im większa różnica, tym bliżej 10
                xpChange = 25 - (25 - 10) * normDiff;
            }
        } else if (result === MatchResult.Lose) {
            if (isUnderdog) {
                // Underdog traci mniej, im większa różnica, tym bliżej -10
                xpChange = -(25 - (25 - 10) * normDiff);
            } else {
                // Faworyt traci więcej, im większa różnica, tym bliżej -40
                xpChange = -(25 + (40 - 25) * normDiff);
            }
        } else if (result === MatchResult.Draw) {
            // Remis – lekko premiuje słabszego
            xpChange = isUnderdog
                ? 5 + (10 * (1 - normDiff)) // słabszy dostaje lekko więcej
                : -5 * normDiff; // faworyt lekko traci przy remisie
        }

        // Bonus za placement (pierwsze kilka gier)
        const placementMult = gamesPlayed < this.PLACEMENT_MATCHES ? this.PLACEMENT_BONUS : 1;
        let finalXP = xpChange * placementMult;

        // Clamp bezpieczeństwa
        finalXP = Math.max(-this.MAX_XP_PER_MATCH, Math.min(this.MAX_XP_PER_MATCH, finalXP));

        return parseFloat(finalXP.toFixed(2));
    }

    public calcBothDiff(
        targetRecord: StatsRecord,
        counterpartRecord: StatsRecord,
        _ratingWinnersMean: number,
        _ratingLosersMean: number,
        _factorK: number
    ): number {
        const gamesPlayed = targetRecord.matchKFactor || 0;
        let delta = this.calcXPChange(targetRecord, counterpartRecord, gamesPlayed);
        if (targetRecord.rating === 0 && delta < 0) delta = 0;
        return delta;
    }

    public calcNewRating(originalRating: number, diffs: number[]): number {
        const totalDiff = diffs.reduce((a, b) => a + b, 0);
        let newRating = Math.round(originalRating + totalDiff);
        if (newRating < 0) newRating = 0;
        if (newRating > this.RATING_CAP) newRating = this.RATING_CAP;
        return newRating;
    }

    public calcTeamRatingsMean(eachTeamPlayers: PlayerObject[]): number {
        const sum = eachTeamPlayers
            .map((p: PlayerObject) => window.gameRoom.playerList.get(p.id)!.stats.rating)
            .reduce((a, b) => a + b, 0);
        return parseFloat((sum / eachTeamPlayers.length).toFixed(2));
    }

    public makeStasRecord(matchResult: MatchResult, teamPlayers: PlayerObject[]): StatsRecord[] {
        const statsRecords: StatsRecord[] = [];
        teamPlayers.forEach((p: PlayerObject) => {
            const pl = window.gameRoom.playerList.get(p.id)!;
            statsRecords.push({
                rating: pl.stats.rating,
                realResult: matchResult,
                matchKFactor: pl.matchRecord.factorK,
                matchGoal: pl.matchRecord.goals,
                matchOG: pl.matchRecord.ogs,
                matchPassSuccRate:
                    pl.matchRecord.balltouch === 0
                        ? 0
                        : parseFloat((pl.matchRecord.passed / pl.matchRecord.balltouch).toFixed(2))
            });
        });
        return statsRecords;
    }
}

export interface StatsRecord {
    rating: number;
    realResult: MatchResult;
    matchKFactor: number;
    matchGoal: number;
    matchOG: number;
    matchPassSuccRate: number;
}

export enum MatchResult {
    Win = 1.0,
    Draw = 0.5,
    Lose = 0.0
}
