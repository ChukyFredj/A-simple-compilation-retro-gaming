import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export default function Background3D() {
    const starsRef = useRef();

    const [positions, sizes] = useMemo(() => {
        const positions = new Float32Array(3000 * 3);
        const sizes = new Float32Array(3000);

        for (let i = 0; i < 3000; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

            sizes[i] = Math.random() * 1.5;
        }

        return [positions, sizes];
    }, []);

    useFrame((state, delta) => {
        if (starsRef.current) {
            starsRef.current.rotation.z += delta * 0.02;
            starsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
            starsRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.1) * 0.1;

            const sizes = starsRef.current.geometry.attributes.size.array;
            for (let i = 0; i < sizes.length; i++) {
                sizes[i] = 0.5 + Math.sin(state.clock.elapsedTime + i) * 0.5;
            }
            starsRef.current.geometry.attributes.size.needsUpdate = true;
        }
    });

    return (
        <points ref={starsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-size"
                    count={sizes.length}
                    array={sizes}
                    itemSize={1}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                color="#ffffff"
                sizeAttenuation={true}
                transparent={true}
                opacity={0.8}
                fog={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
} 