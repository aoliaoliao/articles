<template>
  <div>
    <h3>文章列表</h3>
    <div class="list" v-for="(i, index) in list" :key="index">
      <router-link :to="{path:'/item/'+i.id}">{{i.title}}</router-link>
      <p>
        {{i.description}}
        <span>{{i.user.nickname}}<span>{{i.user.update_time}}</span></span>
      </p>
    </div>
  </div>
</template>
<script>
export default {
  asyncData ({store, route}){
    return store.dispatch('fetchList')
  },
  computed: {
    list () {
      return this.$store.state.list
    }
  },
  data(){
    return {
      name:'wfz'
    }
  }
}
</script>

<style lang="stylus" scoped>
h3 {
  color: red;
}
</style>