import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useRef, useState } from 'react';

export default function Bullet({ position, onHit }) {
    const bulletRef = useRef();
    const [isActive, setIsActive] = useState(true);
    const speed = 15;

    useFrame((state, delta) => {
        if (!bulletRef.current || !isActive) return;

        const currentPos = bulletRef.current.translation();

        bulletRef.current.setTranslation({
            x: currentPos.x,
            y: currentPos.y + speed * delta,
            z: currentPos.z
        });

        if (currentPos.y > 10) {
            setIsActive(false);
        }
    });

    if (!isActive) return null;

    return (
        <RigidBody
            ref={bulletRef}
            type="dynamic"
            position={position}
            mass={1}
            gravityScale={0}
            onCollisionEnter={() => {
                setIsActive(false);
                if (onHit) onHit();
            }}
        >
            <mesh>
                <sphereGeometry args={[0.2]} />
                <meshStandardMaterial
                    color="yellow"
                    emissive="yellow"
                    emissiveIntensity={0.5}
                />
            </mesh>
        </RigidBody>
    );
}