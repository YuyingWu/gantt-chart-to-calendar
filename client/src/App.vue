<template>
  <div id="app">
    <div class="container">
      <el-form id="header" :inline="true">
        <el-form-item>
          <el-date-picker
            v-model="selectedTime"
            type="month"
            placeholder="选择月">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-select v-model="productLine" placeholder="请选择" @change="changeProductLine">
            <el-option
              v-for="item in productLines"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="developer" placeholder="请选择" @change="changeDeveloper">
            <el-option
              v-for="item in developers"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div id="content" v-loading="loading">
        <Calendar
          :year="year"
          :month="month"
          :developers="developers"
          :list="list"
          :product-colors="productColors"
          :onSelected="onSelected"
        >
        </Calendar>
        <Detail
          :task="task"
        >
        </Detail>
        <div v-if="!loading && !list.length" class="no-result">
          <p>本月暂无记录</p>
        </div>
      </div>
    </div>
    <Plan v-if="noPlanTaskList.length" :tasks="noPlanTaskList"></Plan>
  </div>
</template>

<script>
import _ from 'lodash'
import request from 'axios'
import Calendar from './components/calendar'
import Detail from './components/detail'
import Plan from './components/plan'
import colorUtil from './utils/color'

const planJSON = require('../static/plan.js');

export default {
  name: 'App',
  data () {
    return {
      year: 0,
      month: 0,
      day: 0,
      developer: '全部',
      productLine: '全部',
      developers: ['全部'],
      productLines: ['全部'],
      productColors: {},
      list: [],
      taskList: [],
      noPlanTaskList: [],
      selected: null,
      task: null,
      loading: false
    }
  },
  computed: {
    selectedTime: {
      get () {
        return this.year + '-' + this.month
      },
      set (value) {
        this.year = value.getFullYear()
        this.month = value.getMonth() + 1
      }
    }
  },
  created () {
    const now = new Date()
    this.year = now.getFullYear()
    this.month = now.getMonth() + 1
    this.day = now.getDate()
    this.loading = true

    this.fetch()
  },
  methods: {
    fetch () {
      const data = planJSON;
      // request.get('/api/plan').then(data => {
        const { developerList, productList, list, noPlanList } = data

        this.developers = this.developers.concat(developerList)
        this.productLines = this.productLines.concat(productList)
        this.taskList = list
        this.noPlanTaskList = noPlanList

        const colors = {}
        productList.forEach(item => colorUtil(colors, item))
        this.productColors = colors

        this.generate()
      // }).catch(() => {
      //   this.loading = false
      // })
    },
    generate () {
      const { developer, productLine, taskList } = this

      if (developer !== '全部' || productLine !== '全部') {
        const list = _.filter(taskList, item => {
          let flag = true

          if (developer !== '全部') {
            flag = item.assigned.indexOf(developer) > -1
          }

          if (flag && productLine !== '全部') {
            flag = item.productLine === productLine
          }

          return flag
        })

        this.list = list
      } else {
        this.list = this.taskList
      }

      this.loading = false
    },
    changeProductLine () {
      this.generate()
    },
    changeDeveloper () {
      this.generate()
    },
    onSelected (index) {
      this.selected = index
      this.task = this.taskList.find(item => item.index === index)
    }
  },
  components: {
    Calendar,
    Detail,
    Plan
  }
}
</script>
