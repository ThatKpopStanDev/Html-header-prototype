import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
document.addEventListener("DOMContentLoaded", () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  function calculateScale(width, height) {
    const baseWidth = 1920;
    const baseHeight = 1080;
    const scaleFactor = Math.max(width / baseWidth, height / baseHeight);
    const scale = Math.min(1, 0.8 + (1 - scaleFactor) * 0.2);
    return scale;
  }
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  const modal = document.querySelector(".modal");

  modal.appendChild(renderer.domElement);
  let scale = calculateScale(window.innerWidth, window.innerHeight);
  const geometry = new THREE.PlaneGeometry(3, 3);
  const uniforms = {
    scale: { value: scale },
    ax: { value: 5.0 },
    ay: { value: 7.0 },
    az: { value: 9.0 },
    aw: { value: 13.0 },
    bx: { value: 1.0 },
    by: { value: 1.0 },
    color1: { value: new THREE.Color("#ffffff") },
    color2: { value: new THREE.Color("#ffffff") },
    color3: { value: new THREE.Color("#ffffff") },
    color4: { value: new THREE.Color("#3e4fff") },
    time: { value: 0.0 },
    resolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv; 
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
        uniform float time;
        uniform float scale;
        uniform vec2 resolution;
        uniform vec3 color1, color2, color3, color4;
        uniform int numOctaves;
        const float PI = 3.141592654;
        uniform float ax, ay, az, aw;
        uniform float bx, by;
        
        // just a bunch of sin & cos to generate an interesting pattern
        float cheapNoise(vec3 stp) {
          vec3 p = vec3(stp.st, stp.p);
          vec4 a = vec4(ax, ay, az, aw);
          return mix(
            sin(p.z + p.x * a.x + cos(p.x * a.x - p.z)) * 
            cos(p.z + p.y * a.y + cos(p.y * a.x + p.z)),
            sin(1. + p.x * a.z + p.z + cos(p.y * a.w - p.z)) * 
            cos(1. + p.y * a.w + p.z + cos(p.x * a.x + p.z)), 
            .436
          );
        }
        
        void main() {
          
          vec2 aR = vec2(resolution.x/resolution.y, 1.);
          vec2 st = vUv * aR * scale;
          float S = sin(time * .005);
          float C = cos(time * .005);
          vec2 v1 = vec2(cheapNoise(vec3(st, 2.)), cheapNoise(vec3(st, 1.)));
          vec2 v2 = vec2(
            cheapNoise(vec3(st + bx*v1 + vec2(C * 1.7, S * 9.2), 0.15 * time)),
            cheapNoise(vec3(st + by*v1 + vec2(S * 8.3, C * 2.8), 0.126 * time))
          );
          float n = .5 + .5 * cheapNoise(vec3(st + v2, 0.));
          
          vec3 color = mix(color1,
            color2,
            clamp((n*n)*8.,0.0,1.0));
    
          color = mix(color,
            color3,
            clamp(length(v1),0.0,1.0));
    
          color = mix(color,
                    color4,
                    clamp(length(v2.x),0.0,1.0));
          
          //       color *= n * n * n + .6  * n * n + .5 * n;
          color /= n*n + n * 7.;
          gl_FragColor = vec4(color,1.);
        }
      `,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  camera.position.z = 1;

  function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.resolution.value.x = window.innerWidth;
    uniforms.resolution.value.y = window.innerHeight;
    const scale = calculateScale(window.innerWidth, window.innerHeight);
    uniforms.scale.value = scale;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  window.addEventListener("resize", onWindowResize, false);

  function animate() {
    requestAnimationFrame(animate);
    uniforms.time.value += 0.01;
    renderer.render(scene, camera);
  }
  animate();
});
