import { RigidBody } from '@react-three/rapier';

export default function Borders() {
    return (
        <>
            {/* Bordure supérieure */}
            <RigidBody type="fixed" position={[0, 5.5, 0]} restitution={1}>
                <mesh>
                    <boxGeometry args={[16, 0.2, 0.2]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>
            </RigidBody>

            {/* Bordure inférieure */}
            <RigidBody type="fixed" position={[0, -5.5, 0]} restitution={1}>
                <mesh>
                    <boxGeometry args={[16, 0.2, 0.2]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>
            </RigidBody>
        </>
    );
} 