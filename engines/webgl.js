export default class WebGlTest {
	constructor(div, resourceLocations, sprites) {
		this.cnv = document.createElement('canvas');
		this.cnv.width  = div.offsetWidth;
		this.cnv.height = div.offsetHeight;
		div.appendChild(this.cnv);

		const gl = this.cnv.getContext('webgl', {powerPreference: "high-performance"});
		this.gl = gl;

		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_COLOR, gl.ONE_MINUS_SRC_ALPHA);

		// Needed for geometry instancing.
		this.ext = gl.getExtension('ANGLE_instanced_arrays');

		// Vertex Shader
		const vsSource = `
			attribute vec4 aPos;
			attribute vec2 aUV;
			attribute vec2 aOffset;

			varying highp vec2 vTextureCoord;

			void main(void) {
				gl_Position = vec4(aPos.x + aOffset.x, aPos.y - aOffset.y , 0.0, 1.0);
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

		const spriteWidth = (24 / this.cnv.width) * 2;
		const spriteHeight = (24 / this.cnv.height) * 2;

		const pos = [-1					, 1			   	  , 0,
					 -1 + spriteWidth	, 1			      , 0,
					 -1 + spriteWidth	, 1 - spriteHeight, 0,
					 -1					, 1 - spriteHeight, 0];

		this.vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer );
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);


		const off = []

		for(var i = 0; i < sprites.length; i++) {
			const sprite = sprites[i];

			const x = (((sprite.posX + (sprite.velX * frame)) % 824) + 824) % 824 - 24;
			const y = (((sprite.posY + (sprite.velY * frame)) % 624) + 624) % 624 - 24;

			off.push(x / 400)
			off.push(y / 300)
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

		this.texture = this.loadTexture(gl, resourceLocations.get("spriteImage"))

		this.sprites = sprites;
	}

	drawFrame(frame, max) {
		const gl = this.gl;
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.enableVertexAttribArray(this.shaderXYAttrib);
		gl.vertexAttribPointer(this.shaderXYAttrib,
							   3, // Component size
							   gl.FLOAT, // Type
							   false, // Normalize
							   0, // Stride
							   0); // Offset

		gl.bindBuffer(gl.ARRAY_BUFFER, this.offsetBuffer);

		for(var i = 0; i < max; i++) { // This is the bottleneck at the moment...
			const sprite = sprites[i];

			const x = (((sprite.posX + (sprite.velX * frame)) % 824) + 824) % 824 - 24;
			const y = (((sprite.posY + (sprite.velY * frame)) % 624) + 624) % 624 - 24;

			const offsetIndex = i * 2
			this.offsetArray[offsetIndex] = x / 400;
			this.offsetArray[offsetIndex+1] = y / 300;
		}

		gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.offsetArray);

		gl.enableVertexAttribArray(this.shaderOffsetAttrib);
		gl.vertexAttribPointer(this.shaderOffsetAttrib, 2, gl.FLOAT, false, 0, 0);
		// this line says this attribute only changes for each 1 instance
		this.ext.vertexAttribDivisorANGLE(this.shaderOffsetAttrib, 1);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
		gl.enableVertexAttribArray(this.shaderUVAttrib);
		gl.vertexAttribPointer(this.shaderUVAttrib,
							   2, // Component size
							   gl.FLOAT, // Type
							   false, // Normalize
							   0, // Stride
							   0); // Offset

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

		gl.useProgram(this.shaderProgram);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.uniform1i(this.shaderSamplerU, 0);

		this.ext.drawElementsInstancedANGLE(gl.TRIANGLES,
											6, // Count
											gl.UNSIGNED_SHORT,  // Type
											0, // offset
											max);
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

		// Stand-in black texture until image is loaded
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));

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
