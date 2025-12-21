"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import { Points, PointMaterial, Float } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.cjs';

function Particles(props: any) {
    const ref = useRef<any>(null);
    const sphere = useMemo(() => random.inSphere(new Float32Array(5000 * 3), { radius: 1.5 }), []);

    useFrame((state, delta) => {
        if (ref.current) {
            // Auto-rotation
            ref.current.rotation.x -= delta / 15;
            ref.current.rotation.y -= delta / 20;

            // Mouse interaction (parallax)
            // state.mouse.x/y are normalized coordinates (-1 to 1)
            const x = state.mouse.x * 0.2;
            const y = state.mouse.y * 0.2;

            // LERP for smooth transition (Linear Interpolation)
            ref.current.rotation.x += (y - ref.current.rotation.x) * delta * 0.2;
            ref.current.rotation.y += (x - ref.current.rotation.y) * delta * 0.2;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#8b5cf6"
                    size={0.003} // Slightly finer particles
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.8}
                />
            </Points>
        </group>
    );
}

function FloatingShapes() {
    return (
        <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
            <mesh position={[1, -0.5, 0]}>
                <torusGeometry args={[0.5, 0.2, 16, 100]} />
                <meshStandardMaterial color="#60a5fa" wireframe opacity={0.3} transparent />
            </mesh>
            <mesh position={[-1.2, 0.8, -1]}>
                <icosahedronGeometry args={[0.6, 0]} />
                <meshStandardMaterial color="#f43f5e" wireframe opacity={0.2} transparent />
            </mesh>
        </Float>
    )
}

export default function Scene3D() {
    return (
        <div className="w-full h-full absolute inset-0 -z-10 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <ambientLight intensity={0.5} />
                <Particles />
                <FloatingShapes />
            </Canvas>
        </div>
    );
}
