//import * as p5api from "./p5api.js";
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
    //script.onload = scriptLoaded;
    /*const apipromise = new Promise((resolve, reject) => {
      const api = document.createElement("script");
      //api.type = "text/javascript";
      api.onload = () => {resolve()};
      api.onerror = () => {reject};
      api.src = "./engines/p5api.js";
      document.body.appendChild(api);
  });*/
    await promise;
    //await apipromise;
    console.log("promise over");
    const seed = (sketch) => {
      let x = 800;
      let y = 600;
      sketch.setup = () => {
        sketch.createCanvas(x, y);
      }

      sketch.draw = () => {
        sketch.background(0);
        sketch.fill(255);
        sketch.rect(100,100,50,50);
      }
    };
    console.log(div.offsetHeight, div.offsetWidth);
    this.p5Instance = new p5(seed, div);
    //check successs here
  };
  drawFrame(frame, max, inputs) {
  };
  checkCollision() {};
  destroy() {};
}