import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';

export default function Background() {
    const starsRef = useRef();

    // Création des étoiles
    const [positions, sizes] = useMemo(() => {
        const positions = new Float32Array(2000 * 3);
        const sizes = new Float32Array(2000);

        for (let i = 0; i < 2000; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;


            sizes[i] = Math.random() * 2;
        }

        return [positions, sizes];
    }, []);

    useFrame((state, delta) => {
        if (starsRef.current) {

            starsRef.current.rotation.z += delta * 0.05;

            // Effet de scintillement
            const positions = starsRef.current.geometry.attributes.position.array;
            const sizes = starsRef.current.geometry.attributes.size.array;

            for (let i = 0; i < sizes.length; i++) {
                sizes[i] = Math.max(0.1, Math.sin(state.clock.elapsedTime + i) * 2);
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
                size={0.1}
                color="#ffffff"
                sizeAttenuation={true}
                transparent={true}
                opacity={0.8}
                fog={false}
            />
        </points>
    );
} 