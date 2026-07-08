import { useEffect, useRef, useState } from "react";
import { Renderer, Camera, Transform, Program, Mesh, Geometry, Color } from "ogl";

interface LightfallProps {
  density?: number;
  streakCount?: number;
  speed?: number;
}

export function Lightfall({
  density: propDensity,
  streakCount: propStreakCount,
  speed = 1.0,
}: LightfallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive state monitoring viewport width for GPU optimization
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Compute final params based on screen size
  const finalDensity = propDensity !== undefined ? propDensity : (isMobile ? 0.12 : 0.3);
  const finalStreakCount = propStreakCount !== undefined ? propStreakCount : (isMobile ? 1 : 2);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    // 1. Initialize OGL Renderer
    const renderer = new Renderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    // 2. Scene setup
    const scene = new Transform();
    const camera = new Camera(gl);
    camera.position.z = 1;

    // 3. Define shaders
    const vertexShader = `
      attribute vec3 position;
      attribute vec3 randoms; // random values: x-offset, y-offset, speed/scale

      uniform float uTime;
      uniform float uSpeed;
      uniform vec2 uResolution;
      uniform float uDensity;

      varying vec3 vRandoms;
      varying float vProgress;

      void main() {
        vRandoms = randoms;
        
        // Wrap falling animation vertically
        float individualSpeed = uSpeed * (0.4 + randoms.z * 0.6);
        float progress = fract(randoms.y - uTime * 0.04 * individualSpeed);
        vProgress = progress;

        // Position coordinates
        vec3 pos = position;
        pos.x = randoms.x * 2.0 - 1.0;
        pos.y = progress * 2.2 - 1.1; // Fall from top to bottom

        // Scale by aspect ratio to prevent stretching
        pos.x *= uResolution.y / uResolution.x;

        gl_Position = vec4(pos, 1.0);

        // Responsive point sizing
        float baseSize = isMobile ? 3.0 : 6.0;
        gl_PointSize = (baseSize + randoms.z * 10.0) * (uResolution.x / 1400.0);
      }
    `;

    const fragmentShader = `
      precision highp float;

      uniform vec3 uColor;

      varying vec3 vRandoms;
      varying float vProgress;

      void main() {
        // Draw soft circles
        vec2 temp = gl_PointCoord - vec2(0.5);
        float dist = length(temp);
        
        if (dist > 0.5) discard;

        // Soft exponential falloff for glow effect
        float intensity = smoothstep(0.5, 0.0, dist);
        
        // Fade in at the top and out at the bottom
        float edgeFade = smoothstep(0.0, 0.15, vProgress) * smoothstep(1.0, 0.85, vProgress);
        
        // Random opacity variation
        float alpha = intensity * (0.15 + vRandoms.z * 0.7) * edgeFade;

        gl_FragColor = vec4(uColor, alpha);
      }
    `;

    // 4. Create geometry
    // Calculate count proportional to density
    const numParticles = Math.floor(400 * finalDensity);
    const positionArray = new Float32Array(numParticles * 3);
    const randomsArray = new Float32Array(numParticles * 3);

    for (let i = 0; i < numParticles; i++) {
      positionArray[i * 3 + 0] = 0;
      positionArray[i * 3 + 1] = 0;
      positionArray[i * 3 + 2] = 0;

      randomsArray[i * 3 + 0] = Math.random(); // X position [0, 1]
      randomsArray[i * 3 + 1] = Math.random(); // Y start offset [0, 1]
      randomsArray[i * 3 + 2] = Math.random(); // Speed & Size scale [0, 1]
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positionArray },
      randoms: { size: 3, data: randomsArray },
    });

    // 5. Create Program
    // Gold/cyan accent color matching Meridian Prime theme (electric teal/cyan)
    const themeColor = new Color("#06b6d4"); // Cyan-500
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: speed },
        uDensity: { value: finalDensity },
        uResolution: { value: [gl.canvas.width, gl.canvas.height] },
        uColor: { value: themeColor },
      },
      transparent: true,
      depthTest: false,
    });

    // 6. Create Mesh
    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });
    particles.setParent(scene);

    // 7. Add larger vertical streaks
    // Standard geometry for major falling streaks (line segments)
    const numStreaks = Math.floor(12 * finalStreakCount);
    const streakPositions = new Float32Array(numStreaks * 2 * 3); // 2 vertices per line, 3 coords per vertex
    const streakRandoms = new Float32Array(numStreaks * 2 * 3);    // x, start_y, speed

    for (let i = 0; i < numStreaks; i++) {
      const rx = Math.random();
      const ry = Math.random();
      const rz = Math.random(); // speed

      // Top vertex
      streakPositions[i * 6 + 0] = 0;
      streakPositions[i * 6 + 1] = 0.15; // streak length offset
      streakPositions[i * 6 + 2] = 0;

      streakRandoms[i * 6 + 0] = rx;
      streakRandoms[i * 6 + 1] = ry;
      streakRandoms[i * 6 + 2] = rz;

      // Bottom vertex
      streakPositions[i * 6 + 3] = 0;
      streakPositions[i * 6 + 4] = -0.15;
      streakPositions[i * 6 + 5] = 0;

      streakRandoms[i * 6 + 3] = rx;
      streakRandoms[i * 6 + 4] = ry;
      streakRandoms[i * 6 + 5] = rz;
    }

    const streakGeometry = new Geometry(gl, {
      position: { size: 3, data: streakPositions },
      randoms: { size: 3, data: streakRandoms },
    });

    const streakVertexShader = `
      attribute vec3 position;
      attribute vec3 randoms;

      uniform float uTime;
      uniform float uSpeed;
      uniform vec2 uResolution;

      varying float vAlpha;
      varying float vFade;

      void main() {
        float speed = uSpeed * (0.6 + randoms.z * 0.4);
        float progress = fract(randoms.y - uTime * 0.05 * speed);
        
        vec3 pos = position;
        // Position X using randoms
        float px = randoms.x * 2.0 - 1.0;
        px *= uResolution.y / uResolution.x;
        
        // Position Y using progress and vertex offset
        float py = (progress * 2.4 - 1.2) + position.y;

        gl_Position = vec4(px, py, 0.0, 1.0);

        // Pass vertical fade down the line: top is brighter than bottom
        vFade = (position.y + 0.15) / 0.3; // normalize to [0, 1]
        
        // Fade out at edges of canvas
        vAlpha = smoothstep(0.0, 0.2, progress) * smoothstep(1.0, 0.8, progress) * (0.2 + randoms.z * 0.6);
      }
    `;

    const streakFragmentShader = `
      precision highp float;
      uniform vec3 uColor;
      varying float vAlpha;
      varying float vFade;

      void main() {
        // Draw elegant glowing streak, top is brighter
        float glow = pow(vFade, 1.5);
        gl_FragColor = vec4(uColor, glow * vAlpha * 0.6);
      }
    `;

    const streakProgram = new Program(gl, {
      vertex: streakVertexShader,
      fragment: streakFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: speed },
        uResolution: { value: [gl.canvas.width, gl.canvas.height] },
        uColor: { value: themeColor },
      },
      transparent: true,
      depthTest: false,
    });

    const streaks = new Mesh(gl, { mode: gl.LINES, geometry: streakGeometry, program: streakProgram });
    streaks.setParent(scene);

    // 8. Handle Resizing
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
      
      program.uniforms.uResolution.value = [width, height];
      streakProgram.uniforms.uResolution.value = [width, height];
    };
    
    window.addEventListener("resize", resize);
    resize();

    // 9. Animation Loop
    let animationFrameId: number;
    let time = 0;
    
    const updateLoop = () => {
      time += 0.1;
      
      program.uniforms.uTime.value = time;
      streakProgram.uniforms.uTime.value = time;
      
      renderer.render({ scene, camera });
      animationFrameId = requestAnimationFrame(updateLoop);
    };

    animationFrameId = requestAnimationFrame(updateLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [finalDensity, finalStreakCount, speed, isMobile]);

  return (
    <div ref={containerRef} className="absolute inset-0 -z-10 h-full w-full overflow-hidden bg-[#030712]">
      <canvas ref={canvasRef} className="block h-full w-full opacity-60" />
    </div>
  );
}
