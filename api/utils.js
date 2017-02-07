const cheerio = require('cheerio');
/**
 * 用cheerio提取搜索结果页面中有用的信息，并返回结果
 * @param html
 * @returns {{state: string, itemsNum: string, bookList: Array}}
 */
exports.handleSearchHtml = function (html) {
  let $ = cheerio.load(html);
  let itemsNum = $('.bulk-actions strong').text();
  let result = {
    state: '',
    itemsNum: '', //所有搜索到的条目数
    bookList: []
  };

  if (!itemsNum) {
    result.state = 'not found';
    return result;
  }
  result.itemsNum = itemsNum;
  $('#search_book_list .book_list_info').each((id, ele) => {
    let $ele = $(ele);
    let temp = $ele.find('p').html().split('</span>')[1].split('<br>');
    let publisher = temp[1];
    let author = temp[0];
    result.bookList.push({
      //图书馆是否可借信息
      libmsg: $ele.find('p span').html(),
      //出版社信息
      publisher: publisher,
      //书名
      title: $ele.find('h3 a').text(),
      //作者
      author: author,
      //书在图书馆中的id
      libId: $ele.find('h3 a').attr('href').split('=')[1],
    })
  });

  return result;
};

/**
 * 提取图书详情页有用信息
 * @param html
 * @returns {{state: string, title: string, isbn: string, libMsg: Array}}
 */
exports.handleDetailHtml = function (html) {
  let $ = cheerio.load(html);
  let result = {
    state: 'ok',
    title: '',
    isbn: '',
    abstract: '',
    authors: [],
    publisher: '',
    libMsg: []
  };
  let dls = $('#item_detail dl');
  //获取书的名称
  result.title = $(dls[0]).find('a').text();
  //获取书的ISBN
  dls.each((id, dl) => {
    let $dl = $(dl);
    let temp = $dl.find('dt').text();
    if (temp.indexOf('出版发行项') != -1) {
      result.publisher = $dl.find('dd').text()
    }
    if (temp.indexOf('ISBN') != -1) {
      result.isbn = $dl.find('dd').text().split('/')[0];
    }
    if (temp.indexOf('个人责任者') != -1) {
      result.authors.push($dl.find('dd a').text())
    }
    if (temp.indexOf('提要文摘附注') != -1) {
      result.abstract = $dl.find('dd').text()
    }
  });

  let bookIndexPos, addressPos, statePos
  $('#item tr.greytext1 td').each((index, ele) => {
    let text = $(ele).text();
    switch (text) {
      case '索书号':
        bookIndexPos = index
        break
      case '校区—馆藏地':
        addressPos = index
        break
      case '书刊状态':
        statePos = index
        break
    }
  })

  $('#item tr.whitetext').each((index, ele) => {
    let $ele = $(ele);
    result.libMsg.push({
      // 图书在图书馆的id
      bookIndex: $($ele.find('td')[bookIndexPos]).text(),
      // 图书在图书馆的位置
      address: $($ele.find('td')[addressPos]).text(),
      // 图书借阅状态
      state: $($ele.find('td')[statePos]).text(),
    })
  });
  return result
};

exports.handleMyHtml = function (html) {
  let $ = cheerio.load(html)
  let result = {
    state: 'ok',
    borrowList: []
  }
  let trs = $('#mylib_content table tr')
  let flag = $('#mylib_content h2').text()
  if (!flag) {
    result.state = 'error'
    return result
  }
  for (let i = 1; i < trs.length; i++) {
    let tds = $(trs[i]).find('td')
    result.borrowList.push({
      title: $(tds[1]).find('a').text(),
      borrowDate: $(tds[2]).text(),
      deadDate: $(tds[3]).text()
    })
  }
  return result
}
