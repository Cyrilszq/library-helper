<template>
  <div>
    <mu-circular-progress :size="50" :strokeWidth="5" v-show="initLoading" class="progress"/>
    <div class="login-table" v-if="!isLogin">
      <mu-text-field label="账号" hintText="请输入账号" type="text" v-model="account" labelFloat/>
      <mu-text-field label="密码" hintText="请输入密码" type="password" v-model="password" labelFloat/>
      <br>
      <div class="btn-wrap">
        <mu-checkbox label="记住密码" v-model="isRemember"/>
        <br>
        <mu-raised-button label="登录" primary style="width: 100%;" @click="login"/>
      </div>
    </div>
    <div v-else class="me-detail">
      <section>
        <h3>当前借阅</h3>
        <mu-table :selectable="false" :showCheckbox="false">
          <mu-thead>
            <mu-tr>
              <mu-th>书名</mu-th>
              <mu-th>借阅日期</mu-th>
              <mu-th>应还日期</mu-th>
            </mu-tr>
          </mu-thead>
          <mu-tbody>
            <mu-tr v-for="item in borrowList">
              <mu-td>{{item.title}}</mu-td>
              <mu-td>{{item.borrowDate}}</mu-td>
              <mu-td>{{item.deadDate}}</mu-td>
            </mu-tr>
          </mu-tbody>
        </mu-table>
      </section>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  export default{
    created () {
      this.account = window.localStorage.getItem('account')
      this.password = window.localStorage.getItem('password')
    },
    data () {
      return {
        account: '',
        password: '',
        isRemember: true,
        borrowList: [],
        initLoading: false,
        isLogin: false
      }
    },
    methods: {
      login () {
        this.initLoading = true
        axios.post('/api/login', {
          account: this.account,
          password: this.password
        }).then((res) => {
          res = res.data
          if (res.state === 'error') {
            this.initLoading = false
            window.alert('登录失败')
          } else {
            if (this.isRemember) {
              window.localStorage.setItem('account', this.account)
              window.localStorage.setItem('password', this.password)
            } else {
              window.localStorage.setItem('account', '')
              window.localStorage.setItem('password', '')
            }
            this.initLoading = false
            this.borrowList = res.borrowList
            this.isLogin = true
          }
        })
      }
    }
  }
</script>

<style scoped>
  .login-table {
    text-align: center;
  }

  .btn-wrap {
    width: 256px;
    margin: 0 auto;
    text-align: left;
  }

  .progress {
    position: fixed;
    top: 50%;
    right: 50%;
    margin-top: -25px;
    margin-right: -25px;
  }

  .me-detail section h3 {
    text-align: center;
  }

  .mu-td {
    white-space: normal;
    padding: 0 10px;
    text-align: center;
  }
</style>
