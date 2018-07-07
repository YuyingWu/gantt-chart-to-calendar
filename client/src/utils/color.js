// 颜色生成器，基于[HSL](https://baike.baidu.com/item/HSL)，这里只生成H: 色相
// 按照平分原则，拆分六大主色

const colors = [0, 60, 120, 180, 240]
let radix = 30

for (; radix >= 7;) {
  for (let i = 0, len = colors.length; i < len; i++) {
    const val = colors[i] + radix

    if (val <= 255) {
      colors.push(val)
    }
  }

  radix = Math.ceil(radix / 2)
}

export default function (map = {}, index) {
  const idx = Object.keys(map).length

  if (typeof map[index] === 'undefined') {
    map[index] = colors[idx]
  }

  return map[index]
}
