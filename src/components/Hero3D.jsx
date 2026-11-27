import { Component, Suspense, useContext, useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Color, PMREMGenerator } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { ColorContext } from '../App.jsx'

const MODEL = '/models/wd01.glb'

function Reflections() {
  const { gl, scene } = useThree()

  useEffect(() => {
    const pmrem = new PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.5

    return () => {
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])

  return null
}

function Device() {
  const { scene } = useGLTF(MODEL)
  const { color } = useContext(ColorContext)

  useEffect(() => {
    const shell = new Color(color.shell)
    const grip = shell.clone().multiplyScalar(0.62)
    scene.traverse((o) => {
      if (!o.isMesh) {
        return
      }
      const m = o.material
      if (m.name === 'Pink_Plastic') {
        m.color.copy(shell)
        m.metalness = 0
        m.roughness = 0.5
      }
      if (m.name === 'Pink_Grip_Rubber') {
        m.color.copy(grip)
      }
      if (m.name === 'Chrome') {
        m.metalness = 1
        m.roughness = 0.08
        m.envMapIntensity = 1.6
      }
      if (m.name === 'Silver_Button') {
        m.metalness = 0.85
        m.roughness = 0.3
      }
    })
  }, [scene, color])

  return <primitive object={scene} rotation={[0.18, -0.5, 0]} />
}

export default function Hero3D({ fallback }) {
  const [spin, setSpin] = useState(true)
  const [failed, setFailed] = useState(false)

  if (failed) {
    return fallback
  }

  return (
    <HeroBoundary fallback={fallback}>
      <div className="hero-stage">
        <Suspense fallback={fallback}>
          <Canvas
            camera={{ position: [0.045, 0.028, 0.30], fov: 34, near: 0.01, far: 10 }}
            dpr={[1, 1.6]}
            gl={{ alpha: true, antialias: true }}
            onCreated={({ gl }) => gl.setClearAlpha(0)}
            onError={() => setFailed(true)}
          >
            <Reflections />
            <ambientLight intensity={0.5} />
            <directionalLight position={[-1, 2, 2]} intensity={1.8} />
            <directionalLight position={[2, 0.5, -1]} intensity={0.5} />
            <Device />
            <OrbitControls
              makeDefault
              enableZoom={false}
              enablePan={false}
              autoRotate={spin}
              autoRotateSpeed={0.9}
              enableDamping
              dampingFactor={0.08}
              minPolarAngle={0.6}
              maxPolarAngle={2.3}
              onStart={() => setSpin(false)}
            />
          </Canvas>
          <div className="hero-shadow" aria-hidden="true" />
          <p className="hero-drag tech" aria-hidden="true">drag to turn it over</p>
        </Suspense>
      </div>
    </HeroBoundary>
  )
}

class HeroBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { broke: false }
  }

  static getDerivedStateFromError() {
    return { broke: true }
  }

  render() {
    if (this.state.broke) {
      return this.props.fallback
    }
    return this.props.children
  }
}

useGLTF.preload(MODEL)
