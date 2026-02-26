'use client';

import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Decal, useTexture, useGLTF, Center } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';

type ProductType = 'tshirt' | 'hoodie' | 'bag';

interface MockupViewer3DProps {
    frontTextureUrl: string | null;
    backTextureUrl: string | null;
    view?: 'front' | 'back';
    productType?: ProductType;
    color?: string;
}

const transparentPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// ══════════════════════════════════════════════════════════════════
// GLB model paths for each product type
// ══════════════════════════════════════════════════════════════════
const MODEL_PATHS: Record<ProductType, string> = {
    tshirt: '/models/tshirt_front.glb',
    hoodie: '/models/hoodie_front.glb',
    bag: '/models/tote_bag.glb',
};

// Product-specific decal configurations
const DECAL_CONFIG: Record<ProductType, {
    front: { position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number] };
    back: { position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number] };
    modelScale: number;
}> = {
    tshirt: {
        front: { position: [0, 0.05, 0.5], rotation: [0, 0, 0], scale: [0.7, 0.9, 1.0] },
        back: { position: [0, 0.05, -0.5], rotation: [0, Math.PI, 0], scale: [0.7, 0.9, 1.0] },
        modelScale: 3.5,
    },
    hoodie: {
        front: { position: [0, -0.05, 0.55], rotation: [0, 0, 0], scale: [0.65, 0.75, 1.0] },
        back: { position: [0, -0.05, -0.55], rotation: [0, Math.PI, 0], scale: [0.65, 0.75, 1.0] },
        modelScale: 3.5,
    },
    bag: {
        front: { position: [0, -0.1, 0.52], rotation: [0, 0, 0], scale: [0.7, 0.7, 1.0] },
        back: { position: [0, -0.1, -0.52], rotation: [0, Math.PI, 0], scale: [0.7, 0.7, 1.0] },
        modelScale: 2.4,
    },
};

// ══════════════════════════════════════════════════════════════════
// GENERIC GLB MODEL — loads any .glb file and applies decals
// ══════════════════════════════════════════════════════════════════
function GLBProductModel({
    frontTextureUrl,
    backTextureUrl,
    view = 'front',
    color = '#2A2A35',
    productType = 'tshirt',
}: MockupViewer3DProps & { color: string }) {
    const modelPath = MODEL_PATHS[productType];
    const { nodes, materials } = useGLTF(modelPath) as any;

    // Find the first mesh geometry in the model (works for all our GLB files)
    const geometry = useMemo(() => {
        // Try common node names
        const meshNode = nodes.geometry_0 || nodes.Object_2 || nodes.mesh_0 || nodes.Mesh;
        if (!meshNode?.geometry) {
            // Fallback: search all nodes for the first one with geometry
            for (const key of Object.keys(nodes)) {
                if (nodes[key]?.geometry) {
                    const geo = nodes[key].geometry.clone();
                    if (!geo.attributes.normal) geo.computeVertexNormals();
                    return geo;
                }
            }
            return null;
        }
        const geo = meshNode.geometry.clone();
        if (!geo.attributes.normal) geo.computeVertexNormals();
        return geo;
    }, [nodes]);

    // Find the original material
    const originalMaterial = useMemo(() => {
        for (const key of Object.keys(materials || {})) {
            if (materials[key]) return materials[key];
        }
        // Fallback: search nodes for material
        for (const key of Object.keys(nodes)) {
            if (nodes[key]?.material) return nodes[key].material;
        }
        return null;
    }, [nodes, materials]);

    // Pre-load textures
    const frontProps = useTexture({ map: frontTextureUrl || transparentPixel });
    const backProps = useTexture({ map: backTextureUrl || transparentPixel });
    const frontMap = frontProps.map;
    const backMap = backProps.map;

    if (frontTextureUrl && frontMap) { frontMap.anisotropy = 16; frontMap.colorSpace = THREE.SRGBColorSpace; }
    if (backTextureUrl && backMap) { backMap.anisotropy = 16; backMap.colorSpace = THREE.SRGBColorSpace; }

    const groupRotation: [number, number, number] = view === 'back' ? [0, Math.PI, 0] : [0, 0, 0];
    const cfg = DECAL_CONFIG[productType];

    return (
        <group dispose={null} rotation={groupRotation}>
            <Center scale={cfg.modelScale}>
                {geometry && (
                    <mesh castShadow receiveShadow geometry={geometry}>
                        <meshStandardMaterial
                            color={color}
                            roughness={0.85}
                            metalness={0.0}
                            // Preserve original material's map if it has one, to blend with our color
                            map={originalMaterial?.map || null}
                        />
                        {frontTextureUrl && (
                            <Decal
                                position={cfg.front.position}
                                rotation={cfg.front.rotation}
                                scale={cfg.front.scale}
                                map={frontMap}
                            />
                        )}
                        {backTextureUrl && (
                            <Decal
                                position={cfg.back.position}
                                rotation={cfg.back.rotation}
                                scale={cfg.back.scale}
                                map={backMap}
                            />
                        )}
                    </mesh>
                )}
            </Center>
        </group>
    );
}

// Preload all GLB models
useGLTF.preload('/models/tshirt_front.glb');
useGLTF.preload('/models/hoodie_front.glb');
useGLTF.preload('/models/tote_bag.glb');

// ══════════════════════════════════════════════════════════════════
// MAIN EXPORT — MockupViewer3D with product type switching
// ══════════════════════════════════════════════════════════════════
export default function MockupViewer3D({
    frontTextureUrl,
    backTextureUrl,
    view = 'front',
    productType = 'tshirt',
    color = '#2A2A35',
}: MockupViewer3DProps) {
    if (!frontTextureUrl && !backTextureUrl) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-void border border-border-std relative">
                <div className="absolute inset-0 bg-grid-pattern bg-[length:20px_20px] opacity-[0.05] pointer-events-none" />
                <span className="font-mono text-xs text-text-dim animate-pulse">Awaiting Render Data...</span>
            </div>
        );
    }

    const productLabel = productType === 'tshirt' ? 'T-Shirt' : productType === 'hoodie' ? 'Hoodie' : 'Tote Bag';

    return (
        <div className="w-full h-full relative bg-void border border-border-std overflow-hidden cursor-move">
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05] pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05)_0%,transparent_70%)] pointer-events-none z-0"></div>

            {/* Product type badge */}
            <div className="absolute top-3 left-3 z-20 pointer-events-none">
                <span className="bg-panel/90 backdrop-blur px-2.5 py-1 border border-cyan/30 font-mono text-[9px] text-cyan uppercase tracking-widest shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                    {productLabel} • 3D Preview
                </span>
            </div>

            <Canvas shadows camera={{ position: [0, 0, 6], fov: 45 }}>
                <Suspense fallback={null}>
                    {/* Studio Lighting */}
                    <ambientLight intensity={0.5} />
                    <spotLight position={[5, 10, 5]} angle={0.25} penumbra={1} intensity={1} castShadow />
                    <Environment preset="city" />

                    {/* All products use the GLB loader */}
                    <GLBProductModel
                        frontTextureUrl={frontTextureUrl}
                        backTextureUrl={backTextureUrl}
                        view={view}
                        color={color}
                        productType={productType}
                    />

                    {/* Ground shadow */}
                    <ContactShadows resolution={512} scale={10} blur={2} opacity={0.5} far={10} color="#000000" position={[0, -2, 0]} />

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

