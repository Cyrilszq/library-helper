const axios = require('axios');
const utils = require('./utils');
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36';
const fs = require('fs');
const path = require('path')
const request = require('request')
const tesseract = require('node-tesseract');
const gm = require('gm')
const baseUrl = 'http://huiwen.ujs.edu.cn:8080'
// const baseUrl = 'http://opac.nju.edu.cn/'

exports.getSearchResults = async(ctx, next) => {
  let url = baseUrl + '/opac/openlink.php',
    defaultQuery = {
      doctype: 'ALL',
      with_ebook: 'on',
      displaypg: '20',
      showmode: 'list',
      sort: 'CATA_DATE',
      orderby: 'desc',
      dept: 'ALL',
      page: '1'
    },
    queryString = {},
    result = {};
  queryString = Object.assign(defaultQuery, ctx.query);
  try {
    let res = await axios.get(url, {
      params: queryString,
      headers: {'User-Agent': userAgent}
    });
    result = utils.handleSearchHtml(res.data);
    ctx.body = result
  } catch (e) {
    console.log(e)
  }

};

exports.getDetailResults = async(ctx, next) => {
  let url = baseUrl + '/opac/item.php'
  let doubanUrl = 'https://api.douban.com/v2/book/isbn/'
  let id = ctx.params.id
  let result = {}, res, ret
  try {
    res = await axios.get(url, {
      params: {marc_no: id},
      headers: {'User-Agent': userAgent}
    })
    result = utils.handleDetailHtml(res.data);
    result.libId = id;
    ret = await axios.get(doubanUrl + result.isbn)
    ret = ret.data;
    result.authors = ret.author && result.authors;
    result.bookImgUrl = ret.image;
    result.summary = ret.summary;
    result.author_intro = ret.author_intro;
  } catch (e) {
    result.state = 'error';
  }
  ctx.body = result
};

exports.login = async(ctx, next) => {
  let account = ctx.request.body.account
  let password = ctx.request.body.password
  let cookie = ''
  let captcha = ''
  let html = ''
  let result = {}
  try {
    cookie = await getCookie()
    await saveCaptcha(cookie, account)
    captcha = parseInt(await handleCaptcha(account))
    html = await loginLib(account, password, captcha, cookie)
    result = utils.handleMyHtml(html)
  } catch (e) {
    result.state = 'error'
  }
  ctx.body = result
}

function loginLib(account, password, captcha, cookie) {
  let options = {
    method: 'POST',
    url: baseUrl + '/reader/redr_verify.php',
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'zh-CN,zh;q=0.8',
      'Cache-Control': 'max-age=0',
      'Connection': 'keep-alive',
      'Content-Length': '74',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookie,
      'Host': 'huiwen.ujs.edu.cn:8080',
      'Origin': 'http://huiwen.ujs.edu.cn:8080',
      'Referer': 'http://huiwen.ujs.edu.cn:8080/reader/login.php',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36'
    },
    form: {
      number: account,
      passwd: password,
      captcha: captcha,
      select: 'cert_no',
      returnUrl: ''
    }
  }
  return new Promise((reslove, reject) => {
    request(options, (err, res, body) => {
      if (err) reject(err)
      request({
        method: 'GET',
        url: baseUrl + '/reader/book_lst.php',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Accept-Language': 'zh-CN,zh;q=0.8',
          'Cache-Control': 'max-age=0',
          'Connection': 'keep-alive',
          'Cookie': cookie,
          'Host': 'huiwen.ujs.edu.cn:8080',
          'Upgrade-Insecure-Requests': '1',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36'
        }
      }, (err, res, body) => {
        if (err) reject(err)
        reslove(body)
      })
    })
  })
}

function getCookie() {
  return new Promise((reslove, reject) => {
    request({
      method: 'GET',
      url: baseUrl + '/reader/login.php',
      headers: {
        'User-Agent': userAgent
      }
    }, (err, res, body) => {
      if (err) reject(err)
      reslove(res.headers['set-cookie'][0].split(';')[0])
    })
  })
}

function saveCaptcha(cookie, account) {
  return new Promise((reslove, reject) => {
    gm(request({
      method: 'GET',
      url: baseUrl + '/reader/captcha.php',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, sdch',
        'Accept-Language': 'zh-CN,zh;q=0.8',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Cookie': cookie,
        'Host': 'huiwen.ujs.edu.cn:8080',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36'
      }
    }))
      .write(`${__dirname}/images/${account}.tif`, function (err) {
        if (err) reject(err)
        reslove()
      })
  })
}

function handleCaptcha(account) {
  return new Promise((reslove, reject) => {
    tesseract.process(`${__dirname}/images/${account}.tif`, function (err, text) {
      if (err) reject(err)
      reslove(text)
    })
  })
}


