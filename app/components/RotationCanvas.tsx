'use client'


import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
/**
 * ============================================
 * PR-668 - PCB Component Rotation Visualization
 * --------------------------------------------
 * Goal:
 *  - Demonstrate rotation around world origin (broken)
 *  - Demonstrate rotation around component’s own center (fixed)
 *  - Toggle between modes to visualize the difference
 *
 * ============================================
 */

export default function RotationCanvas() {
  // HTML container reference (where renderer mounts)
  const mountRef = useRef<HTMLDivElement>(null)

  // References for the 3D objects
  const pcbRef = useRef<THREE.Mesh | null>(null)
  const pivotRef = useRef<THREE.Object3D | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

  // UI state
  const [isRotating, setIsRotating] = useState(false)
  const [mode, setMode] = useState<'broken' | 'fixed'>('broken')

  useEffect(() => {
    if (!mountRef.current) return

    // ---------- 1. Basic Setup ----------
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x1f2937) // gray background
    rendererRef.current = renderer
    mountRef.current.appendChild(renderer.domElement)

    // ---------- 2. Create Objects ----------
    const pcbGeometry = new THREE.BoxGeometry(2, 0.3, 1)
    const pcbMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, shininess: 100 })
    const pcb = new THREE.Mesh(pcbGeometry, pcbMaterial)
    pcb.position.set(3, 1, 0)
    pcbRef.current = pcb

    const pivot = new THREE.Object3D()
    pivot.position.copy(pcb.position)
    pivot.add(pcb)
    pivotRef.current = pivot

    // "Broken" mode will add pcb directly to scene.
    // "Fixed" mode will add pivot (which contains pcb).
    scene.add(mode === 'broken' ? pcb : pivot)

    // ---------- 3. Visual Aids ----------
    const worldAxes = new THREE.AxesHelper(2)
    scene.add(worldAxes)

    const localAxes = new THREE.AxesHelper(1.5)
    pcb.add(localAxes)

    const originGeometry = new THREE.SphereGeometry(0.1)
    const originMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    const originSphere = new THREE.Mesh(originGeometry, originMaterial)
    scene.add(originSphere)

    // ---------- 4. Lighting ----------
    const ambientLight = new THREE.AmbientLight(0x404040)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // ---------- 5. Camera ----------
    camera.position.set(0, 3, 8)
    camera.lookAt(3, 1, 0)

    // ---------- 6. Resize Handler ----------
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // ---------- 7. Animation Loop ----------
    const animate = () => {
      requestAnimationFrame(animate)

      if (isRotating) {
        if (mode === 'broken' && pcbRef.current) {
          // Broken: rotates in world space
          pcbRef.current.rotateY(0.02)
        } else if (mode === 'fixed' && pivotRef.current) {
          // Fixed: rotates around its local pivot center
          pivotRef.current.rotateY(0.02)
        }
      }

      renderer.render(scene, camera)
    }
    animate()

    // ---------- 8. Cleanup ----------
    return () => {
      window.removeEventListener('resize', handleResize)

      // Dispose geometry/materials
      pcbGeometry.dispose()
      pcbMaterial.dispose()
      renderer.dispose()

      // Remove renderer from DOM
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [isRotating, mode]) // rerun effect when mode changes

  // ---------- 9. UI Controls ----------
  return (
    <div className="relative w-full h-screen">
      {/* Control Panel */}
      <div className="absolute top-6 left-6 z-50 bg-gray-900/90 text-white p-6 rounded-xl backdrop-blur-sm max-w-md border border-gray-700 shadow-lg">
        <h3 className="text-xl font-bold mb-3 text-green-400">PR-668: PCB Rotation Modes</h3>

        {/* Start/Stop rotation */}
        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`w-full py-2 px-4 mb-3 rounded-lg font-semibold transition-all duration-200 ${
            isRotating ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isRotating ? 'Stop Rotation' : 'Start Rotation'}
        </button>

        {/* Mode toggle */}
        <button
          onClick={() => setMode(mode === 'broken' ? 'fixed' : 'broken')}
          className="w-full py-2 px-4 mb-4 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 transition-all duration-200"
        >
          Switch to {mode === 'broken' ? ' Fixed Mode' : ' Broken Mode'}
        </button>

        <div className="text-sm text-gray-200 space-y-2">
          <p><strong>Current Mode:</strong> {mode === 'broken' ? 'Broken (World-space rotation)' : 'Fixed (Local-space rotation)'}</p>
          <p>• Green Box = PCB Component</p>
          <p>• Red Sphere = World Origin</p>
          <p>• Axes: Red=X, Green=Y, Blue=Z</p>
        </div>
      </div>

      {/* Three.js Canvas */}
      <div ref={mountRef} className="w-full h-full" />
    </div>
  )
}

