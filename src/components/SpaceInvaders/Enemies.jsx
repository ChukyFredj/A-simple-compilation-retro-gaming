import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useEffect, useRef, useState } from 'react';

export default function Enemies({ onEnemyDestroyed }) {
    const [enemies, setEnemies] = useState([]);
    const direction = useRef(1);
    const speed = useRef(1);

    useEffect(() => {
        const newEnemies = [];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 3; j++) {
                newEnemies.push({
                    id: `${i}-${j}`,
                    position: [(i - 2) * 1.5, 3 + j * 1.5, 0],
                    isAlive: true
                });
            }
        }
        setEnemies(newEnemies);
    }, []);

    useFrame((state, delta) => {
        setEnemies(prev => {
            const newEnemies = prev.map(enemy => {
                if (!enemy.isAlive) return enemy;

                const [x, y, z] = enemy.position;
                const newX = x + direction.current * speed.current * delta;

                if (Math.abs(newX) > 5) {
                    direction.current *= -1;
                    return { ...enemy, position: [x, y - 0.5, z] };
                }

                return { ...enemy, position: [newX, y, z] };
            });

            return newEnemies;
        });
    });

    return enemies.map(enemy => enemy.isAlive && (
        <RigidBody
            key={enemy.id}
            type="fixed"
            position={enemy.position}
            onCollisionEnter={() => {
                setEnemies(prev => prev.map(e =>
                    e.id === enemy.id ? { ...e, isAlive: false } : e
                ));
                onEnemyDestroyed();
            }}
        >
            <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="red" />
            </mesh>
        </RigidBody>
    ));
} 