import { RigidBody } from '@react-three/rapier';
import React from 'react';

export default function Boundaries() {
    return (
        <>
            {/* Sol avec effet de grille */}
            <RigidBody type="fixed" position={[0, -6, 0]}>
                <mesh>
                    <boxGeometry args={[12, 0.1, 1]} />
                    <meshStandardMaterial
                        color="#50ff50"
                        emissive="#50ff50"
                        emissiveIntensity={0.3}
                        transparent
                        opacity={0.7}
                        wireframe={true}
                    />
                </mesh>
            </RigidBody>

            {/* Bordure gauche avec effet lumineux */}
            <RigidBody type="fixed" position={[-6, 0, 0]}>
                <mesh>
                    <boxGeometry args={[0.1, 13, 1]} />
                    <meshStandardMaterial
                        color="#50ff50"
                        emissive="#50ff50"
                        emissiveIntensity={0.3}
                        transparent
                        opacity={0.7}
                        wireframe={true}
                    />
                </mesh>
                {/* Ligne lumineuse intérieure */}
                <mesh position={[0.05, 0, 0]}>
                    <boxGeometry args={[0.02, 13, 1]} />
                    <meshStandardMaterial
                        color="#50ff50"
                        emissive="#50ff50"
                        emissiveIntensity={1}
                        transparent
                        opacity={0.3}
                    />
                </mesh>
            </RigidBody>

            {/* Bordure droite avec effet lumineux */}
            <RigidBody type="fixed" position={[6, 0, 0]}>
                <mesh>
                    <boxGeometry args={[0.1, 13, 1]} />
                    <meshStandardMaterial
                        color="#50ff50"
                        emissive="#50ff50"
                        emissiveIntensity={0.3}
                        transparent
                        opacity={0.7}
                        wireframe={true}
                    />
                </mesh>
                {/* Ligne lumineuse intérieure */}
                <mesh position={[-0.05, 0, 0]}>
                    <boxGeometry args={[0.02, 13, 1]} />
                    <meshStandardMaterial
                        color="#50ff50"
                        emissive="#50ff50"
                        emissiveIntensity={1}
                        transparent
                        opacity={0.3}
                    />
                </mesh>
            </RigidBody>
        </>
    );
}