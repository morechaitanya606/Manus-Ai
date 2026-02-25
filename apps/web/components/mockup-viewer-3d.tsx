'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Decal, useTexture, useGLTF, Center } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';

interface MockupViewer3DProps {
    frontTextureUrl: string | null;
    backTextureUrl: string | null;
    view?: 'front' | 'back';
}

const transparentPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// The real 3D T-Shirt Model using the user's provided .glb file
function TShirtModel({ frontTextureUrl, backTextureUrl, view = 'front' }: MockupViewer3DProps) {
    // Load the custom 3D model
    const { nodes, materials } = useGLTF('/models/tshirt.glb') as any;

    // Ensure the geometry has vertex normals computed for DecalGeometry
    const geometry = React.useMemo(() => {
        if (!nodes.geometry_0?.geometry) return null;
        const geo = nodes.geometry_0.geometry.clone();
        if (!geo.attributes.normal) {
            geo.computeVertexNormals();
        }
        return geo;
    }, [nodes]);

    // Pre-load textures (fallback to transparent pixel so React hooks rules are respected)
    const frontProps = useTexture({ map: frontTextureUrl || transparentPixel });
    const backProps = useTexture({ map: backTextureUrl || transparentPixel });

    const frontMap = frontProps.map;
    const backMap = backProps.map;

    if (frontTextureUrl && frontMap) {
        frontMap.anisotropy = 16;
        frontMap.colorSpace = THREE.SRGBColorSpace;
    }

    if (backTextureUrl && backMap) {
        backMap.anisotropy = 16;
        backMap.colorSpace = THREE.SRGBColorSpace;
    }

    // Set default initial rotation based on the current garmentView they were editing
    const groupRotation: [number, number, number] = view === 'back' ? [0, Math.PI, 0] : [0, 0, 0];

    return (
        <group dispose={null} rotation={groupRotation}>
            <Center scale={3.5}>
                {geometry && (
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={geometry}
                        material={materials['Material.001'] || nodes.geometry_0.material} // Fallback
                    >
                        {/* Project the front uploaded design onto the chest */}
                        {frontTextureUrl && (
                            <Decal
                                position={[0, 0.05, 0.5]} // Shifted up slightly from center
                                rotation={[0, 0, 0]}
                                scale={[0.7, 0.9, 1.0]}   // Realistic standard chest graphic size (was 1.2x1.5)
                                map={frontMap}
                            />
                        )}

                        {/* Project the back uploaded design onto the shoulder blades */}
                        {backTextureUrl && (
                            <Decal
                                position={[0, 0.05, -0.5]}
                                rotation={[0, Math.PI, 0]}
                                scale={[0.7, 0.9, 1.0]}
                                map={backMap}
                            />
                        )}
                    </mesh>
                )}
            </Center>
        </group>
    );
}

// Preload the model for faster consecutive renders
useGLTF.preload('/models/tshirt.glb');

export default function MockupViewer3D({ frontTextureUrl, backTextureUrl, view = 'front' }: MockupViewer3DProps) {
    if (!frontTextureUrl && !backTextureUrl) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-void border border-border-std relative">
                <div className="absolute inset-0 bg-grid-pattern bg-[length:20px_20px] opacity-[0.05] pointer-events-none" />
                <span className="font-mono text-xs text-text-dim animate-pulse">Awaiting Render Data...</span>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative bg-void border border-border-std overflow-hidden cursor-move">
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05] pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05)_0%,transparent_70%)] pointer-events-none z-0"></div>

            <Canvas shadows camera={{ position: [0, 0, 6], fov: 45 }}>
                <Suspense fallback={null}>
                    {/* Realistic Studio Lighting Setup */}
                    <ambientLight intensity={0.5} />
                    <spotLight position={[5, 10, 5]} angle={0.25} penumbra={1} intensity={1} castShadow />
                    <Environment preset="city" /> {/* Drei environment maps create highly realistic reflections/lighting */}

                    {/* Render the Custom 3D Model with the decal */}
                    <TShirtModel frontTextureUrl={frontTextureUrl} backTextureUrl={backTextureUrl} view={view} />

                    {/* Ground shadow for realism */}
                    <ContactShadows resolution={512} scale={10} blur={2} opacity={0.5} far={10} color="#000000" position={[0, -2, 0]} />

                    {/* Re-enabled zoom so user can freely explore the model */}
                    <OrbitControls makeDefault minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.5} enableZoom={true} />
                </Suspense>
            </Canvas>

            {/* Overlay hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
                <span className="bg-panel/80 backdrop-blur px-3 py-1 border border-border-std font-mono text-[9px] text-cyan uppercase tracking-widest shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                    Drag to Rotate Model
                </span>
            </div>
        </div>
    );
}
