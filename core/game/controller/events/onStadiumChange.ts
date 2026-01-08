import * as Tst from "../Translator";
import * as LangRes from "../../resource/strings";
import { convertTeamID2Name, TeamID } from "../../model/GameObject/TeamID";
import { PlayerObject } from "../../model/GameObject/PlayerObject";
import { setDefaultStadiums } from "../RoomTools";
import { draftState } from "./basket3vs3";

export function onStadiumChangeListner(newStadiumName: string, byPlayer: PlayerObject): void {
    var placeholderStadium = {
        playerID: 0,
        playerName: '',
        stadiumName: newStadiumName,
        gameRuleName: window.gameRoom.config.rules.ruleName,
        gameRuleLimitTime: window.gameRoom.config.rules.requisite.timeLimit,
        gameRuleLimitScore: window.gameRoom.config.rules.requisite.scoreLimit,
        gameRuleNeedMin: window.gameRoom.config.rules.requisite.minimumPlayers,
        possTeamRed: window.gameRoom.ballStack.possCalculate(TeamID.Red),
        possTeamBlue: window.gameRoom.ballStack.possCalculate(TeamID.Blue),
        streakTeamName: convertTeamID2Name(window.gameRoom.winningStreak.teamID),
        streakTeamCount: window.gameRoom.winningStreak.count
    };

    const isTestRuid = window.gameRoom.config._RUID === "test";

    // Blokuj zmianę stadionu jeśli nie test RUID i przez gracza
    if (!isTestRuid && byPlayer !== null && byPlayer.id !== 0) {
        window.gameRoom.logger.i(
            'onStadiumChange',
            `Stadium change blocked (RUID=${window.gameRoom.config._RUID}) by ${byPlayer.name}#${byPlayer.id}`
        );
        setDefaultStadiums();
        return;
    }

    // Event called when the stadium is changed.
    if (byPlayer !== null && window.gameRoom.playerList.size != 0 && byPlayer.id != 0) {
        placeholderStadium.playerID = byPlayer.id;
        placeholderStadium.playerName = byPlayer.name;

        if (window.gameRoom.playerList.get(byPlayer.id)!.permissions['superadmin'] === true) {
            window.gameRoom.logger.i(
                'onStadiumChange',
                `The map ${newStadiumName} has been loaded by ${byPlayer.name}#${byPlayer.id}.(super:${window.gameRoom.playerList.get(byPlayer.id)!.permissions['superadmin']})`
            );
            window.gameRoom._room.sendAnnouncement(
                Tst.maketext(LangRes.onStadium.loadNewStadium, placeholderStadium),
                null,
                0x00FF00,
                "normal",
                0
            );
        } else {
            window.gameRoom.logger.i(
                'onStadiumChange',
                `The map ${byPlayer.name}#${byPlayer.id} tried to set a new stadium(${newStadiumName}), but it is rejected.(super:${window.gameRoom.playerList.get(byPlayer.id)!.permissions['superadmin']})`
            );
            window.gameRoom._room.sendAnnouncement(
                Tst.maketext(LangRes.onStadium.cannotChange, placeholderStadium),
                byPlayer.id,
                0xFF0000,
                "bold",
                2
            );
            setDefaultStadiums();
        }
    } else {
        window.gameRoom.logger.i(
            'onStadiumChange',
            `The map ${newStadiumName} has been loaded as default map.`
        );
    }
}
