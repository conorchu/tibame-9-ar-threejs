import * as THREE from "three";
import { MindARThree } from "mindar-image-three";
import { ROUTE } from "./route.js";

const startButton = document.querySelector("#start-button");
const guideState = document.querySelector("#guide-state");
const guideTitle = document.querySelector("#guide-title");
const guideMessage = document.querySelector("#guide-message");
const hint = document.querySelector("#hint");
const errorCard = document.querySelector("#error-card");

const mindarThree = new MindARThree({
  container: document.querySelector("#ar-container"),
  imageTargetSrc: "./assets/tibame.mind",
  uiLoading: "no",
  uiScanning: "no",
  uiError: "no",
});

const { renderer, scene, camera } = mindarThree;

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const activeGuides = [];

function setGuideCopy(step, located = false) {
  guideTitle.textContent = step.title;
  guideMessage.textContent = step.instruction;

  if (!located) return;

  if (step.arrived) {
    guideState.textContent = "已抵達";
    guideState.className = "state state--arrived";
  } else if (step.safety) {
    guideState.textContent = "安全提示";
    guideState.className = "state state--stairs";
  } else {
    guideState.textContent = "✓ 已定位";
    guideState.className = "state state--located";
  }
}

function getPathPoints(rotationZ = 0, arrived = false) {
  const z = 0.05;

  if (arrived) {
    return [
      new THREE.Vector3(-0.12, -0.58, z),
      new THREE.Vector3(-0.12, -0.42, z),
      new THREE.Vector3(-0.12, -0.26, z),
      new THREE.Vector3(-0.12, -0.10, z),
    ];
  }

  // 左轉
  if (rotationZ === 90) {
    return [
      new THREE.Vector3(-0.10, -0.60, z),
      new THREE.Vector3(-0.10, -0.44, z),
      new THREE.Vector3(-0.10, -0.28, z),
      new THREE.Vector3(-0.18, -0.14, z),
      new THREE.Vector3(-0.32, -0.05, z),
    ];
  }

  // 右轉
  if (rotationZ === -90) {
    return [
      new THREE.Vector3(-0.10, -0.60, z),
      new THREE.Vector3(-0.10, -0.44, z),
      new THREE.Vector3(-0.10, -0.28, z),
      new THREE.Vector3(0.00, -0.14, z),
      new THREE.Vector3(0.16, -0.05, z),
    ];
  }

  // 往回
  if (Math.abs(rotationZ) === 180) {
    return [
      new THREE.Vector3(-0.10, -0.05, z),
      new THREE.Vector3(-0.10, -0.21, z),
      new THREE.Vector3(-0.10, -0.37, z),
      new THREE.Vector3(-0.10, -0.53, z),
    ];
  }

  // 直走
  return [
    new THREE.Vector3(-0.10, -0.60, z),
    new THREE.Vector3(-0.10, -0.46, z),
    new THREE.Vector3(-0.10, -0.32, z),
    new THREE.Vector3(-0.10, -0.18, z),
    new THREE.Vector3(-0.10, -0.04, z),
  ];
}

function makeChevronMesh(color = 0xffffff) {
  const shape = new THREE.Shape();

  shape.moveTo(-0.09, 0.065);
  shape.lineTo(-0.02, 0.0);
  shape.lineTo(-0.09, -0.065);
  shape.lineTo(-0.035, -0.065);
  shape.lineTo(0.06, 0.0);
  shape.lineTo(-0.035, 0.065);
  shape.closePath();

  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.98,
    side: THREE.DoubleSide,
  });

  return new THREE.Mesh(geometry, material);
}

function makeHologramGuide(step) {
  const group = new THREE.Group();
  const color = 0xffffff;

  const points = getPathPoints(step.arrowRotationZ, step.arrived);
  const path = new THREE.CatmullRomCurve3(points);

  // 一串同樣大小的小點：不畫粗線，避免箭頭把路線蓋住
  const dots = [];
  const DOT_COUNT = 10;
  const DOT_RADIUS = 0.014;

  for (let index = 0; index < DOT_COUNT; index += 1) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(DOT_RADIUS, 18, 18),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.88,
      }),
    );

    // 只走到 72%，後面預留給箭頭，因此路線與箭頭不重疊
    const t = (index / (DOT_COUNT - 1)) * 0.72;
    dot.position.copy(path.getPointAt(t));

    group.add(dot);
    dots.push(dot);
  }

  // 三個大型 >>> 箭頭，放在點點前方
  const arrowGroup = new THREE.Group();

  for (let index = 0; index < 3; index += 1) {
    const chevron = makeChevronMesh(color);
    chevron.position.x = -index * 0.115;
    arrowGroup.add(chevron);
  }

  const arrowT = 0.90;
  const arrowPosition = path.getPointAt(arrowT);
  const tangent = path.getTangentAt(arrowT).normalize();
  const angle = Math.atan2(tangent.y, tangent.x);

  arrowGroup.position.copy(arrowPosition);
  arrowGroup.position.z += 0.018;
  arrowGroup.rotation.z = angle;

  group.add(arrowGroup);

  // 沿用之前手機測試時「整體縮小」的設定
  group.scale.setScalar(0.72);

  group.userData = {
    dots,
    arrowGroup,
    arrowBasePosition: arrowGroup.position.clone(),
    floatSeed: Math.random() * Math.PI * 2,
  };

  return group;
}

// 9 個 target 全部啟用
for (const step of ROUTE) {
  const anchor = mindarThree.addAnchor(step.targetIndex);
  const guide = makeHologramGuide(step);

  guide.visible = false;
  anchor.group.add(guide);
  activeGuides.push(guide);

  anchor.onTargetFound = () => {
    activeGuides.forEach((item) => {
      item.visible = false;
    });

    guide.visible = true;
    setGuideCopy(step, true);

    if (step.arrived) {
      hint.textContent = "Tibame 路線導引完成。";
    } else {
      const nextNumber = Math.min(step.targetIndex + 2, ROUTE.length);
      hint.textContent =
        `第 ${step.targetIndex + 1} 張已定位。依照白色點點與箭頭前進，再掃描第 ${nextNumber} 張地標。`;
    }
  };

  anchor.onTargetLost = () => {
    guide.visible = false;
  };
}

function animate(time) {
  const seconds = time * 0.001;

  for (const guide of activeGuides) {
    if (!guide.visible) continue;

    const {
      dots,
      arrowGroup,
      arrowBasePosition,
      floatSeed,
    } = guide.userData;

    // 整組導引輕微浮空
    guide.position.z =
      Math.sin(seconds * 2 + floatSeed) * 0.006;

    // 同樣大小的小點，只做亮度 / 輕微呼吸，不改成不同尺寸
    dots.forEach((dot, index) => {
      const pulse =
        0.96 +
        Math.sin(seconds * 5 - index * 0.55) * 0.06;

      dot.scale.setScalar(pulse);

      dot.material.opacity =
        0.58 +
        (index / dots.length) * 0.30 +
        Math.sin(seconds * 6 - index) * 0.05;
    });

    // 三箭頭上下漂浮 + 微呼吸
    arrowGroup.position.copy(arrowBasePosition);
    arrowGroup.position.z =
      arrowBasePosition.z +
      Math.sin(seconds * 4 + floatSeed) * 0.01;

    arrowGroup.scale.setScalar(
      1.0 + Math.sin(seconds * 4.5 + floatSeed) * 0.035,
    );
  }

  renderer.render(scene, camera);
}

async function startAR() {
  startButton.disabled = true;
  startButton.textContent = "正在開啟相機…";
  errorCard.hidden = true;

  try {
    await mindarThree.start();
    renderer.setAnimationLoop(animate);

    startButton.hidden = true;
    hint.textContent =
      "請先對準第 1 張 Tibame 地標；辨識成功後，會顯示白色浮空路線與箭頭。";
  } catch (error) {
    console.error(error);

    errorCard.hidden = false;
    startButton.disabled = false;
    startButton.textContent = "再試一次";
  }
}

startButton.addEventListener("click", startAR);
