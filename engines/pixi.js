//import * as PIXI from "pixi";
export default class PixiTest {
  constructor(div, resourceLocations, sprites, firstMax) {
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
        script.src = "https://pixijs.download/release/pixi.js";
        document.body.appendChild(script);
    });
    //script.onload = scriptLoaded;
    await promise;
    console.log("promise over");
    const app = new PIXI.Application(div.offsetWidth, div.offsetHeight);
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

    for (let i = 0; i < firstMax[0]; i++) {
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
  drawFrame(frame, max, inputs) {
    if (!this.ship || this.gameElements.length <= 0) {
      return;
    }
    for (let i = 0; i < this.gameElements.length; i++) {
      const rock = this.gameElements[i];
      const rockSprite = this.rawSprites[i + 1];
      const x = (((rockSprite.posX + (rockSprite.velX * frame)) % 824) + 824) % 824 - 24;
			const y = (((rockSprite.posY + (rockSprite.velY * frame)) % 624) + 624) % 624 - 24;
      rock.position.set(x, y);
    }
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

		const shipHit = this.checkCollision();
		shipSprite.posX += shipSprite.velX;
		shipSprite.posY += shipSprite.velY;
		const x = ((shipSprite.posX % 824) + 828) % 824 - 28;
		const y = ((shipSprite.posY % 624) + 628) % 624 - 28;
    this.ship.position.set(x, y);
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
				debugger;
				break;
				//return true;
			}
    }
  }
  destroy() {}
}
