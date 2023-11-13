class p5Ship {
  constructor(x, y) {
    //this.spriteName = image;
    this.x = x;
    this.y = y;
    this.velX = 0;
    this.velY = 0;
  }
}

class p5Rock {
  constructor(x, y, vx, vy) {
    //this.spriteName = image;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }
}
export default class P5Test {
  constructor(div, resourceLocations, sprites, firstMax, limitSpriteCount) {
    //this.app = new PIXI.Application();
    //div.appendChild(this.app.view);
    this.rawSprites = sprites;
    this.gameElements = [];
    this.rockImage = resourceLocations.get("rock");
    this.shipImage = resourceLocations.get("ship");
    this.initP5(div, resourceLocations, sprites, firstMax);
    this.p5Instance = null;
  }
  async initP5(div, resourceLocations, sprites, firstMax) {
    console.log("starting promise");
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      //script.type = "text/javascript";
      script.onload = () => {resolve()};
      script.onerror = () => {reject};
      script.src = "./engines/resources/p5.min.js";
      document.body.appendChild(script);
    });
    await promise;
    //await apipromise;
    const otherPromise = new Promise((resolve, reject)=>{
      console.log("promise over");
      const seed = (sketch) => {
      let x = div.offsetWidth;
      let y = div.offsetHeight;
      sketch.preload = () => {
        sketch.spaceShip = sketch.loadImage(this.shipImage);
        sketch.spaceRock = sketch.loadImage(this.rockImage);
      };
      sketch.partList = this.rawSprites;
      sketch.setup = () => {
        sketch.createCanvas(x, y);
        //sketch.noLoop();
        
      }
      //console.log(sketch.spaceShip, this.rawSprites[0].posX, this.rawSprites[0].posY);
      sketch.ship = new p5Ship(this.rawSprites[0].posX, this.rawSprites[0].posY);
      sketch.rockList = [];
      for (let i = 0; i < firstMax; i++) {
        const sprite = this.rawSprites[i+1];
        const x = ((sprite.posX % 824) + 824) % 824 - 24;
			  const y = ((sprite.posY % 624) + 624) % 624 - 24;
        const rock = new p5Rock(x, y, sprite.velX, sprite.velY);
        sketch.rockList.push(rock);
      };
      sketch.draw = () => {
        sketch.background("#1e1f1c");
        sketch.fill(255);
        //sketch.rect(100,100,50,50);
        sketch.image(sketch.spaceShip, sketch.ship.x, sketch.ship.y);
        for (let i = 0; i < sketch.rockList.length; i++) {
          const rock = sketch.rockList[i];
          /*if (rock.x >= 824) {
            debugger;
          }
          else if (rock.x <= 0) {
            debugger;
          }*/
          sketch.image(sketch.spaceRock, sketch.rockList[i].x, sketch.rockList[i].y);
        }
      }
    };
    this.p5Instance = new p5(seed, div);
    //const shipSprite = this.rawSprites[0];
    });
    await otherPromise;
  };
  drawFrame(frame, frameSpriteCount, inputs, collision) {
    if (!this.p5Instance) {
      console.log("not ready yet");
      return;
    }

    while(this.p5Instance.rockList.length - 1 < frameSpriteCount) {
			const sprite = this.rawSprites[this.p5Instance.rockList.length];

      const x = ((sprite.posX % 824) + 824) % 824 - 24;
      const y = ((sprite.posY % 624) + 624) % 624 - 24;
      const rock = new p5Rock(x, y, sprite.velX, sprite.velY);
      this.p5Instance.rockList.push(rock);
    }

    for (let i = 0; i < this.p5Instance.rockList.length; i++) {
      const rock = this.p5Instance.rockList[i];
      /*const movex = (((rock.x + (rock.vx)) % 824) + 824) % 824 - 24;
      const movey = (((rock.y + (rock.vy)) % 824) + 824) % 824 - 24;*/
      rock.x += rock.vx;
      rock.y += rock.vy;
      if (rock.x >= 824 || rock.x <=-24) {
        rock.x = rock.vx >0 ? -24 : 824;
      }
      if (rock.y >= 624 || rock.y <=-24) {
        rock.y = rock.vy >0 ? -24 : 624;
      }
    }
    this.p5Instance.redraw();
    if (collision) {
			const shipHit = this.checkCollision();
		}
    //const fps = this.p5Instance.frameRate();
    //const fcount = this.p5Instance.frameCount;
    //return{"rate":fps, "count": fcount}
  };
  checkCollision() {
    const ship = this.p5Instance.ship;
		for (let i = 1; i < this.p5Instance.rockList.length; i++) {
			const sprite = this.p5Instance.rockList[i];
			const dx = (ship.x - sprite.x);
			const dy = (ship.y - sprite.y);
			const diff = Math.sqrt( (dx * dx) + (dy * dy) );
			if (diff <= 12) {
				console.log("pow");
				//debugger;
				break;
				//return true;
			}
		}
  };
  destroy() {};
}