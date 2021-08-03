/*do imports here*/
import Canvas2DTest from "./engines/canvas2d.js";
//import WebGlTest from "./engines/webgl.js"

const gameDiv = document.getElementById('gameDiv');
const debugDiv = document.getElementById('debugDiv');

const startButton = document.createElement('button');
startButton.onclick = start;
startButton.textContent = "Start";
debugDiv.appendChild(startButton);

const perfCnv = document.getElementById('perfCanvas');
const perfCtx = perfCnv.getContext('2d');
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
    let yPos = height - i * step;
    if (yPos > 0 && yPos < height) {
      perfCtx.fillRect(0, yPos, 10, 1);
      perfCtx.fillText((i * 10).toString(), 15, yPos);
    }
  }

  perfCtx.fillRect(0, 0, 1, perfCnv.height);
  perfCtx.fillText("FPS", 2, 10);
}
//Count	, Color
const tests = [ [10000	, "Green"	],//00
				[5000	, "Orange"	],
				[10000	, "Red"		],
				[0		, "Cyan"	] ] // 0 is for Dynamic


const resources = new Map();
resources.set("rock", "./Resources/space_rock.png");
resources.set("ship", "./Resources/space_ship.png");

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

function start() {
	//currentEngine = new WebGlTest(gameDiv, resources, sprites);
	currentEngine = new Canvas2DTest(gameDiv, resources, sprites);

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

let gameOver = false;

function update() {
	const now = performance.now();
	const fps = 1000 / (now - time);
	time = now;
  inputhistory.push(new Map(keyChecks));
	if(frame == 0) { // First frame of a test
		if(testIndex == tests.length) {
			testIndex = 0;
			return;
		}
    drawGrid();
		test = tests[0];
		max = test[0];
	}

	gameOver = currentEngine.drawFrame(frame, max, inputhistory[frame]);
	drawMetrics(frame, fps, test);

	if(test[0] == 0) { // Dynamicly increase sprites if in the 0 test.
		max = Math.min(max + 10, sprites.length);
	}

	frame++;

	if(frame % perfCnv.width == 0) { // Reset graph for next test at end.
		//frame = 0;
    //inputhistory.slice(0, inputhistory.length);
    drawGrid();
	}

if (!gameOver) {
  requestAnimationFrame(update);
}
else {
  alert("ouch");
}
  /*for (let i = 0; i < keyPresses.length; i++) {
    if (!keyChecks[keyPresses[i]]) {
      keyPresses.slice(keyPresses.indexOf(e.keyCode), 1);
    }
  }*/
}

function drawMetrics(frame, fps, test) {
	perfCtx.fillStyle = "White";
	perfCtx.fillRect(perfCnv.width - 100, 2, 100, 50);

	perfCtx.fillStyle = "Black";
	perfCtx.fillText(`NUM : ${max}`, perfCnv.width - 90, 42);

	perfCtx.fillStyle = test[1];
	perfCtx.fillText(`FPS : ${fps.toFixed(0)}`, perfCnv.width - 90, 22);
	perfCtx.fillRect(frame % 1000, Math.max(height - Math.ceil((fps * (height / 100))), 0), 1, 1);
}
