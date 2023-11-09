//import Phaser from "./resources/phaser.min.js";
let crashed = false;

function setCrashed(val) {
  console.log("bang boom crash blast", val);
  crashed = val;
}
let spawner;
export default class PhaserTest {
  constructor(div, resourceLocations, sprites, firstMax) {
    this.sprites = sprites;
    this.crashed = false;
    this.phaser;
    //this.gameElements = [];
    this.initPhaser(div, resourceLocations, sprites, firstMax);
  }
  async initPhaser(div, resourceLocations, sprites, firstMax) {
    console.log("starting promise");
    const promise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.onload = () => {resolve()};
        script.onerror = () => {reject};
        script.src = "./engines/resources/phaser.min.js";
        document.body.appendChild(script);
    });
    //script.onload = scriptLoaded;
    await promise;
    console.log("promise over");
    //const phaserElement = new PhaserContainer(div, resourceLocations, sprites, firstMax);
    //this.phaser = phaserElement;
    const phaserConfig = {
      type: Phaser.CANVAS,
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
    spawner = (spriteList, index) => {
      const sprite = spriteList[index];
      const x = ((sprite.posX % 824) + 824) % 824 - 24;
      const y = ((sprite.posY % 624) + 624) % 624 - 24;
      const rock = rocks.create(x, y, "rock");
      this.game.gameElements.push(rock);
    }
    for (let i = 0; i < this.game.firstSpriteMax; i++) {
      /*const sprite = this.game.thousandSpriteList[i + 101];
      const x = ((sprite.posX % 824) + 824) % 824 - 24;
      const y = ((sprite.posY % 624) + 624) % 624 - 24;
      const rock = rocks.create(x, y, "rock");
      this.game.gameElements.push(rock);*/
      spawner(this.game.thousandSpriteList, (i + 101));
    }
    //this.add.sprite(ship.posX, ship.posY, 100, "ship");
    console.log("gameelements:", this.game.gameElements.length);
    //this.physics.add.overlap(rocks, player, setCrashed(true), null, this);
  }

  update ()
  {
  }

  drawFrame(frame, max, inputs, rampAmount, collision) {
    if (!this.game || !this.game.gameElements[0]) {
      return false;
    }
    //console.log("draw frame");
    //console.log(this.game, this.game.physics);

    const ship = this.sprites[0];
    if (rampAmount > 0 && this.game.gameElements.length < 1000000) {
			const additionalSprites = this.game.gameElements.length + rampAmount > 1000000 ? 1000000 - this.game.gameElements.length : rampAmount;
			const existingSprites = this.game.gameElements.length;
			for (let i = 0; i < additionalSprites; i++) {
				spawner(this.game.thousandSpriteList, (i + 101 + existingSprites));
			}
		}
    //rocks
    for(var i = 1; i < this.game.gameElements.length; i++) {
      const sprite = this.sprites[i];
      const rock = this.game.gameElements[i];

      const x = (((sprite.posX + (sprite.velX * frame)) % 824) + 824) % 824 - 24;
      const y = (((sprite.posY + (sprite.velY * frame)) % 624) + 624) % 624 - 24;

      rock.x = x;
      rock.y = y;
    }

    //Y position
		if (inputs.get(83)) {
			ship.velY += 0.01;
		}
		else if (inputs.get(87)) {
			ship.velY -= 0.01;
		}
		else {
			if (ship.velY != 0) {
				ship.velY *= 0.99;
			}
		}

		//X position
		if (inputs.get(68)) {
			ship.velX += 0.01;
		}
		else if (inputs.get(65)) {
			ship.velX -= 0.01;
		}
		else {
			if (ship.velX != 0) {
				ship.velX *= 0.99;
			}
		}

    if (collision) {
      const shipHit = this.checkCollision();
    }

		ship.posX += ship.velX;
		ship.posY += ship.velY;
		const x = ((ship.posX % 824) + 828) % 824 - 28;
		const y = ((ship.posY % 624) + 628) % 624 - 28;
    const phaserShip = this.game.gameElements[0];
    phaserShip.x = x;
    phaserShip.y = y;
  }
  checkCollision() {
    const ship = this.game.gameElements[0];
    for(var i = 1; i < this.game.gameElements.length; i++) {
      const rock = this.game.gameElements[i];
      const dx = (ship.x - rock.x);
			const dy = (ship.y - rock.y);
			const diff = Math.sqrt( (dx * dx) + (dy * dy) );
			//debugger;
			if (diff <= 12) {
				//debugger;
        console.log("pow");
				break;
				//return true;
			}
    }

  }
  destroy() {}
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
