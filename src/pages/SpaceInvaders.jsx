import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { useState } from 'react';
import Enemies from '../components/SpaceInvaders/Enemies';
import Player from '../components/SpaceInvaders/Player';

export default function SpaceInvaders() {
    const [score, setScore] = useState(0);

    return (
        <div className="h-screen w-screen">
            <div className="absolute top-4 left-4 z-10 font-press-start text-white">
                Score: {score}
            </div>
            <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
                <color attach="background" args={['#000000']} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Physics>
                    <Player />
                    <Enemies onEnemyDestroyed={() => setScore(prev => prev + 100)} />
                </Physics>
            </Canvas>
        </div>
    );
}