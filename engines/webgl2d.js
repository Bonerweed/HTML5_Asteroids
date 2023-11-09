export default class WebGlTest {
	constructor(div, resourceLocations, sprites, firstMax) {
		this.rawSprites = sprites;

		const cnv = document.createElement('canvas');
		cnv.width  = div.offsetWidth;
		cnv.height = div.offsetHeight;
		div.appendChild(cnv);

		const gl = cnv.getContext('webgl', {powerPreference: "high-performance"});
		this.gl = gl;

		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		//gl.blendFunc(gl.SRC_COLOR, gl.ONE_MINUS_SRC_ALPHA); We need to handle alpha to be 100% accurate

		// Needed for geometry instancing.
		this.ext = gl.getExtension('ANGLE_instanced_arrays');

		// Vertex Shader
		const vsSource = `
			attribute vec2 aPos;
			attribute vec2 aUV;
			attribute vec2 aOffset;

			varying highp vec2 vTextureCoord;

			void main(void) {
				vec2 scaledToScreen = aOffset * vec2(1.0 / 400.0, 1.0 / 300.0);
				gl_Position = vec4(aPos.x + scaledToScreen.x, aPos.y - scaledToScreen.y , 0.0, 1.0);
				vTextureCoord = aUV;
			}
		`;

		// Fragment shader
		const fsSource = `
			precision highp float;
			varying highp vec2 vTextureCoord;
			uniform sampler2D uSampler;

			void main(void) {
				gl_FragColor = texture2D(uSampler, vTextureCoord);
			}
		`;

		this.shaderProgram = this.initShaderProgram(gl, vsSource, fsSource);
		this.shaderXYAttrib = gl.getAttribLocation(this.shaderProgram, 'aPos');
		this.shaderOffsetAttrib = gl.getAttribLocation(this.shaderProgram, 'aOffset');
		this.shaderUVAttrib = gl.getAttribLocation(this.shaderProgram, 'aUV');
		this.shaderSamplerU = gl.getUniformLocation(this.shaderProgram, 'uSampler');

		const spriteWidth = (24 / cnv.width) * 2;
		const spriteHeight = (24 / cnv.height) * 2;

		const pos = [-1					, 1			   	  ,
					 -1 + spriteWidth	, 1			      ,
					 -1 + spriteWidth	, 1 - spriteHeight,
					 -1					, 1 - spriteHeight];

		this.vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer );
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);


		const off = []

		for(var i = 0; i < sprites.length; i++) {
			const sprite = sprites[i];

			const x = ((sprite.posX % 824) + 824) % 824 - 24;
			const y = ((sprite.posY % 624) + 624) % 624 - 24;

			off.push(x)
			off.push(y)
		}

		this.offsetBuffer = gl.createBuffer();
		this.offsetArray = new Float32Array(off);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.offsetBuffer );
		gl.bufferData(gl.ARRAY_BUFFER, this.offsetArray, gl.DYNAMIC_DRAW);

		const uvs = [0, 0,
					 1, 0,
					 1, 1,
					 0, 1];

		this.uvBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

		const idx = [0, 1, 2,
					 0, 2, 3];

		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);

		this.rockTex = this.loadTexture(gl, resourceLocations.get("rock"))
		this.shipTex = this.loadTexture(gl, resourceLocations.get("ship"))

		this.vaoExt = gl.getExtension('OES_vertex_array_object');
		this.vao = this.vaoExt.createVertexArrayOES();
		this.vaoExt.bindVertexArrayOES(this.vao);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.enableVertexAttribArray(this.shaderXYAttrib);
		gl.vertexAttribPointer(this.shaderXYAttrib,
							   2, // Component size
							   gl.FLOAT, // Type
							   false, // Normalize
							   0, // Stride
							   0); // Offset

		gl.bindBuffer(gl.ARRAY_BUFFER, this.offsetBuffer);

		gl.enableVertexAttribArray(this.shaderOffsetAttrib);
		gl.vertexAttribPointer(this.shaderOffsetAttrib, 2, gl.FLOAT, false, 0, 0);
		this.ext.vertexAttribDivisorANGLE(this.shaderOffsetAttrib, 1); // How many attributes to move for each object.

		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
		gl.enableVertexAttribArray(this.shaderUVAttrib);
		gl.vertexAttribPointer(this.shaderUVAttrib,
							   2, // Component size
							   gl.FLOAT, // Type
							   false, // Normalize
							   0, // Stride
							   0); // Offset

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

		this.vaoExt.bindVertexArrayOES(null);
	}

	drawFrame(frame, max, inputs, rampAmount, collision) {
		const gl = this.gl;
		gl.clear(gl.COLOR_BUFFER_BIT);

		this.vaoExt.bindVertexArrayOES(this.vao);

		for(var i = 1; i < max; i++) {
			const sprite = this.rawSprites[i];

			const x = (((sprite.posX + (sprite.velX * frame)) % 824) + 824) % 824 - 24;
			const y = (((sprite.posY + (sprite.velY * frame)) % 624) + 624) % 624 - 24;

			const offsetIndex = i * 2
			this.offsetArray[offsetIndex] = x;
			this.offsetArray[offsetIndex + 1] = y;
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

		// Set the ship position
		//const shipHit = this.checkCollision();
		shipSprite.posX += shipSprite.velX;
		shipSprite.posY += shipSprite.velY;
		this.offsetArray[0] = ((shipSprite.posX % 824) + 824) % 824 - 24;
		this.offsetArray[1] = ((shipSprite.posY % 624) + 624) % 624 - 24;

		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.offsetBuffer );
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.offsetArray);
		
		gl.useProgram(this.shaderProgram);

		// Draw Rocks
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.rockTex);
		gl.uniform1i(this.shaderSamplerU, 0);

		this.ext.drawElementsInstancedANGLE(gl.TRIANGLES,		// Style
											6, 					// Instance Index Count
											gl.UNSIGNED_SHORT,  // Type
											0, 					// Offset
											max);				// Number to draw

		// Draw Ship
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.shipTex);
		gl.uniform1i(this.shaderSamplerU, 0);

		this.ext.drawElementsInstancedANGLE(gl.TRIANGLES,		// Style
											6, 					// Instance Index Count
											gl.UNSIGNED_SHORT,  // Type
											0, 					// Offset
											1);					// Number to draw

		this.checkCollision(max);
	}

	checkCollision(max) {
		const shipX = this.offsetArray[0];
		const shipY = this.offsetArray[1];
		
		for (let i = 2; i < max; i+= 2) {
			const rockX = this.offsetArray[i];
			const rockY = this.offsetArray[i + 1];

			const dx = shipX - rockX;
			const dy = shipY - rockY;
			const diff = Math.sqrt(dx * dx + dy * dy);

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

	initShaderProgram(gl, vsSource, fsSource) {
		const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
		const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

		const shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // Alert if failed
			alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
			return null;
		}

		return shaderProgram;

	}

	loadShader(gl, type, source) {
		const shader = gl.createShader(type);

		gl.shaderSource(shader, source);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			alert(`Error compiling shader: ${gl.getShaderInfoLog(shader)}`);
			gl.deleteShader(shader);
			return null;
		}

		return shader;
	}

	loadTexture(gl, url) {
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// Use an invisible pixel until loaded.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 0]));

		const image = new Image();
		image.onload = function() {
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		};

		image.src = url;

		return texture;
	}
}
