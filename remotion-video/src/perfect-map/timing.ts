export const NARRATION = [
  {key: 'impossible', start: 0, end: 10, text: '其实，在数学上，世界上根本就不存在一张完美的平面世界地图。'},
  {key: 'distance', start: 10, end: 26, text: '我们心目中一张真正“完美”的世界地图，本质上就是地图上任意两点之间的距离，都必须和现实世界分毫不差地成比例。'},
  {key: 'gauss', start: 26, end: 35, text: '但这扇通往完美的大门，早在两百年前就被数学家高斯给焊死了。'},
  {key: 'intrinsic', start: 35, end: 46, text: '早在两百年前，高斯就提出了著名的“绝妙定理”，用严谨的微分几何证明了：曲面的弯曲程度，高斯曲率，是内蕴的。'},
  {key: 'curvature', start: 46, end: 58, text: '地球表面是一个高斯曲率大于零的正球体，而平坦纸面的曲率是绝对的零。'},
  {key: 'flatten', start: 58, end: 70, text: '这意味着，球面上任意微小的局部，都不可能在不发生任何拉伸、挤压的前提下，贴合到平面上。'},
  {key: 'peel', start: 70, end: 86, text: '就像你要剥开橘子皮，在不撕破、不揉皱的前提下，是绝对不可能把这个橘子皮完整压平在桌面上的。'},
  {key: 'choices', start: 86, end: 94, text: '那怎么办呢？既然地球注定要变形，那制图师就只剩下了三种选择。'},
  {key: 'conformal', start: 94, end: 116, text: '你想保形状，等角？局部任何方向的拉伸比例必须一样，这样轮廓看着才不会歪；但代价就是纬度一高，网格被成倍成倍地无限放大，面积直接爆炸。'},
  {key: 'equalArea', start: 116, end: 138, text: '你想保面积，等积？横向被拉长了，纵向就必须被狠狠压瘪，两边乘积抵消掉才能保住平米数，结果大陆被挤压得像被车轮碾过。'},
  {key: 'equidistant', start: 138, end: 162, text: '你想保距离，等距？几何上，你最多只能保住以某一点为中心向外辐射的距离，或者某几条特定经纬线的距离，绝不可能保住全图任意两点间的距离。'},
  {key: 'conclusion', start: 162, end: 176, text: '这就是地图学里残酷的规则：当我们没法画出完美的地图，这时候每一张地图的绘制，本质上都是制图师权衡利弊后，主动选择的偏见。'},
] as const;

export const EVENTS = {
  routes: 11, secondRoute: 17, mismatch: 22,
  theorem: 26, sections: 36, curvature: 46,
  flatten: 58, flattenEnd: 66,
  peel: 70, cut: 74, spread: 78, spreadEnd: 85,
  choices: 86, conformal: 94, latitude: 100, highLatitude: 110,
  equalArea: 116, squeeze: 121, squeezed: 132,
  equidistant: 138, rays: 143, crossDistance: 152,
  conclusion: 162, final: 166, end: 176,
} as const;
export const getPerfectMapTimestamps = (fps: number) => Object.fromEntries(Object.entries(EVENTS).map(([key, value]) => [key, Math.round(value * fps)])) as Record<keyof typeof EVENTS, number>;
