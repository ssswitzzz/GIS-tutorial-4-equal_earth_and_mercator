export const MERCATOR_BEATS = [
  {start: 0, end: 9, title: '墨卡托，究竟错在哪？', eyebrow: '先看它为什么诞生'},
  {start: 9, end: 23, title: '1569 年，为航海而作。', eyebrow: '赫拉杜斯·墨卡托'},
  {start: 23, end: 35, title: '一张纸，卷成圆柱。', eyebrow: '理解构造的第一步'},
  {start: 35, end: 45, title: '相切的地方，是赤道。', eyebrow: '正轴切圆柱的几何框架'},
  {start: 45, end: 49, title: '把球面坐标，映到圆柱上。', eyebrow: '经纬线与海岸轮廓的对应'},
  {start: 49, end: 61, title: '沿经线切开，展开地图。', eyebrow: '由球面坐标，到平面坐标'},
  {start: 61, end: 74, title: '汇聚的经线，变成平行线。', eyebrow: '失真从这里开始'},
  {start: 74, end: 86, title: '越靠近两极，横向越被拉宽。', eyebrow: '同样的经度差，不同的实际距离'},
  {start: 86, end: 98, title: '只拉横向，角度就变了。', eyebrow: '还差关键的一步'},
  {start: 98, end: 115, title: '两个方向，同样地拉伸。', eyebrow: '墨卡托的等角条件'},
  {start: 115, end: 135, title: '固定航向，画成一条直线。', eyebrow: '等角航线的航海价值'},
  {start: 135, end: 151, title: '保住角度，面积付出代价。', eyebrow: '高纬度的尺度膨胀'},
  {start: 151, end: 161, title: '两极，永远画不到。', eyebrow: '坐标没有有限的终点'},
  {start: 161, end: 173, title: '为什么导航仍然使用它？', eyebrow: '回到今天的日常地图'},
  {start: 173, end: 184, title: '看清局部方向，也要理解尺度。', eyebrow: '投影的价值，取决于用途'},
] as const;
export const M = {wrap: 23, wrapped: 34, equator: 35, print: 45, unwrap: 49, flat: 59, meridians: 61, east: 74, wrong: 86, correct: 98, corrected: 111, route: 115, arrive: 132, inflation: 135, poles: 151, navigation: 161, turn: 170, end: 184} as const;
export const mercatorFrames = (fps: number) => Object.fromEntries(Object.entries(M).map(([key, value]) => [key, Math.round(value * fps)])) as Record<keyof typeof M, number>;
