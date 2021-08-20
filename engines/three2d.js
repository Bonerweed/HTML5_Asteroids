export default class Three2dTest {
	constructor(div, resourceLocations, sprites, firstMax) {
		this.rawSprites = sprites;

		this.gameElements = [];

		this.initThree(div, resourceLocations, sprites, firstMax);
	}

	async initThree(div, resourceLocations, sprites, firstMax) {
		console.log("starting promise");
		const promise = new Promise((resolve, reject) => {
				const script = document.createElement("script");
				script.type = "text/javascript";
				script.onload = () => {resolve()};
				script.onerror = () => {reject};
				script.src = "./engines/resources/three.min.js";
				document.body.appendChild(script);
		});

		await promise;
		console.log("promise over");

		this.scene = new THREE.Scene();

		this.camera = new THREE.OrthographicCamera(0, div.offsetWidth, div.offsetHeight, 0, 0, 1);
		this.scene.add(this.camera);

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(div.offsetWidth, div.offsetHeight);

		div.appendChild(this.renderer.domElement);

		const group = new THREE.Group();
		group.scale.y = -1; // Flip the y axis because Three's OrthographicCamera bottom is the lower value.
		group.position.y = div.offsetHeight;
		this.scene.add(group);

		const shipMap = new THREE.TextureLoader().load(resourceLocations.get("ship"));
		const shipMaterial = new THREE.SpriteMaterial({ map: shipMap });

		const shipSprite = this.rawSprites[0];
		this.ship = new THREE.Sprite(shipMaterial);
		this.ship.scale.set(24, 24, 1)
		this.ship.position.set(shipSprite.posX, shipSprite.posY, 0);
		group.add(this.ship);

		const rockMap = new THREE.TextureLoader().load(resourceLocations.get("rock"));
		const rockMaterial = new THREE.SpriteMaterial({ map: rockMap });

		for (let i = 0; i < firstMax[0]; i++) {
			const sprite = this.rawSprites[i + 1];
			const x = ((sprite.posX % 824) + 824) % 824 - 24;
			const y = ((sprite.posY % 624) + 624) % 624 - 24;
			const rock = new THREE.Sprite(rockMaterial);
			rock.scale.set(24, 24, 1);
			rock.position.set(x, y, 0);
			this.gameElements.push(rock);
			group.add(rock);
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

		const shipHit = this.checkCollision();
		shipSprite.posX += shipSprite.velX;
		shipSprite.posY += shipSprite.velY;
		const x = ((shipSprite.posX % 824) + 828) % 824 - 28;
		const y = ((shipSprite.posY % 624) + 628) % 624 - 28;
		this.ship.position.set(x, y, 0);

		this.renderer.render(this.scene, this.camera);
	}

	checkCollision() {
		const shipPos = this.ship.position;
		
		for (let i = 0; i < this.gameElements.length; i++) {
			const sprite = this.gameElements[i];
			const diff = shipPos.distanceTo(sprite.position);

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
