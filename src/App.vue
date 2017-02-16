<template>
  <div>
    <!--<mu-appbar title="Library">-->
      <!--<mu-icon-button icon='menu' slot="left"/>-->
      <!--<mu-icon-button icon='expand_more' slot="right"/>-->
    <!--</mu-appbar>-->
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
    <mu-paper class="bottom-nav">
      <mu-bottom-nav :value="bottomNav" @change="handleChange">
        <mu-bottom-nav-item value="home"
                            title="主页"
                            icon="home"/>
        <mu-bottom-nav-item value="favorite"
                            title="收藏"
                            icon="favorite"/>
        <mu-bottom-nav-item value="me"
                            title="个人"
                            icon="person"/>
      </mu-bottom-nav>
    </mu-paper>
  </div>
</template>

<script>
  export default {
    name: 'app',
    created () {
      // 为了使bottom-nav组件正确切换
      window.onhashchange = () => {
        let hash = window.location.hash
        switch (hash) {
          case '#/me':
            this.bottomNav = 'me'
            break
          case '#/favorite':
            this.bottomNav = 'favorite'
            break
          default:
            this.bottomNav = 'home'
            break
        }
      }
    },
    data () {
      return {
        bottomNav: 'home'
      }
    },
    methods: {
      handleChange (val) {
        this.bottomNav = val
        this.$router.push({name: `${val}`})
      }
    }
  }
</script>

<style scoped>
  .bottom-nav {
    width: 100vw;
    position: fixed;
    bottom: 0;
  }
</style>
