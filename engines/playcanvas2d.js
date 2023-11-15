export default class PlayCanvas2DTest {
  constructor(div, resourceLocations, sprites, firstMax, limitSpriteCount){
    this.cnv = document.createElement('canvas');
		this.cnv.width  = div.offsetWidth;
		this.cnv.height = div.offsetHeight;
    this.rockList = [];
    this.spriteData = sprites;

		div.appendChild(this.cnv);
    this.initPlayCanvas(this.cnv, resourceLocations, firstMax);
  }
  async initPlayCanvas(canvas, resourceLocations, firstMax){
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
		const app = new pc.Application(canvas, {name: "appRoot"});
		console.log(app.name);
    this.app = app;
    this.app.start();
    this.app.setCanvasFillMode(pc.FILLMODE_NONE);

    //Making sprite assets
    this.shipAsset = new pc.Asset("ship", "texture", {
      url: resourceLocations.get("ship")
    });

    this.rockAsset = new pc.Asset("rock", "texture", {
      url: resourceLocations.get("rock")
    });
    this.app.assets.add(this.shipAsset);
    this.app.assets.add(this.rockAsset);

    //this.app.assets._assets.push(this.shipAsset);
    console.log("asset tests: ", this.app.assets);
    console.log(this.app.assets._assets);
    console.log(this.app.assets.ship);
    
    //console.log(this.app.assets);
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
    this.screenEntity = new pc.Entity("screenEntity");
    this.screenEntity.addComponent("screen", { resolution: new pc.Vec2(800, 600), screenSpace: true });
    this.screenEntity.screen.scaleMode = "blend";
    //this.screenEntity.screen.scaleBlend = 0.5;
    this.screenEntity.screen.referenceResolution = new pc.Vec2(800, 600);
    this.panel = new pc.Entity("panel");
    
    //console.log("panel parent: ", this.panel.parent);

    //Setting up ship & screenEntity
    this.screenEntity.addComponent(this.panel);
    this.ship = new pc.Entity("ship");
    this.ship.addComponent('element', {
        //anchor: new pc.Vec4(0.5, 0.5, 0.5, 0.5),
        pivot: new pc.Vec2(0.5, 0.5),
        //width: 24,
        //height: 24,
        type: "image",
        textureAsset: this.app.assets._assets[0].id,
        //drawOrder: 1000,    
    });

    //Making some rocks
    for (let i = 0; i < firstMax; i++) {
      const sprite = this.spriteData[i + 1];
			const x = ((sprite.posX % 824) + 824) % 824 - 24;
			const y = ((sprite.posY % 624) + 624) % 624 - 24;
      const rock = new pc.Entity();
      rock.addComponent("element", {
          type: "image",
          textureAsset: this.app.assets._assets[1].id,
      });

      //rock.addComponent("script");
      //rock.script.create("trigger");
      //rock.setLocalScale(24,24,24);
      console.log("x: ", x, "y: ", y);
      this.screenEntity.addChild(rock);
      rock.setLocalPosition(new pc.Vec3(x,y,0));
      this.rockList.push(rock);
    }

    this.app.root.name ="root";
    console.log("ship dims: ", this.ship.calculatedHeight);
    console.log("ship asset elem componenet: ", this.ship.element);
    console.log("ship depth: ", this.ship.graphDepth);
    // Create camera entity
    let camera = new pc.Entity("camera");
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.1, 0.2, 0.3).fromString("#1e1f1c")
    });
    let cube = new pc.Entity("cube");
      cube.addComponent('model', {
        type: "box"
    });

    //cube.element.color = pc.Color.RED;
    let light = new pc.Entity("light")
    light.addComponent("light",{
      type: "omni",
    color: new pc.Color(1, 0, 0),
    range: 10,
    //eulerAngles: pc.Vec3(90, 0, 0) 
          });
    //this.light.setEulerAngles(90, 0, 0);
    //cube.color = new pc.Color(144,12,88);

    //console.log(this.ship, this.ship.sprite);
    console.log("ship loop: ");
    
    console.log("app name: ", this.app.root.name);
    
    
    console.log("root children: ", this.app.root.children);
    for(let i = 0; i < this.app.root.children; i++) {
      console.log(this.app.root.children[i]);
    }
    
    //this.app.root.addChild(this.panel);
    //this.app.root.addChild(cube);
    this.screenEntity.addChild(this.ship);
    this.screenEntity.addChild(light);
    //this.screenEntity.addChild(this.screenEntity);
    this.screenEntity.addChild(camera);
    this.app.root.addChild(this.screenEntity);
    //camera.setPosition(0, 0, 10);
    console.log("ship global position: ", this.ship.getPosition());
    console.log("ship local position: ", this.ship.getLocalPosition());

    console.log("screenEntity: ", this.screenEntity);
    
  }
  drawFrame(frame, frameSpriteCount, inputs, collision){
    if (!this.app || !this.ship) {
      return false;
    }

    while(this.rockList.length - 1 < frameSpriteCount) {
			const sprite = this.spriteData[this.rockList.length + 1];
      const x = ((sprite.posX % 824) + 824) % 824 - 24;
      const y = ((sprite.posY % 624) + 624) % 624 - 24;
      const rock = new pc.Entity();
      rock.addComponent("element", {
        type: "image",
        textureAsset: this.app.assets._assets[1].id,
      });
      this.screenEntity.addChild(rock);
      rock.setLocalPosition(new pc.Vec3(x,y,0));
      this.rockList.push(rock);
    }

    /*if (rampAmount > 0 && this.rockList.length < 1000000) {
			const additionalSprites = this.rockList.length + rampAmount > 1000000 ? 1000000 - this.rockList.length : rampAmount;
			const existingSprites = this.rockList.length;
			for (let i = 0; i < additionalSprites; i++) {
				const sprite = this.spriteData[i + 1];
			  const x = ((sprite.posX % 824) + 824) % 824 - 24;
			  const y = ((sprite.posY % 624) + 624) % 624 - 24;
        const rock = new pc.Entity();
        rock.addComponent("element", {
          type: "image",
          textureAsset: this.app.assets._assets[1].id,
        });
        console.log("x: ", x, "y: ", y);
        this.screenEntity.addChild(rock);
        rock.setLocalPosition(new pc.Vec3(x,y,0));
        this.rockList.push(rock);
			}
		}*/

    for (let i = 0; i < this.rockList.length; i++) {
      const rock = this.rockList[i];
      const rockSprite = this.spriteData[i+1];
      const x = (((rockSprite.posX + (rockSprite.velX * frame)) % 824) + 824) % 824 - 24;
			const y = (((rockSprite.posY + (rockSprite.velY * frame)) % 624) + 624) % 624 - 24;
      rock.setLocalPosition(new pc.Vec3(x,y,0));
    }

    const ship = this.spriteData[0];

    if (inputs.get(83)) {
      ship.velY -= 0.01;
    }
    else if (inputs.get(87)) {
      ship.velY += 0.01;
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

    ship.posX += ship.velX;
    ship.posY += ship.velY;
    const x = ((ship.posX % 824) + 828) % 824 - 28;
    const y = ((ship.posY % 624) + 628) % 624 - 28;
    console.log(x, y);
    this.ship.setLocalPosition(new pc.Vec3(x,y,0));
    if (collision) {
      this.checkCollision();
    }
    
    //ship.translate(0.1,0,0);
  } 
  checkCollision(){
    const shipPos = this.ship.getLocalPosition();
		for (let i = 0; i < this.rockList.length; i++) {
			const sprite = this.rockList[i].getLocalPosition();
      console.log(shipPos.x, shipPos.y, sprite.x, sprite.y);
			const dx = (shipPos.x - sprite.x);
			const dy = (shipPos.y - sprite.y);
			const diff = Math.sqrt( (dx * dx) + (dy * dy) );
      console.log(dx, dy, diff);
			//debugger;
			if (diff <= 24) {
				console.log("pow");
				//debugger;
				break;
				//return true;
			}
		}
  }
  destroy(){}
}
