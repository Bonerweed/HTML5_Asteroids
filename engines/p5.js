export default class P5Test {
  constructor(div, resourceLocations, sprites, firstMax) {
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
        sketch.noLoop();
        
      }
      //console.log(sketch.spaceShip, this.rawSprites[0].posX, this.rawSprites[0].posY);
      //sketch.ship = sketch.image(sketch.spaceShip, this.rawSprites[0].posX, this.rawSprites[0].posY);
      sketch.draw = () => {
        sketch.background(0);
        sketch.fill(255);
        //sketch.rect(100,100,50,50);
        sketch.ship = sketch.image(sketch.spaceShip, this.rawSprites[0].posX, this.rawSprites[0].posY);
      }
    };
    console.log(div.offsetHeight, div.offsetWidth);
    this.p5Instance = new p5(seed, div);
    const shipSprite = this.rawSprites[0];
    });
    await otherPromise;
    //this.ship = this.p5Instance.game.createSprite(shipSprite.posX, shipSprite.posY, 24, 24);
    //this.ship = new this.p5Instance.Sprite(shipSprite.posX, shipSprite.posY, 24, 24);
    //this.ship.addImage(this.p5Instance.game.loadImage(this.shipImage))
    //check successs here
  };
  drawFrame(frame, max, inputs) {
    if (!this.p5Instance) {
      console.log("not ready yet");
      return;
    }
    this.p5Instance.redraw()
  };
  checkCollision() {};
  destroy() {};
}