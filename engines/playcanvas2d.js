export default class PlayCanvas2DTest {
  constructor(div, resourceLocations, sprites){
    this.cnv = document.createElement('canvas');
		this.cnv.width  = div.offsetWidth;
		this.cnv.height = div.offsetHeight;
		div.appendChild(this.cnv);
    this.initPlayCanvas(this.cnv, resourceLocations);
  }
  async initPlayCanvas(canvas, resourceLocations){
    console.log("starting promise");
		const promise = new Promise((resolve, reject) => {
				const script = document.createElement("script");
				script.type = "text/javascript";
				script.onload = () => {resolve()};
				script.onerror = () => {reject};
				script.src = "./engines/resources/playcanvas-latest.min.js";
				document.body.appendChild(script);
		});
		//script.onload = scriptLoaded;
		await promise;
		console.log("promise over");
		const app = new pc.Application(canvas, {});
		console.log(app);
    this.app = app;
    this.app.start();
    this.app.setCanvasFillMode(pc.FILLMODE_NONE);
    this.shipAsset = new pc.Asset("ship", "texture", {
      url: resourceLocations.get("ship")
    });
    this.rockAsset = new pc.Asset("rock", "texture", {
      url: resourceLocations.get("rock")
    });
    //this.app.assets._assets.push(this.ship);
    console.log(this.app.assets);
    /*this.shipAtlas = new pc.TextureAtlas();
    this.shipAtlas.frames = {
      "0" : {
        rect: new pc.Vec4(0,0, 24, 24),
        pivot: new pc.Vec2(0.5, 0.5),
        border: new pc.Vec4(5,5,5,5)
      }
    };
    this.shipAtlas.texture = resourceLocations.get("ship");*/

  /*  this.ship = new pc.Sprite(this.app.GraphicsDevice,
      {
        pixelsPerUnit: 1,
        renderMode: pc.SPRITE_RENDERMODE_SIMPLE,
        atlas: this.shipAtlas,
        frameKeys: ["0"]
      }
    );
    console.log(this.ship);*/
    /*this.ship = new pc.Entity();
    this.ship.addComponent("sprite",
    {
      type: pc.SPRITETYPE_SIMPLE,
      sprite: "ship"
    });*/
    // Create a screen to display the particle texture
    this.screenEntity = new pc.Entity();
    this.screenEntity.addComponent("screen", { resolution: new pc.Vec2(800, 600), screenSpace: true });
    this.screenEntity.screen.scaleMode = "blend";
    this.screenEntity.screen.referenceResolution = new pc.Vec2(1280, 720);
    this.panel = new pc.Entity();
    this.screenEntity.addComponent(this.panel);
    this.ship = this.panel.addComponent('element', {
        anchor: new pc.Vec4(0.5, 0.5, 0.5, 0.5),
        pivot: new pc.Vec2(0.5, 0.5),
        width: 100,
        height: 100,
        type: "image",
        textureAsset: this.shipAsset
    });
    // Create camera entity
    var camera = new pc.Entity();
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.1, 0.2, 0.3)
    });
    var cube = new pc.Entity();
      cube.addComponent('model', {
        type: "box"
    });

    console.log(this.ship, this.ship.sprite);
    this.app.root.addChild(this.ship);
    //this.app.root.addChild(cube);
    this.app.root.addChild(this.screenEntity);
    this.app.root.addChild(camera);
    camera.setPosition(0, 0, 3);
  }
  drawFrame(){}
  checkCollision(){}
  destroy(){}
}
