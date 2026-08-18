import * as THREE from "three";
import { MindARThree } from "mindar-image-three";
import { ROUTE } from "./route.js";

// =========================
// DOM
// =========================

const startButton = document.querySelector("#start-button");
const guideState = document.querySelector("#guide-state");
const guideTitle = document.querySelector("#guide-title");
const guideMessage = document.querySelector("#guide-message");
const hint = document.querySelector("#hint");
const errorCard = document.querySelector("#error-card");

// =========================
// MindAR
// =========================

const mindarThree = new MindARThree({
  container: document.querySelector("#ar-container"),
  imageTargetSrc: "./assets/targets.mind",
  uiLoading: "no",
  uiScanning: "no",
  uiError: "no",
});

const { renderer, scene, camera } = mindarThree;

const activeGuides = [];

// =========================
// 更新文字
// =========================

function setGuideText(step) {
  guideTitle.textContent = step.title;
  guideMessage.textContent = step.instruction;

  if (step.arrived || step.direction === "arrived") {
    guideState.textContent = "已抵達";
    guideState.className = "state state--arrived";
  } else {
    guideState.textContent = "✓ 已定位";
    guideState.className = "state state--located";
  }
}

// =========================
// 建立藍色點點
// =========================

function createDot() {
  const geometry = new THREE.SphereGeometry(
    0.018,
    20,
    20
  );

  const material = new THREE.MeshBasicMaterial({
    color: 0x2f80ed,
    transparent: true,
    opacity: 0.95,
  });

  return new THREE.Mesh(
    geometry,
    material
  );
}

// =========================
// 建立白色＋藍框箭頭
// =========================

function createChevron() {
  const group = new THREE.Group();

  // 藍色外框
  const outerShape = new THREE.Shape();

  outerShape.moveTo(-0.12, 0.09);
  outerShape.lineTo(-0.025, 0);
  outerShape.lineTo(-0.12, -0.09);
  outerShape.lineTo(-0.055, -0.09);
  outerShape.lineTo(0.07, 0);
  outerShape.lineTo(-0.055, 0.09);
  outerShape.closePath();

  const outerGeometry =
    new THREE.ShapeGeometry(
      outerShape
    );

  const outerMaterial =
    new THREE.MeshBasicMaterial({
      color: 0x2f80ed,
      side: THREE.DoubleSide,
    });

  const outerArrow =
    new THREE.Mesh(
      outerGeometry,
      outerMaterial
    );

  group.add(outerArrow);

  // 白色內層
  const innerShape = new THREE.Shape();

  innerShape.moveTo(-0.095, 0.06);
  innerShape.lineTo(-0.025, 0);
  innerShape.lineTo(-0.095, -0.06);
  innerShape.lineTo(-0.055, -0.06);
  innerShape.lineTo(0.035, 0);
  innerShape.lineTo(-0.055, 0.06);
  innerShape.closePath();

  const innerGeometry =
    new THREE.ShapeGeometry(
      innerShape
    );

  const innerMaterial =
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });

  const innerArrow =
    new THREE.Mesh(
      innerGeometry,
      innerMaterial
    );

  innerArrow.position.z = 0.002;

  group.add(innerArrow);

  return group;
}

// =========================
// 建立抵達 Pin
// =========================

function createLocationPin() {
  const group = new THREE.Group();

  const blueMaterial =
    new THREE.MeshBasicMaterial({
      color: 0x2f80ed,
      side: THREE.DoubleSide,
    });

  const whiteMaterial =
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });

  const shape = new THREE.Shape();

  shape.moveTo(0, -0.14);

  shape.bezierCurveTo(
    -0.04,
    -0.07,
    -0.12,
    -0.02,
    -0.12,
    0.08
  );

  shape.bezierCurveTo(
    -0.12,
    0.20,
    -0.06,
    0.27,
    0,
    0.27
  );

  shape.bezierCurveTo(
    0.06,
    0.27,
    0.12,
    0.20,
    0.12,
    0.08
  );

  shape.bezierCurveTo(
    0.12,
    -0.02,
    0.04,
    -0.07,
    0,
    -0.14
  );

  const geometry =
    new THREE.ShapeGeometry(shape);

  const pin =
    new THREE.Mesh(
      geometry,
      blueMaterial
    );

  group.add(pin);

  // Pin 中央白色圓孔
  const hole =
    new THREE.Mesh(
      new THREE.CircleGeometry(
        0.035,
        32
      ),
      whiteMaterial
    );

  hole.position.set(
    0,
    0.11,
    0.002
  );

  group.add(hole);

  return group;
}

// =========================
// 建立整組導引
// =========================

function createGuide(step) {
  const group = new THREE.Group();

  const dots = [];
  const arrowGroup = new THREE.Group();

  // 快速新增點點
  const addDot = (
    x,
    y,
    z = 0.04
  ) => {
    const dot = createDot();

    dot.position.set(
      x,
      y,
      z
    );

    group.add(dot);
    dots.push(dot);
  };

  // =========================
  // 前方
  // =========================

  if (step.direction === "forward") {
    addDot(0, -0.68);
    addDot(0, -0.55);
    addDot(0, -0.42);
    addDot(0, -0.29);
    addDot(0, -0.16);

    for (let i = 0; i < 3; i++) {
      const arrow = createChevron();

      arrow.rotation.z =
        THREE.MathUtils.degToRad(
          90
        );

      arrow.position.y =
        i * 0.17;

      arrowGroup.add(arrow);
    }

    arrowGroup.position.set(
      0,
      0.01,
      0.07
    );
  }

  // =========================
  // 右轉
  // =========================

  else if (step.direction === "right") {
    addDot(-0.12, -0.68);
    addDot(-0.12, -0.55);
    addDot(-0.12, -0.42);
    addDot(-0.12, -0.29);
    addDot(-0.12, -0.16);

    for (let i = 0; i < 3; i++) {
      const arrow = createChevron();

      arrow.position.x =
        i * 0.20;

      arrowGroup.add(arrow);
    }

    arrowGroup.position.set(
      -0.05,
      0.08,
      0.07
    );
  }

  // =========================
  // 左轉
  // =========================

  else if (step.direction === "left") {
    addDot(0.12, -0.68);
    addDot(0.12, -0.55);
    addDot(0.12, -0.42);
    addDot(0.12, -0.29);
    addDot(0.12, -0.16);

    for (let i = 0; i < 3; i++) {
      const arrow = createChevron();

      arrow.rotation.z =
        Math.PI;

      arrow.position.x =
        -i * 0.20;

      arrowGroup.add(arrow);
    }

    arrowGroup.position.set(
      0.05,
      0.08,
      0.07
    );
  }

  // =========================
  // 抵達
  // =========================

  else if (
    step.direction === "arrived" ||
    step.arrived
  ) {
    addDot(0, -0.68);
    addDot(0, -0.55);
    addDot(0, -0.42);
    addDot(0, -0.29);
    addDot(0, -0.16);

    const pin =
      createLocationPin();

    pin.position.set(
      0,
      0.08,
      0.07
    );

    arrowGroup.add(pin);
  }

  // =========================
  // 如果 route.js 沒寫 direction
  // 預設當作 forward
  // =========================

  else {
    addDot(0, -0.68);
    addDot(0, -0.55);
    addDot(0, -0.42);
    addDot(0, -0.29);
    addDot(0, -0.16);

    for (let i = 0; i < 3; i++) {
      const arrow = createChevron();

      arrow.rotation.z =
        THREE.MathUtils.degToRad(
          90
        );

      arrow.position.y =
        i * 0.17;

      arrowGroup.add(arrow);
    }

    arrowGroup.position.set(
      0,
      0.01,
      0.07
    );
  }

  group.add(arrowGroup);

  // 整組大小
  group.scale.setScalar(0.85);

  group.userData = {
    dots,
    arrowGroup,
    baseArrowY:
      arrowGroup.position.y,
    floatSeed:
      Math.random() *
      Math.PI *
      2,
  };

  return group;
}

// =========================
// 建立所有 Target
// =========================

ROUTE.forEach((step) => {
  const anchor =
    mindarThree.addAnchor(
      step.targetIndex
    );

  const guide =
    createGuide(step);

  guide.visible = false;

  anchor.group.add(guide);

  activeGuides.push(guide);

  // 掃描成功
  anchor.onTargetFound = () => {
    activeGuides.forEach(
      (item) => {
        item.visible = false;
      }
    );

    guide.visible = true;

    setGuideText(step);

    if (
      step.direction === "arrived" ||
      step.arrived
    ) {
      hint.textContent =
        "已抵達目的地";
    } else {
      hint.textContent =
        `第 ${
          step.targetIndex + 1
        } 張地標已定位`;
    }

    console.log(
      "FOUND TARGET:",
      step.targetIndex,
      step.direction
    );
  };

  // Target 離開鏡頭
  anchor.onTargetLost = () => {
    guide.visible = false;

    console.log(
      "LOST TARGET:",
      step.targetIndex
    );
  };
});

// =========================
// 浮空動畫
// =========================

function animate(time) {
  const seconds =
    time * 0.001;

  activeGuides.forEach(
    (guide) => {
      if (!guide.visible) {
        return;
      }

      const {
        dots,
        arrowGroup,
        baseArrowY,
        floatSeed,
      } = guide.userData;

      // 整組微微浮動
      guide.position.z =
        Math.sin(
          seconds * 2 +
          floatSeed
        ) * 0.006;

      // 點點微呼吸
      dots.forEach(
        (dot, index) => {
          const pulse =
            1 +
            Math.sin(
              seconds * 4 -
              index * 0.6
            ) * 0.06;

          dot.scale.setScalar(
            pulse
          );
        }
      );

      // 箭頭 / Pin 微微上下漂浮
      arrowGroup.position.y =
        baseArrowY +
        Math.sin(
          seconds * 3 +
          floatSeed
        ) * 0.012;
    }
  );

  renderer.render(
    scene,
    camera
  );
}

// =========================
// 啟動 AR
// =========================

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

// =========================
// Button
// =========================

startButton.addEventListener(
  "click",
  startAR
);