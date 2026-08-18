// Tibame 9 張地標路線
// targetIndex 對應 MindAR Compiler 上傳順序：
// 第1張 = 0、第2張 = 1 ... 第9張 = 8。
//
// arrowRotationZ：
// 0 = 往前 / 上
// 90 = 左
// -90 = 右
// 180 = 往回 / 下
//
// 目前第 1～7 張先沿用之前 Tibame 的文字設定。
// 第 8～9 張先保留成可直接修改的欄位。

export const ROUTE = [
  {
    targetIndex: 0,
    title: "Tibame 正門已定位",
    instruction: "你已到 Tibame正門附近，往前走到進入大樓的路口",
    arrowRotationZ: 0,
  },
  {
    targetIndex: 1,
    title: "正門口",
    instruction: "往前走到大廳，搭電梯",
    arrowRotationZ: 0,
  },
  {
    targetIndex: 2,
    title: "已到電梯口",
    instruction: "請搭乘電梯到 4 樓",
    arrowRotationZ: 0,
  },
  {
    targetIndex: 3,
    title: "已到4樓櫃台",
    instruction: "往前走到走廊",
    arrowRotationZ: 0,
  },
  {
    targetIndex: 4,
    title: "已到走廊",
    instruction: "往右轉",
    arrowRotationZ: -90,
  },
  {
    targetIndex: 5,
    title: "走廊",
    instruction: "走到底，往左轉",
    arrowRotationZ: 90,
  },
  {
    targetIndex: 6,
    title: "走廊",
    instruction: "一路走到底，再往左轉",
    arrowRotationZ: 0,
  },
  {
    targetIndex: 7,
    title: "走廊",
    instruction: "一路走到底，再往右轉",
    arrowRotationZ: 0,
  },
  {
    targetIndex: 8,
    title: "已抵達",
    instruction: "Tibame 路線導引完成。",
    arrowRotationZ: 0,
    arrived: true,
  },
];

/**/
