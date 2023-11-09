let transformNode;
export default class Babylon3DTest {
	constructor(div, resourceLocations, sprites, firstMax) {
		this.rawSprites = sprites;

		this.gameElements = [];

		this.initBabylon(div, resourceLocations, sprites, firstMax);
	}

	async initBabylon(div, resourceLocations, sprites, firstMax) {
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
		this.scene.clearColor = BABYLON.Color3.Black();
		this.scene.ambientColor = new BABYLON.Color3.FromHexString("#404040");

		const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -128), this.scene);
		camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
		camera.orthoLeft = 0;
		camera.orthoRight = div.offsetWidth;
		camera.orthoTop = div.offsetHeight;
		camera.orthoBottom = 0;

		transformNode = new BABYLON.TransformNode(); // We use a transform to convert the top to 0 and the bottom to 600.
		transformNode.scaling.y = -1;
		transformNode.position.y = 600;

		const shipSprite = this.rawSprites[0];

		const directionalLight = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(-1, -1, 1));
		directionalLight.diffuse = new BABYLON.Color3.FromHexString("#ffffff");

		this.ship = BABYLON.MeshBuilder.CreateSphere("sphere", {diameterX: 24, diameterY: 12, diameterZ: 24});
		this.ship.width = 24;
		this.ship.height = 24;
		this.ship.position.set(shipSprite.posX, shipSprite.posY, 0)
		this.ship.parent = transformNode;

		const shipMat = new BABYLON.StandardMaterial("redMat");
		shipMat.diffuseColor = new BABYLON.Color3.FromHexString("#D77BBA");
		shipMat.ambientColor = new BABYLON.Color3.FromHexString("#D77BBA");
		shipMat.specularColor = new BABYLON.Color3(0, 0, 0);
		this.ship.material = shipMat;

		const rockMat = new BABYLON.StandardMaterial("redMat");
		rockMat.diffuseColor = new BABYLON.Color3.FromHexString("#663931");
		rockMat.ambientColor = new BABYLON.Color3.FromHexString("#663931");
		rockMat.specularColor = new BABYLON.Color3(0, 0, 0);

		for (let i = 0; i < firstMax; i++) {
			const sprite = this.rawSprites[i + 1];
			const x = ((sprite.posX % 824) + 824) % 824 - 24;
			const y = ((sprite.posY % 624) + 624) % 624 - 24;
			const rock = BABYLON.MeshBuilder.CreateSphere("sphere", {diameterX: 24, diameterY: 24, diameterZ: 24});
			rock.position.set(sprite.posX, sprite.posY, 0);
			rock.material = rockMat;
			rock.parent = transformNode;
			this.gameElements.push(rock);
		}
	}

	drawFrame(frame, max, inputs, rampAmount, collision) {
		if (!this.ship || this.gameElements.length <= 0) {
			return;
		}
		if (rampAmount > 0 && this.gameElements.length < 1000000) {
			const additionalSprites = this.gameElements.length + rampAmount > 1000000 ? 1000000 - this.gameElements.length : rampAmount;
			const existingSprites = this.gameElements.length;
			for (let i = 0; i < additionalSprites; i++) {
				const sprite = this.rawSprites[i + 1 + existingSprites];
				const rockMat = new BABYLON.StandardMaterial("redMat");
				rockMat.diffuseColor = new BABYLON.Color3.FromHexString("#663931");
				rockMat.ambientColor = new BABYLON.Color3.FromHexString("#663931");
				rockMat.specularColor = new BABYLON.Color3(0, 0, 0);
				const x = ((sprite.posX % 824) + 824) % 824 - 24;
				const y = ((sprite.posY % 624) + 624) % 624 - 24;
				const rock = BABYLON.MeshBuilder.CreateSphere("sphere", {diameterX: 24, diameterY: 24, diameterZ: 24});
				rock.position.set(sprite.posX, sprite.posY, 0);
				rock.material = rockMat;
				rock.parent = transformNode;
				this.gameElements.push(rock);
			}
		}
		for (let i = 0; i < this.gameElements.length; i++) {
			const rock = this.gameElements[i];
			const rockSprite = this.rawSprites[i + 1];
			const x = (((rockSprite.posX + (rockSprite.velX * frame)) % 824) + 824) % 824 - 24;
			const y = (((rockSprite.posY + (rockSprite.velY * frame)) % 624) + 624) % 624 - 24;
			rock.position.set(x, y, 0);
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
			const rock = this.gameElements[i];
			const diff = BABYLON.Vector3.Distance(shipPos, rock.position);

			//console.log(diff);
			//debugger;
			if (diff <= 12) {
				console.log(diff);
				break;
				//return true;
			}
		}
	}

	destroy() {}
}
