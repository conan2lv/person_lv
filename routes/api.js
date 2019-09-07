/*
后端的请求路径的接口函数
 */

var express = require('express');
const mongoose = require('mongoose')
const fs = require('fs');
const formdata = require('formidable');
const models = require('../db/models');
const MusicModel = models.getModel('Music');
const UserModel = models.getModel('User');
const AlbumModel = models.getModel('Album');
const PhotoModel = models.getModel('Photo');
const DiaryModel = models.getModel('Diary');
const TagModel = models.getModel('Tag');
const NoteModel = models.getModel('Note');
const IPModel = models.getModel('IP');
const CarouselModel = models.getModel('Carousel')
var router = express.Router();

//获取音乐
router.get('/getMusic',function(req, res){
  MusicModel.find(function (err, data) {
    if(err){
      console.log(err)
      res.send({ code: 0, msg: '查找音乐失败'})
    }else{
      res.send({ code: 1, data: data});
    }
  })
})

//获取用户信息
router.get('/getUserInfo',function(req,res) {
  UserModel.findOne(function(err,data) {
    if(err){
      console.log(err)
      res.send({ code: 0, msg: '获取用户信息失败' })
    }else{
      res.send({ code: 1, data: data });
    }
  })
})

//获取首页的轮播图片
router.get('/getCarouselImg',function(req,res){
  CarouselModel.find(function(err,data) {
    if(err){
      console.log(err)
      res.send({ code: 0, msg: '获取轮播图片失败' })
    }else{
      res.send({ code: 1, data: data });
    }
  })
})

//处理用户上传头像
router.post('/uploadAvatar',function(req,res) {
  let form = new formdata.IncomingForm();
  form.uploadDir = './tmp'
  form.keepExtensions = true;
  form.parse(req,function(err,fields,file){
    if(err){
      console.log("错误")
    }else{
      let filePath = file.file.path;
      let filename = file.file.name;
      let newFilePath = './dist/static/img/avatar/' + filename
      fs.rename(filePath,newFilePath,function(err){
        if(err){
          res.send({ code: 0, msg: '头像上传失败' });  
        }else{  
          res.send({ code: 1, url: filename});  
        } 
      })

      let updateUser = {
        avatar : filename
      }
      UserModel.findByIdAndUpdate('5d3808e7a90eda46ac153c1b', updateUser, function(err, res){
        if (err) {
            console.log("Error:" + err);
        }
        else {
            console.log("Res:" + res);
        }
      })
    }
  })
})

//获取相册信息
router.get('/getAlbum',function(req,res){
  AlbumModel.find(function(err,data) {
    if(err){
      console.log(err)
      res.send({ code: 0, msg: '获取相册信息失败' })
    }else{
      res.send({ code: 1, data: data });
    }
  })
})

//修改相册标题
router.get('/updateAlbumTitle',function(req,res){
  let updateAlbum = {
    title : req.query.title
  }

  let _res = res
  AlbumModel.findByIdAndUpdate(req.query.id, updateAlbum, function(err, res){
    if (err) {
        console.log("Error:" + err);
        _res.send({ code: 0, msg : '相册编辑失败'})
    }
    else {
        console.log("Res:" + res);
        _res.send({ code: 1, title : req.query.title})
    }
  })
})

//新建相册
router.get('/createAlbum',function(req,res){
  let newAlbum = new AlbumModel({
    title: req.query.title,
    cover_img : './static/img/图片.png'
  })
  newAlbum.save(function(err,data){
    if(err){
      res.send({code : 0, msg : '新建相册失败'})
    }else{
      res.send({code: 1, data : data})
    }
  })
})

//删除相册
router.get('/deleteAlbum',function(req,res){
  AlbumModel.findByIdAndDelete(req.query.id,function(err,data){
    if(err){
      console.log(err)
      res.send({ code: 0, msg: '相册删除失败' })
    }else{
      res.send({ code: 1, data: data });
      //删除相册包含的所有照片
      PhotoModel.deleteMany({album: mongoose.Types.ObjectId(req.query.id)},function(err,data){
        if(err) throw err
      })
    }
  })
})

//获取相册中的图片信息
router.get('/getPhoto',function(req,res){
  PhotoModel.find({'album' : mongoose.Types.ObjectId(req.query.album_id)}).skip(req.query.group * 10).limit(10).exec(function(err,data) {
    if(err){
      res.send({ code: 0, msg: '获取相册图片失败' })
    }else{
      if(data.length > 0){
        res.send({ code: 1, data : data, end : false})
      }else{
        res.send({ code : 1, data: data, end : true})
      }
    }
  })
})

//更换相册封面
router.get('/changeCoverImg',function(req,res){
  //查找相册的第一张图片作为封面
  PhotoModel.findOne({'album': mongoose.Types.ObjectId(req.query.id)},function(err,data){
    if(err){
      console.log(err)
      res.send({code: 0,msg: '更换封面失败'})
    }else{
      let updateAlbum = {}
      if(data){
        updateAlbum = { cover_img : data.src }
      }else{
        updateAlbum = { cover_img : './static/img/图片.png' }
      }
      AlbumModel.findByIdAndUpdate(req.query.id,updateAlbum,function(err,data){
        if(err){
          res.send({code: 0,msg: '更换封面失败'})
        }else{
          res.send({code: 1,cover_img: data.src})
        }
      })
    }
  })
})

//上传图片
router.post('/uploadPhoto',function(req,res){
  let form = new formdata.IncomingForm();
  form.uploadDir = './tmp'
  form.keepExtensions = true;
  form.parse(req,function(err,fields,file){
    if(err){
      console.log("错误")
    }else{
      let filePath = file.file.path;
      let filename = file.file.name;
      let dirname = './dist/static/img/album_img/' + fields.id
      fs.exists(dirname,function(exists){
        if(exists){
          console.log("该文件存在！");
        }
        else{
          fs.mkdir(dirname, 0777, function(err){
            if(err){
             throw err
            }else{
             console.log("creat done!");
            }
          })
        }
      });
      let newFilePath = dirname + '/' +  filename
      fs.rename(filePath,newFilePath,function(err){
        if(err){
          throw err
        }else{
          let newPhoto = new PhotoModel({
            src : './static/img/album_img/' + fields.id + '/' + filename,
            album : mongoose.Types.ObjectId(fields.id)
          })
    
          newPhoto.save(function(err,data){
            if(err){
              res.send({ code: 0, msg: '图片上传错误'});  
            }else{
              res.send({ code: 1, data: data});  
            }
          })
        } 
      })
    }
  })
})

//删除图片
router.get('/deletePhoto',function(req,res){
  PhotoModel.findByIdAndDelete(req.query.id,function(err,data){
    if(err){
      console.log(err)
      res.send({ code: 0, msg: '图片删除失败' })
    }else{
      res.send({ code: 1, data: data });
    }
  })
})

//获取日记信息
router.get('/getDiary',function(req,res){
  DiaryModel.find(function(err,data) {
    if(err){
      console.log(err)
      res.send({ code: 0, msg: '获取日记信息失败' })
    }else{
      let newData = []
      data.forEach(item=>{
        let tmp = {}
        tmp._id = item._id;
        tmp.year = item.date.getFullYear();
        tmp.month = item.date.getMonth() + 1;
        tmp.day = item.date.getDate();
        newData.push(tmp)
      })
      res.send({ code: 1, data: newData });
    }
  })
})

//获取日记内容
router.get('/getDiaryContent',function(req,res){
  DiaryModel.findById(req.query.id,function(err,data) {
    if(err){
      console.log(err)
      res.send({ code: 0, msg: '获取日记信息失败' })
    }else{
      res.send({ code: 1, data: data });
    }
  })
})

//删除日记
router.get('/deleteDiary',function(req,res){
  DiaryModel.findByIdAndRemove(req.query.id,function(err,data){
    if(err){
      console.log(err)
      res.send({ code: 0, msg: '日记删除失败' })
    }else{
      console.log(data)
      res.send({ code: 1, data: data });
    }
  })
})

//保存日记
router.post('/saveDiary',function(req,res){
  //id存在则为保存
  if(req.body.id){
    let newDiary = {
      content : req.body.content
    }
    let _res = res
    DiaryModel.findByIdAndUpdate(req.body.id, newDiary, function(err, res){
      if (err) {
          console.log("Error:" + err);
          _res.send({ code: 0, msg : '保存失败'})
      }
      else {
          console.log("Res:" + res);
          _res.send({ code: 1, msg: '保存成功'})
      }
    })
  }else{//id不存在，则为新建
    let newDiary = new DiaryModel({
      content : req.body.content,
      date : new Date()
    })
    newDiary.save(function(err,data){
      if(err){
        res.send({code : 0, msg : '新建日记失败'})
      }else{
        res.send({code: 1, msg : '新建日记成功', data : data})
      }
    })
  }
})

//获取标签
router.get('/getTag',function(req,res){
  TagModel.find(function(err,data) {
    if(err){
      console.log(err)
      res.send({ code: 0, msg: '获取标签失败' })
    }else{
      res.send({ code: 1, data: data });
    }
  })
})

//新增标签
router.get('/addTag',function(req,res){
  //查找是否有重复标签
  TagModel.find({name: req.query.name},function(err,data){
    if(err){
      throw err
    }else{
      if(data.length === 0){//data为空，没有同名标签
        let newTag = new TagModel({
          name: req.query.name,
          color : req.query.color,
          count: 0
        })
        newTag.save(function(err,data){
          if(err){
            res.send({code : 0, msg : '新增标签失败'})
          }else{
            res.send({code: 1, data : data})
          }
        })
      }else{
        res.send({code : 0, msg : '已有同名标签，请更换名称'})
      }
    }
  })
})

//修改标签
router.get('/updateTag',function(req,res){
  let updateTag = {
    name : req.query.name,
    color : req.query.color
  }

  let _res = res
  TagModel.findByIdAndUpdate(req.query.id, updateTag, function(err, res){
    if (err) {
        console.log("Error:" + err);
        _res.send({ code: 0, msg : '标签编辑失败'})
    }
    else {
        console.log("Res:" + res);
        _res.send({ code: 1, title : req.query.name})
    }
  })
})

//删除标签
router.get('/deleteTag',function(req,res){
  TagModel.findByIdAndRemove(req.query.id,function(err,data){
    if(err){
      console.log(err)
      res.send({ code: 0, msg: '标签删除失败' })
    }else{
      res.send({ code: 1, msg: '标签删除成功' });
      //删除标签所包含的所有笔记
      NoteModel.deleteMany({category: data.name},function(err,data){
        if(err) throw err
      })
    }
  })
})

//标签包含的笔记数量加一或减一
function NoteCount(name,type){
  TagModel.findOne({'name': name},function(err,data){
    if(err){ throw err }
    else{
      let c = 0;
      if(type === 'add'){
        c = parseInt(data.count) + 1
      }else{
        c = parseInt(data.count) - 1
      }
      TagModel.findOneAndUpdate({'name': name}, {'count': c}, function(err, data){
        if(err) throw err
      })
    }
  })
}

//获取笔记信息
router.get('/getNote',function(req,res){
  NoteModel.find(function(err,data) {
    if(err){
      console.log(err)
      res.send({ code: 0, msg: '获取笔记信息失败' })
    }else{
      let newData = []
      data.forEach(item=>{
        let tmp = {
          _id: item._id,
          title: item.title,
          category: item.category,
          summary: item.summary,
          createdTime: item.createdTime,
          pageView: item.pageView
        }
        newData.push(tmp)
      })
      res.send({ code: 1, data: newData });
    }
  })
})

//获取笔记内容
router.get('/getNoteContent',function(req,res){
  NoteModel.findById(req.query.id, function(err,data) {
    if(err){
      console.log(err)
      res.send({ code: 0, msg: '获取笔记详情失败' })
    }else{
      res.send({ code: 1, data: data });
    }
  })
})

//搜索笔记
router.get('/searchNote',function(req,res){
  NoteModel.find({title: eval("/" + req.query.key +"/i")},function(err,data){
    if(err){
      res.send({ code: 0, msg: '搜索错误'})
    }else{
      res.send({ code: 1, data: data})
    }
  })
})

//保存笔记
router.post('/saveNote',function(req,res){
  if(req.body.id){//如果id存在，则为修改原有笔记
    let updateNote = {
      title: req.body.title,
      category: req.body.category,
      summary: req.body.text.slice(0,20),
      content: req.body.html,
      modifiedTime: new Date(),
    }

    NoteModel.findByIdAndUpdate(req.body.id, updateNote, function(err, res){
      if(err){
        res.send({code : 0, msg : '笔记保存失败'})
      }
      else{
        res.send({code: 1, msg: '笔记保存成功', data : data})
      }
    })
  }else{
    let newNote = new NoteModel({
      title: req.body.title,
      category: req.body.category,
      summary: req.body.text.slice(0,20),
      content: req.body.html,
      createdTime : new Date(),
      modifiedTime: new Date(),
      pageView: 0
    })
    newNote.save(function(err,data){
      if(err){
        res.send({code : 0, msg : '笔记保存失败'})
      }else{
        NoteCount(req.body.category,'add')
        res.send({code: 1, msg: '笔记保存成功', data : data})
      }
    })
  }
})

//删除笔记
router.get('/deleteNote',function(req,res){
  NoteModel.findByIdAndRemove(req.query.id,function(err,data){
    if(err){
      console.log(err)
      res.send({ code: 0, msg: '笔记删除失败' })
    }else{
      NoteCount(data.category,'less')
      res.send({ code: 1, msg: '笔记删除成功' });
    }
  })
})

//增加浏览量
router.get('/addPageView',function(req,res){
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress
  let updatePageView  = {
    pageView : parseInt(req.query.pageView)
  }
  IPModel.findOne({'ip': ip,'noteid': req.query.id},function(err,data){
    if(err){
      throw err
    }else{
      if(data){
        let currentTime = new Date();
        let t = currentTime - data.time;
        if(t > 86400000){ //一天类同个ip访问不算浏览量
          IPModel.findByIdAndRemove(data._id,function(err){
            if(err) throw err
          })

          let newIP = new IPModel({ ip: ip,noteid: req.query.id,time: currentTime })
          newIP.save(function(err,data){
            if(err) throw err
          })

          NoteModel.findByIdAndUpdate(req.query.id, updatePageView, function(err, data){
            if(err) throw err
          })
        }
      }else{
        let newIP = new IPModel({ ip: ip,noteid: req.query.id,time: new Date() })
        newIP.save(function(err,data){
          if(err) throw err
        })
        NoteModel.findByIdAndUpdate(req.query.id, updatePageView, function(err, data){
          if(err) throw err
        })
      }
    }
  })

  res.send({})
})

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
