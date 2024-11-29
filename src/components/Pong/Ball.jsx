import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function Ball({ onScore, onCollision }) {
    const ballRef = useRef();
    const [initialKick, setInitialKick] = useState(false);
    const speed = 12;
    const lastCollisionTime = useRef(0);

    const resetBall = useCallback((direction = 1) => {
        if (!ballRef.current) return;

        // Angle fixe de 45 degrés
        const angle = Math.PI / 4; // 45 degrés
        const velocityX = Math.cos(angle) * speed * direction;
        const velocityY = Math.sin(angle) * speed;

        // Positionner la balle au centre
        ballRef.current.setTranslation({ x: 0, y: 0, z: 0 });
        ballRef.current.setLinvel({ x: velocityX, y: velocityY, z: 0 });
        lastCollisionTime.current = 0;
    }, []);

    useEffect(() => {
        if (!initialKick) {
            resetBall(-1); // Servir vers le joueur
            setInitialKick(true);
        }
    }, [initialKick, resetBall]);

    useFrame(() => {
        if (!ballRef.current) return;

        const position = ballRef.current.translation();
        const velocity = ballRef.current.linvel();
        const currentTime = Date.now();

        // Anti-blocage : si la balle est trop lente ou bloquée, on la réinitialise
        const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        if (currentSpeed < speed * 0.5 || (currentTime - lastCollisionTime.current > 2000 && Math.abs(velocity.x) < 2)) {
            resetBall(position.x > 0 ? -1 : 1);
            return;
        }

        // Vérifier si la balle est sortie des limites horizontales
        if (position.x < -8) {
            onScore(false); // Point pour l'AI
            resetBall(-1);
        } else if (position.x > 8) {
            onScore(true); // Point pour le joueur
            resetBall(-1);
        }

        // Vérifier si la balle est sortie des limites verticales
        if (position.y > 5.5 || position.y < -5.5) {
            resetBall(position.x > 0 ? -1 : 1); // Resservir la balle vers le dernier joueur qui l'a touchée
            return;
        }

        // Rebond simple sur les murs (inversion de la vitesse Y)
        if (position.y > 5 || position.y < -5) {
            ballRef.current.setLinvel({
                x: velocity.x,
                y: -velocity.y,
                z: 0
            });
            lastCollisionTime.current = currentTime;
            if (onCollision) onCollision(); // Jouer le son lors des rebonds sur les murs
        }

        // Maintenir une vitesse constante
        if (Math.abs(currentSpeed - speed) > 0.1) {
            const factor = speed / currentSpeed;
            ballRef.current.setLinvel({
                x: velocity.x * factor,
                y: velocity.y * factor,
                z: 0
            });
        }
    });

    const handleCollision = () => {
        // Éviter les collisions multiples trop rapides
        const now = Date.now();
        if (now - lastCollisionTime.current > 50) { // 50ms de délai minimum entre les sons
            if (onCollision) onCollision();
            lastCollisionTime.current = now;
        }
    };

    return (
        <RigidBody
            ref={ballRef}
            type="dynamic"
            position={[0, 0, 0]}
            colliders="ball"
            name="ball"
            restitution={1}
            friction={0}
            linearDamping={0}
            angularDamping={0}
            gravityScale={0}
            ccd={true} // Activer la détection continue des collisions
            onCollisionEnter={handleCollision}
        >
            <mesh>
                <sphereGeometry args={[0.2]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
        </RigidBody>
    );
} 