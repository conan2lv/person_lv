const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const history = require('connect-history-api-fallback');

// 路由信息(接口地址)开始存放在./routes目录下
var indexRouter = require('./routes/index');//主页接口
var apiRouter = require('./routes/api');//后端路由

var app = express();

// 模板开始
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade'); //设置模板引擎

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(history({
  htmlAcceptHeaders: ['text/html', 'application/xhtml+xml']
}));

app.use(express.static(path.join(__dirname, 'dist')));

app.use('/', indexRouter);
app.use('/api', apiRouter); 

// 捕获404
app.use(function(req, res, next) {
  next(createError(404));
});

// 错误处理
app.use(function(err, req, res, next) {
  //开发环境的错误检测
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // 渲染错误页面
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;