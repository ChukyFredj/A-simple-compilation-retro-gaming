import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useEffect, useRef, useState } from 'react';

const POWERUP_COLORS = {
    rapidFire: "#00ff00",
    shield: "#ffff00",
    infiniteEnergy: "#00ffff"
};

export default function PowerUp({ position, type, onCollect }) {
    const [isActive, setIsActive] = useState(true);
    const powerUpRef = useRef();
    const speed = 3;

    useFrame((state, delta) => {
        if (!powerUpRef.current || !isActive) return;

        const currentPos = powerUpRef.current.translation();

        powerUpRef.current.setTranslation({
            x: position[0] + Math.sin(state.clock.getElapsedTime() * 2) * 0.2,
            y: currentPos.y - speed * delta,
            z: position[2]
        });

        if (currentPos.y < -6) {
            setIsActive(false);
        }
    });

    useEffect(() => {
        return () => {
            setIsActive(false);
        };
    }, []);

    if (!isActive) return null;

    return (
        <RigidBody
            ref={powerUpRef}
            type="dynamic"
            position={position}
            sensor
            onIntersectionEnter={(e) => {
                if (e.other.rigidBodyObject.name === 'player') {
                    setIsActive(false);
                    if (onCollect) onCollect(type);
                }
            }}
        >
            <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial
                    color={POWERUP_COLORS[type]}
                    emissive={POWERUP_COLORS[type]}
                    emissiveIntensity={0.8}
                    transparent
                    opacity={0.8}
                />
            </mesh>
        </RigidBody>
    );
} 