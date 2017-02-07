<template>
  <div class="favorite">
    <mu-card v-for="book,index in favList">
      <h2>{{book.title}}</h2>
      <mu-table :selectable="false" :showCheckbox="false">
        <mu-thead>
          <mu-tr>
            <mu-th>索书号</mu-th>
            <mu-th>馆藏地</mu-th>
            <mu-th>借阅信息</mu-th>
          </mu-tr>
        </mu-thead>
        <mu-tbody>
          <mu-tr v-for="item in book.libMsg">
            <mu-td>{{item.bookIndex}}</mu-td>
            <mu-td>{{item.address}}</mu-td>
            <mu-td>{{item.state}}</mu-td>
          </mu-tr>
        </mu-tbody>
      </mu-table>
      <div class="btn-wrap">
        <mu-raised-button label="删除" primary @click="deleteBook(book.libId,index)"/>
        <mu-raised-button label="更新借阅信息" primary @click="updateBook(book.libId,index)"/>
      </div>
    </mu-card>
    <mu-snackbar v-if="snackbar" message="更新成功"/>
  </div>
</template>

<script>
  import axios from 'axios'
  export default{
    created () {
      let localStorage = window.localStorage
      for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i)
        if (key !== 'account' && key !== 'password') {
          let value = JSON.parse(localStorage.getItem(key))
          this.favList.push(value)
        }
      }
    },
    data () {
      return {
        favList: [],
        snackbar: false
      }
    },
    methods: {
      deleteBook (id, index) {
        window.localStorage.removeItem(id)
        this.favList.splice(index, 1)
      },
      showSnackbar () {
        this.snackbar = true
        if (this.snackTimer) clearTimeout(this.snackTimer)
        this.snackTimer = setTimeout(() => {
          this.snackbar = false
        }, 800)
      },
      updateBook (id, index) {
        axios.get(`/api/detail/${id}`)
          .then((res) => {
            this.favList[index].libMsg = res.data.libMsg
            // 这样使vue可以监测到数组变动
            this.favList.splice(index, 1, this.favList[index])
            this.showSnackbar()
          })
      }
    }
  }
</script>

<style scoped>
  .favorite {
    padding: 16px;
    padding-bottom: 64px;
  }

  .favorite h2 {
    text-align: center;
  }

  .mu-card {
    padding: 8px;
    margin-top: 8px
  }

  .btn-wrap {
    text-align: right;
  }

  .mu-td {
    white-space: normal;
    padding: 0;
    text-align: center;
  }
</style>
