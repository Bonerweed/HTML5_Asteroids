let spriteManagerRock;
let res;
export default class Babylon2dTest {
	constructor(div, resourceLocations, sprites, startSpriteCount, limitSpriteCount) {
		this.rawSprites = sprites;

		this.gameElements = [];

		this.initBabylon(div, resourceLocations, sprites, startSpriteCount, limitSpriteCount);
		res = resourceLocations;
	}

	async initBabylon(div, resourceLocations, sprites, startSpriteCount, limitSpriteCount) {
		console.log("starting promise");
		const promise = new Promise((resolve, reject) => {
				const script = document.createElement("script");
				script.type = "text/javascript";
				script.onload = () => {resolve()};
				script.onerror = () => {reject};
				script.src = "./engines/resources/babylon.js";
				document.body.appendChild(script);
		});
		await promise;
		console.log("promise over");

		const cnv = document.createElement('canvas');
		cnv.width  = div.offsetWidth;
		cnv.height = div.offsetHeight;
		div.appendChild(cnv);

		const engine = new BABYLON.Engine(cnv, true);
		this.scene = new BABYLON.Scene(engine);

		this.scene.clearColor = BABYLON.Color3.FromHexString("#1e1f1c");

		const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -1), this.scene);
		camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
		camera.orthoLeft = 0;
		camera.orthoRight = div.offsetWidth;
		camera.orthoTop = 0;
		camera.orthoBottom = div.offsetHeight;

		const spriteManagerShip = new BABYLON.SpriteManager("ship", resourceLocations.get("ship"), 1, {width: 24, height: 24});

		const shipSprite = this.rawSprites[0];

		this.ship = new BABYLON.Sprite("ship", spriteManagerShip);
		this.ship.invertV = true; // As we draw the orthographic camera from 0 -> Height our sprites are reversed.
		this.ship.width = 24;
		this.ship.height = 24;
		this.ship.position.set(shipSprite.posX, shipSprite.posY, 0);

		//change sprite amount stored, figure out during runtime
		
		spriteManagerRock = new BABYLON.SpriteManager("rock", resourceLocations.get("rock"), (startSpriteCount == limitSpriteCount) ? startSpriteCount : sprites.length, {width: 24, height: 24});

		for (let i = 0; i < startSpriteCount; i++) {
			const sprite = this.rawSprites[i + 1];
			const x = ((sprite.posX % 824) + 824) % 824 - 24;
			const y = ((sprite.posY % 624) + 624) % 624 - 24;
			const rock = new BABYLON.Sprite("rock", spriteManagerRock);
			rock.invertV = true; // As we draw the orthographic camera from 0 -> Height our sprites are reversed.
			rock.width = 24;
			rock.height = 24;
			rock.position.set(x, y, 0);
			this.gameElements.push(rock);
		}
	}

	drawFrame(frame, frameSpriteCount, inputs, collision) {
		if (!this.ship || this.gameElements.length <= 0) {
			return;
		}


		while(this.gameElements.length - 1 < frameSpriteCount) {
			const sprite = this.rawSprites[this.gameElements.length + 1];
			const rock = new BABYLON.Sprite("rock", spriteManagerRock);
			rock.invertV = true;
			rock.width = 24;
			rock.height = 24;
			rock.position.set(((sprite.posX % 824) + 824) % 824 - 24,
			                  ((sprite.posY % 624) + 624) % 624 - 24,
							  0);
			this.gameElements.push(rock);
		}

		for (let i = 0; i < this.gameElements.length; i++) {
			const rock = this.gameElements[i];
			const rockSprite = this.rawSprites[i + 1];
			const x = (((rockSprite.posX + (rockSprite.velX * frame)) % 824) + 824) % 824 - 24;
			const y = (((rockSprite.posY + (rockSprite.velY * frame)) % 624) + 624) % 624 - 24;
			rock.position.set(x, y, 0);
		}

		spriteManagerRock.render();
		const shipSprite = this.rawSprites[0];
		//Y position
		if (inputs.get(83)) {
			shipSprite.velY += 0.01;
		}
		else if (inputs.get(87)) {
			shipSprite.velY -= 0.01;
		}
		else {
			if (shipSprite.velY != 0) {
				shipSprite.velY *= 0.99;
			}
		}

		//X position
		if (inputs.get(68)) {
			shipSprite.velX += 0.01;
		}
		else if (inputs.get(65)) {
			shipSprite.velX -= 0.01;
		}
		else {
			if (shipSprite.velX != 0) {
				shipSprite.velX *= 0.99;
			}
		}
		if (collision) {
			const shipHit = this.checkCollision();
		}
		shipSprite.posX += shipSprite.velX;
		shipSprite.posY += shipSprite.velY;
		const x = ((shipSprite.posX % 824) + 828) % 824 - 28;
		const y = ((shipSprite.posY % 624) + 628) % 624 - 28;
		this.ship.position.set(x, y, 0);

		this.scene.render();
	}

	checkCollision() {
		const shipPos = this.ship.position;

		for (let i = 0; i < this.gameElements.length; i++) {
			const sprite = this.gameElements[i];
			const diff = BABYLON.Vector3.Distance(shipPos, sprite.position);

			//console.log(diff);
			//debugger;
			if (diff <= 12) {
				console.log(diff);
				//debugger;
				//break;
				//return true;
			}
		}
	}

	destroy() {}
}
