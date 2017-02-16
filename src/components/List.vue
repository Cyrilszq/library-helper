<template>
  <div class="list">
    <span v-if="itemsNum > 0" class="message">共检索到{{itemsNum}}项</span>
    <span v-else class="message">没有检索到您要找的内容</span>
    <mu-list>
      <template v-for="(item,index) in bookList">
        <router-link :to="{name:'detail',params:{id:item.libId}}">
          <mu-list-item :title="item.title">
            <p v-html="item.publisher"></p>
            <p v-html="item.author" style="width: 75%"></p>
            <p v-html="item.libmsg" class="libmsg"></p>
          </mu-list-item>
        </router-link>
        <mu-divider/>
      </template>
      <mu-float-button icon="keyboard_arrow_up"
                       mini
                       class="to-top"
                       @click="toTop"/>
      <mu-infinite-scroll
        :loading="scrollLoading"
        @load="loadMore"
        loadingText="正在加载..."
        style="margin-top: 10px"
      />
    </mu-list>
  </div>
</template>

<script>
  import axios from 'axios'
  export default {
    name: 'list',
    props: ['searchMsg', 'bookMsg'],
    data () {
      return {
        scrollLoading: false,
        scroller: null,
      }
    },
    methods: {
      loadMore () {
        // 如果没有更多页，则不需要继续加载
        if (Math.ceil(this.itemsNum / 20) < this.searchMsg.currentPage) {
          return
        }
        let url = ''
        this.scrollLoading = true
        if (this.searchMsg.type === 'searchInResult') {
          url = `/api/result/?search_bar=result&s2_type=${this.searchMsg.tab}&s2_text=${this.newKeyword}&title=${this.initKeyword}&page=${this.searchMsg.currentPage}`
          this.fetchData(url)
        } else {
          url = `/api/result/?strSearchType=title&strText=${this.initKeyword}&match_flag=forward&page=${this.searchMsg.currentPage}`
          this.fetchData(url)
        }
      },
      fetchData (url) {
        axios.get(url)
          .then((res) => {
            this.bookMsg.bookList = this.bookMsg.bookList.concat(res.data.bookList)
            this.scrollLoading = false
            this.searchMsg.currentPage++
          })
      },
      toTop () {
        document.body.scrollTop = 0
      }
    },
    computed: {
      bookList() {
        return this.bookMsg.bookList
      },
      itemsNum() {
        return this.bookMsg.itemsNum
      },
      initKeyword() {
        return encodeURIComponent(this.searchMsg.initKeyword)
      },
      newKeyword() {
        return encodeURIComponent(this.searchMsg.newKeyword)
      }
    }
  }
</script>
<style scoped>
  .list {
    padding-bottom: 64px;
  }

  .message {
    display: inline-block;
    margin-left: 8px;
  }

  .libmsg {
    position: absolute;
    right: 16px;
    bottom: 24px;
  }

  .list p {
    color: #616161;
  }

  .to-top {
    position: fixed;
    bottom: 84px;
    right: 20px;
  }


</style>
