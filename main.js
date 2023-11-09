/*do imports here*/
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
"PlayCanvas (3D)"
];
for (let i = 0; i < engines.length; i++) {
	const option = document.createElement("option");
	option.value = engines[i];
	option.text = engines[i];
	engineSelector.appendChild(option);
}
debugDiv.appendChild(engineSelector);

const startButton = document.createElement("button");
startButton.onclick = start;
startButton.textContent = "Start";
debugDiv.appendChild(startButton);

const altStartButton = document.createElement("button");
altStartButton.onclick = rampItUp;
altStartButton.textContent = "Ramp";
debugDiv.appendChild(altStartButton);

const checkBox = document.createElement("input");
checkBox.type = "checkbox";
checkBox.id = "failstate";
const label = document.createElement("label");
label.htmlFor = "failstate";
label.appendChild(document.createTextNode("check collision"));

debugDiv.appendChild(checkBox);
debugDiv.appendChild(label);

const csvBox = document.createElement("input");
csvBox.type = "checkbox";
csvBox.id = "generatecsv";
const csvlabel = document.createElement("label");
csvlabel.htmlFor = "generatecsv";
csvlabel.appendChild(document.createTextNode("Generate .csv"));

debugDiv.appendChild(csvBox);
debugDiv.appendChild(csvlabel);

const concurrencyAmount = document.createElement("p");
concurrencyAmount.textContent = "CORES:" + String(window.navigator.hardwareConcurrency);
const userAgentApprox = document.createElement("p");
userAgentApprox.textContent = "MEMORY APPROXIMATION:" + "0";
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
const tests = [ [10	, "Green"	],//00
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
let max = 1;
let testIndex = 0;
let currentEngine;
let test;
let frameRequestId = null;
let spriteAmount = 0;
let chosenEngine;
let dataSheet = [];
let rampTarget = 0;
let rampAmount = 0;
let rampPacer = 0;
let currentSprites;
let checkCollision = false;

function rampItUp() {
	spriteAmount = Number(document.getElementById("renderAmount").value);
	rampTarget = Number(document.getElementById("rampAmount").value);
	console.log("we ramping lads");
	rampAmount = (rampTarget - spriteAmount) / 1000;
	console.log(rampAmount, rampTarget);
	start();
}

function start() {
	spriteAmount = Number(document.getElementById("renderAmount").value);
	if (frameRequestId) {
			cancelAnimationFrame(frameRequestId);
			frameRequestId = null;
	}
	if (currentEngine) {
		currentEngine.destroy();
	}
	gameDiv.innerHTML = "";
	chosenEngine = document.getElementById("engineSelect").value;
	checkCollision = document.getElementById("failstate").checked;
	console.log(chosenEngine, spriteAmount, document.getElementById("failstate").checked);
	switch(chosenEngine){
		case ("Canvas2D"):
				console.log("Canvas selected");
				currentEngine = new Canvas2DTest(gameDiv, resources, sprites);
				break;
		case ("WebGL (2D)"):
				console.log("WebGL selected");
				currentEngine = new WebGlTest(gameDiv, resources, sprites);
				break;
		case ("Three (2D)"):
				console.log("Three 2d selected");
				currentEngine = new Three2DTest(gameDiv, resources, sprites, spriteAmount);
				break;
		case ("Three (3D)"):
				console.log("Three 3d selected");
				currentEngine = new Three3DTest(gameDiv, resources, sprites, spriteAmount);
				break;
		case ("Babylon (2D)"):
				console.log("Babylon selected");
				currentEngine = new Babylon2DTest(gameDiv, resources, sprites, spriteAmount);
				break;
		case ("Babylon (3D)"):
				console.log("Babylon 3d selected");
				currentEngine = new Babylon3DTest(gameDiv, resources, sprites, spriteAmount);
				break;
		case ("Phaser"):
				console.log("Phaser selected");
				currentEngine = new PhaserTest(gameDiv, resources, sprites, spriteAmount);
				break;
		case ("Pixi"):
				console.log("Pixi selected");
				currentEngine = new PixiTest(gameDiv, resources, sprites, spriteAmount);
				break;
		case ("P5"):
				console.log("P5 selected");
				currentEngine = new P5Test(gameDiv, resources, sprites, spriteAmount);
				break;
		case ("PlayCanvas (2D)"):
				console.log("PlayCanvas selected");
				currentEngine = new PlayCanvas2DTest(gameDiv, resources, sprites, spriteAmount);
				break;
		case ("PlayCanvas (3D)"):
				console.log("PlayCanvas3D selected");
				currentEngine = new PlayCanvas3DTest(gameDiv, resources, sprites, spriteAmount);
				break;
		case ("WebGL (3D)"):
				console.log("webGL3D selected");
				currentEngine = new PlayCanvas3DTest(gameDiv, resources, sprites, spriteAmount);
				break;
	}
	dataSheet = [chosenEngine, "FRAME,FPS,FRAMETIME"];
	//currentEngine = new Canvas2DTest(gameDiv, resources, sprites);
	//const isFailChecked = document.getElementById("failstate").value;
	concurrencyAmount.textContent ="CORES:" + String(window.navigator.hardwareConcurrency)
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

//let gameOver = false;
async function update() {
	const now = performance.now();
	let fps = 1000 / (now - time);
	time = now;
	inputhistory.push(new Map(keyChecks));
	if(frame == 0) { // First frame of a test
		drawGrid();
		test = spriteAmount;
		max = spriteAmount;
		currentSprites = spriteAmount;
	}
	else if (rampTarget > 0 && currentSprites < rampTarget) {
		console.log(rampPacer);
		if (rampPacer > 1) {
			const intPart = String(rampPacer).split(".")[0];
			const decimalPart= String(rampPacer).split(".")[1];
			console.log("adding",intPart,"sprites");
			currentSprites += Number(intPart);
			rampPacer = Number(decimalPart);
		}
		else {
			rampPacer += rampAmount;
		}
	}
	const timeHere = performance.now();
	const returnVal = currentEngine.drawFrame(frame, currentSprites, inputhistory[frame], rampAmount, checkCollision);
	if (chosenEngine == "P5" && returnVal) {
		userAgentApprox.textContent = "FPS: " + String(returnVal.rate) + "\tFCOUNT: " + String(returnVal.count);
		fps = returnVal.rate
	}
	const timeAfter = performance.now();
	const frameTime = (timeAfter - timeHere);
	dataSheet.push((String(frame+1)+","+String(fps)+","+String(frameTime)+","+String(currentSprites)));
	drawMetrics(frame, fps, test, frameTime);
	/*if(test[0] == 0) { // Dynamicly increase sprites if in the 0 test.
		max = Math.min(max + 10, sprites.length);
	}*/

	frame++;

	if(frame % perfCnv.width == 0) { // Reset graph for next test at end.
		//drawGrid();
		if (document.getElementById("generatecsv").checked) {
			donwloadData();
		}
		console.log("the end");
	}
	else {
		frameRequestId = requestAnimationFrame(update);
	}
}

function drawMetrics(frame, fps, test, frameTime) {
	perfCtx.fillStyle = "White";
	perfCtx.fillRect(perfCnv.width - 100, 2, 100, 70);

	perfCtx.fillStyle = "Black";
	perfCtx.fillText(`NUM : ${currentSprites}`, perfCnv.width - 90, 42);

	perfCtx.fillStyle = "GREEN";
	perfCtx.fillText(`FPS : ${fps.toFixed(0)}`, perfCnv.width - 90, 22);
	perfCtx.fillRect(frame % 1000, Math.max(height - Math.ceil((fps * (height / 100))), 0), 1, 1);

	perfCtx.fillStyle = "PINK";
	perfCtx.fillText(`FT : ${frameTime} ms`, perfCnv.width - 90, 62);
	perfCtx.fillRect(frame % 1000, Math.max(height - Math.ceil((frameTime * (height / 100))), 0), 1, 1);
}
function donwloadData(){
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