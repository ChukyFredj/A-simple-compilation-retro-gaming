import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { useCallback, useMemo, useRef, useState } from 'react';
import Boundaries from '../components/SpaceInvaders/Boundaries';
import Enemies from '../components/SpaceInvaders/Enemies';
import Player from '../components/SpaceInvaders/Player';

export default function SpaceInvaders() {
    const [score, setScore] = useState(0);
    const [wave, setWave] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [chargeLevel, setChargeLevel] = useState(100);
    const [powerUps, setPowerUps] = useState({
        rapidFire: false,
        shield: false,
        infiniteEnergy: false
    });
    const enemiesRef = useRef(null);

    const maxWaves = useMemo(() => 10, []);
    const initialPowerUps = useMemo(() => ({
        rapidFire: false,
        shield: false,
        infiniteEnergy: false
    }), []);

    const handleGameOver = () => {
        setGameOver(true);
    };

    const restartGame = () => {
        setScore(0);
        setWave(1);
        setGameOver(false);
        setChargeLevel(100);
        setPowerUps(initialPowerUps);
    };

    const handleEnemyDestroyed = useCallback((points) => {
        setScore(prev => prev + points);
    }, []);

    const handleNewWave = useCallback((waveNumber) => {
        setWave(waveNumber);
    }, []);

    return (
        <div className="h-screen w-screen">
            <div className="absolute top-4 left-4 z-10 font-press-start text-white">
                Score: {score}
            </div>
            <div className="absolute top-4 right-4 z-10 font-press-start text-white">
                Vague: {wave}/10
            </div>

            {/* Interface des bonus et de l'énergie */}
            <div className="absolute left-4 top-20 z-10 font-press-start text-white">
                <div className="mb-4">
                    <div className="text-sm mb-1 flex justify-between items-center">
                        <span>Énergie</span>
                        <span className="text-xs">{Math.round(chargeLevel)}%</span>
                    </div>
                    <div className="w-32 h-4 bg-gray-800 rounded overflow-hidden border border-gray-600">
                        <div
                            className="h-full bg-blue-500 rounded"
                            style={{ width: `${chargeLevel}%` }}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className={`p-2 rounded ${powerUps.rapidFire ? 'bg-green-500' : 'bg-gray-700'}`}>
                        Tir Rapide
                    </div>
                    <div className={`p-2 rounded ${powerUps.infiniteEnergy ? 'bg-cyan-500' : 'bg-gray-700'}`}>
                        Énergie Infinie
                    </div>
                    <div className={`p-2 rounded ${powerUps.shield ? 'bg-yellow-500' : 'bg-gray-700'}`}>
                        Bouclier
                    </div>
                </div>
            </div>

            {gameOver && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black bg-opacity-70">
                    <div className="text-center font-press-start text-white">
                        <h2 className="text-4xl mb-4">Game Over</h2>
                        <p className="mb-4">Score Final: {score}</p>
                        <button
                            onClick={restartGame}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded"
                        >
                            Rejouer
                        </button>
                    </div>
                </div>
            )}

            <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
                <color attach="background" args={['#000000']} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Physics>
                    <Boundaries />
                    {!gameOver && (
                        <>
                            <Player
                                onGameOver={handleGameOver}
                                chargeLevel={chargeLevel}
                                setChargeLevel={setChargeLevel}
                                powerUps={powerUps}
                                setPowerUps={setPowerUps}
                            />
                            <Enemies
                                ref={enemiesRef}
                                onEnemyDestroyed={handleEnemyDestroyed}
                                onNewWave={handleNewWave}
                                maxWaves={maxWaves}
                                onGameOver={handleGameOver}
                                currentWave={wave}
                                setPowerUps={setPowerUps}
                                powerUps={powerUps}
                                key={gameOver ? 'game-over' : 'playing'}
                            />
                        </>
                    )}
                </Physics>
            </Canvas>
        </div>
    );
}