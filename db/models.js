/*
包含n个能操作mongodb数据库集合的model的模块
1. 连接数据库
  1.1. 引入mongoose
  1.2. 连接指定数据库(URL只有数据库是变化的)
  1.3. 获取连接对象
  1.4. 绑定连接完成的监听(用来提示连接成功)
2. 定义对应特定集合的Model
  2.1. 字义Schema(描述文档结构)
  2.2. 定义Model(与集合对应, 可以操作集合)
3. 向外暴露获取Model的方法
 */
// 1. 连接数据库
const mongoose = require('mongoose')
mongoose.connect('mongodb://47.103.200.8:27017/personlv')
const conn = mongoose.connection
conn.on('connected', function () {
  console.log('数据库连接成功!')
})

// 2. 创建模型

//音乐集合
const musicSchema = mongoose.Schema({
  //封面图片
  img: {
    type: String
  },
  //歌曲名
  title: {
    type: String
  },
  //歌曲资源路径
  src: {
    type: String
  },
  //歌手名
  singer: {
    type: String,
    default: '未知歌手'
  }
})

//用户集合
const userSchema = mongoose.Schema({
  //昵称
  username:{
    type: String
  },
  //头像路径
  avatar:{
    type: String
  }
})

//相册集合
const albumSchema = mongoose.Schema({
  //相册名
  title:{
    type: String
  },
  //相册描述
  info:{
    type: String
  },
  //相册封面
  cover_img:{
    type: String
  }
})

//图片集合
const photoSchema = mongoose.Schema({
  //图片路径
  src:{
    type: String
  },
  //图片所属相册
  album:{
    type: Object
  }
})

//日记集合
const diarySchema = mongoose.Schema({
  date: {
    type: Date
  },
  content: {
    type: String
  }
})

//标签集合
const TagSchema = mongoose.Schema({
  //标签名
  name : {
    type: String
  },
  //颜色
  color : {
    type : String
  },
  //该标签下的笔记数据
  count: {
    type: Number
  }
})

//笔记集合
const NoteSchema = mongoose.Schema({
  //标题
  title: {
    type: String
  },
  //类别
  category: {
    type: String
  },
  //摘要
  summary : {
    type: String
  },
  //具体内容
  content: {
    type: String
  },
  //创建日期
  createdTime: {
    type: Date
  },
  //最后修改日期
  modifiedTime: {
    type: Date
  },
  //浏览次数
  pageView: {
    type: Number
  }
})

//访问ip集合
const IPSchema = mongoose.Schema({
  //ip
  ip: {
    type: String
  },
  //对应的笔记id
  noteid: {
    type: String
  },
  //创建时间
  time: {
    type: Date
  }
})

//轮播图片集合
const CarouselSchema = mongoose.Schema({
  //图片路径
  src: {
    type: String
  }
})

MusicModel = mongoose.model('Music', musicSchema)
UserModel = mongoose.model('User',userSchema)
AlbumModel = mongoose.model('Album',albumSchema)
PhotoModel = mongoose.model('Photo',photoSchema)
DiaryModel = mongoose.model('Diary',diarySchema)
TagModel = mongoose.model('Tag',TagSchema)
NoteModel = mongoose.model('Note',NoteSchema)
IPModel = mongoose.model('IP',IPSchema)
CarouselModel = mongoose.model('Carousel',CarouselSchema)

// 3. 向外暴露
module.exports = {
  getModel(name) {
    return mongoose.model(name)
  }
}

