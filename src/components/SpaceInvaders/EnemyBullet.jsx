import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useEffect, useRef, useState } from 'react';

export default function EnemyBullet({ position, onHit, checkShield }) {
    const bulletRef = useRef();
    const [isActive, setIsActive] = useState(true);
    const speed = 3;
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
        if (currentPos.y < -6 || currentPos.y > 10) {
            setIsActive(false);
            return;
        }

        bulletRef.current.setTranslation({
            x: currentPos.x,
            y: currentPos.y - speed * delta,
            z: currentPos.z
        });
    });

    if (!isActive) return null;

    return (
        <RigidBody
            ref={bulletRef}
            type="dynamic"
            position={position}
            sensor
            name="enemyBullet"
            onIntersectionEnter={(e) => {
                if (e.other.rigidBodyObject.name === 'player') {
                    setIsActive(false);
                    const hasShield = checkShield();
                    if (!hasShield && onHit) {
                        onHit();
                    }
                }
            }}
        >
            <mesh>
                <boxGeometry args={[0.2, 0.2, 0.2]} />
                <meshStandardMaterial
                    color="#ff0000"
                    emissive="#ff0000"
                    emissiveIntensity={0.5}
                />
            </mesh>
        </RigidBody>
    );
} 