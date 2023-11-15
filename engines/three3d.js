export default class Three3dTest {
	constructor(div, resourceLocations, sprites, firstMax, limitSpriteCount) {
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

		this.scene.background = new THREE.Color(0x1E1F1C);

		this.camera = new THREE.OrthographicCamera(0, div.offsetWidth, div.offsetHeight, 0, 1, 256);
		this.camera.position.z = 128;
		this.scene.add(this.camera);

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(div.offsetWidth, div.offsetHeight);

		div.appendChild(this.renderer.domElement);

		this.group = new THREE.Group();
		this.group.scale.y = -1; // Flip the y axis because Three's OrthographicCamera bottom is the lower value.
		this.group.position.y = div.offsetHeight;
		this.scene.add(this.group);

		this.sphereGeometry = new THREE.SphereGeometry(12, 32, 16);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
		directionalLight.position.x = 1;
		directionalLight.position.z = 1;
		this.scene.add( directionalLight );

		const light = new THREE.AmbientLight(0x404040);
		this.scene.add(light);

		const shipSprite = this.rawSprites[0];
		this.ship = new THREE.Mesh( this.sphereGeometry, new THREE.MeshLambertMaterial({ color: 0xD77BBA } ));
		this.ship.scale.y = 0.5;
		this.ship.position.set(shipSprite.posX, shipSprite.posY, 0);
		this.group.add(this.ship);

		this.rockMaterial = new THREE.MeshLambertMaterial({ color: 0x663931 })

		for (let i = 0; i < firstMax; i++) {
			const sprite = this.rawSprites[i + 1];
			const x = ((sprite.posX % 824) + 824) % 824 - 24;
			const y = ((sprite.posY % 624) + 624) % 624 - 24;

			const rock = new THREE.Mesh(this.sphereGeometry, this.rockMaterial);
			rock.position.set(x, y, 0);
			this.gameElements.push(rock);
			this.group.add(rock);
		}
	}

	drawFrame(frame, frameSpriteCount, inputs, collision) {
		if (!this.ship || this.gameElements.length <= 0) {
			return;
		}

		while(this.gameElements.length - 1 < frameSpriteCount) {
			const sprite = this.rawSprites[this.gameElements.length + 1];
			const rock = new THREE.Mesh(this.sphereGeometry, this.rockMaterial);
			rock.position.set(((sprite.posX % 824) + 824) % 824 - 24,
			                  ((sprite.posY % 624) + 624) % 624 - 24,
							  0);
			this.gameElements.push(rock);
			this.group.add(rock);
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
		} else if (inputs.get(87)) {
			shipSprite.velY -= 0.01;
		} else {
			if (shipSprite.velY != 0) {
				shipSprite.velY *= 0.99;
			}
		}

		//X position
		if (inputs.get(68)) {
			shipSprite.velX += 0.01;
		} else if (inputs.get(65)) {
			shipSprite.velX -= 0.01;
		} else {
			if (shipSprite.velX != 0) {
				shipSprite.velX *= 0.99;
			}
		}

		if (collision) {
			const shipHit = this.checkCollision();
		}

		shipSprite.posX += shipSprite.velX;
		shipSprite.posY += shipSprite.velY;

		this.ship.position.set(((shipSprite.posX % 824) + 828) % 824 - 28,
		                       ((shipSprite.posY % 624) + 628) % 624 - 28, 0);

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
				break;
				//return true;
			}
		}
	}

	destroy() {}
}
