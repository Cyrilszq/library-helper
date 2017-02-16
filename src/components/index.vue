<template>
  <div class="index">
    <mu-circular-progress
      :size="50"
      :strokeWidth="5"
      v-if="initLoading"
      class="progress"/>
    <div class="re-search">
      <mu-select-field v-model="currentFilter"
                       :labelFocusClass="['label-foucs']"
                       class="search-input">
        <mu-menu-item v-for="(item,index) in filterOpts"
                      :value="String(index)"
                      :title="item.value"/>
      </mu-select-field>
      <mu-text-field hintText="请输入关键字"
                     class="search"
                     v-model="keyword"
                     style="flex: 3"
                     @keyup.enter.native="search('reSearch')"/>
    </div>
    <div class="btn-wrap">
      <mu-raised-button label="在结果中检索"
                        primary
                        @click="search('search')"
                        v-show="!searchInResult"/>
      <mu-raised-button label="检索"
                        primary
                        @click="search('reSearch')"/>
    </div>
    <List
      :searchMsg="searchMsg"
      :bookMsg="bookMsg"
      v-if="!initLoading"></List>
  </div>
</template>

<script>
  import List from './List.vue'
  import axios from 'axios'
  export default {
    name: 'index',
    components: {
      List
    },
    data () {
      return {
        keyword: '',
        filterOpts: [
          {key: 'title', value: '题名'},
          {key: 'author', value: '作者'},
          {key: 'publisher', value: '出版社'}
        ],
        currentFilter: '0',
        searchMsg: {
          type: 'reSearch',
          initKeyword: '',
          newKeyword: '',
          currentPage: 1
        },
        bookMsg: {
          bookList: [],
          itemsNum: 0
        },
        initLoading: false,
        searchInResult: false
      }
    },
    methods: {
      search (type) {
        this.initLoading = true
        this.searchMsg.currentPage = 2
        if (type === 'reSearch') {
          this.searchMsg.type = 'reSearch'
          this.searchMsg.initKeyword = this.keyword
          this.fetchNewList()
        } else {
          this.searchMsg.tab = this.filterOpts[this.currentFilter].key
          this.searchMsg.newKeyword = this.keyword
          this.fectchInResult()
        }
        this.keyword = ''
      },
      fetchNewList() {
        let keyword = encodeURIComponent(this.keyword)
        let url = `/api/result/?strSearchType=title&strText=${keyword}&match_flag=forward&page=1`
        axios.get(url)
          .then(res => {
            this.bookMsg.bookList = res.data.bookList
            this.bookMsg.itemsNum = +res.data.itemsNum
            this.initLoading = false
            this.searchInResult = false
          })
      },
      fectchInResult() {
        let initKeyword = encodeURIComponent(this.searchMsg.initKeyword)
        let newKeyword = encodeURIComponent(this.keyword)
        let url = `/api/result/?search_bar=result&s2_type=${this.searchMsg.tab}&s2_text=${newKeyword}&title=${initKeyword}&page=1`
        axios.get(url)
          .then((res) => {
            this.bookMsg.bookList = res.data.bookList
            this.initLoading = false
            this.bookMsg.itemsNum = +res.data.itemsNum
            this.searchMsg.type = 'searchInResult'
            this.searchInResult = true
          })
      }
    }
  }
</script>

<style scoped>
  .re-search {
    display: flex;
    padding: 5px;
    margin-top: 20px;
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

  .progress {
    position: fixed;
    top: 50%;
    right: 50%;
    margin-top: -25px;
    margin-right: -25px;
  }
</style>
