<template>
  <div class="list">
    <mu-circular-progress :size="50" :strokeWidth="5" v-if="initLoading" class="progress"/>
    <div class="re-search">
      <mu-select-field v-model="currentFilter"
                       :labelFocusClass="['label-foucs']"
                       class="search-input">
        <mu-menu-item v-for="(item,index) in filterOpts" :value="String(index)" :title="item.value"/>
      </mu-select-field>
      <mu-text-field hintText="请输入关键字" class="search" v-model="keyword" style="flex: 3"/>
    </div>
    <div class="btn-wrap">
      <mu-raised-button label="在结果中搜索" primary @click="search('search')" v-show="!isInSearch"/>
      <mu-raised-button label="重新检索" primary @click="search('reSearch')"/>
    </div>
    <span v-if="itemsNum > 0" class="message">共检索到{{itemsNum}}项</span>
    <span v-else class="message">没有检索到您要找的内容</span>
    <div v-if="!initLoading">
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
        <mu-float-button icon="keyboard_arrow_up" mini class="to-top" @click="toTop"/>
        <mu-infinite-scroll
          :loading="scrollLoading"
          @load="loadMore"
          loadingText="正在加载..."
          style="margin-top: 10px"
        />
      </mu-list>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  // 这里为了区分是重新搜索还是在结果中搜索写得有些复杂
  export default {
    name: 'list',
    created () {
      this.initKeyWord = encodeURIComponent(this.$route.params.keyword)
      this.fetchData(this.initKeyWord)
        .then((res) => {
          this.bookList = res.data.bookList
          this.itemsNum = +res.data.itemsNum
          this.currentPage++
          this.initLoading = false
        })
    },
    data () {
      return {
        bookList: [],
        itemsNum: 0,
        currentPage: 1,
        initLoading: true,
        scrollLoading: false,
        scroller: null,
        filterOpts: [
          {key: 'title', value: '题名'},
          {key: 'author', value: '作者'},
          {key: 'publisher', value: '出版社'}
        ],
        currentFilter: '0',
        initKeyWord: '',
        keyword: '',
        searchInResult: false,
        isInSearch: false
      }
    },
    methods: {
      loadMore () {
        // 如果没有更多页，则不需要继续加载
        if (Math.ceil(this.itemsNum / 20) < this.currentPage) {
          return
        }
        this.scrollLoading = true
        if (this.searchInResult) {
          axios.get(`/api/result/?search_bar=result&s2_type=${this.filterOpts[this.currentFilter].key}&s2_text=${this.keyword}&title=${this.initKeyWord}&page=${this.currentPage}`)
            .then((res) => {
              this.bookList = this.bookList.concat(res.data.bookList)
              this.currentPage++
              this.scrollLoading = false
            })
        } else {
          this.fetchData(this.initKeyWord)
            .then((res) => {
              this.bookList = this.bookList.concat(res.data.bookList)
              this.scrollLoading = false
              this.currentPage++
            })
        }
      },
      search (type) {
        this.initLoading = true
        this.currentPage = 1
        if (type === 'reSearch') {
          this.fetchData(encodeURIComponent(this.keyword))
            .then((res) => {
              this.bookList = res.data.bookList
              this.itemsNum = +res.data.itemsNum
              this.currentPage++
              this.initLoading = false
              this.initKeyWord = this.keyword
              this.searchInResult = false
              this.isInSearch = false
            })
        } else {
          axios.get(`/api/result/?search_bar=result&s2_type=${this.filterOpts[this.currentFilter].key}&s2_text=${this.keyword}&title=${this.initKeyWord}&page=${this.currentPage}`)
            .then((res) => {
              this.bookList = res.data.bookList
              this.itemsNum = +res.data.itemsNum
              this.currentPage++
              this.initLoading = false
              this.searchInResult = true
              this.isInSearch = true
            })
        }
      },
      fetchData (keyword) {
        let url = `/api/result/?strSearchType=title&strText=${keyword}&match_flag=forward&page=${this.currentPage}`
        return axios.get(url)
      },
      toTop () {
        document.body.scrollTop = 0
      }
    },
    // 该路由被keep-alive，为了使url改变时组件可以刷新
    beforeRouteEnter (to, from, next) {
      let keyword = encodeURIComponent(to.params.keyword)
      next(vm => {
        if (vm.initKeyWord !== keyword) {
          vm.currentPage = 1
          vm.initLoading = true
          vm.initKeyWord = keyword
          vm.searchInResult = false
          vm.keyword = ''
          vm.fetchData(keyword)
            .then((res) => {
              vm.bookList = res.data.bookList
              vm.itemsNum = +res.data.itemsNum
              vm.currentPage++
              vm.initLoading = false
              vm.isInSearch = false
            })
        }
      })
    }
  }
</script>
<style scoped>
  .list {
    padding-bottom: 64px;
  }

  .re-search {
    display: flex;
    padding: 5px;
  }

  .search-input {
    flex: 1;
    margin-right: 10px;
    padding-left: 10px;
  }

  .btn-wrap {
    text-align: right;
    padding-right: 10px;
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

  .progress {
    position: fixed;
    top: 50%;
    right: 50%;
    margin-top: -25px;
    margin-right: -25px;
  }
</style>
