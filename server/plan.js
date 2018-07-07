const fs = require('fs')
const path = require('path')
const csv = require('csv')
const _ = require('lodash')

const typeMap = {
  0: 'develop',
  1: 'join'
}
const regJira = /^[a-zA-Z\d]+\-\d+$/
const regDevelop = /^开发( #\d)?$/
const twoHour = 2 * 3600 * 1000

/**
{
  productLine: '',  // 产品线
  title: '',        // 任务名称
  url: 'jira',      // jira地址，从名称中获取
  assigned: '',     // 分配
  // 开发
  develop: {
    startTime: 0,     // 开始时间
    endTime: '',      // 结束时间
    effort: '',       // 工时
    done: '',         // 完成度
  },
  // 联调
  jointDebug: {
    startTime: 0,     // 开始时间
    endTime: '',      // 结束时间
    effort: '',       // 工时
    done: '',         // 完成度
  },
  // 测试
  test: {
    startTime: 0,     // 开始时间
    endTime: '',      // 结束时间
    effort: '',       // 工时
    done: '',         // 完成度
  },
  // 发布
  publish: {
    startTime: 0,     // 开始时间
    endTime: '',      // 结束时间
    effort: '',       // 工时
    done: '',         // 完成度
  }
}
*/

function csv2json() {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname, './plan.csv'), {
      encoding: 'utf8'
    }, (err, content) => {
      if (err) {
        console.log('file', err)
        reject(err)
      }

      try {
        csv.parse(content, {}, (err, data) => {
          if (err) {
            console.log('parse', err)
          }

          data.splice(0, 1)

          // 取出第一列，任务为叶子节点
          const indexList = data.map(item => item[0])
          const productLineMap = {} // 产品Map
          const taskIndexList = []  // 任务列表
          const milestoneIndexList = [] // 里程碑列表
          indexList.forEach((item, i) => {
            if (item.indexOf('.') === -1) {
              productLineMap[item] = data[i][1]

              return
            }

            const idx = indexList.findIndex(val => {
              return val !== item && val.indexOf(item) === 0
            })

            if (idx === -1) {
              if (/^(联调|测试|发布)$/.test(data[i][1])) {
                milestoneIndexList.push(i)
              } else {
                taskIndexList.push(i)
              }
            }
          })

          const taskList = []
          const noPlanTaskList = []
          const developerList = []

          taskIndexList.forEach(i => {
            const item = data[i]
            const assigned = item[8]
            let index = item[0]
            const product = index.split('.')[0]
            let title = item[1]
            const match = title.match(regDevelop)
            const task = {
              index: index,
              title: '',
              url: ''
            }

            // 处理标题
            if (match) {
              if (!match[1] && data[i + 1] && data[i + 1][0] === index) {
                task.hidden = true
              }

              const parent = _.findLast(data, elem => {
                return elem[0] === index.split('.').slice(0, -1).join('.')
              }, i)
              
              if (parent) {
                title = parent[1]
              }
            }
            
            task.productLine = productLineMap[product]
            title = title.split(/\s/g)

            if (title.length && regJira.test(title[0])) {
              task.url = `http://jira.haihangyun.com/browse/${title[0]}`
              title.splice(0, 1)
            }

            task.title = title.join(' ')

            if (assigned) {
              // 已排期
              const detail = {
                develop: {
                  startTime: timeConvert(item[2]),
                  endTime: timeConvert(item[3]),
                  effort: effortConvert(item[5]),
                  done: percentConvert(item[6]),
                },
                assigned: assigned,
                jointDebug: null,
                test: null,
                publish: null
              }

              taskList.push({
                ...task,
                ...detail
              })

              if (developerList.indexOf(assigned) === -1) {
                developerList.push(assigned)
              }
            } else {
              // 未排期
              noPlanTaskList.push(task)
            }
          })

          // 里程碑找出相关联的任务
          milestoneIndexList.forEach(i => {
            const milestone = data[i]
            const prerequisites = milestone[15]
            const title = milestone[1]
            const effort = effortConvert(milestone[5])

            prerequisites.split(', ').forEach((item, idx) => {
              const tasks = _.filter(taskList, elem => elem.index === item)
              const len = tasks.length
              
              if (!len) {
                return
              }

              let startTime = timeConvert(milestone[2])

              if (!effort) {
                idx = idx % 4

                if (idx >= 2) {
                  startTime += (0.5 + idx) * twoHour
                } else {
                  startTime += idx * twoHour
                }
              }

              tasks.forEach((task, idx) => {
                if (idx > 1) {
                  return
                }

                const prefix = ['joint', 'test', 'publish'][['联调', '测试', '发布'].indexOf(title)]
                task[prefix] = {
                  startTime: startTime,
                  endTime: timeConvert(milestone[3]),
                  effort: effort || 0.25,
                  done: percentConvert(milestone[6]),
                }
              })
            })
          })

          resolve({
            list: taskList,
            noPlanList: noPlanTaskList,
            developerList: developerList,
            productList: Object.values(productLineMap)
          })
        })
      } catch (e) {
        reject(e)
      }
    })
  })
}

// 百分比转换
function percentConvert(value) {
  return value.substr(0, value.length - 1) / 100
}

// 12小时制转换
const regHour12 = /^(上午|下午)(.+)$/

function timeConvert(value) {
  const split = value.split(' ')
  const match = split[1].match(regHour12)

  if (match) {
    let time = new Date(split[0] + ' ' + match[2]).getTime()

    if (match[1] === '下午') {
      time += 12 * 3600 * 1000
    }

    return time
  }

  return 0
}

// 工时转换
const regEffort = /^(\d)(.+)$/

function effortConvert(value) {
  return value.split(' ').reduce(caculate, 0)
}

function caculate(total, value) {
  const match = value.match(regEffort)

  if (match) {
    const val = parseInt(match[1])
    const unit = match[2]

    switch (unit) {
      case '月':
        total += 20 * val
        break
      case '周':
        total += 5 * val
        break
      case '天':
        total += val
        break
      case '小时':
        total += val / 8
        break
    }
  }
}

module.exports = csv2json

const compile2LocalFile = function() {
  csv2json().then(data => {
    fs.writeFileSync('data.json', JSON.stringify(data));
  });
}

module.exports.compile2LocalFile = compile2LocalFile;