import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber/native'
import * as THREE from 'three'
import type { Mpu6050Tracker } from '@/lib/mpu6050/tracker'

const BRISTLE_X = [-0.055, -0.028, 0, 0.028, 0.055]

/** The toothbrush mesh — rotates live from the IMU tracker quaternion. */
export const BrushScene = ({ trackerRef }: { trackerRef: RefObject<Mpu6050Tracker> }) => {
  const bodyRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    const body = bodyRef.current
    const tracker = trackerRef.current
    if (!body || !tracker) return
    tracker.extrapolate(delta)
    body.quaternion.copy(tracker.getSceneQuaternion())
  })

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2.5, 3, 2]} intensity={1.15} />
      <directionalLight position={[-2, 1.5, -1.5]} intensity={0.35} />
      <group ref={bodyRef}>
        <mesh position={[0, 0, -0.32]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.032, 0.038, 0.68, 24]} />
          <meshStandardMaterial color="#64748b" metalness={0.35} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <boxGeometry args={[0.1, 0.055, 0.07]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[0, 0, 0.16]}>
          <boxGeometry args={[0.17, 0.11, 0.13]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {BRISTLE_X.map((x) => (
          <mesh key={x} position={[x, 0.055, 0.24]}>
            <boxGeometry args={[0.014, 0.065, 0.022]} />
            <meshStandardMaterial color="#38bdf8" />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.3]}>
          <sphereGeometry args={[0.028, 20, 20]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.9} />
        </mesh>
      </group>
    </>
  )
}
