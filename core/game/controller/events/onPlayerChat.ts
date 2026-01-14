import * as Tst from "../Translator";
import * as LangRes from "../../resource/strings";
import { PlayerObject } from "../../model/GameObject/PlayerObject";
import { isCommandString, parseCommand } from "../Parser";
import { convertTeamID2Name, TeamID } from "../../model/GameObject/TeamID";
import { isIncludeBannedWords } from "../TextFilter";
import { gameState, updateQueue, tryStartMatch } from './gameState.js';
import { draftState, draft, pickPlayer, handleAfkChange } from "./basket3vs3";
import { getTopPlayersFromDB, getPlayerRankFromDB } from "../Storage";

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
// CACHE dla pozycji w rankingu (żeby nie pobierać z bazy przy każdej wiadomości)
// =======================
interface RankCache {
    position: number;
    total: number;
    rating: number;
    timestamp: number;
}

const playerRankCache: Map<string, RankCache> = new Map();
const CACHE_DURATION = 60000; // 60 sekund

async function getCachedPlayerRank(playerAuth: string): Promise<RankCache | null> {
    const cached = playerRankCache.get(playerAuth);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION) {
        return cached;
    }

    const rankData = await getPlayerRankFromDB(playerAuth);
    if (!rankData) return null;

    // ⛔ NIE cache’uj spoza TOP100
    if (rankData.position > 100) {
        playerRankCache.delete(playerAuth);
        return null;
    }

    const entry: RankCache = { ...rankData, timestamp: now };
    playerRankCache.set(playerAuth, entry);
    return entry;
}
// Funkcja do odświeżenia cache dla wszystkich graczy online
export async function refreshAllPlayersRankCache(): Promise<void> {
    const players = Array.from(window.gameRoom.playerList.values());

    for (const p of players) {
        if (!p.auth) continue;

        const rank = await getPlayerRankFromDB(p.auth);
        if (rank && rank.position <= 100) {
            playerRankCache.set(p.auth, {
                ...rank,
                timestamp: Date.now()
            });
        } else {
            playerRankCache.delete(p.auth);
        }
    }
}

// =======================
// Główna funkcja obsługi czatu
// =======================
export async function onPlayerChatListener(
    player: PlayerObject,
    message: string
): Promise<boolean> {
    window.gameRoom.logger.i('onPlayerChat', `[${player.name}#${player.id}] ${message}`);
    const isBasket3vs3 = window.gameRoom.config._RUID === "basket3vs3";
    const isBasketball = window.gameRoom.config._RUID === "basketball";

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
            window.gameRoom._room.sendAnnouncement("You can’t go AFK during the match!", player.id, 0xFF0000, "bold", 1);
            return false;
        }

        if (player.team !== 0) {
            window.gameRoom._room.sendAnnouncement("You can only set AFK while being in spectator.", player.id, 0xFFFF00, "bold", 1);
            return false;
        }

        if (gameState.afkPlayers.includes(player.id)) {
            gameState.afkPlayers = gameState.afkPlayers.filter(id => id !== player.id);
            window.gameRoom._room.sendAnnouncement(`💤 ${player.name} has returned from AFK`, null, 0x00FF00, "bold", 1);
            if (isBasketball) {
                tryStartMatch();
            }

            else if (isBasket3vs3) {
                handleAfkChange(player.id, false);
            }

        } else {
            gameState.afkPlayers.push(player.id);
            window.gameRoom._room.sendAnnouncement(`💤 ${player.name} is now AFK`, null, 0xFFFF00, "bold", 1);
            if (isBasket3vs3) {
                handleAfkChange(player.id, true);
            }
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

    if (message === "!top") {
        try {
            const topPlayers = await getTopPlayersFromDB();

            if (!topPlayers || topPlayers.length === 0) {
                window.gameRoom._room.sendAnnouncement(
                    "❌ No ranking data available.",
                    player.id,
                    0xFF0000,
                    "bold",
                    1
                );
                return false;
            }

            const topLine = topPlayers.slice(0, 10).map((p, index) => {
                const pos = index + 1;
                const emoji =
                    pos === 1 ? "🥇" :
                        pos === 2 ? "🥈" :
                            pos === 3 ? "🥉" : "🔹";

                return `${emoji} ${p.name} (${p.rating})`;
            }).join(" | "); // separacja pionową kreską

            window.gameRoom._room.sendAnnouncement(
                topLine,
                player.id,
                0x00FFFF, // np. cyan dla całej listy
                "bold",
                1
            );

        } catch (err) {
            window.gameRoom._room.sendAnnouncement(
                "❌ Failed to load TOP players.",
                player.id,
                0xFF0000,
                "bold",
                1
            );
        }

        return false;
    }
    // ========= RANK command =========
    if (message === "!rank") {
        try {
            const playerAuth = window.gameRoom.playerList.get(player.id)?.auth;
            if (!playerAuth) {
                window.gameRoom._room.sendAnnouncement(
                    "❌ Could not find your player data.",
                    player.id,
                    0xFF0000,
                    "bold",
                    1
                );
                return false;
            }
            const rankData = await getPlayerRankFromDB(playerAuth);
            if (!rankData) {
                window.gameRoom._room.sendAnnouncement(
                    "❌ You are not in the ranking yet. Play some games first!",
                    player.id,
                    0xFF0000,
                    "bold",
                    1
                );
                return false;
            }
            // Calculate percentage (top X%)
            const percentage = ((rankData.position / rankData.total) * 100).toFixed(1);
            // Medal based on position
            let medal = "🏆";
            if (rankData.position === 1) medal = "👑";
            else if (rankData.position === 2) medal = "🥈";
            else if (rankData.position === 3) medal = "🥉";
            else if (rankData.position <= 10) medal = "⭐";
            else if (rankData.position <= 50) medal = "🔹";
            window.gameRoom._room.sendAnnouncement(
                `${medal} ${player.name}, your rank: #${rankData.position} / ${rankData.total} players (${rankData.rating} pts) | Top ${percentage}%`,
                player.id,
                0x00FFFF,
                "bold",
                1
            );
        } catch (err) {
            window.gameRoom._room.sendAnnouncement(
                "❌ Failed to load rank data.",
                player.id,
                0xFF0000,
                "bold",
                1
            );
        }
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
    const isStrongball = window.gameRoom.config._RUID === "strongball";
    if (isBasketball || isStrongball) {

        const playerData = window.gameRoom.playerList.get(player.id);
        if (!playerData) return true;

        const rating = playerData.stats?.rating ?? 0;
        const auth = playerData.auth;

        // ===== RANK (TOP100 ONLY) =====
        let rankPart = "";
        if (auth) {
            const cachedRank = await getCachedPlayerRank(auth);
            if (cachedRank && cachedRank.position <= 100) {
                rankPart = `[#${cachedRank.position}]`;
            }
        }

        // ===== TIER =====
        const tierPart = `[${getPlayerPrefix(rating)}]`;

        // ===== ADMIN =====
        let basePrefix = rankPart
            ? `${rankPart}${tierPart}`
            : tierPart;

        // ===== MEDALE / KOLORY (BEZ ZMIAN LOGIKI) =====
        let medalPrefix = "";
        let medalColor = 0xFFFFFF;
        if (isBasketball) {
            if (
                auth === "m9kiuCZTTNCcWQrAZh6e4a6fYsob--gTdhBjh397MH4" ||
                auth === "x_tfum7KEeIj3aqZVS5vz_VkV5oXEddUKqhQLOu40E8"
            ) {
                medalPrefix = "[🥇]";
                medalColor = 0xFFD700;
            }
            else if (auth === "MvfahQ_9EfqRwmfIOANPYpbY1A_gsK5xOc9v9yDDYkU") {
                medalPrefix = "[🥈]";
                medalColor = 0xFF8300;
            }
            else if (auth === "qO4d1F7Tujq3kzUeXSXO52NrBlohuINfP78VCqXFJ1A") {
                medalPrefix = "[🥉]";
                medalColor = 0xCD7F32;
            }
            else if (auth === "EXuArT2LI52mSbYqp6JTcQvJ9Ww08k5-b2qWLHAdBIM") {
                medalColor = 0xFF00EE;
            }
        }


        const prefixedMessage = `${medalPrefix}${basePrefix} ${playerData.name}: ${message}`;
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