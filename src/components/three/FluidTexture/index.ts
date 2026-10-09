import { useMemo } from "react";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";

export default class FluidTexture {
  public texture: THREE.Texture | null;
  private size: number;
  private radius: number;
  private canvas: HTMLCanvasElement | null;

  // GPGPU
  private gpuCompute: GPUComputationRenderer | null;
  private velocityVariable: any;
  private renderer: THREE.WebGLRenderer | null;

  // Uniforms
  private forceUniforms: any;
  private advectionUniforms: any;
  private diffusionUniforms: any;

  // Track previous cursor position
  private prevPoint: { x: number; y: number } = { x: 0, y: 0 };
  private velocityMagnitude: number = 0;

  constructor(
    renderer: THREE.WebGLRenderer,
    isOnScreen = false,
    size = 128,
    radius = 0.05
  ) {
    this.size = size;
    this.radius = radius;
    this.renderer = renderer;
    this.canvas = null;
    this.gpuCompute = null;
    this.velocityVariable = null;

    this.advectionUniforms = {};

    this.initGPGPU();
    this.initTexture(isOnScreen);
  }

  private initGPGPU() {
    if (!this.renderer) return;

    this.gpuCompute = new GPUComputationRenderer(
      this.size,
      this.size,
      this.renderer
    );

    // Create initial velocity texture
    const velocityTexture = this.gpuCompute.createTexture();
    const velocityArray = velocityTexture.image.data;
    for (let i = 0; i < velocityArray.length; i += 4) {
      velocityArray[i] = 0; // vx
      velocityArray[i + 1] = 0; // vy
      velocityArray[i + 2] = 0; // padding
      velocityArray[i + 3] = 1;
    }

    // Add variables to compute renderer
    this.velocityVariable = this.gpuCompute.addVariable(
      "uVelocity",
      this.getAdvectionShader(),
      velocityTexture
    );

    // Set dependencies
    this.gpuCompute.setVariableDependencies(this.velocityVariable, [
      this.velocityVariable,
    ]);

    // Setup uniforms
    this.advectionUniforms = this.velocityVariable.material.uniforms;
    this.advectionUniforms.uDissipation = { value: 0.98 };
    this.advectionUniforms.uForce = { value: new THREE.Vector2(0, 0) };
    this.advectionUniforms.uForcePos = { value: new THREE.Vector2(0, 0) };
    this.advectionUniforms.uForceRadius = { value: this.radius * this.size };
    this.advectionUniforms.uResolution = {
      value: new THREE.Vector2(this.size, this.size),
    };

    // Compute!
    const error = this.gpuCompute.init();
    if (error !== null) {
      console.error("GPUComputationRenderer error:", error);
    }
  }

  private getAdvectionShader(): string {
    return `
      uniform float uDissipation;
      uniform vec2 uForce;
      uniform vec2 uForcePos;
      uniform vec2 uResolution;
      uniform float uForceRadius;

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        
        // Sample current velocity
        vec4 vel = texture2D(uVelocity, uv);
        
        // Advection (semi-Lagrangian)
        vec2 pos = gl_FragCoord.xy - vel.xy;
        vec4 advected = texture2D(uVelocity, pos / resolution.xy);
        
        // Apply dissipation
        advected.xy *= uDissipation;
        
        // Add force at cursor
        float dist = distance(gl_FragCoord.xy, uForcePos);
        float influence = smoothstep(uForceRadius, 0.0, dist);
        advected.xy += uForce * influence;
        
        gl_FragColor = advected;
      }
    `;
  }

  private initTexture(onScreen: boolean) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.canvas.height = this.size;
    const ctx = this.canvas.getContext("2d");

    if (ctx) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.needsUpdate = true;

    this.canvas.id = "fluidTexture";
    this.canvas.style.position = "fixed";
    this.canvas.style.bottom = "0";
    this.canvas.style.zIndex = "10000";

    if (onScreen) {
      document.body.appendChild(this.canvas);
    }
  }

  public update(point: { x: number; y: number }) {
    if (!this.gpuCompute || !this.velocityVariable) return;

    // Calculate velocity from cursor movement
    const dx = point.x - this.prevPoint.x;
    const dy = point.y - this.prevPoint.y;
    this.velocityMagnitude = Math.sqrt(dx * dx + dy * dy);

    // Normalize point to texture space
    const normalizedPoint = {
      x: (point.x + 1) / 2,
      y: (point.y + 1) / 2,
    };

    // Only apply force if cursor is moving
    const forceX = dx * 5; // Scale force
    const forceY = -dy * 5;
    const forcePosX = normalizedPoint.x * this.size;
    const forcePosY = (1 - normalizedPoint.y) * this.size;

    // Update uniforms
    this.advectionUniforms.uForce.value.set(forceX, forceY);
    this.advectionUniforms.uForcePos.value.set(forcePosX, forcePosY);

    // Increase dissipation when cursor is not moving
    const baseDissipation = 0.98;
    const noMovementDissipation = 0.85; // Stronger dissipation when idle
    const dissipation =
      this.velocityMagnitude > 0.001 ? baseDissipation : noMovementDissipation;
    this.advectionUniforms.uDissipation.value = dissipation;

    // Compute GPU simulation
    this.gpuCompute.compute();

    // Render velocity field to canvas
    this.renderVelocityToCanvas();

    // Store current point for next frame
    this.prevPoint = { x: point.x, y: point.y };
  }

  private renderVelocityToCanvas() {
    if (
      !this.gpuCompute ||
      !this.velocityVariable ||
      !this.renderer ||
      !this.canvas
    )
      return;

    // Read velocity texture from GPU
    const velocityTexture = this.gpuCompute.getCurrentRenderTarget(
      this.velocityVariable
    ).texture;

    // Create a scene to render the velocity to canvas
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uVelocity: { value: velocityTexture },
        uResolution: { value: new THREE.Vector2(this.size, this.size) },
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uVelocity;
        uniform vec2 uResolution;

        void main() {
          vec4 vel = texture2D(uVelocity, gl_FragCoord.xy / uResolution);
          float mag = length(vel.xy) * 0.5;
          gl_FragColor = vec4(vec3(mag), 1.0);
        }
      `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Render to texture
    const renderTarget = new THREE.WebGLRenderTarget(this.size, this.size);
    this.renderer.setRenderTarget(renderTarget);
    this.renderer.render(scene, camera);
    this.renderer.setRenderTarget(null);

    // Read pixels and update canvas
    const pixels = new Uint8Array(this.size * this.size * 4);
    this.renderer.readRenderTargetPixels(
      renderTarget,
      0,
      0,
      this.size,
      this.size,
      pixels
    );

    const ctx = this.canvas.getContext("2d");
    if (ctx) {
      const imageData = ctx.createImageData(this.size, this.size);
      imageData.data.set(pixels);
      ctx.putImageData(imageData, 0, 0);
    }

    if (this.texture) {
      this.texture.needsUpdate = true;
    }

    // Cleanup
    renderTarget.dispose();
    geometry.dispose();
    material.dispose();
  }
}

export const useFluidTexture = (
  renderer: THREE.WebGLRenderer,
  { isOnScreen = false, size = 128, radius = 0.2 } = {}
) => {
  return useMemo(
    () => new FluidTexture(renderer, isOnScreen, size, radius),
    [renderer]
  );
};
