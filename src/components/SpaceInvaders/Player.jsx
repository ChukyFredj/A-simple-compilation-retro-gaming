import { useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ExtrudeGeometry, Shape } from 'three';
import Bullet from './Bullet';

const createCannonGeometry = () => {
    const shape = new Shape();

    // Base du canon
    shape.moveTo(-0.5, -0.25);
    shape.lineTo(0.5, -0.25);
    shape.lineTo(0.5, 0);
    shape.lineTo(0.25, 0);
    // Canon

    shape.lineTo(0.15, 0.25);
    shape.lineTo(-0.15, 0.25);
    shape.lineTo(-0.25, 0);
    shape.lineTo(-0.5, 0);
    shape.lineTo(-0.5, -0.25);

    return new ExtrudeGeometry(shape, {
        depth: 0.2,
        bevelEnabled: false
    });
};

export default function Player({ onGameOver, chargeLevel, setChargeLevel, powerUps, onShoot }) {
    const [bullets, setBullets] = useState([]);
    const playerRef = useRef();
    const lastShootTime = useRef(0);
    const lastUpdateTime = useRef(0);
    const [, getKeys] = useKeyboardControls();

    // Nettoyage des balles
    const cleanupBullets = useCallback(() => {
        setBullets(prev => prev.filter(bullet =>
            bullet.position[1] < 10 && bullet.position[1] > -6
        ));
    }, []);

    useEffect(() => {
        return () => {
            setBullets([]);
        };
    }, []);

    const calculateNewPosition = useCallback((currentX, delta, direction) => {
        if (direction === 'left') {
            return Math.max(currentX - 5 * delta, -5);
        }
        return Math.min(currentX + 5 * delta, 5);
    }, []);

    useFrame((state, delta) => {
        const currentTime = state.clock.getElapsedTime();

        // Limite la fréquence de mise à jour
        if (currentTime - lastUpdateTime.current < 0.016) return;
        lastUpdateTime.current = currentTime;

        const { left, right, space } = getKeys();

        // Optimisation de la recharge d'énergie
        if ((!space || powerUps.infiniteEnergy) && chargeLevel < 100) {
            setChargeLevel(prev => Math.min(prev + 30 * delta, 100));
        }

        if (!playerRef.current) return;

        // Optimisation du mouvement
        const currentPosition = playerRef.current.translation();
        let newX = currentPosition.x;

        if (left || right) {
            newX = calculateNewPosition(
                currentPosition.x,
                delta,
                left ? 'left' : 'right'
            );

            playerRef.current.setNextKinematicTranslation({
                x: newX,
                y: -5,
                z: 0
            });
        }

        // Optimisation du système de tir
        const energyCost = powerUps.rapidFire ? 10 : 20;
        if (space && (chargeLevel >= energyCost || powerUps.infiniteEnergy)) {
            const shootCooldown = powerUps.rapidFire ? 0.15 : 0.5;

            if (currentTime - lastShootTime.current > shootCooldown) {
                setBullets(prev => [...prev, {
                    id: Date.now(),
                    position: [newX, -4.5, 0]
                }]);
                lastShootTime.current = currentTime;

                if (!powerUps.infiniteEnergy) {
                    setChargeLevel(prev => Math.max(0, prev - energyCost));
                }

                // Jouer le son de tir
                onShoot?.();
            }
        }

        // Nettoyage périodique des balles
        cleanupBullets();
    });

    return (
        <>
            <RigidBody
                ref={playerRef}
                type="kinematicPosition"
                position={[0, -5, 0]}
                colliders="cuboid"
                name="player"
                enabledRotations={[false, false, false]}
                onCollisionEnter={(e) => {
                    if (powerUps.shield) return;
                    if (e.other.rigidBody.name === 'enemyBullet') {
                        onGameOver();
                    }
                }}
            >
                <mesh geometry={createCannonGeometry()}>
                    <meshStandardMaterial
                        color={powerUps.shield ? "#ffff50" : "#50ff50"}
                        emissive={powerUps.shield ? "#ffff50" : "#50ff50"}
                        emissiveIntensity={0.5}
                    />
                </mesh>
            </RigidBody>
            {bullets.map(bullet => (
                <Bullet
                    key={bullet.id}
                    position={bullet.position}
                    damage={bullet.damage}
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