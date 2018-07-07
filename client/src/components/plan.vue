<template>
  <div class="mod-plan">
    <h3>未排期任务：</h3>
    <ul>
      <li v-for="task in tasks" :key="task.index">
        <a v-if="task.url" href="item.url">{{ `${task.productLine} - ${task.title}` }}</a>
        <span v-else>{{ `${task.productLine} - ${task.title}` }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: [
    'tasks'
  ]
}
</script>
