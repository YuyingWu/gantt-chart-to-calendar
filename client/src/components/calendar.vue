<template>
  <div class="mod-calendar">
    <div class="week">
      <div class="item">星期天</div>
      <div class="item">星期一</div>
      <div class="item">星期二</div>
      <div class="item">星期三</div>
      <div class="item">星期四</div>
      <div class="item">星期五</div>
      <div class="item">星期六</div>
    </div>
    <div v-for="(row, i) in dates" :key="`${year}-${month}-${i}`" class="row">
      <div
        v-for="(item, j) in row"
        :key="`${year}-${month}-${row}-${j}`"
        :class="['item', 'date', item.type ? '' : 'disabled', item.current ? 'today' : '']"
      >
        <div class="info">
          <span>{{ item.index }}</span>
        </div>
      </div>
      <div class="tasks">
        <div
          v-for="(task, k) in tasks[i]"
          :key="`${year}-${month}-${i}-task-${k}`"
          class="task"
          :style="{
            width: task.style.width,
            left: task.style.left,
            top: task.style.top,
            backgroundColor: task.style.color
          }"
          :title="task.title"
        >
          <div class="done" :style="{
            width: task.style.done,
            backgroundColor: task.style.darkColor
          }"></div>
          <span v-if="task.type === 'develop'" @click="selectTask(task)">
            <i class="product" :style="{
              backgroundColor: task.style.productColor
            }">
              {{ task.productLine.substr(0, 1) }}
            </i>
            {{ `[${task.assigned}] ${task.title}` }}
          </span>
          <span v-else class="milestone" @click="selectTask(task)">
            <i :class="['icon', 'icon-qizi', `icon-${task.type}`]"></i>
            {{ task.name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import timeUtil from '../utils/time'
import topUtil from '../utils/top'
import colorUtil from '../utils/color'

const oneDay = 24 * 3600 * 1000
const columnWidth = 100 / 7
const morningTime = 8 * 3600 * 1000
const afternoonTime = 13 * 3600 * 1000

export default {
  data () {
    return {
      tasks: [],
      dates: []
    }
  },
  created () {
    this.generate()
  },
  watch: {
    year () {
      this.generate()
    },
    month () {
      this.generate()
    },
    list () {
      this.generate()
    }
  },
  props: {
    year: {
      type: Number,
      required: true
    },
    month: {
      type: Number,
      required: true
    },
    list: {
      type: Array,
      required: true
    },
    developers: {
      type: Array,
      required: true
    },
    productColors: {
      type: Object,
      required: true
    },
    onSelected: {
      type: Function,
      required: true
    }
  },
  methods: {
    generate () {
      const { year, month, list } = this

      if (!list.length) {
        return
      }

      const time = new Date(`${year}-${month}`)
      const startIndex = time.getDay()
      const endIndex = startIndex + timeUtil.getMonthDay(time)
      const lastMonthDays = timeUtil.getMonthDay(new Date(`${year}-${month - 1}`))
      const now = new Date().getTime()
      const dates = []
      let row = []
      let idx = 0
      let _date = 0
      let _time = 0

      // 计算日历
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 7; j++) {
          if (j === 0) {
            row = []
          }

          idx = i * 7 + j

          if (idx < startIndex) {
            _date = lastMonthDays - (startIndex - idx - 1)
            row.push({
              index: _date,
              type: 0,
              time: new Date(`${year}-${month - 1}-${_date}`).getTime(),
              task: []
            })
          } else if (idx >= endIndex) {
            _date = idx - endIndex + 1
            row.push({
              index: _date,
              type: 0,
              time: new Date(`${year}-${month + 1}-${_date}`).getTime(),
              task: []
            })
          } else {
            _date = idx - startIndex + 1
            _time = new Date(`${year}-${month}-${_date}`).getTime()
            row.push({
              index: _date,
              type: 1,
              time: _time,
              current: _time < now && now - _time < oneDay,
              task: []
            })
          }

          if (j === 6) {
            dates.push(row)
          }
        }
      }

      // 筛选出日期范围内的任务
      let startTime = dates[0][0].time
      let endTime = dates[5][6].time + oneDay
      const tasksOnRange = []
      list.forEach((item, idx) => {
        if (item.hidden) {
          return
        }

        const develop = item.develop
        const jointDebug = item.jointDebug
        const test = item.test
        const publish = item.publish

        if ((develop.startTime > startTime && develop.startTime < endTime) || (develop.startTime < startTime && develop.endTime > startTime)) {
          tasksOnRange.push({
            ...item,
            type: 'develop',
            ...develop
          })
        }

        if (jointDebug && ((jointDebug.startTime > startTime && jointDebug.startTime < endTime) || (jointDebug.startTime < startTime && jointDebug.endTime > startTime))) {
          tasksOnRange.push({
            ...item,
            type: 'jointDebug',
            name: '联调',
            ...jointDebug
          })
        }

        if (test && ((test.startTime > startTime && test.startTime < endTime) || (test.startTime < startTime && test.endTime > startTime))) {
          tasksOnRange.push({
            ...item,
            type: 'test',
            name: '测试',
            ...test
          })
        }

        if (publish && ((publish.startTime > startTime && publish.startTime < endTime) || (publish.startTime < startTime && publish.endTime > startTime))) {
          tasksOnRange.push({
            ...item,
            type: 'publish',
            name: '发布',
            ...publish
          })
        }
      })
      tasksOnRange.sort((a, b) => {
        return a.startTime - b.startTime
      })

      const tasks = []
      const colors = {}

      // 按周排列任务，计算排列
      dates.forEach(week => {
        startTime = week[0].time
        endTime = week[6].time + oneDay
        const taskList = JSON.parse(JSON.stringify(
          _.filter(tasksOnRange, item => {
            return (item.startTime > startTime && item.startTime < endTime) || (item.startTime < startTime && item.endTime > startTime)
          })
        ))
        const topList = []

        taskList.forEach((task, i) => {
          let effort = task.effort
          let start = 1
          let done = task.effort * task.done

          if (task.startTime > startTime) {
            start = Math.floor((task.startTime - startTime) / oneDay)
            const hour = task.startTime - startTime - start * oneDay

            if (hour >= afternoonTime) {
              start += 0.5 + (hour - afternoonTime) / morningTime
            } else {
              start += (hour - morningTime) / morningTime
            }
          } else {
            const dev = Math.floor((startTime - task.startTime) / oneDay)
            effort -= dev
            done -= dev
          }

          if (effort + start > 6) {
            const newEffort = 6 - start
            effort = newEffort
          }

          if (done > effort) {
            done = effort
          }

          const color = colorUtil(colors, task.index)
          const style = {
            left: start * columnWidth,
            width: columnWidth * effort
          }
          style.top = topUtil(topList, style) * 24

          task.style = {
            left: `${style.left}%`,
            width: `${style.width}%`,
            top: `${style.top}px`,
            color: `hsl(${color}, 100%, 90%)`,
            darkColor: `hsl(${color}, 100%, 30%)`,
            done: `${done / effort * 100}%`,
            productColor: `hsl(${this.productColors[task.productLine]}, 80%, 50%)`
          }
        })

        tasks.push(taskList)
      })

      this.dates = dates
      this.tasks = tasks
    },
    selectTask (item) {
      this.onSelected(item.index)
    }
  }
}
</script>
