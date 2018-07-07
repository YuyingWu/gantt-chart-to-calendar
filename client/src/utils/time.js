const bigMonth = [1, 3, 5, 7, 8, 10, 12]

export default {
  // 获取月份的天数
  getMonthDay (time) {
    const year = time.getFullYear()
    const month = time.getMonth() + 1

    if (month === 2) {
      return this.isLeapYear(year) ? 29 : 28
    }

    return bigMonth.indexOf(month) > -1 ? 31 : 30
  },
  isLeapYear (year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  }
}
