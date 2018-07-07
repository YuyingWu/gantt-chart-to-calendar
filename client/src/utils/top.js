// 根据排列情况，计算TOP，保证不互相覆盖

export default function (list = [], style) {
  const { left, width } = style
  const len = list.length
  let item
  let idx = -1

  if (len) {
    for (let i = 0; i < len; i++) {
      item = list[i]

      if (item <= left) {
        list[i] = left + width
        idx = i
        break
      }
    }

    if (idx === -1) {
      list.push(left + width)
      idx = len
    }

    return idx
  } else {
    list.push(left + width)
    return 0
  }
}
