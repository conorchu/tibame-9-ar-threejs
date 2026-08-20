import * as THREE from "three";
import { MindARThree } from "mindar-image-three";
import { ROUTE } from "./route.js";

// ==================================================
// DOM
// ==================================================

const startButton = document.querySelector("#start-button");
const guideState = document.querySelector("#guide-state");
const guideTitle = document.querySelector("#guide-title");
const guideMessage = document.querySelector("#guide-message");
const hint = document.querySelector("#hint");
const errorCard = document.querySelector("#error-card");

// ==================================================
// MindAR
// ==================================================

const mindarThree = new MindARThree({
  container: document.querySelector("#ar-container"),
  imageTargetSrc: "./assets/targets.mind",
  uiLoading: "no",
  uiScanning: "no",
  uiError: "no",
});

const { renderer, scene, camera } = mindarThree;

const activeGuides = [];

// ==================================================
// 更新文字
// ==================================================

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

// ==================================================
// 建立白色＋藍框箭頭
// ==================================================

function createChevron() {
  const group = new THREE.Group();

  // ==================================================
  // 藍色外框
  // ==================================================

  const outerShape = new THREE.Shape();

  outerShape.moveTo(-0.12, 0.09);
  outerShape.lineTo(-0.025, 0);
  outerShape.lineTo(-0.12, -0.09);
  outerShape.lineTo(-0.055, -0.09);
  outerShape.lineTo(0.07, 0);
  outerShape.lineTo(-0.055, 0.09);
  outerShape.closePath();

  const outerGeometry =
    new THREE.ShapeGeometry(outerShape);

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

  // ==================================================
  // 白色內層
  // ==================================================

  const innerShape = new THREE.Shape();

  innerShape.moveTo(-0.095, 0.06);
  innerShape.lineTo(-0.025, 0);
  innerShape.lineTo(-0.095, -0.06);
  innerShape.lineTo(-0.055, -0.06);
  innerShape.lineTo(0.035, 0);
  innerShape.lineTo(-0.055, 0.06);
  innerShape.closePath();

  const innerGeometry =
    new THREE.ShapeGeometry(innerShape);

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

// ==================================================
// 建立抵達 Pin
// ==================================================

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

  // ==================================================
  // Pin 中央白色圓孔
  // ==================================================

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

// ==================================================
// 建立箭頭
// ==================================================

function createArrowGuide(step) {
  const arrowGroup =
    new THREE.Group();

  // ==================================================
  // FORWARD
  // ==================================================

  if (step.direction === "forward") {

    for (let i = 0; i < 3; i++) {

      const arrow =
        createChevron();

      // 原始 >>> 
      // 旋轉 90° → ↑

      arrow.rotation.z =
        THREE.MathUtils.degToRad(90);

      // 三個箭頭沿著前方排列

      arrow.position.y =
        i * 0.17;

      arrowGroup.add(arrow);
    }

    // ==================================================
    // ★ Forward 水平貼地
    // ==================================================
    //
    // 使用 -90°
    // 避免躺到地板後方向反轉
    //

    arrowGroup.rotation.x =
      THREE.MathUtils.degToRad(-90);

    // ==================================================
    // ★ Forward 箭頭高度
    // ==================================================
    //
    // 數值越接近 0 → 越高
    // 數值越負 → 越低
    //

    arrowGroup.position.set(
      0,
      -0.35,
      0.07
    );
  }

  // ==================================================
  // RIGHT
  // ==================================================

  else if (step.direction === "right") {

    for (let i = 0; i < 3; i++) {

      const arrow =
        createChevron();

      // >>> 保持原方向

      arrow.position.x =
        i * 0.20;

      arrowGroup.add(arrow);
    }

    // ==================================================
    // Right 保持原本垂直方向
    // ==================================================

    arrowGroup.position.set(
      -0.20,
      -0.14,
      0.07
    );
  }

  // ==================================================
  // LEFT
  // ==================================================

  else if (step.direction === "left") {

    for (let i = 0; i < 3; i++) {

      const arrow =
        createChevron();

      // >>> → <<<

      arrow.rotation.z =
        Math.PI;

      arrow.position.x =
        -i * 0.20;

      arrowGroup.add(arrow);
    }

    // ==================================================
    // Left 保持原本垂直方向
    // ==================================================

    arrowGroup.position.set(
      0.20,
      -0.14,
      0.07
    );
  }

  // ==================================================
  // ARRIVED
  // ==================================================

  else if (
    step.direction === "arrived" ||
    step.arrived
  ) {

    const pin =
      createLocationPin();

    pin.position.set(
      0,
      0.14,
      0.07
    );

    arrowGroup.add(pin);

    // 抵達時不需要箭頭高度調整
  }

  // ==================================================
  // DEFAULT
  // ==================================================

  else {

    for (let i = 0; i < 3; i++) {

      const arrow =
        createChevron();

      arrow.rotation.z =
        THREE.MathUtils.degToRad(90);

      arrow.position.y =
        i * 0.17;

      arrowGroup.add(arrow);
    }

    arrowGroup.position.set(
      0,
      -0.35,
      0.07
    );
  }

  // ==================================================
  // ★ 箭頭整體放大
  // ==================================================

  arrowGroup.scale.setScalar(1.6);

  return arrowGroup;
}

// ==================================================
// 建立整組 AR 導引
// ==================================================

function createGuide(step) {

  const group =
    new THREE.Group();

  // ==================================================
  // 只有箭頭
  // ==================================================

  const arrowGroup =
    createArrowGuide(step);

  group.add(arrowGroup);

  // ==================================================
  // 整體縮放
  // ==================================================

  group.scale.setScalar(0.85);

  // ==================================================
  // 動畫資料
  // ==================================================

  group.userData = {

    arrowGroup,

    baseArrowX:
      arrowGroup.position.x,

    baseArrowY:
      arrowGroup.position.y,

    baseArrowZ:
      arrowGroup.position.z,

    floatSeed:
      Math.random() *
      Math.PI *
      2,
  };

  return group;
}

// ==================================================
// 建立所有 Target
// ==================================================

ROUTE.forEach((step) => {

  const anchor =
    mindarThree.addAnchor(
      step.targetIndex
    );

  const guide =
    createGuide(step);

  guide.visible = false;

  anchor.group.add(
    guide
  );

  activeGuides.push(
    guide
  );

  // ==================================================
  // Target 找到
  // ==================================================

  anchor.onTargetFound = () => {

    // 只顯示目前這一站

    activeGuides.forEach(
      (item) => {
        item.visible = false;
      }
    );

    guide.visible = true;

    setGuideText(step);

    // ==================================================
    // UI 提示
    // ==================================================

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

  // ==================================================
  // Target 離開鏡頭
  // ==================================================

  anchor.onTargetLost = () => {

    guide.visible = false;

    console.log(
      "LOST TARGET:",
      step.targetIndex
    );
  };
});

// ==================================================
// 浮空動畫
// ==================================================

function animate(time) {

  const seconds =
    time * 0.001;

  activeGuides.forEach(
    (guide) => {

      if (!guide.visible) {
        return;
      }

      const {
        arrowGroup,
        baseArrowX,
        baseArrowY,
        baseArrowZ,
        floatSeed,
      } = guide.userData;

      // ==================================================
      // 整組 AR 微微浮動
      // ==================================================

      guide.position.z =
        Math.sin(
          seconds * 2 +
          floatSeed
        ) * 0.006;

      // ==================================================
      // 箭頭獨立浮動
      // ==================================================

      arrowGroup.position.x =
        baseArrowX;

      arrowGroup.position.y =
        baseArrowY +
        Math.sin(
          seconds * 3 +
          floatSeed
        ) * 0.012;

      arrowGroup.position.z =
        baseArrowZ;
    }
  );

  renderer.render(
    scene,
    camera
  );
}

// ==================================================
// 啟動 AR
// ==================================================

async function startAR() {

  startButton.disabled =
    true;

  startButton.textContent =
    "正在開啟相機…";

  errorCard.hidden =
    true;

  try {

    await mindarThree.start();

    renderer.setAnimationLoop(
      animate
    );

    startButton.hidden =
      true;

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

    errorCard.hidden =
      false;

    startButton.disabled =
      false;

    startButton.textContent =
      "再試一次";
  }
}

// ==================================================
// Button
// ==================================================

startButton.addEventListener(
  "click",
  startAR
);