import { useFrame, useLoader } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import EnemyBullet from './EnemyBullet';
import PowerUp from './PowerUp';

// Mémoisation du modèle 3D
const useEnemyModel = () => {
    const materials = useLoader(MTLLoader, '/models/Space-Invaders-Enemy.mtl');
    return useLoader(OBJLoader, '/models/Space-Invaders-Enemy.obj', (loader) => {
        materials.preload();
        loader.setMaterials(materials);
    });
};

const ALIEN_COLORS = {
    1: "#ff0000",
    2: "#00ff00",
    3: "#0000ff"
};

// Enlever useMemo de createWave et le déplacer dans le composant
const createWave = (waveNumber = 1) => {
    const newEnemies = [];
    const baseSpeed = 2 + (waveNumber - 1) * 2;

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 8; col++) {
            const position = [
                (col - 3.5) * 1.5,
                10 - row * 1.2,
                0
            ];
            newEnemies.push({
                id: `wave${waveNumber}-${row}-${col}`,
                position: position,
                type: row + 1,
                isAlive: true,
                points: 100,
                scale: 0.08,
                color: ALIEN_COLORS[row + 1]
            });
        }
    }
    return { enemies: newEnemies, speed: baseSpeed };
};

const Enemies = forwardRef(({
    onEnemyDestroyed,
    onNewWave,
    maxWaves = 10,
    onGameOver,
    currentWave,
    setPowerUps,
    powerUps
}, ref) => {
    const [enemies, setEnemies] = useState([]);
    const direction = useRef(1);
    const speed = useRef(2);
    const moveDownAmount = 0.3;
    const lastMoveTime = useRef(0);
    const moveInterval = 0.5;
    const waveNumber = useRef(1);
    const targetPositions = useRef([]);
    const isWaveInProgress = useRef(false);
    const [enemyBullets, setEnemyBullets] = useState([]);
    const lastEnemyShootTime = useRef(0);
    const destroyingEnemies = useRef(new Set());
    const [localPowerUps, setLocalPowerUps] = useState([]);
    const timeoutRefs = useRef([]);
    const frameCount = useRef(0);
    const currentPositions = useRef([]);
    const lastUpdateTime = useRef(0);

    const obj = useEnemyModel();

    // Mémoisation de la création de vague
    const startNewWave = useCallback(() => {
        if (waveNumber.current <= maxWaves && !isWaveInProgress.current) {
            isWaveInProgress.current = true;
            const waveData = createWave(waveNumber.current);

            // Initialisation des positions actuelles et cibles
            currentPositions.current = waveData.enemies.map(e => [...e.position]);
            targetPositions.current = waveData.enemies.map(e => [...e.position]);

            setEnemies(waveData.enemies);
            speed.current = waveData.speed;
            onNewWave(waveNumber.current);
            waveNumber.current += 1;

            setTimeout(() => {
                isWaveInProgress.current = false;
            }, 2000);
        }
    }, [maxWaves, onNewWave]);

    // Mémoisation des ennemis vivants
    const aliveEnemies = useMemo(() =>
        enemies.filter(e => e.isAlive),
        [enemies]
    );

    // Optimisation du mouvement des ennemis
    const updateEnemyPositions = useCallback((currentTime, delta) => {
        // Si pas assez de temps écoulé, on fait une interpolation
        if (currentTime - lastMoveTime.current < moveInterval) {
            const progress = (currentTime - lastMoveTime.current) / moveInterval;

            setEnemies(prev => {
                const newEnemies = [...prev];
                for (let i = 0; i < newEnemies.length; i++) {
                    if (!newEnemies[i].isAlive) continue;

                    const current = currentPositions.current[i];
                    const target = targetPositions.current[i];

                    if (current && target) {
                        newEnemies[i] = {
                            ...newEnemies[i],
                            position: [
                                current[0] + (target[0] - current[0]) * progress,
                                current[1] + (target[1] - current[1]) * progress,
                                current[2]
                            ]
                        };
                    }
                }
                return newEnemies;
            });

            return;
        }

        // Calcul des nouvelles positions cibles
        const leftMostX = Math.min(...aliveEnemies.map(e => e.position[0]));
        const rightMostX = Math.max(...aliveEnemies.map(e => e.position[0]));

        const hitBorder = (direction.current > 0 && rightMostX >= 4.5) ||
            (direction.current < 0 && leftMostX <= -4.5);

        // Sauvegarde des positions actuelles
        currentPositions.current = enemies.map(e => [...e.position]);

        if (hitBorder) {
            direction.current *= -1;
            targetPositions.current = enemies.map(enemy => [
                enemy.position[0],
                enemy.position[1] - moveDownAmount,
                enemy.position[2]
            ]);
        } else {
            const moveX = direction.current * 0.5;
            targetPositions.current = enemies.map(enemy => [
                enemy.position[0] + moveX,
                enemy.position[1],
                enemy.position[2]
            ]);
        }

        lastMoveTime.current = currentTime;
        lastUpdateTime.current = currentTime;
    }, [enemies, aliveEnemies]);

    // Optimisation des tirs ennemis
    const updateEnemyBullets = useCallback((currentTime) => {
        frameCount.current++;

        // Ne met à jour les tirs que tous les 3 frames
        if (frameCount.current % 3 === 0) {
            if (currentTime - lastEnemyShootTime.current > 2) {
                if (aliveEnemies.length > 0 && Math.random() < 0.5) {
                    const lowestEnemies = aliveEnemies.reduce((acc, enemy) => {
                        if (!acc[enemy.position[0]]) {
                            acc[enemy.position[0]] = enemy;
                        } else if (enemy.position[1] < acc[enemy.position[0]].position[1]) {
                            acc[enemy.position[0]] = enemy;
                        }
                        return acc;
                    }, {});

                    const shootingEnemy = Object.values(lowestEnemies)[
                        Math.floor(Math.random() * Object.values(lowestEnemies).length)
                    ];

                    if (shootingEnemy && shootingEnemy.position[1] > -3) {
                        setEnemyBullets(prev => [...prev, {
                            id: Date.now(),
                            position: [...shootingEnemy.position]
                        }]);
                    }
                    lastEnemyShootTime.current = currentTime;
                }
            }

            // Nettoyage des balles hors écran
            setEnemyBullets(prev => prev.filter(bullet => bullet.position[1] > -6));
        }
    }, [aliveEnemies]);

    // Optimisation du nettoyage des balles
    const cleanupBullets = useCallback(() => {
        setEnemyBullets(prev => {
            const newBullets = prev.filter(bullet => {
                // Vérifie si la balle est encore dans l'écran
                return bullet.position[1] > -6 && bullet.position[1] < 10;
            });
            return newBullets.length !== prev.length ? newBullets : prev;
        });
    }, []);

    // Optimisation du nettoyage des power-ups
    const cleanupPowerUps = useCallback(() => {
        setLocalPowerUps(prev => {
            const newPowerUps = prev.filter(powerUp => {
                // Vérifie si le power-up est encore dans l'écran
                return powerUp.position[1] > -6;
            });
            return newPowerUps.length !== prev.length ? newPowerUps : prev;
        });
    }, []);

    const handleEnemyDestroy = useCallback((enemyId, points, position) => {
        if (!destroyingEnemies.current.has(enemyId)) {
            destroyingEnemies.current.add(enemyId);

            setEnemies(prev => {
                const newEnemies = prev.map(e =>
                    e.id === enemyId ? { ...e, isAlive: false } : e
                );

                // Vérifie si l'ennemi a été effectivement détruit
                const wasDestroyed = newEnemies.some(e => e.id === enemyId && !e.isAlive);
                if (wasDestroyed) {
                    onEnemyDestroyed(points);
                    spawnPowerUp(position);
                }

                return newEnemies;
            });

            // Nettoyage après un court délai
            const timeout = setTimeout(() => {
                destroyingEnemies.current.delete(enemyId);
            }, 100);
            timeoutRefs.current.push(timeout);
        }
    }, [onEnemyDestroyed]);

    useFrame((state, delta) => {
        const currentTime = state.clock.getElapsedTime();

        // Nettoyage périodique (toutes les 10 frames)
        if (frameCount.current % 10 === 0) {
            cleanupBullets();
            cleanupPowerUps();
        }

        // Mise à jour des positions avec interpolation
        if (currentTime - lastUpdateTime.current < 0.016) { // 60 FPS
            return;
        }
        lastUpdateTime.current = currentTime;

        updateEnemyPositions(currentTime, delta);

        if (currentWave >= 1) {
            updateEnemyBullets(currentTime);
        }

        if (aliveEnemies.length === 0 && !isWaveInProgress.current && waveNumber.current <= maxWaves) {
            startNewWave();
        }
    });

    useImperativeHandle(ref, () => ({
        resetGame: () => {
            waveNumber.current = 1;
            speed.current = 2;
            direction.current = 1;
            isWaveInProgress.current = false;
            setEnemyBullets([]);
            startNewWave();
        }
    }));

    useEffect(() => {
        startNewWave();
    }, []);

    useEffect(() => {
        // Nettoyage complet lors du démontage
        return () => {
            timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
            timeoutRefs.current = [];
            destroyingEnemies.current.clear();
            setEnemyBullets([]);
            setLocalPowerUps([]);
            setEnemies([]);
        };
    }, []);

    const shootEnemyBullet = (enemy) => {
        if (enemy.position[1] > -3) {
            setEnemyBullets(prev => [...prev, {
                id: Date.now(),
                position: [...enemy.position]
            }]);
        }
    };

    const spawnPowerUp = (position) => {
        if (Math.random() < 0.2) { // 20% de chance de faire apparaître un bonus
            const types = ['rapidFire', 'shield', 'infiniteEnergy'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            setLocalPowerUps(prev => [...prev, {
                id: Date.now(),
                position,
                type: randomType
            }]);
        }
    };

    const handlePowerUpCollect = (type) => {
        setPowerUps(prev => {
            const newPowerUps = { ...prev, [type]: true };

            const timeout = setTimeout(() => {
                setPowerUps(current => ({ ...current, [type]: false }));
            }, 10000);

            timeoutRefs.current.push(timeout);
            return newPowerUps;
        });
    };

    return (
        <>
            {aliveEnemies.map(enemy => (
                <RigidBody
                    key={enemy.id}
                    type="fixed"
                    position={enemy.position}
                    onCollisionEnter={() => handleEnemyDestroy(enemy.id, enemy.points, enemy.position)}
                >
                    <primitive
                        object={obj.clone()}
                        scale={[enemy.scale, enemy.scale, enemy.scale]}
                    >
                        <meshPhongMaterial
                            color={enemy.color}
                            emissive={enemy.color}
                            emissiveIntensity={0.5}
                            shininess={100}
                        />
                    </primitive>
                </RigidBody>
            ))}
            {enemyBullets.map(bullet => (
                <EnemyBullet
                    key={bullet.id}
                    position={bullet.position}
                    checkShield={() => powerUps.shield}
                    onHit={() => {
                        setEnemyBullets(prev =>
                            prev.filter(b => b.id !== bullet.id)
                        );
                        onGameOver();
                    }}
                />
            ))}
            {localPowerUps.map(powerUp => (
                <PowerUp
                    key={powerUp.id}
                    position={powerUp.position}
                    type={powerUp.type}
                    onCollect={(type) => {
                        setLocalPowerUps(prev => prev.filter(p => p.id !== powerUp.id));
                        handlePowerUpCollect(type);
                    }}
                />
            ))}
        </>
    );
});

Enemies.displayName = 'Enemies';

export default Enemies; 