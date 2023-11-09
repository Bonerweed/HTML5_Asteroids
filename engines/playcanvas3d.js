export default class PlayCanvas3DTest {
  constructor(div, resourceLocations, sprites, firstMax){
    this.cnv = document.createElement('canvas');
		this.cnv.width  = div.offsetWidth;
		this.cnv.height = div.offsetHeight;
		div.appendChild(this.cnv);
    this.rockList = [];
    this.spriteData = sprites;
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
		const app = new pc.Application(canvas, {});
		//console.log(app);
    this.app = app;
    this.app.start();
    this.app.setCanvasFillMode(pc.FILLMODE_NONE);

    this.camera = new pc.Entity();
    this.camera.addComponent('camera', {
      clearColor: new pc.Color(0.1, 0.2, 0.3),
      projection: pc.PROJECTION_ORTHOGRAPHIC,
      orthoHeight: 300
    });

    this.light = new pc.Entity();
    this.light.addComponent('light');
    this.light.setEulerAngles(90,0,0)


    const shipMaterial =  new pc.StandardMaterial();
    shipMaterial.diffuse.set(1, 0, 0);
    shipMaterial.specular.set(0, 0, 1);
    shipMaterial.update();
    this.ship = new pc.Entity();
    this.ship.addComponent('model', {
        type: "capsule"
    });
    this.ship.addComponent("rigidbody", {
        type: pc.BODYTYPE_KINEMATIC
    });
    this.ship.addComponent("collision", {
      type: "sphere"
    });
    //this.ship.material = shipMaterial;

    const triggerScript = pc.createScript("triggerScript");
    triggerScript.prototype.initialize = function () {
      this.entity.collision.on("collisionstart",this.onCollisionStart, this);
    };
    triggerScript.prototype.onCollisionStart = (result) => {
      console.log("oof", result);
      debugger;
    }
    /*triggerScript.prototype.update = function(dt){
      console.log("help");
    };*/
    this.ship.addComponent("script");
    this.ship.script.create("triggerScript");
    this.ship.setLocalScale(12,12,12);
    this.ship.rotate(0,0,90);
    console.log("ship", this.ship.collision, this.app);

    for (let i = 0; i < firstMax; i++) {
      const sprite = this.spriteData[i + 1];
			const x = ((sprite.posX % 824) + 824) % 824 - 24;
			const y = ((sprite.posY % 624) + 624) % 624 - 24;
      const rock = new pc.Entity();
      rock.addComponent('model', {
          type: "sphere",
      });
      rock.addComponent("rigidbody", {
          type: pc.BODYTYPE_KINEMATIC
      });
      rock.addComponent("collision", {
        type: "sphere"
      });
      //rock.addComponent("script");
      //rock.script.create("trigger");
      rock.setLocalScale(24,24,24);
      this.app.root.addChild(rock);
      rock.setPosition(new pc.Vec3(x,y,0));
      this.rockList.push(rock);
    }

    this.app.root.addChild(this.ship);
    this.app.root.addChild(this.camera);
    this.app.root.addChild(this.light);
    this.camera.setPosition(400, 300, 60);
  }

  drawFrame(frame, max, inputs, rampAmount, collision){
    if (!this.app || !this.ship) {
      return false;
    }
    const ship = this.spriteData[0];
    if (rampAmount > 0 && this.rockList.length < 1000000) {
			const additionalSprites = this.rockList.length + rampAmount > 1000000 ? 1000000 - this.rockList.length : rampAmount;
			const existingSprites = this.rockList.length;
			for (let i = 0; i < additionalSprites; i++) {
				const sprite = this.spriteData[i + 1 + existingSprites];
				const x = ((sprite.posX % 824) + 824) % 824 - 24;
        const y = ((sprite.posY % 624) + 624) % 624 - 24;
        const rock = new pc.Entity();
        rock.addComponent('model', {
            type: "sphere",
        });
        rock.addComponent("rigidbody", {
            type: pc.BODYTYPE_KINEMATIC
        });
        rock.addComponent("collision", {
          type: "sphere"
        });
        //rock.addComponent("script");
        //rock.script.create("trigger");
        rock.setLocalScale(24,24,24);
        this.app.root.addChild(rock);
        rock.setPosition(new pc.Vec3(x,y,0));
        this.rockList.push(rock);
			}
		}
    for (let i = 0; i < this.rockList.length; i++) {
      const rock = this.rockList[i];
      const rockSprite = this.spriteData[i+1];
      const x = (((rockSprite.posX + (rockSprite.velX * frame)) % 824) + 824) % 824 - 24;
			const y = (((rockSprite.posY + (rockSprite.velY * frame)) % 624) + 624) % 624 - 24;
      rock.setPosition(new pc.Vec3(x,y,0));
    }
    //Y position
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
    //console.log(this.ship.getPosition());
    this.ship.setPosition(new pc.Vec3(x,y,0));

  }
  checkCollision(){}
  destroy(){}
}
