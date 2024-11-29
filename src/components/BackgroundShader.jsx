import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

const vertexShader = `
varying vec2 vUv;
varying float vTime;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    
    // Création de plusieurs couches d'ondes
    float wave1 = sin(uv.x * 10.0 + uTime) * 0.5 + 0.5;
    float wave2 = sin(uv.y * 8.0 - uTime * 1.2) * 0.5 + 0.5;
    float wave3 = sin((uv.x + uv.y) * 5.0 + uTime * 0.8) * 0.5 + 0.5;
    
    // Mélange des couleurs
    vec3 color1 = vec3(0.5, 0.0, 1.0); // Violet
    vec3 color2 = vec3(0.0, 0.5, 1.0); // Bleu
    vec3 color3 = vec3(1.0, 0.0, 0.5); // Rose
    
    // Animation des couleurs
    vec3 finalColor = color1 * wave1 + color2 * wave2 + color3 * wave3;
    finalColor = finalColor / 3.0; // Normalisation
    
    // Ajout d'un effet de pulsation
    float pulse = sin(uTime * 0.5) * 0.1 + 0.9;
    finalColor *= pulse;
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default function BackgroundShader() {
    const meshRef = useRef();
    const materialRef = useRef();

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -1]}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={{
                    uTime: { value: 0 }
                }}
            />
        </mesh>
    );
} 