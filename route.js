export const ROUTE = [

  {
    targetIndex: 0,
    title: "Tibame 已定位",
    instruction: "你快到Tibame了，找到正門口",
    direction: "right",

    // 點點數量
    dotCount: 10,

    // 點點間距
    dotSpacing: 0.13,
  },

  {
    targetIndex: 1,
    title: "已到正們口",
    instruction: "往前到電梯口，搭乘電梯",
    direction: "forward",

    dotCount: 14,
    dotSpacing: 0.13,
  },

  {
    targetIndex: 2,
    title: "電梯口",
    instruction: "請搭乘電梯到4樓",
    direction: "forward",

    dotCount: 8,
    dotSpacing: 0.13,
  },

  {
    targetIndex: 3,
    title: "4樓櫃台",
    instruction: "已到4樓櫃台，前往走廊",
    direction: "forward",

    dotCount: 10,
    dotSpacing: 0.13,
  },

  {
    targetIndex: 4,
    title: "前往走廊",
    instruction: "前往走廊，請往右轉",
    direction: "right",

    dotCount: 18,
    dotSpacing: 0.13,
  },

  {
    targetIndex: 5,
    title: "走廊",
    instruction: "請往左轉",
    direction: "left",

    dotCount: 12,
    dotSpacing: 0.13,
  },

  {
    targetIndex: 6,
    title: "走廊",
    instruction: "繼續往前走，左轉",
    direction: "left",

    dotCount: 20,
    dotSpacing: 0.13,
  },

  {
    targetIndex: 7,
    title: "走廊",
    instruction: "繼續往前走，右轉",
    direction: "right",

    dotCount: 16,
    dotSpacing: 0.13,
  },

  {
    targetIndex: 8,
    title: "已抵達",
    instruction: "你已抵達目的地",
    direction: "arrived",

    // 抵達時不需要點點
    dotCount: 0,
    dotSpacing: 0.13,

    arrived: true,
  },

];