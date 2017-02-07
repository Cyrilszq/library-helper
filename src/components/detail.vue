<template>
  <div class="detail">
    <mu-circular-progress :size="50" :strokeWidth="5" v-show="initLoading" class="progress"/>
    <div v-if="!initLoading">
      <div class="detail-header">
        <div class="header-left">
          <h2>{{book.title}}</h2>
          <p>
            <span v-for="author in book.authors" style="margin-right: 4px">{{author}}</span>编著
          </p>
          <p>{{book.publisher}}</p>
        </div>
        <div>
          <img :src="book.bookImgUrl"/>
        </div>
      </div>
      <div>
        <p>摘要：</p>
        <p>{{book.abstract}}</p>
        <p>豆瓣简介：</p>
        <p>{{book.summary}}</p>
      </div>
      <mu-table :selectable="false" :showCheckbox="false">
        <mu-thead>
          <mu-tr>
            <mu-th>索书号</mu-th>
            <mu-th>馆藏地</mu-th>
            <mu-th>借阅信息</mu-th>
          </mu-tr>
        </mu-thead>
        <mu-tbody>
          <mu-tr v-for="item,index in book.libMsg">
            <mu-td>{{item.bookIndex}}</mu-td>
            <mu-td>{{item.address}}</mu-td>
            <mu-td>{{item.state}}</mu-td>
          </mu-tr>
        </mu-tbody>
      </mu-table>
      <mu-raised-button label="收藏" primary fullWidth style="margin-top: 10px" @click="toCollect"/>
      <mu-snackbar v-if="snackbar" message="收藏成功"/>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  export default{
    created () {
      let id = this.$route.params.id
      axios.get(`/api/detail/${id}`)
        .then((res) => {
          this.book = res.data
          this.initLoading = false
        })
    },
    data () {
      return {
        book: {},
        initLoading: true,
        snackbar: false
      }
    },
    methods: {
      toCollect () {
        let favMsg = {
          libId: this.book.libId,
          title: this.book.title,
          libMsg: this.book.libMsg
        }
        window.localStorage.setItem(this.book.libId, JSON.stringify(favMsg))
        this.showSnackbar()
      },
      showSnackbar () {
        this.snackbar = true
        if (this.snackTimer) clearTimeout(this.snackTimer)
        this.snackTimer = setTimeout(() => {
          this.snackbar = false
        }, 1500)
      }
    }
  }
</script>

<style scoped>
  .detail {
    padding: 16px;
    padding-bottom: 64px;
  }

  .progress {
    position: fixed;
    top: 50%;
    right: 50%;
    margin-top: -25px;
    margin-right: -25px;
  }

  .detail-header {
    display: flex;
  }

  .header-left {
    flex: 1;
  }

  .mu-td {
    white-space: normal;
    padding: 0;
    text-align: center;
  }
</style>
