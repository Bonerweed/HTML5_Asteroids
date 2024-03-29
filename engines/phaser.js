//import Phaser from "./resources/phaser.min.js";
let crashed = false;

function setCrashed(val) {
	console.log("bang boom crash blast", val);
	crashed = val;
}

export default class PhaserTest {
	constructor(div, resourceLocations, sprites, firstMax, limitSpriteCount) {
		this.sprites = sprites;
		this.crashed = false;
		this.phaser;
		this.initPhaser(div, resourceLocations, sprites, firstMax);
	}

	async initPhaser(div, resourceLocations, sprites, firstMax) {
		console.log("starting promise");
		const promise = new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.type = "text/javascript";
			script.onload = () => { resolve() };
			script.onerror = () => { reject };
			script.src = "./engines/resources/phaser.min.js";
			document.body.appendChild(script);
		});
		//script.onload = scriptLoaded;
		await promise;
		console.log("Engin Loaded");

		const phaserConfig = {
			type: Phaser.CANVAS,
			backgroundColor: '#1e1f1c',
			width: div.offsetWidth,
			height: div.offsetHeight,
			parent: "gameDiv",
			physics: {
				default: 'arcade',
				arcade: {
					gravity: { x: 0, y: 0 },
					debug: false
				}
			},
			scene: {
				preload: this.preload,
				create: this.create,
				update: this.update
			}
		};

		this.game = new Phaser.Game(phaserConfig);
		this.game.thousandSpriteList = this.sprites;
		this.game.firstSpriteMax = firstMax;
		this.game.gameElements = [];
	}

	preload() {
		this.load.image("rock", "./Resources/space_rock.png");
		this.load.image("ship", "./Resources/space_ship.png");
	}

	create() {
		const rocks = this.physics.add.group();
		
		const ship = this.game.thousandSpriteList[0];
		const player = this.physics.add.sprite(ship.posX + 50, ship.posY, "ship");
		this.game.gameElements.push(player);

		this.game.spawner = (spriteList, index) => {
			const sprite = spriteList[index];
			const rock = rocks.create(((sprite.posX % 824) + 824) % 824 - 24,
			                          ((sprite.posY % 624) + 624) % 624 - 24,
									  "rock");
			this.game.gameElements.push(rock);
		}

		for (let i = 0; i < this.game.firstSpriteMax; i++) {
			this.game.spawner(this.game.thousandSpriteList, this.game.gameElements.length);
		}
	}

	update() {
	}

	drawFrame(frame, frameSpriteCount, inputs, collision) {
		if (!this.game || !this.game.gameElements[0]) {
			return false;
		}

		while (this.game.gameElements.length - 1 < frameSpriteCount) {
			this.game.spawner(this.game.thousandSpriteList, this.game.gameElements.length);
		}

		//Rocks

		for (var i = 1; i < this.game.gameElements.length; i++) {
			const sprite = this.sprites[i];
			const rock = this.game.gameElements[i];

			rock.x = (((sprite.posX + (sprite.velX * frame)) % 824) + 824) % 824 - 24;;
			rock.y = (((sprite.posY + (sprite.velY * frame)) % 624) + 624) % 624 - 24;
		}

		// Ship
		const ship = this.sprites[0];

		//Y position
		if (inputs.get(83)) {
			ship.velY += 0.01;
		} else if (inputs.get(87)) {
			ship.velY -= 0.01;
		} else {
			if (ship.velY != 0) {
				ship.velY *= 0.99;
			}
		}

		//X position
		if (inputs.get(68)) {
			ship.velX += 0.01;
		} else if (inputs.get(65)) {
			ship.velX -= 0.01;
		} else {
			if (ship.velX != 0) {
				ship.velX *= 0.99;
			}
		}

		if (collision) {
			const shipHit = this.checkCollision();
		}

		ship.posX += ship.velX;
		ship.posY += ship.velY;

		const phaserShip = this.game.gameElements[0];
		phaserShip.x = ((ship.posX % 824) + 828) % 824 - 28;
		phaserShip.y = ((ship.posY % 624) + 628) % 624 - 28;
	}

	checkCollision() {
		const ship = this.game.gameElements[0];
		for (var i = 1; i < this.game.gameElements.length; i++) {
			const rock = this.game.gameElements[i];
			const dx = (ship.x - rock.x);
			const dy = (ship.y - rock.y);
			const diff = Math.sqrt((dx * dx) + (dy * dy));
			//debugger;
			if (diff <= 12) {
				break;
			}
		}

	}

	destroy() { }
}

/*class PhaserContainer {
  constructor(div, resourceLocations, sprites, firstMax) {
	const phaserConfig = {
	  type: Phaser.AUTO,
	  width: div.offsetWidth,
	  height: div.offsetHeight,
	  parent: "gameDiv",
	  physics: {
		  default: 'arcade',
		  arcade: {
			  gravity: { x: 0, y: 0},
			  debug: false
		  }
	  },
	  scene: {
		preload: this.preload,
		create: this.create,
		update: this.update
	  }
	};
	this.game = new Phaser.Game(phaserConfig);
	this.game.thousandSpriteList = this.sprites;
	this.game.firstSpriteMax = firstMax;
	this.game.gameElements = [];//this.gameElements;
	console.log(this.game);
  }

  preload ()
  {
	this.load.image("rock", "./Resources/space_rock.png");
	this.load.image("ship", "./Resources/space_ship.png");
  }

  create ()
  {
	const rocks = this.physics.add.group();
	console.log(this.game.firstSpriteMax);
	const ship = this.game.thousandSpriteList[0];
	const player = this.physics.add.sprite(ship.posX + 50, ship.posY, "ship");
	this.game.gameElements.push(player);
	for (let i = 0; i < this.game.firstSpriteMax[0]; i++) {
	  const sprite = this.game.thousandSpriteList[i + 101];
	  const x = ((sprite.posX % 824) + 824) % 824 - 24;
	  const y = ((sprite.posY % 624) + 624) % 624 - 24;
	  const rock = rocks.create(x, y, "rock");
	  this.game.gameElements.push(rock);
	}
	//this.add.sprite(ship.posX, ship.posY, 100, "ship");
	console.log(this.game.gameElements.length);
	this.physics.add.overlap(rocks, player, setCrashed(true), null, this);
  }

  update ()
  {
  }
}*/
