import * as Tst from "../Translator";
import * as LangRes from "../../resource/strings";
import { PlayerObject } from "../../model/GameObject/PlayerObject";
import { isCommandString, parseCommand } from "../Parser";
import { convertTeamID2Name, TeamID } from "../../model/GameObject/TeamID";
import { isIncludeBannedWords } from "../TextFilter";
import { gameState, updateQueue, tryStartMatch } from './gameState.js';
import { draftState, draft, pickPlayer } from "./basket3vs3";

// =======================
// Definicja rang i funkcja do prefixu
// =======================
const tiers = [
    { rating: 0, emoji: "⚫", name: "Iron" },
    { rating: 200, emoji: "🟤", name: "Bronze" },
    { rating: 400, emoji: "⚪", name: "Silver" },
    { rating: 600, emoji: "🟡", name: "Gold" },
    { rating: 800, emoji: "🔵", name: "Platinum" },
    { rating: 1000, emoji: "🟢", name: "Emerald" },
    { rating: 1200, emoji: "🟠", name: "Diamond" },
    { rating: 1400, emoji: "🔴", name: "Ruby" },
    { rating: 1600, emoji: "👑", name: "Legendary" }
];

function getPlayerPrefix(rating: number) {
    let tier = tiers[0];
    for (let i = 0; i < tiers.length; i++) {
        if (rating >= tiers[i].rating) tier = tiers[i];
        else break;
    }
    return `${tier.emoji} ${tier.name}`;
}

// =======================
// Główna funkcja obsługi czatu
// =======================
export function onPlayerChatListener(player: PlayerObject, message: string): boolean {
    window.gameRoom.logger.i('onPlayerChat', `[${player.name}#${player.id}] ${message}`);

    const placeholderChat = {
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

    // ========= AFK command =========
    if (message === "!afk") {
        const gameInProgress = window.gameRoom._room.getScores() !== null;

        if (gameInProgress && player.team !== 0) {
            window.gameRoom._room.sendAnnouncement("❌ You can’t go AFK during the match!", player.id, 0xFF0000, "bold", 1);
            return false;
        }

        if (player.team !== 0) {
            window.gameRoom._room.sendAnnouncement("⚠️ You can only set AFK while being in spectator.", player.id, 0xFFFF00, "bold", 1);
            return false;
        }

        if (gameState.afkPlayers.includes(player.id)) {
            gameState.afkPlayers = gameState.afkPlayers.filter(id => id !== player.id);
            window.gameRoom._room.sendAnnouncement(`✅ ${player.name} has returned from AFK and can play.`, null, 0x00FF00, "bold", 1);
            tryStartMatch();
        } else {
            gameState.afkPlayers.push(player.id);
            window.gameRoom._room.sendAnnouncement(`💤 ${player.name} is now AFK.`, null, 0xFFFF00, "bold", 1);
        }
        updateQueue();
        return false;
    }

    // ========= AFKS command =========
    if (message === "!afks") {
        if (gameState.afkPlayers.length === 0) {
            window.gameRoom._room.sendAnnouncement("No one is AFK.", player.id, 0x00FF00, "bold", 1);
            return false;
        }

        // Pobierz listę obiektów graczy AFK
        const afkPlayerNames = gameState.afkPlayers
            .map(id => window.gameRoom.playerList.get(id))
            .filter(p => p)
            .map(p => p?.name);

        const afkList = afkPlayerNames.join(", ");

        window.gameRoom._room.sendAnnouncement(`💤 Players AFK: ${afkList}`, player.id, 0xFFFF00, "bold", 1);
        return false;
    }

    // ========= Commands =========
    if (isCommandString(message)) {
        parseCommand(player, message);
        return false;
    }

    // ========= Normal chat =========
    if (!player.admin) {
        // sprawdzenie mutów
        if (window.gameRoom.isMuteAll || window.gameRoom.playerList.get(player.id)!.permissions['mute']) {
            window.gameRoom._room.sendAnnouncement(Tst.maketext(LangRes.onChat.mutedChat, placeholderChat), player.id, 0xFF0000, "bold", 2);
            return false;
        }

        // Anti Chat Flood
        if (window.gameRoom.config.settings.antiChatFlood && window.gameRoom.isStatRecord) {
            let chatFloodCritFlag = false;
            window.gameRoom.antiTrollingChatFloodCount.push(player.id);
            for (let floodCritCount = 1; floodCritCount <= window.gameRoom.config.settings.chatFloodCriterion; floodCritCount++) {
                const floodID = window.gameRoom.antiTrollingChatFloodCount[window.gameRoom.antiTrollingChatFloodCount.length - floodCritCount] || 0;
                if (floodID === player.id) chatFloodCritFlag = true;
                else { chatFloodCritFlag = false; break; }
            }
        }
    }

    // Długość wiadomości
    if (message.length > window.gameRoom.config.settings.chatLengthLimit) {
        window.gameRoom._room.sendAnnouncement(Tst.maketext(LangRes.onChat.tooLongChat, placeholderChat), player.id, 0xFF0000, "bold", 2);
        return false;
    }

    // Separator
    if (message.includes('|,|')) {
        window.gameRoom._room.sendAnnouncement(Tst.maketext(LangRes.onChat.includeSeperator, placeholderChat), player.id, 0xFF0000, "bold", 2);
        return false;
    }

    // Banned words
    if (window.gameRoom.config.settings.chatTextFilter && isIncludeBannedWords(window.gameRoom.bannedWordsPool.chat, message)) {
        window.gameRoom._room.sendAnnouncement(Tst.maketext(LangRes.onChat.bannedWords, placeholderChat), player.id, 0xFF0000, "bold", 2);
        return false;
    }

    const isBasketball = window.gameRoom.config._RUID === "basketball";
    const isBasket3vs3 = window.gameRoom.config._RUID === "basket3vs3";

    if (isBasketball) {
        // pobieramy pełny obiekt z listy graczy
        const playerData = window.gameRoom.playerList.get(player.id);

        if (!playerData) {
            console.log("DEBUG: player not found in playerList");
            return true; // lub false, jeśli chcesz zablokować wysłanie
        }

        const rating = playerData.stats.rating ?? 0;

        let prefix = getPlayerPrefix(rating);
        let displayPrefix = `[${prefix}]`;
        if (playerData.admin) displayPrefix = `[👑 Admin][${prefix}]`;

        // ===== Top 3 gracze medal + kolor =====
        let medalPrefix = "";
        let medalColor = 0xFFFFFF; // domyślny biały

        if (playerData.auth === "m9kiuCZTTNCcWQrAZh6e4a6fYsob--gTdhBjh397MH4" || playerData.auth === "x_tfum7KEeIj3aqZVS5vz_VkV5oXEddUKqhQLOu40E8") {
            medalPrefix = "[🥇]";
            medalColor = 0xFFD700;
        } else if (playerData.auth === "MvfahQ_9EfqRwmfIOANPYpbY1A_gsK5xOc9v9yDDYkU") {
            medalPrefix = "[🥈]";
            medalColor = 0xFF8300;
        } else if (playerData.auth === "qO4d1F7Tujq3kzUeXSXO52NrBlohuINfP78VCqXFJ1A") {
            medalPrefix = "[🥉]";
            medalColor = 0xCD7F32;
        } else if(playerData.auth=== "EXuArT2LI52mSbYqp6JTcQvJ9Ww08k5-b2qWLHAdBIM") { // Mamba
            medalColor = 0xFF00EE;
        }

        const prefixedMessage = `${medalPrefix}${displayPrefix} ${playerData.name}: ${message}`;
        window.gameRoom._room.sendAnnouncement(prefixedMessage, null, medalColor, "normal", 1);
        return false;
    } 
    else if (isBasket3vs3) {
        const playerData = window.gameRoom.playerList.get(player.id);

        if (!playerData) {
            console.log("DEBUG: player not found in playerList");
            return true;
        }

        const rating = playerData.stats.rating ?? 0;

        let prefix = getPlayerPrefix(rating);
        let displayPrefix = `[${prefix}]`;
        if (playerData.admin) displayPrefix = `[👑 Admin][${prefix}]`;

        let medalPrefix = "";
        let medalColor = 0xFFFFFF;
        const prefixedMessage = `${medalPrefix}${displayPrefix} ${playerData.name}: ${message}`;
        window.gameRoom._room.sendAnnouncement(prefixedMessage, null, medalColor, "normal", 1);
        
        if (draftState.postGameLock) return false;
        if (!draft.active) return false;
 
        if (player.id !== draft.pickerId) return false;

        var n = parseInt(message, 10);
        if (isNaN(n)) return false;

        pickPlayer(n - 1);
        return false;
    }
    else {
        return true;
    }
}