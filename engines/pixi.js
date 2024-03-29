//import * as PIXI from "pixi";
export default class PixiTest {
	constructor(div, resourceLocations, sprites, firstMax, limitSpriteCount) {
		//this.app = new PIXI.Application();
		//div.appendChild(this.app.view);
		this.rawSprites = sprites;
		this.gameElements = [];
		this.rockImage = resourceLocations.get("rock");
		this.shipImage = resourceLocations.get("ship");
		this.initPixi(div, resourceLocations, sprites, firstMax);
	}

	async initPixi(div, resourceLocations, sprites, firstMax) {
		console.log("starting promise");
		const promise = new Promise((resolve, reject) => {
				const script = document.createElement("script");
				script.type = "text/javascript";
				script.onload = () => {resolve()};
				script.onerror = () => {reject};
				script.src = "./engines/resources/pixi.min.js";
				document.body.appendChild(script);
		});
		//script.onload = scriptLoaded;
		await promise;
		console.log("promise over");
		const app = new PIXI.Application(div.offsetWidth, div.offsetHeight);
		app.renderer.background.color = "1e1f1c";
		console.log(app);
		this.app = app;
		div.appendChild(this.app.view);

		this.gameContainer = new PIXI.Container();
		this.app.stage.addChild(this.gameContainer);

		this.ship = PIXI.Sprite.from(this.shipImage);
		this.gameContainer.addChild(this.ship);
		const shipSprite = this.rawSprites[0];
		this.ship.anchor.set(0.5);
		this.ship.position.set(shipSprite.posX, shipSprite.posY);

		for (let i = 0; i < firstMax; i++) {
			const sprite = this.rawSprites[i+1];
			const x = ((sprite.posX % 824) + 824) % 824 - 24;
			const y = ((sprite.posY % 624) + 624) % 624 - 24;
			const rock = PIXI.Sprite.from(this.rockImage);
			rock.anchor.set(0.5);
			rock.position.set(x, y);
			this.gameElements.push(rock);
			this.gameContainer.addChild(rock);
		}
	}

	drawFrame(frame, frameSpriteCount, inputs, collision) {
		if (!this.ship || this.gameElements.length <= 0) {
			return;
		}

		while(this.gameElements.length - 1 < frameSpriteCount) {
			const sprite = this.rawSprites[this.gameElements.length + 1];
			const rock = PIXI.Sprite.from(this.rockImage);
			rock.anchor.set(0.5);
			rock.position.set(((sprite.posX % 824) + 824) % 824 - 24,
							  ((sprite.posY % 624) + 624) % 624 - 24);
			this.gameElements.push(rock);
			this.gameContainer.addChild(rock);
		}
		
		for (let i = 0; i < this.gameElements.length; i++) {
			const rock = this.gameElements[i];
			const rockSprite = this.rawSprites[i + 1];
			rock.position.set((((rockSprite.posX + (rockSprite.velX * frame)) % 824) + 824) % 824 - 24,
							 (((rockSprite.posY + (rockSprite.velY * frame)) % 624) + 624) % 624 - 24);
		}

		const shipSprite = this.rawSprites[0];
		//Y position
		if (inputs.get(83)) {
			shipSprite.velY += 0.01;
		} else if (inputs.get(87)) {
			shipSprite.velY -= 0.01;
		} else {
			if (shipSprite.velY != 0) {
				shipSprite.velY *= 0.99;
			}
		}

		//X position
		if (inputs.get(68)) {
			shipSprite.velX += 0.01;
		} else if (inputs.get(65)) {
			shipSprite.velX -= 0.01;
		} else {
			if (shipSprite.velX != 0) {
				shipSprite.velX *= 0.99;
			}
		}

		if (collision) {
			const shipHit = this.checkCollision();
		}

		shipSprite.posX += shipSprite.velX;
		shipSprite.posY += shipSprite.velY;

		this.ship.position.set(((shipSprite.posX % 824) + 828) % 824 - 28,
							   ((shipSprite.posY % 624) + 628) % 624 - 28);
	}

	checkCollision() {
		const shipPos = new PIXI.Point().copyFrom(this.ship.position);
		for (let i = 0; i < this.gameElements.length; i++) {
			const sprite = this.gameElements[i];
			const dx = (shipPos.x - sprite.position.x);
			const dy = (shipPos.y - sprite.position.y);
			const diff = Math.sqrt( (dx * dx) + (dy * dy) );
			//console.log(diff);
			//debugger;
			if (diff <= 12) {
				console.log(diff);
				//debugger;
				break;
				//return true;
			}
		}
	}

	destroy() {}
}
