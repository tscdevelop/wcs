import createError, { HttpError } from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

// สำหรับ typeORM
import 'reflect-metadata';
import { AppDataSource } from './config/app-data-source';

import http from 'http';

// ใช้ import สำหรับไฟล์ TypeScript
import indexRouter from './routes/index';
import usersRouter from './routes/users';
import getusersRouter from './routes/getusers';
import imagesRouter from './routes/Images';
import checklistRouter from './routes/checklist';
import registerRouter from './routes/register';
import userRouter from './routes/user.routes';
import roleRouter from './routes/role.routes';
import menuRouter from './routes/menu.routes';

import swaggerApp from './swagger'; // นำเข้า swagger

import fileUpload from 'express-fileupload'; // นำเข้า fileupload

// นำเข้า i18next และ dependencies ที่จำเป็น
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import { AddressInfo } from 'net';

import { setLanguage } from './common/language.context'; // นำเข้า setLanguage
import { authenticateToken } from './common/auth.token';

const app = express();

const server = http.createServer(app);

// ตั้งค่า i18next
// วิธีการเปลี่ยนภาษาผ่าน client
// 1. ผ่าน query parameter:
// GET /api/users?lng=th
// 2. ผ่าน HTTP header:
// GET /api/users
// Header: Accept-Language: th
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'th', // ภาษาเริ่มต้น (en,th)
    detection: {
      order: ['querystring', 'header', 'cookie'],
      caches: ['cookie']
    },
    backend: {
      loadPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.json'), // ที่อยู่ของไฟล์แปลภาษา
    },
  });
  
// ใช้ middleware ของ i18next
app.use(middleware.handle(i18next));

// Middleware เพื่อเซ็ตค่าภาษาใน Context
app.use((req, res, next) => {
  let language = 'en';
  
  // ตรวจสอบ query parameter
  if (typeof req.query.lng === 'string') {
    language = req.query.lng;
  } 
  // ตรวจสอบ HTTP header
  else if (typeof req.headers['accept-language'] === 'string') {
    language = req.headers['accept-language'];
  }
  
  setLanguage(language);
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({ origin: '*', optionsSuccessStatus: 200 }));

// Use express-fileupload middleware
app.use(fileUpload());
app.use(express.json()); // ต้องใช้ เพื่ออ่านค่า req.body

app.use('/', indexRouter);
app.use('/usertest', usersRouter);
app.use('/users', getusersRouter);
app.use('/images', imagesRouter);
app.use('/checklist', checklistRouter);
app.use('/register', registerRouter);

app.use('/api/users', userRouter);
app.use('/api/roles', roleRouter);
app.use('/api/menus', menuRouter);


// ใช้ Swagger UI
app.use(swaggerApp);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// error handler
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

// Create a connection to the database สำหรับ typeORM
AppDataSource.initialize().then(async () => {
  console.log('Connected to the database.');
  // คุณสามารถเพิ่มโค้ดอื่นๆ ที่เกี่ยวข้องกับการใช้งาน TypeORM ที่นี่

  // Start the Express server
const server = app.listen(process.env.PORT || 3502, () => {
  const addr = server.address();

  if (addr && typeof addr === 'object' && 'address' in addr && 'port' in addr) {
    const addressInfo = addr as AddressInfo;
    console.log(`Server is running on http://${addressInfo.address}:${addressInfo.port}`);
  } else {
    console.log(`Server is running on ${addr}`);
  }
});

}).catch((error: any) => console.log('Error: ', error));


export default app;
