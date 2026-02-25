export var stadiumText: string = `{

	"name" : "Strong Ball Ace Cartel",

	"height" : 200,

	"width" : 420,

	"maxViewWidth" : 0,

	"cameraFollow" : "ball",

	"spawnDistance" : 170,

	"kickOffReset" : "partial",

	"bg" : { "type" : "none", "width" : 370, "height" : 170, "kickOffRadius" : 75, "cornerRadius" : 0, "color" : "3A3A3A", "goalLine" : 0 },

	"canBeStored" : false,

	"redSpawnPoints" : [
		

	],

	"blueSpawnPoints" : [
		

	],

	"playerPhysics" : {
		"bCoef" : 0,
		"invMass" : 1e+26,
		"damping" : 0.96,
		"acceleration" : 0.1,
		"kickingAcceleration" : 0.07,
		"kickingDamping" : 0.96,
		"kickStrength" : 8.5,
		"cGroup" : [ "red", "blue"
		],
		"gravity" : [ 0, 0
		],
		"radius" : 15,
		"kickback" : 0

	},

	"ballPhysics" : {
		"radius" : 9.2,
		"invMass" : 1,
		"pos" : [ 0, 0
		],
		"color" : "EDED09",
		"bCoef" : 1,
		"cMask" : [ "all"
		],
		"cGroup" : [ "ball", "kick", "score"
		],
		"damping" : 0.991,
		"speed" : [ 0, 0
		],
		"gravity" : [ 0, 0
		]

	},

	"segments" : [
		{ "v0" : 9, "v1" : 8, "curve" : 89.99999999999999, "vis" : true, "color" : "000000", "bCoef" : 0.1, "cMask" : ["ball" ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 9, "v1" : 10, "curve" : 0, "vis" : true, "color" : "000000", "bCoef" : 0.1, "cMask" : ["ball" ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 11, "v1" : 10, "curve" : 89.99999999999999, "vis" : true, "color" : "000000", "bCoef" : 0.1, "cMask" : ["ball" ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 12, "v1" : 13, "curve" : 89.99999999999999, "vis" : true, "color" : "000000", "bCoef" : 0.1, "cMask" : ["ball" ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 13, "v1" : 14, "curve" : 0, "vis" : true, "color" : "000000", "bCoef" : 0.1, "cMask" : ["ball" ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 14, "v1" : 15, "curve" : 89.99999999999999, "vis" : true, "color" : "000000", "bCoef" : 0.1, "cMask" : ["ball" ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 4, "v1" : 5, "curve" : 0, "vis" : true, "color" : "D9D9D9", "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "bias" : 0 },
		{ "v0" : 5, "v1" : 6, "curve" : 180, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["blueKO" ], "bias" : 0 },
		{ "v0" : 6, "v1" : 5, "curve" : 180, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO" ], "bias" : 0 },
		{ "v0" : 6, "v1" : 7, "curve" : 0, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "bias" : 0 },
		{ "v0" : 16, "v1" : 17, "curve" : 0, "vis" : true, "color" : "D9D9D9", "bCoef" : 1, "cMask" : ["ball" ], "cGroup" : ["wall" ], "bias" : 20 },
		{ "v0" : 17, "v1" : 18, "curve" : 0, "vis" : true, "color" : "D9D9D9", "bCoef" : 1, "cMask" : ["ball" ], "cGroup" : ["wall" ], "bias" : 20 },
		{ "v0" : 19, "v1" : 18, "curve" : 0, "vis" : true, "color" : "D9D9D9", "bCoef" : 1, "cMask" : ["ball" ], "cGroup" : ["wall" ], "bias" : -20 },
		{ "v0" : 20, "v1" : 21, "curve" : 0, "vis" : true, "color" : "D9D9D9", "bCoef" : 1, "cMask" : ["ball" ], "cGroup" : ["wall" ], "bias" : -20 },
		{ "v0" : 22, "v1" : 20, "curve" : 0, "vis" : true, "color" : "D9D9D9", "bCoef" : 1, "cMask" : ["ball" ], "cGroup" : ["wall" ], "bias" : -20 },
		{ "v0" : 22, "v1" : 23, "curve" : 0, "vis" : true, "color" : "D9D9D9", "bCoef" : 1, "cMask" : ["ball" ], "cGroup" : ["wall" ], "bias" : 20 },
		{ "v0" : 24, "v1" : 25, "curve" : 0, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "bias" : 0 },
		{ "v0" : 28, "v1" : 29, "curve" : 0, "vis" : true, "color" : "FF4D4D", "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "bias" : 0 },
		{ "v0" : 30, "v1" : 31, "curve" : -68.77198686670366, "vis" : true, "color" : "3A3A3A", "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "bias" : 0 },
		{ "v0" : 32, "v1" : 33, "curve" : 0, "vis" : true, "color" : "3A3A3A", "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "bias" : 0 },
		{ "v0" : 34, "v1" : 35, "curve" : 0, "vis" : true, "color" : "4D9CFF", "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "bias" : 0 },
		{ "v0" : 36, "v1" : 37, "curve" : 0, "vis" : true, "color" : "3A3A3A", "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "bias" : 0 },
		{ "v0" : 38, "v1" : 39, "curve" : 0, "vis" : true, "color" : "3A3A3A", "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "bias" : 0 },
		{ "v0" : 40, "v1" : 41, "curve" : 0, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 42, "v1" : 43, "curve" : 0, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 44, "v1" : 45, "curve" : 0, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 46, "v1" : 47, "curve" : 0, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 48, "v1" : 49, "curve" : 0, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 50, "v1" : 51, "curve" : 0, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 52, "v1" : 53, "curve" : 0, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 54, "v1" : 55, "curve" : 0, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 56, "v1" : 57, "curve" : 0, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 58, "v1" : 59, "curve" : 0, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 60, "v1" : 61, "curve" : 0, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 62, "v1" : 63, "curve" : 0, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 64, "v1" : 65, "curve" : 0, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 66, "v1" : 67, "curve" : 0, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 68, "v1" : 69, "curve" : 0, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 70, "v1" : 71, "curve" : 0, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "bias" : 0 },
		{ "v0" : 72, "v1" : 73, "curve" : 0, "vis" : true, "color" : "caaa5d", "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "bias" : 0 }

	],

	"vertexes" : [
		/* 0 */ { "x" : -370, "y" : 64, "bCoef" : 1, "cMask" : ["ball" ], "cGroup" : ["wall" ] },
		/* 1 */ { "x" : -370, "y" : -64, "bCoef" : 1, "cMask" : ["ball" ], "cGroup" : ["wall" ] },
		/* 2 */ { "x" : 370, "y" : 64, "bCoef" : 1, "cMask" : ["ball" ], "cGroup" : ["wall" ] },
		/* 3 */ { "x" : 370, "y" : -64, "bCoef" : 1, "cMask" : ["ball" ], "cGroup" : ["wall" ] },
		/* 4 */ { "x" : 0, "y" : 170.14579925843825, "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "vis" : true, "color" : "D9D9D9" },
		/* 5 */ { "x" : 0, "y" : 75, "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "vis" : true, "color" : "caaa5d" },
		/* 6 */ { "x" : 0, "y" : -75, "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "vis" : true, "color" : "caaa5d" },
		/* 7 */ { "x" : 0, "y" : -169.4, "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "vis" : true, "color" : "caaa5d" },
		/* 8 */ { "x" : -376, "y" : -64, "bCoef" : 0.1, "cMask" : ["ball" ], "cGroup" : ["wall" ] },
		/* 9 */ { "x" : -400, "y" : -44, "bCoef" : 0.1, "cMask" : ["ball" ], "cGroup" : ["wall" ] },
		/* 10 */ { "x" : -400, "y" : 44, "bCoef" : 0.1, "cMask" : ["ball" ], "cGroup" : ["wall" ] },
		/* 11 */ { "x" : -376, "y" : 64, "bCoef" : 0.1, "cMask" : ["ball" ], "cGroup" : ["wall" ] },
		/* 12 */ { "x" : 376, "y" : -64, "bCoef" : 0.1, "cMask" : ["ball" ], "cGroup" : ["wall" ] },
		/* 13 */ { "x" : 400, "y" : -44, "bCoef" : 0.1, "cMask" : ["ball" ], "cGroup" : ["wall" ] },
		/* 14 */ { "x" : 400, "y" : 44, "bCoef" : 0.1, "cMask" : ["ball" ], "cGroup" : ["wall" ] },
		/* 15 */ { "x" : 376, "y" : 64, "bCoef" : 0.1, "cMask" : ["ball" ], "cGroup" : ["wall" ] },
		/* 16 */ { "x" : -370.9178423833954, "y" : 72.82240208261157, "bCoef" : 1, "cMask" : ["ball" ], "cGroup" : ["wall" ], "bias" : 20, "vis" : true, "color" : "D9D9D9" },
		/* 17 */ { "x" : -369.55667598932786, "y" : 170.14579925843825, "bCoef" : 1, "cMask" : ["ball" ], "cGroup" : ["wall" ], "bias" : 20, "vis" : true, "color" : "D9D9D9" },
		/* 18 */ { "x" : 370.23725918636165, "y" : 169.4652160614045, "bCoef" : 1, "cMask" : ["ball" ], "cGroup" : ["wall" ], "bias" : 20, "vis" : true, "color" : "D9D9D9" },
		/* 19 */ { "x" : 370.23725918636165, "y" : 71.46123568854406, "bCoef" : 1, "cMask" : ["ball" ], "cGroup" : ["wall" ], "bias" : -20, "vis" : true, "color" : "D9D9D9" },
		/* 20 */ { "x" : 370.23725918636165, "y" : -170.82638245547201, "bCoef" : 1, "cMask" : ["ball" ], "cGroup" : ["wall" ], "bias" : -20, "vis" : true, "color" : "D9D9D9" },
		/* 21 */ { "x" : 370.23725918636165, "y" : -71.46123568854406, "bCoef" : 1, "cMask" : ["ball" ], "cGroup" : ["wall" ], "bias" : -20, "vis" : true, "color" : "D9D9D9" },
		/* 22 */ { "x" : -372.2790087774629, "y" : -170.82638245547201, "bCoef" : 1, "cMask" : ["ball" ], "cGroup" : ["wall" ], "bias" : -20, "vis" : true, "color" : "D9D9D9" },
		/* 23 */ { "x" : -370.9178423833954, "y" : -72.14181888557782, "bCoef" : 1, "cMask" : ["ball" ], "cGroup" : ["wall" ], "bias" : 20, "color" : "D9D9D9", "vis" : true },
		/* 24 */ { "x" : 0, "y" : 168.4, "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "vis" : true, "color" : "caaa5d" },
		/* 25 */ { "x" : 0, "y" : 75, "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "vis" : true, "color" : "caaa5d" },
		/* 26 */ { "x" : 369.5566759893279, "y" : 60, "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "vis" : true, "color" : "D9D9D9" },
		/* 27 */ { "x" : 369.5566759893279, "y" : -57.71372342158185, "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "vis" : true, "color" : "D9D9D9" },
		/* 28 */ { "x" : -370.2372591863616, "y" : 57.95825040889874, "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "vis" : true, "color" : "FF4D4D" },
		/* 29 */ { "x" : -370.2372591863616, "y" : -59.755473012683105, "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "vis" : true, "color" : "FF4D4D" },
		/* 30 */ { "x" : -368.1955095952603, "y" : 59.31941680296625, "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "vis" : true, "color" : "3A3A3A", "curve" : 0 },
		/* 31 */ { "x" : -368.1955095952603, "y" : -58.394306618615595, "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "vis" : true, "color" : "3A3A3A", "curve" : 0 },
		/* 32 */ { "x" : -373.23686661032514, "y" : 58.68924717608315, "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "vis" : true, "color" : "3A3A3A" },
		/* 33 */ { "x" : -373.23686661032514, "y" : -59.0244762454987, "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "vis" : true, "color" : "3A3A3A" },
		/* 34 */ { "x" : 370.2120524012862, "y" : 59.12523119942301, "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "vis" : true, "color" : "4D9CFF" },
		/* 35 */ { "x" : 370.2120524012862, "y" : -58.58849222215883, "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "vis" : true, "color" : "4D9CFF" },
		/* 36 */ { "x" : 372.2538019923875, "y" : 60.48639759349052, "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "vis" : true, "color" : "3A3A3A", "curve" : 0 },
		/* 37 */ { "x" : 372.2538019923875, "y" : -57.22732582809132, "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "vis" : true, "color" : "3A3A3A", "curve" : 0 },
		/* 38 */ { "x" : 367.21244497732266, "y" : 59.85622796660742, "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "vis" : true, "color" : "3A3A3A" },
		/* 39 */ { "x" : 367.21244497732266, "y" : -57.85749545497443, "bCoef" : 0.1, "cMask" : ["red","blue" ], "cGroup" : ["redKO","blueKO" ], "vis" : true, "color" : "3A3A3A" },
		/* 40 */ { "x" : -17.973761118113487, "y" : -24.927787864472435, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 41 */ { "x" : -33.07636051808278, "y" : 11.30137880219423, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 42 */ { "x" : -17.973761118113487, "y" : -24.927787864472435, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 43 */ { "x" : -5.326360518082774, "y" : 11.30137880219423, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 44 */ { "x" : 5.354125049362365, "y" : 9.759712135527565, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 45 */ { "x" : 28.590306148583895, "y" : 9.759712135527565, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 46 */ { "x" : 5.354125049362365, "y" : 9.759712135527565, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 47 */ { "x" : 5.3655873086769885, "y" : -24.156954531139107, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 48 */ { "x" : 28.68201121683822, "y" : -24.156954531139107, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 49 */ { "x" : 5.3655873086769885, "y" : -24.156954531139107, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 50 */ { "x" : 28.590306148583895, "y" : -24.156954531139107, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 51 */ { "x" : 28.590306148583895, "y" : -11.823621197805771, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 52 */ { "x" : 28.590306148583895, "y" : 0.5097121355275647, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 53 */ { "x" : 28.590306148583895, "y" : 9.759712135527565, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 54 */ { "x" : -11.169794319266359, "y" : -4.115287864472435, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 55 */ { "x" : -27.73038660470289, "y" : -4.115287864472435, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 56 */ { "x" : -42.28863012375395, "y" : -7.9732937300121804, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 57 */ { "x" : -58.463421822636505, "y" : -5.763772493299339, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 58 */ { "x" : -42.28863012375395, "y" : -2.1862849317025645, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 59 */ { "x" : -58.463421822636505, "y" : -5.763772493299339, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 60 */ { "x" : -42.28863012375395, "y" : -6.815891970350261, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 61 */ { "x" : -58.463421822636505, "y" : -5.763772493299339, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 62 */ { "x" : 40.56712454715118, "y" : -4.247256027263063, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 63 */ { "x" : 56.83652301121431, "y" : -5.593563650083784, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 64 */ { "x" : 40.87484627290317, "y" : -10.026077548231942, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 65 */ { "x" : 56.83652301121431, "y" : -5.593563650083784, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 66 */ { "x" : 40.628668892301576, "y" : -5.40302033145683, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 67 */ { "x" : 56.83652301121431, "y" : -5.593563650083784, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 68 */ { "x" : -42.538879152870045, "y" : -5.06414876653762, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 69 */ { "x" : -58.463421822636505, "y" : -5.763772493299339, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 70 */ { "x" : 40.87891792141767, "y" : -7.9055106226177445, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 71 */ { "x" : 56.83652301121431, "y" : -5.593563650083784, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 72 */ { "x" : 5.354125049362365, "y" : 9.759712135527565, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" },
		/* 73 */ { "x" : 5.3655873086769885, "y" : -24.156954531139107, "bCoef" : 0.1, "cMask" : [ ], "cGroup" : ["wall" ], "vis" : true, "color" : "caaa5d" }

	],

	"goals" : [
		{ "p0" : [-370,64 ], "p1" : [-370,-64 ], "team" : "red" },
		{ "p0" : [370,64 ], "p1" : [370,-64 ], "team" : "blue" }

	],

	"planes" : [
		{ "normal" : [0,1 ], "dist" : -170, "bCoef" : 1, "cMask" : ["ball" ], "cGroup" : ["wall" ] },
		{ "normal" : [0,-1 ], "dist" : -170, "bCoef" : 1, "cMask" : ["ball" ], "cGroup" : ["wall" ] },
		{ "normal" : [0,1 ], "dist" : -200, "bCoef" : 0.1, "cMask" : ["all" ], "cGroup" : ["wall" ] },
		{ "normal" : [0,-1 ], "dist" : -200, "bCoef" : 0.1, "cMask" : ["all" ], "cGroup" : ["wall" ] },
		{ "normal" : [1,0 ], "dist" : -420, "bCoef" : 0.1, "cMask" : ["all" ], "cGroup" : ["wall" ] },
		{ "normal" : [-1,0 ], "dist" : -420, "bCoef" : 0.1, "cMask" : ["all" ], "cGroup" : ["wall" ] }

	],

	"discs" : [
		{ "radius" : 8, "invMass" : 0, "pos" : [-370,64 ], "color" : "FF3B3B", "bCoef" : 0.5, "cMask" : ["all" ], "cGroup" : ["all" ], "damping" : 0.99, "speed" : [0,0 ], "gravity" : [0,0 ] },
		{ "radius" : 8, "invMass" : 0, "pos" : [-370,-64 ], "color" : "FF3B3B", "bCoef" : 0.5, "cMask" : ["all" ], "cGroup" : ["all" ], "damping" : 0.99, "speed" : [0,0 ], "gravity" : [0,0 ] },
		{ "radius" : 8, "invMass" : 0, "pos" : [370,64 ], "color" : "3B86E0", "bCoef" : 0.5, "cMask" : ["all" ], "cGroup" : ["all" ], "damping" : 0.99, "speed" : [0,0 ], "gravity" : [0,0 ] },
		{ "radius" : 8, "invMass" : 0, "pos" : [370,-64 ], "color" : "3B86E0", "bCoef" : 0.5, "cMask" : ["all" ], "cGroup" : ["all" ], "damping" : 0.99, "speed" : [0,0 ], "gravity" : [0,0 ] }

	],

	"joints" : [
		

	],

	"cameraWidth" : 0,

	"cameraHeight" : 0,

	"traits" : {
		"ballArea" : { "vis" : false, "bCoef" : 1, "cMask" : ["ball" ] },
		"goalPost" : { "radius" : 8, "invMass" : 0, "bCoef" : 0.5 },
		"goalNet" : { "vis" : true, "bCoef" : 0.1, "cMask" : ["ball" ] },
		"kickOffBarrier" : { "vis" : false, "bCoef" : 0.1, "cGroup" : ["redKO","blueKO" ], "cMask" : ["red","blue" ] }

	}
}`