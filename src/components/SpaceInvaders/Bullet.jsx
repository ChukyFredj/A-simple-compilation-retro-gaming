import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useEffect, useRef, useState } from 'react';

export default function Bullet({ position, onHit }) {
    const bulletRef = useRef();
    const [isActive, setIsActive] = useState(true);
    const speed = 15;
    const lastUpdateTime = useRef(0);

    // Nettoyage à la destruction
    useEffect(() => {
        return () => {
            setIsActive(false);
        };
    }, []);

    useFrame((state, delta) => {
        if (!bulletRef.current || !isActive) return;

        const currentTime = state.clock.getElapsedTime();

        // Limite la fréquence de mise à jour
        if (currentTime - lastUpdateTime.current < 0.016) return;
        lastUpdateTime.current = currentTime;

        const currentPos = bulletRef.current.translation();

        // Vérifie si la balle est hors écran
        if (currentPos.y > 10 || currentPos.y < -6) {
            setIsActive(false);
            return;
        }

        bulletRef.current.setTranslation({
            x: currentPos.x,
            y: currentPos.y + speed * delta,
            z: currentPos.z
        });
    });

    if (!isActive) return null;

    return (
        <RigidBody
            ref={bulletRef}
            type="dynamic"
            position={position}
            mass={1}
            gravityScale={0}
            onCollisionEnter={() => {
                setIsActive(false);
                if (onHit) onHit();
            }}
        >
            <mesh>
                <sphereGeometry args={[0.2]} />
                <meshStandardMaterial
                    color="yellow"
                    emissive="yellow"
                    emissiveIntensity={0.5}
                />
            </mesh>
        </RigidBody>
    );
}