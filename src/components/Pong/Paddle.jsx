import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useCallback, useEffect, useRef } from 'react';

export default function Paddle({ isPlayer, playerScore = 0, aiScore = 0, perfectAiScore = false, onCollision }) {
    const paddleRef = useRef();
    const keysPressed = useRef({});
    const speed = 10;
    const baseAiSpeed = 3;
    const paddleWidth = 2;
    const paddleHeight = 0.4;

    useEffect(() => {
        const handleKeyDown = (e) => {
            keysPressed.current[e.code] = true;
        };
        const handleKeyUp = (e) => {
            keysPressed.current[e.code] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const updatePlayerPaddle = useCallback((delta) => {
        if (!paddleRef.current) return;

        const currentPosition = paddleRef.current.translation();
        let newY = currentPosition.y;

        if (keysPressed.current['ArrowUp'] || keysPressed.current['KeyW']) {
            newY = Math.min(currentPosition.y + speed * delta, 4.3);
        }
        if (keysPressed.current['ArrowDown'] || keysPressed.current['KeyS']) {
            newY = Math.max(currentPosition.y - speed * delta, -4.3);
        }

        paddleRef.current.setNextKinematicTranslation({
            x: isPlayer ? -7 : 7,
            y: newY,
            z: 0
        });
    }, [isPlayer]);

    const updateAIPaddle = useCallback((delta, ballPosition) => {
        if (!paddleRef.current || !ballPosition) return;

        const currentPosition = paddleRef.current.translation();
        const targetY = ballPosition.y;
        let newY = currentPosition.y;

        const isSecretMode = perfectAiScore && playerScore === 0 && aiScore === 6;
        const isBossMode = perfectAiScore && playerScore > 0 && aiScore === 6;

        let difficultyMultiplier;
        let reactionDelay;
        let predictionError;

        if (isSecretMode) {
            difficultyMultiplier = 0;
            reactionDelay = 0;
            predictionError = 0;
        } else if (isBossMode) {
            difficultyMultiplier = 1.8; //1.8
            reactionDelay = 0;
            predictionError = 0;
        } else if (playerScore >= 4) {
            difficultyMultiplier = 1.4; //1.4
            reactionDelay = 0.1;
            predictionError = 0;
        } else {
            difficultyMultiplier = 1;
            reactionDelay = 0.3;
            predictionError = Math.random() * 0.5 - 0.25;
        }

        const aiSpeed = baseAiSpeed * difficultyMultiplier;

        if (Math.abs((targetY + predictionError) - currentPosition.y) > reactionDelay) {
            if (targetY > currentPosition.y) {
                newY = Math.min(currentPosition.y + aiSpeed * delta, 4.3);
            } else {
                newY = Math.max(currentPosition.y - aiSpeed * delta, -4.3);
            }
        }

        paddleRef.current.setNextKinematicTranslation({
            x: 7,
            y: newY,
            z: 0
        });
    }, [playerScore, aiScore, perfectAiScore]);

    useFrame((state, delta) => {
        if (isPlayer) {
            updatePlayerPaddle(delta);
        } else {
            const ball = state.scene.getObjectByName('ball');
            if (ball) {
                updateAIPaddle(delta, ball.position);
            }
        }
    });

    return (
        <RigidBody
            ref={paddleRef}
            type="kinematicPosition"
            position={[isPlayer ? -7 : 7, 0, 0]}
            colliders="cuboid"
            name={isPlayer ? 'playerPaddle' : 'aiPaddle'}
            restitution={1.2}
            onCollisionEnter={onCollision}
        >
            <mesh>
                <boxGeometry args={[paddleHeight, paddleWidth, 0.2]} />
                <meshStandardMaterial
                    color={isPlayer ? "#50ff50" : perfectAiScore ? "#ff0000" : "#7f00ff"}
                    emissive={isPlayer ? "#50ff50" : perfectAiScore ? "#ff0000" : "#7f00ff"}
                    emissiveIntensity={perfectAiScore && !isPlayer ? 0.8 : 0.5}
                />
            </mesh>
        </RigidBody>
    );
} 