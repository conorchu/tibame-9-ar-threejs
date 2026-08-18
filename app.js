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
  imageTargetSrc: "./assets/targets.mind",
  uiLoading: "no",
  uiScanning: "no",
  uiError: "no",
});

const { renderer, scene, camera } = mindarThree;

const activeGuides = [];

function setGuideText(step) {
  guideTitle.textContent = step.title;
  guideMessage.textContent = step.instruction;

  if (step.arrived) {
    guideState.textContent = "已抵達";
    guideState.className = "state state--arrived";
  } else {
    guideState.textContent = "✓ 已定位";
    guideState.className = "state state--located";
  }
}

function createDot() {
  const geometry = new THREE.SphereGeometry(0.018, 16, 16);

  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
  });

  return new THREE.Mesh(geometry, material);
}

function createChevron() {
  const shape = new THREE.Shape();

  shape.moveTo(-0.09, 0.06);
  shape.lineTo(-0.02, 0);
  shape.lineTo(-0.09, -0.06);

  shape.lineTo(-0.04, -0.06);
  shape.lineTo(0.06, 0);
  shape.lineTo(-0.04, 0.06);

  shape.closePath();

  const geometry = new THREE.ShapeGeometry(shape);

  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
  });

  return new THREE.Mesh(geometry, material);
}

function createGuide(step) {
  const group = new THREE.Group();

  const dots = [];

  const dotPositions = [
    [0, -0.55, 0.05],
    [0, -0.43, 0.05],
    [0, -0.31, 0.05],
    [0, -0.19, 0.05],
    [0, -0.07, 0.05],
  ];

  dotPositions.forEach((position) => {
    const dot = createDot();

    dot.position.set(
      position[0],
      position[1],
      position[2]
    );

    group.add(dot);

    dots.push(dot);
  });

  const arrowGroup = new THREE.Group();

  for (let i = 0; i < 3; i++) {
    const arrow = createChevron();

    arrow.position.x = i * 0.11;

    arrowGroup.add(arrow);
  }

  arrowGroup.position.set(
    -0.11,
    0.12,
    0.07
  );

  const rotation =
    THREE.MathUtils.degToRad(
      step.arrowRotationZ || 0
    );

  arrowGroup.rotation.z = rotation;

  group.add(arrowGroup);

  group.scale.setScalar(0.72);

  group.userData = {
    dots,
    arrowGroup,
    baseArrowY: arrowGroup.position.y,
  };

  return group;
}

ROUTE.forEach((step) => {
  const anchor =
    mindarThree.addAnchor(step.targetIndex);

  const guide =
    createGuide(step);

  guide.visible = false;

  anchor.group.add(guide);

  activeGuides.push(guide);

  anchor.onTargetFound = () => {
    activeGuides.forEach((item) => {
      item.visible = false;
    });

    guide.visible = true;

    setGuideText(step);

    if (step.arrived) {
      hint.textContent =
        "已抵達目的地。";
    } else {
      hint.textContent =
        `第 ${step.targetIndex + 1} 張地標已定位`;
    }

    console.log(
      `Target ${step.targetIndex} found`
    );
  };

  anchor.onTargetLost = () => {
    guide.visible = false;

    console.log(
      `Target ${step.targetIndex} lost`
    );
  };
});

function animate(time) {
  const seconds =
    time * 0.001;

  activeGuides.forEach(
    (guide, guideIndex) => {

      if (!guide.visible) {
        return;
      }

      const {
        dots,
        arrowGroup,
        baseArrowY,
      } = guide.userData;

      dots.forEach(
        (dot, index) => {

          const scale =
            1 +
            Math.sin(
              seconds * 4 -
              index * 0.6
            ) * 0.08;

          dot.scale.setScalar(scale);
        }
      );

      arrowGroup.position.y =
        baseArrowY +
        Math.sin(
          seconds * 3 +
          guideIndex
        ) * 0.015;
    }
  );

  renderer.render(
    scene,
    camera
  );
}

async function startAR() {

  startButton.disabled = true;

  startButton.textContent =
    "正在開啟相機…";

  errorCard.hidden = true;

  try {

    await mindarThree.start();

    renderer.setAnimationLoop(
      animate
    );

    startButton.hidden = true;

    hint.textContent =
      "請將鏡頭對準第 1 張 Tibame 地標";

    console.log(
      "MindAR started successfully"
    );

  } catch (error) {

    console.error(
      "MindAR start error:",
      error
    );

    errorCard.hidden = false;

    startButton.disabled = false;

    startButton.textContent =
      "再試一次";
  }
}

startButton.addEventListener(
  "click",
  startAR
);