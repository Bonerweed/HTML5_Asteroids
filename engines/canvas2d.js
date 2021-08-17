export default class Canvas2DTest {
	constructor(div, resourceLocations, sprites) {
		this.cnv = document.createElement('canvas');
    this.cnv.width  = div.offsetWidth;
    this.cnv.height = div.offsetHeight;
		div.appendChild(this.cnv);

		this.ctx = this.cnv.getContext('2d');
		this.ctx.imageSmoothingEnabled = false;

		this.rockImage = new Image();
		this.rockImage.src = resourceLocations.get("rock");
		this.shipImage = new Image();
		this.shipImage.src = resourceLocations.get("ship");

		this.sprites = sprites;
		this.hitPixels = [];
		const rawPixels = [
			{x: 4, y: 3},
			{x: 13, y: 3},
			{x: 0, y: 6},
			{x: 17, y: 6},
			{x: 5, y: 10},
			{x: 12, y: 10}
		];
		for (let i = 0; i < rawPixels.length; i++) {
			const hitx = rawPixels[i].x;
			const hity = rawPixels[i].y;
			const hitIndex = ((hitx * 4) + (hity * 4 * 18));
			this.hitPixels.push(hitIndex);
		}
	}

	drawFrame(frame, max, inputs) {
		this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);

		const ship = this.sprites[0];
		let shipPosX = ship.posX;
		let shipPosY = ship.posY;

		for(var i = 1; i < max; i++) {
			const sprite = this.sprites[i];
			let skin = this.rockImage;

			const x = (((sprite.posX + (sprite.velX * frame)) % 824) + 824) % 824 - 24;
			const y = (((sprite.posY + (sprite.velY * frame)) % 624) + 624) % 624 - 24;

			this.ctx.drawImage(skin, x, y);
		}
		//Y position
		if (inputs.get(83)) {
			ship.velY += 0.01;
		}
		else if (inputs.get(87)) {
			ship.velY -= 0.01;
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

		const shipHit = this.checkCollision(frame, max);

		ship.posX += ship.velX;
		ship.posY += ship.velY;
		const x = ((ship.posX % 824) + 828) % 824 - 28;
		const y = ((ship.posY % 624) + 628) % 624 - 28;
		this.ctx.drawImage(this.shipImage, x, y);
		return shipHit;
	}

	checkCollision(frame, max) {
		const ship = this.sprites[0];
		const x = (((ship.posX + 3) % 824) + 828) % 824 - 28;
		const y = (((ship.posY + 5) % 624) + 628) % 624 - 28;
		/*const imageData = this.ctx.getImageData(x, y, 18, 12);
		for (let i = 0; i < this.hitPixels.length; i++) {
			if (imageData.data[this.hitPixels[i]] != 0) {
				//return true;
				break;
			}
		}
		return false;
		}*/
		for (let i = 1; i < max; i++) {
			const sprite = this.sprites[i];
			const targetx = (((sprite.posX + (sprite.velX * frame)) % 824) + 824) % 824 - 24;
			const targety = (((sprite.posY + (sprite.velY * frame)) % 624) + 624) % 624 - 24;
			const dx = (x - targetx);
			const dy = (y - targety);
			const diff = Math.sqrt( (dx * dx) + (dy * dy) );
			//console.log(diff);
			//debugger;
			if (diff <= 12) {
				//console.log(diff);
				//debugger;
				break;
				//return true;
			}
		}
		return false;
	}

	destroy() {
		this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);
		this.cnv.remove();
		this.cnv = null;
	}
}
