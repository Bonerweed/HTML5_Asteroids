export default class P5Test {
  constructor(div, resourceLocations, sprites, firstMax) {
    //this.app = new PIXI.Application();
    //div.appendChild(this.app.view);
    this.rawSprites = sprites;
    this.gameElements = [];
    this.rockImage = resourceLocations.get("rock");
    this.shipImage = resourceLocations.get("ship");
    this.initP5(div, resourceLocations, sprites, firstMax);
  }
  async initP5(div, resourceLocations, sprites, firstMax) {
    console.log("starting promise");
    const promise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.onload = () => {resolve()};
        script.onerror = () => {reject};
        script.src = "https://cdn.jsdelivr.net/npm/p5@1.4.0/lib/p5.js";
        document.body.appendChild(script);
    });
    //script.onload = scriptLoaded;
    await promise;
    console.log("promise over");
    console.log(p5);
    createCanvas(div.offsetWidth, div.offsetHeight);
    //check successs here
  }
  drawFrame(frame, max, inputs) {
  }
  checkCollision() {}
  destroy() {}
}
