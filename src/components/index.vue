<template>
  <div class="index">
    <div class="search-wrap">
      <mu-text-field hintText="请输入关键字" class="search" v-model="keyword" @keyup.enter.native="search"/>
      <mu-icon-button icon="search" @click.native="search"/>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'index',
    data () {
      return {
        keyword: ''
      }
    },
    methods: {
      search () {
        this.$router.push({name: 'list', params: {keyword: this.keyword}})
      }
    }
  }
</script>

<style scoped>
  .search {
    margin-top: 40px;
  }

  .search-wrap {
    text-align: center;
  }
</style>
