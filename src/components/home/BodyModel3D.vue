<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { useReducedMotion } from '@/composables/useReducedMotion'

const props = defineProps<{ active: string | null }>()
const emit = defineEmits<{
  hover: [bodyPart: string | null]
  select: [bodyPart: string]
}>()

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const loading = ref(true)
const failed = ref(false)
const reducedMotion = useReducedMotion()

let renderer: THREE.WebGLRenderer | undefined
let scene: THREE.Scene | undefined
let camera: THREE.PerspectiveCamera | undefined
let controls: OrbitControls | undefined
let model: THREE.Group | undefined
let animationFrame = 0
let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined
let inView = true
let pointerDown = { x: 0, y: 0 }
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const selectableMeshes: THREE.Mesh[] = []

const regionColors: Record<string, number> = {
  chest: 0xb8cbd8,
  back: 0x8ba4b5,
  shoulders: 0xc3d4de,
  'upper arms': 0x9db4c3,
  waist: 0x91aab9,
  'upper legs': 0x9fb5c3,
}

function material(color = 0x91a5b3, metalness = 0.08, roughness = 0.58) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
    transparent: true,
    opacity: 0.13,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
}

function addMesh(
  geometry: THREE.BufferGeometry,
  meshMaterial: THREE.MeshStandardMaterial,
  position: [number, number, number],
  scale: [number, number, number] = [1, 1, 1],
  bodyPart?: string,
) {
  if (!model) throw new Error('3D model group is not initialized')
  const mesh = new THREE.Mesh(geometry, meshMaterial)
  mesh.position.set(...position)
  mesh.scale.set(...scale)
  mesh.renderOrder = 1
  if (bodyPart) {
    mesh.userData.bodyPart = bodyPart
    mesh.userData.baseColor = meshMaterial.color.getHex()
    selectableMeshes.push(mesh)
  }

  const wireMaterial = new THREE.MeshBasicMaterial({
    color: bodyPart ? 0xc2d2dc : 0x9cafbb,
    transparent: true,
    opacity: bodyPart ? 0.42 : 0.27,
    wireframe: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  const wireframe = new THREE.Mesh(geometry, wireMaterial)
  wireframe.renderOrder = 2
  wireframe.raycast = () => undefined
  mesh.userData.wireframe = wireframe
  mesh.add(wireframe)

  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0xdce8ee,
    transparent: true,
    opacity: bodyPart ? 0.34 : 0.2,
    depthWrite: false,
  })
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 32), edgeMaterial)
  edges.renderOrder = 3
  mesh.userData.outline = edges
  mesh.add(edges)
  model.add(mesh)
  return mesh
}

function addLimb(
  start: THREE.Vector3,
  end: THREE.Vector3,
  topRadius: number,
  bottomRadius: number,
  meshMaterial: THREE.MeshStandardMaterial,
  bodyPart?: string,
) {
  const direction = new THREE.Vector3().subVectors(end, start)
  const geometry = new THREE.CylinderGeometry(topRadius, bottomRadius, direction.length(), 10, 2)
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
  const mesh = addMesh(
    geometry,
    meshMaterial,
    [midpoint.x, midpoint.y, midpoint.z],
    [1, 1, 0.82],
    bodyPart,
  )
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
  return mesh
}

function addBody() {
  model = new THREE.Group()
  model.rotation.y = -0.16
  scene?.add(model)

  const base = material(0x8298a7)
  const panel = material(0x9bb0bd)

  addMesh(
    new THREE.SphereGeometry(0.39, 18, 14),
    material(0xa7bac5),
    [0, 3.08, 0],
    [0.88, 1.12, 0.92],
  )
  addMesh(new THREE.CylinderGeometry(0.23, 0.27, 0.5, 10), panel, [0, 2.52, 0])
  addMesh(new THREE.CylinderGeometry(0.86, 0.54, 1.62, 10, 3), base, [0, 1.67, 0], [1, 1, 0.58])
  addMesh(new THREE.SphereGeometry(0.6, 12, 8), panel, [0, 0.65, 0], [1, 0.72, 0.66])

  const chestLeft = addMesh(
    new THREE.SphereGeometry(0.5, 12, 8),
    material(regionColors.chest),
    [-0.34, 1.92, 0.38],
    [1, 0.67, 0.34],
    'chest',
  )
  const chestRight = addMesh(
    new THREE.SphereGeometry(0.5, 12, 8),
    material(regionColors.chest),
    [0.34, 1.92, 0.38],
    [1, 0.67, 0.34],
    'chest',
  )
  chestLeft.rotation.z = -0.08
  chestRight.rotation.z = 0.08

  addMesh(
    new THREE.SphereGeometry(0.86, 14, 10),
    material(regionColors.back),
    [0, 1.72, -0.33],
    [1, 1.08, 0.29],
    'back',
  )

  addMesh(
    new THREE.CylinderGeometry(0.52, 0.48, 0.96, 10, 2),
    material(regionColors.waist),
    [0, 0.92, 0.04],
    [1, 1, 0.62],
    'waist',
  )

  for (const side of [-1, 1]) {
    addMesh(
      new THREE.SphereGeometry(0.37, 12, 8),
      material(regionColors.shoulders),
      [side * 0.92, 2.22, 0],
      [1.16, 0.92, 0.88],
      'shoulders',
    )
    addLimb(
      new THREE.Vector3(side * 1.0, 2.05, 0),
      new THREE.Vector3(side * 1.18, 0.92, 0.02),
      0.27,
      0.21,
      material(regionColors['upper arms']),
      'upper arms',
    )
    addMesh(new THREE.SphereGeometry(0.22, 10, 7), panel, [side * 1.19, 0.82, 0], [1, 0.9, 0.88])
    addLimb(
      new THREE.Vector3(side * 1.2, 0.74, 0),
      new THREE.Vector3(side * 1.29, -0.24, 0.08),
      0.2,
      0.14,
      base,
    )
    addMesh(
      new THREE.SphereGeometry(0.18, 10, 7),
      panel,
      [side * 1.3, -0.37, 0.1],
      [0.78, 1.28, 0.72],
    )

    addLimb(
      new THREE.Vector3(side * 0.39, 0.34, 0),
      new THREE.Vector3(side * 0.53, -1.16, 0.03),
      0.39,
      0.3,
      material(regionColors['upper legs']),
      'upper legs',
    )
    addMesh(
      new THREE.SphereGeometry(0.3, 10, 7),
      panel,
      [side * 0.54, -1.35, 0.04],
      [0.92, 0.82, 0.88],
    )
    addLimb(
      new THREE.Vector3(side * 0.54, -1.5, 0.03),
      new THREE.Vector3(side * 0.57, -2.72, 0.07),
      0.28,
      0.2,
      base,
    )
    const foot = addMesh(new THREE.BoxGeometry(0.43, 0.23, 0.82, 2, 1, 2), panel, [
      side * 0.57,
      -2.91,
      0.26,
    ])
    foot.rotation.x = -0.06
  }

  const seamMaterial = new THREE.LineBasicMaterial({
    color: 0xd9e9f1,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
  })
  const spinePoints = [
    new THREE.Vector3(0, 2.42, -0.53),
    new THREE.Vector3(0, 1.8, -0.57),
    new THREE.Vector3(0, 1.05, -0.42),
    new THREE.Vector3(0, 0.48, -0.3),
  ]
  const spine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(spinePoints), seamMaterial)
  model.add(spine)
}

function addEnvironment() {
  if (!scene) return
  scene.add(new THREE.HemisphereLight(0xe8edf0, 0x090a0c, 1.7))

  const key = new THREE.DirectionalLight(0xffffff, 4.2)
  key.position.set(-3.5, 5, 5)
  key.castShadow = true
  scene.add(key)

  const rim = new THREE.DirectionalLight(0xbac6cf, 3.3)
  rim.position.set(4, 2, -5)
  scene.add(rim)

  const low = new THREE.PointLight(0x77828b, 2.1, 12)
  low.position.set(0, -2.4, 3)
  scene.add(low)

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xdce1e4,
    transparent: true,
    opacity: 0.08,
  })
  for (const [radius, z] of [
    [3.15, -1.2],
    [2.55, -1.15],
  ] as const) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.008, 6, 120),
      ringMaterial.clone(),
    )
    ring.position.z = z
    scene.add(ring)
  }

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(2.25, 48),
    new THREE.MeshBasicMaterial({ color: 0xcad0d4, transparent: true, opacity: 0.035 }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -3.08
  scene.add(floor)
}

function resize() {
  if (!container.value || !renderer || !camera) return
  const { width, height } = container.value.getBoundingClientRect()
  if (!width || !height) return
  renderer.setSize(width, height, false)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

function updateHighlights() {
  selectableMeshes.forEach((mesh) => {
    const meshMaterial = mesh.material as THREE.MeshStandardMaterial
    const wireMaterial = (mesh.userData.wireframe as THREE.Mesh).material as THREE.MeshBasicMaterial
    const outlineMaterial = (mesh.userData.outline as THREE.LineSegments)
      .material as THREE.LineBasicMaterial
    const isActive = mesh.userData.bodyPart === props.active
    meshMaterial.color.setHex(isActive ? 0xdcebf2 : mesh.userData.baseColor)
    meshMaterial.emissive.setHex(isActive ? 0x7995a6 : 0x000000)
    meshMaterial.emissiveIntensity = isActive ? 0.75 : 0
    meshMaterial.opacity = isActive ? 0.34 : 0.13
    wireMaterial.color.setHex(isActive ? 0xf2fbff : 0xc2d2dc)
    wireMaterial.opacity = isActive ? 0.9 : 0.42
    outlineMaterial.opacity = isActive ? 0.82 : 0.34
  })
}

function hitTest(event: PointerEvent) {
  if (!canvas.value || !camera) return null
  const bounds = canvas.value.getBoundingClientRect()
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  return raycaster.intersectObjects(selectableMeshes, false)[0]?.object.userData.bodyPart as
    string | undefined
}

function onPointerMove(event: PointerEvent) {
  if (event.buttons) return
  const bodyPart = hitTest(event) ?? null
  emit('hover', bodyPart)
  if (canvas.value) canvas.value.style.cursor = bodyPart ? 'pointer' : 'grab'
}

function onPointerDown(event: PointerEvent) {
  pointerDown = { x: event.clientX, y: event.clientY }
  if (controls) controls.autoRotate = false
  emit('hover', null)
}

function onPointerUp(event: PointerEvent) {
  const distance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y)
  if (distance > 6) return
  const bodyPart = hitTest(event)
  if (bodyPart) emit('select', bodyPart)
}

function onPointerLeave() {
  emit('hover', null)
}

function resetView() {
  controls?.reset()
  if (controls) controls.autoRotate = !reducedMotion.value
}

function animate() {
  animationFrame = requestAnimationFrame(animate)
  if (!inView || !renderer || !scene || !camera) return
  controls?.update()
  renderer.render(scene, camera)
  if (loading.value) loading.value = false
}

function disposeScene() {
  scene?.traverse((object) => {
    if (
      object instanceof THREE.Mesh ||
      object instanceof THREE.LineSegments ||
      object instanceof THREE.Line
    ) {
      object.geometry?.dispose()
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      materials.forEach((item) => item?.dispose())
    }
  })
  controls?.dispose()
  renderer?.dispose()
  renderer?.forceContextLoss()
}

watch(() => props.active, updateHighlights)

onMounted(() => {
  if (!canvas.value || !container.value) return
  try {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    camera.position.set(0, 0.12, 13.5)

    renderer = new THREE.WebGLRenderer({
      canvas: canvas.value,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.28

    controls = new OrbitControls(camera, canvas.value)
    controls.target.set(0, 0.05, 0)
    controls.enablePan = false
    controls.enableZoom = false
    controls.enableDamping = true
    controls.dampingFactor = 0.07
    controls.rotateSpeed = 0.62
    controls.autoRotate = !reducedMotion.value
    controls.autoRotateSpeed = 0.52
    controls.minPolarAngle = Math.PI * 0.36
    controls.maxPolarAngle = Math.PI * 0.64
    controls.update()
    controls.saveState()

    addEnvironment()
    addBody()
    updateHighlights()
    resize()

    canvas.value.addEventListener('pointermove', onPointerMove)
    canvas.value.addEventListener('pointerdown', onPointerDown)
    canvas.value.addEventListener('pointerup', onPointerUp)
    canvas.value.addEventListener('pointerleave', onPointerLeave)

    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container.value)
    intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? true
    })
    intersectionObserver.observe(container.value)
    animate()
  } catch {
    failed.value = true
    loading.value = false
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  if (canvas.value) {
    canvas.value.removeEventListener('pointermove', onPointerMove)
    canvas.value.removeEventListener('pointerdown', onPointerDown)
    canvas.value.removeEventListener('pointerup', onPointerUp)
    canvas.value.removeEventListener('pointerleave', onPointerLeave)
  }
  disposeScene()
})
</script>

<template>
  <div ref="container" class="model-3d" :class="{ 'model-3d--loading': loading }">
    <canvas
      ref="canvas"
      aria-label="可拖拽旋转的三维人体模型；请选择右侧文字列表以使用键盘导航"
    ></canvas>
    <div v-if="loading" class="model-3d__loading" aria-live="polite">
      <span></span>
      <small>BUILDING 3D BODY</small>
    </div>
    <div v-if="failed" class="model-3d__fallback" role="status">
      <strong>3D</strong>
      <span>当前设备无法加载三维模型，请使用部位列表继续探索。</span>
    </div>
    <div class="model-3d__hint" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M8 7 4 11l4 4M16 7l4 4-4 4M4 11h16" /></svg>
      拖拽旋转 · 点击部位
    </div>
    <button class="model-3d__reset" type="button" aria-label="重置三维人体视角" @click="resetView">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11a8 8 0 1 1 2.3 5.7M4 5v6h6" /></svg>
    </button>
  </div>
</template>

<style scoped lang="scss">
.model-3d {
  position: absolute;
  inset: 44px 0 34px;
  z-index: 1;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
  outline: none;
  touch-action: none;
  cursor: grab;
}

canvas:active {
  cursor: grabbing;
}

.model-3d__loading,
.model-3d__fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 16px;
  background: rgba(7, 7, 8, 0.38);
  transition: opacity var(--motion-base);
}

.model-3d:not(.model-3d--loading) .model-3d__loading {
  opacity: 0;
  pointer-events: none;
}

.model-3d__loading span {
  width: 34px;
  height: 34px;
  border: 1px solid var(--color-border);
  border-top-color: var(--color-text);
  border-radius: 50%;
  animation: model-loading 0.9s linear infinite;
}

.model-3d__loading small,
.model-3d__fallback span {
  color: var(--color-text-faint);
  font-size: 8px;
  letter-spacing: 0.16em;
}

.model-3d__fallback {
  z-index: 3;
  padding: 30px;
  text-align: center;
}

.model-3d__fallback strong {
  font-size: 72px;
  font-weight: 200;
}
.model-3d__fallback span {
  max-width: 260px;
  line-height: 1.8;
  letter-spacing: 0.04em;
}

.model-3d__hint {
  position: absolute;
  left: 12px;
  bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-faint);
  font-size: 9px;
  letter-spacing: 0.1em;
  pointer-events: none;
}

.model-3d__hint svg,
.model-3d__reset svg {
  width: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.4;
}

.model-3d__reset {
  position: absolute;
  right: 10px;
  bottom: 0;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: rgba(7, 7, 8, 0.66);
  color: var(--color-text-muted);
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition:
    color var(--motion-fast),
    border-color var(--motion-fast),
    transform var(--motion-fast);
}

.model-3d__reset:hover {
  color: var(--color-text);
  border-color: var(--color-border-strong);
  transform: rotate(-18deg);
}

@keyframes model-loading {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 520px) {
  .model-3d {
    inset: 34px -18px 30px;
  }
  .model-3d__hint {
    left: 20px;
  }
  .model-3d__reset {
    right: 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .model-3d__loading span {
    animation: none;
  }
}
</style>
