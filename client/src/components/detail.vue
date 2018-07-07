<template>
  <div class="mod-detail">
    <h3>详情</h3>
    <div class="cell-content">
      <template v-if="detail">
        <dl>
          <dt>任务：</dt>
          <dd>
            <a v-if="detail.url" :href="detail.url" :title="detail.title">{{ detail.title }}</a>
            <span v-else :title="detail.title">{{ detail.title }}</span>
          </dd>
        </dl>
        <div class="group">
          <dl>
            <dt>产品线：</dt>
            <dd>{{ detail.productLine }}</dd>
          </dl>
          <dl>
            <dt>开发人员：</dt>
            <dd>{{ detail.assigned }}</dd>
          </dl>
        </div>
        <div class="group">
          <div class="title">开发</div>
          <dl>
            <dt>开始时间：</dt>
            <dd>{{ detail.develop.startTime }}</dd>
          </dl>
          <dl>
            <dt>结束时间：</dt>
            <dd>{{ detail.develop.endTime }}</dd>
          </dl>
          <dl>
            <dt>工作量：</dt>
            <dd>{{ detail.develop.effort }}</dd>
          </dl>
          <dl>
            <dt>已完成：</dt>
            <dd>{{ detail.develop.done }}</dd>
          </dl>
        </div>
        <div v-if="detail.jointDebug" class="group">
          <div class="title">联调</div>
          <dl>
            <dt>开始时间：</dt>
            <dd>{{ detail.jointDebug.startTime }}</dd>
          </dl>
          <dl>
            <dt>结束时间：</dt>
            <dd>{{ detail.jointDebug.endTime }}</dd>
          </dl>
          <dl>
            <dt>工作量：</dt>
            <dd>{{ detail.jointDebug.effort }}</dd>
          </dl>
          <dl>
            <dt>已完成：</dt>
            <dd>{{ detail.jointDebug.done }}</dd>
          </dl>
        </div>
        <div v-if="detail.test" class="group">
          <div class="title">测试</div>
          <dl>
            <dt>开始时间：</dt>
            <dd>{{ detail.test.startTime }}</dd>
          </dl>
          <dl>
            <dt>结束时间：</dt>
            <dd>{{ detail.test.endTime }}</dd>
          </dl>
          <dl>
            <dt>工作量：</dt>
            <dd>{{ detail.test.effort }}</dd>
          </dl>
          <dl>
            <dt>已完成：</dt>
            <dd>{{ detail.test.done }}</dd>
          </dl>
        </div>
        <div v-if="detail.publish" class="group">
          <div class="title">上线</div>
          <dl>
            <dt>开始时间：</dt>
            <dd>{{ detail.publish.startTime }}</dd>
          </dl>
          <dl>
            <dt>结束时间：</dt>
            <dd>{{ detail.publish.endTime }}</dd>
          </dl>
          <dl>
            <dt>工作量：</dt>
            <dd>{{ detail.publish.effort }}</dd>
          </dl>
          <dl>
            <dt>已完成：</dt>
            <dd>{{ detail.publish.done }}</dd>
          </dl>
        </div>
      </template>
      <div v-else class="no-result">未选中任务</div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

const format = 'MM-DD HH:mm:ss'

export default {
  computed: {
    detail () {
      const { task } = this

      if (task) {
        const { title, url, assigned, productLine, develop, jointDebug, test, publish } = task
        const data = {
          title,
          url,
          assigned,
          productLine,
          develop: {
            startTime: moment(develop.startTime).format(format),
            endTime: moment(develop.endTime).format(format),
            effort: `${develop.effort}d`,
            done: `${develop.done * 100}%`
          }
        }

        if (jointDebug) {
          data.jointDebug = {
            startTime: moment(jointDebug.startTime).format(format),
            endTime: moment(jointDebug.endTime).format(format),
            effort: `${jointDebug.effort}d`,
            done: `${jointDebug.done * 100}%`
          }
        }

        if (test) {
          data.test = {
            startTime: moment(test.startTime).format(format),
            endTime: moment(test.endTime).format(format),
            effort: `${test.effort}d`,
            done: `${test.done * 100}%`
          }
        }

        if (publish) {
          data.publish = {
            startTime: moment(publish.startTime).format(format),
            endTime: moment(publish.endTime).format(format),
            effort: `${publish.effort}d`,
            done: `${publish.done * 100}%`
          }
        }

        return data
      } else {
        return null
      }
    }
  },
  props: [
    'task'
  ]
}
</script>
