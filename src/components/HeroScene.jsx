import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// A floating, distorting crystal orb
function Orb({ position, color, speed, scale, distort, emissiveIntensity = 2 }) {
    const mesh = useRef()

    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.rotation.x += delta * 0.1 * speed
            mesh.current.rotation.y += delta * 0.2 * speed
        }
    })

    return (
        <Float floatIntensity={2} speed={speed} rotationIntensity={1}>
            <mesh ref={mesh} position={position} scale={scale}>
                <icosahedronGeometry args={[1, 4]} />
                <MeshDistortMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={emissiveIntensity}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    metalness={0.9}
                    roughness={0.1}
                    distort={distort}
                    speed={speed * 2}
                    wireframe={false}
                    transparent={true}
                    opacity={0.8}
                />
            </mesh>
        </Float>
    )
}

function CameraRig() {
    useFrame((state) => {
        if (state.pointer) {
            // Parallax effect based on mouse pointer
            state.camera.position.lerp(
                new THREE.Vector3(
                    (state.pointer.x * 2),
                    (state.pointer.y * 2),
                    8
                ),
                0.05
            )
            state.camera.lookAt(0, 0, 0)
        }
    })
    return null
}

export default function HeroScene() {
    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <Canvas
                camera={{ position: [0, 0, 8], fov: 45 }}
                dpr={[1, 2]}
                gl={{ antialias: false, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
                eventSource={typeof window !== 'undefined' ? document.getElementById('root') : undefined}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
                <directionalLight position={[-10, -10, -5]} intensity={2} color="#06b6d4" />
                <directionalLight position={[10, -10, 5]} intensity={2} color="#a855f7" />

                {/* Core structure representing the "community network" */}
                <Float speed={1.5} rotationIntensity={2} floatIntensity={1}>
                    <mesh position={[0, 0, 0]}>
                        <icosahedronGeometry args={[2.5, 1]} />
                        <meshPhysicalMaterial
                            color="#000000"
                            emissive="#a855f7"
                            emissiveIntensity={0.5}
                            roughness={0.1}
                            metalness={0.9}
                            wireframe={true}
                            transparent={true}
                            opacity={0.15}
                        />
                    </mesh>
                </Float>

                {/* Floating energy orbs */}
                <Orb position={[-3.5, 1.5, -2]} color="#06b6d4" speed={1.2} scale={0.7} distort={0.4} emissiveIntensity={3} />
                <Orb position={[3.5, -1.5, -1]} color="#a855f7" speed={1.5} scale={1} distort={0.5} emissiveIntensity={3} />
                <Orb position={[0, 3, -4]} color="#ec4899" speed={0.8} scale={0.5} distort={0.3} emissiveIntensity={2} />
                <Orb position={[-2, -3, -3]} color="#3b82f6" speed={1.8} scale={0.6} distort={0.6} emissiveIntensity={2.5} />

                {/* Ambient particles */}
                <Sparkles count={100} scale={15} size={1} speed={0.3} opacity={0.3} color="#06b6d4" />
                <Sparkles count={100} scale={15} size={1} speed={0.3} opacity={0.3} color="#a855f7" />

                {/* Post-processing (Bloom adds the glowing "awesome" factor) */}
                <EffectComposer>
                    <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.2} />
                </EffectComposer>

                <CameraRig />
            </Canvas>
        </div>
    )
}
