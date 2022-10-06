require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.SERVER_PORT || 3001;
const path = require('path');
const moment = require('moment');

// socket.io
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
});

// client 連線的 >> connection 事件
io.on('connection', (socket) => {
  console.log('socket: a user connected');
  socket.on('disconnect', () => {
    console.log('socket: user disconnected');
  });
  // User send Msg to Admin
  socket.on('lifeUser', (message) => {
    let { id, msg, time } = message;
    console.log('Message', `id:${id} msg:${msg}`);
    socket.broadcast.emit('life', { id, msg, time });
  });
  // socket on Admin send to user
  socket.on('life', (message) => {
    let { id, msg, time } = message;
    if (id !== 0) {
      socket.broadcast.emit(`user${id}`, { id, msg, time });
    }
  });
});

// 啟用session
const expressSession = require('express-session');
// 把 session 存在硬碟中
var FileStore = require('session-file-store')(expressSession);
app.use(
  expressSession({
    store: new FileStore({
      // session 儲存的路徑
      path: path.join(__dirname, '..', 'sessions'),
    }),
    secret: process.env.SESSION_SECRET,
    // 如果 session 沒有改變的話，要不要重新儲存一次？
    resave: false,
    // 還沒初始化的，要不要存
    saveUninitialized: false,
  })
);

// Routers
const recipe = require('./routers/recipe');
const news = require('./routers/news');
const signup = require('./routers/signup');
const picnic = require('./routers/picnic');
const camping = require('./routers/camping');
const picnicMap = require('./routers/picnicMap');
const map = require('./routers/map');
const login = require('./routers/login');
const user = require('./routers/user');
const product = require('./routers/product');
const order = require('./routers/order');

const corsOptions = {
  // 如果要讓 cookie 可以跨網域存取，這邊要設定 credentials
  // 且 origin 也要設定
  credentials: true,
  origin: ['http://localhost:3000'],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`Now：${moment().format('YYYY-MM-DD h:mm:ss')}`);
  next();
});
//設置靜態檔案
app.use(express.static(path.join(__dirname, 'public')));
// middleware
app.use('/api/1.0/recipes', recipe);
app.use('/api/1.0/news', news);
app.use('/api/1.0/signup', signup);
app.use('/api/1.0/picnic', picnic);
app.use('/api/1.0/getMap', picnicMap);
app.use('/api/1.0/camping', camping);
app.use('/api/1.0/map', map);
app.use('/api/1.0/', login);
app.use('/api/1.0/user', user);
app.use('/api/1.0/products', product);
app.use('/api/1.0/orders', order);

// server running
server.listen(port, () => console.log('server is runing : ' + port));
