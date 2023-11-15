"use strict";

import Canvas2DTest from "./engines/canvas2d.js";
import WebGlTest from "./engines/webgl2d.js"
import PhaserTest from "./engines/phaser.js";
import PixiTest from "./engines/pixi.js";
import P5Test from "./engines/p5.js";
import Three2DTest from "./engines/three2d.js";
import Babylon2DTest from "./engines/babylon2d.js";
import PlayCanvas2DTest from "./engines/playcanvas2d.js";
import PlayCanvas3DTest from "./engines/playcanvas3d.js";
import Babylon3DTest from "./engines/babylon3d.js";
import Three3DTest from "./engines/three3d.js";

const gameDiv = document.getElementById("gameDiv");
const debugDiv = document.getElementById("debugDiv");
const perfDiv = document.getElementById("perfDiv")

const engineSelector = document.createElement("select");
engineSelector.name = "engines";
engineSelector.id = "engineSelect";

const engines = ["Canvas2D",
				 "Phaser",
				 "Pixi",
				 "P5",
				 "WebGL (2D)",
				 "Three (2D)",
				 "Three (3D)",
				 "Babylon (2D)",
				 "Babylon (3D)",
				 "PlayCanvas (2D)",
				 "PlayCanvas (3D)"];

for (let i = 0; i < engines.length; i++) {
	const option = document.createElement("option");
	option.value = engines[i];
	option.text = engines[i];
	engineSelector.appendChild(option);
}

debugDiv.appendChild(engineSelector);

document.getElementById("startButton").onclick = start;

const collisionCheckBox = document.createElement("input");
collisionCheckBox.type = "checkbox";
collisionCheckBox.id = "failstate";

const collisionCheckBoxLabel = document.createElement("label");
collisionCheckBoxLabel.htmlFor = "failstate";
collisionCheckBoxLabel.appendChild(document.createTextNode("Collision"));

debugDiv.appendChild(collisionCheckBox);
debugDiv.appendChild(collisionCheckBoxLabel);

const csvBox = document.createElement("input");
csvBox.type = "checkbox";
csvBox.id = "generatecsv";
const csvlabel = document.createElement("label");
csvlabel.htmlFor = "generatecsv";
csvlabel.appendChild(document.createTextNode("Generate CSV"));

debugDiv.appendChild(csvBox);
debugDiv.appendChild(csvlabel);

const concurrencyAmount = document.createElement("p");
concurrencyAmount.textContent = `CORES: ${window.navigator.hardwareConcurrency}`

const userAgentApprox = document.createElement("p");
userAgentApprox.textContent = `MEMORY APPROXIMATION: ${-1}`;

perfDiv.appendChild(concurrencyAmount);
perfDiv.appendChild(userAgentApprox);

const perfCnv = document.getElementById("perfCanvas");
const perfCtx = perfCnv.getContext("2d");
perfCtx.imageSmoothingEnabled	= false;

const height = perfCnv.height;
const step = (height - (height % 10)) / 10;

function drawGrid() {
	perfCtx.clearRect(0, 0, perfCnv.width, perfCnv.height);
	perfCtx.fillStyle	= "Grey";
	perfCtx.font = "normal 10pt Courier New";

	perfCtx.textAlign = "end";
	perfCtx.fillRect(0, perfCnv.height - 1, perfCnv.width, 1);
	perfCtx.fillText("FRAME", perfCnv.width, perfCnv.height - 2);

	perfCtx.textAlign = "start";

	for (let i = 0; i <= 12; i++) {
		const yPos = height - (i * step);
		if (yPos > 0 && yPos < height) {
			perfCtx.fillRect(0, yPos, 10, 1);
			perfCtx.fillText((i * 10).toString(), 15, yPos);
		}
	}

	perfCtx.fillRect(0, 0, 1, perfCnv.height);
	perfCtx.fillText("FPS", 2, 10);
}

//Count	, Color
const tests = [ [10	    , "Green"	],//00
				[5000	, "Orange"	],
				[10000	, "Red"		],
				[0		, "Cyan"	] ] // 0 is for Dynamic


const resources = new Map();
resources.set("rock", "./resources/space_rock.png");
resources.set("ship", "./resources/space_ship.png");

class Sprite {
	constructor() {
		this.name;
		this.posX;
		this.posY;
		this.velX;
		this.velY;
	}
}

const sprites = [];
const shipSprite = new Sprite();
shipSprite.name = "ship";
shipSprite.posX = 300;
shipSprite.posY = 300;
shipSprite.velX = 0;
shipSprite.velY = 0;
sprites.push(shipSprite);


let seed = 1337;

// Generate a million sprites via a very quick and dirty variation on the Park-Miller-Carta pseudo-random number generator.
for(let i = 0; i < 1000000; i++) {
	const sprite = new Sprite();

	sprite.name = "rock";
	sprite.posX = (seed = seed * 16807 % 2147483647) % 824;
	sprite.posY = (seed = seed * 16807 % 2147483647) % 624;
	sprite.velX = Math.sin((seed = seed * 16807 % 2147483647));
	sprite.velY = Math.sin((seed = seed * 16807 % 2147483647));

	sprites.push(sprite);
}

let time = performance.now()

let frame = 0;
let endFrame = perfCnv.width;

let startSpriteCount = 0; // Number of sprites at the start
let limitSpriteCount = 0; // Max number of sprites at the end.
let frameSpriteCount = 0; // Total Number of sprites on the current frame.
let spritesEachFrame = 0; // The number of sprites to add each frame.

let currentEngine;
let currentEngineName = "None";

let frameRequestId = null;
let dataSheet = [];

let checkCollision = false;

function start() {
	if (frameRequestId) { // Try to cancel any tests in progress
		cancelAnimationFrame(frameRequestId);
		frameRequestId = null;
	}

	if (currentEngine) { // Reset any existing loaded engines
		currentEngine.destroy();
	}

	frame = 0;

	// Reset game div
	gameDiv.innerHTML = "";

	currentEngineName = engineSelector.value;
	checkCollision = collisionCheckBox.checked;

	// Number of sprites at the start
	startSpriteCount = Number(document.getElementById("startSpriteInput").value);
	limitSpriteCount = Number(document.getElementById("endSpriteInput").value);
	spritesEachFrame = Math.ceil((limitSpriteCount - startSpriteCount) / (endFrame - 1));

	console.log(`Engine    : ${currentEngineName}`);
	console.log(`Start     : ${startSpriteCount}`);
	console.log(`End       : ${limitSpriteCount}`);
	console.log(`Ramp      : ${spritesEachFrame}`);
	console.log(`Collision : ${checkCollision}`);

	switch(currentEngineName) {
		case ("Canvas2D"):
			currentEngine = new Canvas2DTest(gameDiv, resources, sprites, startSpriteCount, limitSpriteCount);
			break;
		case ("WebGL (2D)"):
			currentEngine = new WebGlTest(gameDiv, resources, sprites, startSpriteCount, limitSpriteCount);
			break;
		case ("Three (2D)"):
			currentEngine = new Three2DTest(gameDiv, resources, sprites, startSpriteCount, limitSpriteCount);
			break;
		case ("Three (3D)"):
			currentEngine = new Three3DTest(gameDiv, resources, sprites, startSpriteCount, limitSpriteCount);
			break;
		case ("Babylon (2D)"):
			currentEngine = new Babylon2DTest(gameDiv, resources, sprites, startSpriteCount, limitSpriteCount);
			break;
		case ("Babylon (3D)"):
			currentEngine = new Babylon3DTest(gameDiv, resources, sprites, startSpriteCount, limitSpriteCount);
			break;
		case ("Phaser"):
			currentEngine = new PhaserTest(gameDiv, resources, sprites, startSpriteCount, limitSpriteCount);
			break;
		case ("Pixi"):
			currentEngine = new PixiTest(gameDiv, resources, sprites, startSpriteCount, limitSpriteCount);
			break;
		case ("P5"):
			currentEngine = new P5Test(gameDiv, resources, sprites, startSpriteCount, limitSpriteCount);
			break;
		case ("PlayCanvas (2D)"):
			currentEngine = new PlayCanvas2DTest(gameDiv, resources, sprites, startSpriteCount, limitSpriteCount);
			break;
		case ("PlayCanvas (3D)"):
			currentEngine = new PlayCanvas3DTest(gameDiv, resources, sprites, startSpriteCount, limitSpriteCount);
			break;
		/*case ("WebGL (3D)"):
			currentEngine = new PlayCanvas3DTest(gameDiv, resources, sprites, startSpriteCount, limitSpriteCount);
			break;*/
		default:
			alert(`Unknown Engine ${currentEngineName}`)
			return;
	}
	
	// Create Datasheet header
	dataSheet = [currentEngineName, "FRAME,FPS,FRAMETIME"];

	update();
}

const inputhistory = [];
const keyPresses = [];
const keyChecks = new Map();

window.onkeyup = (e) => {
	keyChecks.set(e.keyCode, false);
}

window.onkeydown = (e) => {
	keyChecks.set(e.keyCode, true);
}

async function update() {
	const now = performance.now();
	let fps = 1000 / (now - time);
	//console.log(performance.now())
	time = now;

	inputhistory.push(new Map(keyChecks));

	if(frame == 0) { // First frame of a test
		drawGrid();
	}

	// Calculate how many sprites should exist on this frame
	frameSpriteCount = Math.min(startSpriteCount + (spritesEachFrame * frame), limitSpriteCount)

	const timeBeforeDraw = performance.now();
	const returnVal = currentEngine.drawFrame(frame, frameSpriteCount, inputhistory[frame], checkCollision);
	const frameTime = performance.now() - timeBeforeDraw;

	// Note: The P5  frame counter probably doesn't take external stuff into account (our graphs, etc) and will report incorrect data. Not an apples to apples comparison.
	/*if (currentEngineName == "P5" && returnVal) {
		userAgentApprox.textContent = "FPS: " + String(returnVal.rate) + "\tFCOUNT: " + String(returnVal.count);
		fps = returnVal.rate
	}*/

	if(csvBox) {
		dataSheet.push((String(frame+1)+","+String(fps)+","+String(frameTime)+","+String(frameSpriteCount)));
	}

	drawMetrics(frame, fps, frameTime);

	frame++;

	if(frame % perfCnv.width == 0) { // Reset graph for next test at end.
		//drawGrid();
		if (csvBox.checked) {
			donwloadData();
		}
		console.log("the end");
	} else {
		frameRequestId = requestAnimationFrame(update);
	}
}

function drawMetrics(frame, fps, frameTime) {
	perfCtx.fillStyle = "#272822";
	perfCtx.fillRect(perfCnv.width - 140, 13, 140, 50);

	perfCtx.fillStyle = "#6a9955";
	perfCtx.fillText(`FRAME/SEC : ${fps.toFixed(0)}`, perfCnv.width - 140, 22);
	perfCtx.fillRect(frame % 1000, Math.max(height - Math.ceil((fps * (height / 100))), 0), 1, 1);

	perfCtx.fillStyle = "#4fc1ff";
	perfCtx.fillText(`SPRITENUM : ${frameSpriteCount}`, perfCnv.width - 140, 42);

	perfCtx.fillStyle = "#ffb518";
	perfCtx.fillText(`FRAMETIME : ${frameTime.toFixed(0)} ms`, perfCnv.width - 140, 62);
	perfCtx.fillRect(frame % 1000, Math.max(height - Math.ceil((frameTime * (height / 100))), 0), 1, 1);
}

function donwloadData() {
	const csvData = dataSheet.join("\n");
	const name = String(currentEngine+".csv");
	const blob = new Blob([csvData], { type: "text/csv" });
	const url = window.URL.createObjectURL(blob)
	const a = document.createElement("a")
	a.setAttribute("href", url)
	//a.setAttribute("download", name);
	a.download = `data.csv`;
	a.click()
}