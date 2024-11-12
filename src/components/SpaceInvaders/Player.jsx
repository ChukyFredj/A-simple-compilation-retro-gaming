import { useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useRef, useState } from 'react';
import Bullet from './Bullet';

export default function Player() {
    const [bullets, setBullets] = useState([]);
    const playerRef = useRef();
    const lastShootTime = useRef(0);
    const [, getKeys] = useKeyboardControls();

    useFrame((state, delta) => {
        const { left, right, space } = getKeys();

        if (!playerRef.current) return;

        if (left) {
            playerRef.current.setTranslation({
                x: Math.max(playerRef.current.translation().x - 5 * delta, -5),
                y: -5,
                z: 0
            });
        }

        if (right) {
            playerRef.current.setTranslation({
                x: Math.min(playerRef.current.translation().x + 5 * delta, 5),
                y: -5,
                z: 0
            });
        }

        if (space && state.clock.getElapsedTime() - lastShootTime.current > 0.5) {
            const position = playerRef.current.translation();
            setBullets(prev => [...prev, {
                id: Date.now(),
                position: [position.x, position.y + 1, position.z]
            }]);
            lastShootTime.current = state.clock.getElapsedTime();
        }

        setBullets(prev => prev.filter(bullet => bullet.position[1] < 10));
    });

    return (
        <>
            <RigidBody ref={playerRef} type="fixed" position={[0, -5, 0]}>
                <mesh>
                    <boxGeometry args={[1, 0.5, 0.5]} />
                    <meshStandardMaterial color="lime" />
                </mesh>
            </RigidBody>
            {bullets.map(bullet => (
                <Bullet
                    key={bullet.id}
                    position={bullet.position}
                    onHit={() => {
                        setBullets(prev =>
                            prev.filter(b => b.id !== bullet.id)
                        );
                    }}
                />
            ))}
        </>
    );
} 