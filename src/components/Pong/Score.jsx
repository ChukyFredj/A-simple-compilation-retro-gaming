
export default function Score({ playerScore, aiScore }) {
    return (
        <>
            {/* Ligne centrale pointillée */}
            {Array.from({ length: 20 }).map((_, i) => (
                <mesh key={i} position={[0, 5 - i * 0.5, 0]}>
                    <boxGeometry args={[0.1, 0.2, 0.1]} />
                    <meshStandardMaterial color="#ffffff" opacity={0.5} transparent />
                </mesh>
            ))}
        </>
    );
} 