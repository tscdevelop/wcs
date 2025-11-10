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
import aisleRouter from './routes/aisle.routes';
import mrsRouter from './routes/mrs.routes';
import waitingRouter from './routes/waiting.routes';

import swaggerApp from './swagger'; // นำเข้า swagger

import fileUpload from 'express-fileupload'; // นำเข้า fileupload

// นำเข้า i18next และ dependencies ที่จำเป็น
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import { AddressInfo } from 'net';

import { setLanguage } from './common/language.context'; // นำเข้า setLanguage
import { authenticateToken } from './common/auth.token';

import createTasksRouter from './routes/tasks.routes';
import { T1MTaskService } from './services/task_mrs.service';
import { MockMrsGateway } from './gateways/mrs.gateway.mock';
import { OrchestratedTaskService } from './services/tasks.service';

const app = express();

// const server = http.createServer(app);

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
// app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin: 'https://wcs-front.vercel.app', // your frontend URL
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.options('*', cors()); // handle preflight for all routes


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

app.use('/api/aisle', aisleRouter);
app.use('/api/mrs', mrsRouter);
app.use('/api/waiting', waitingRouter);

// ใช้ Swagger UI
app.use(swaggerApp);

// app.use((req: Request, res: Response, next: NextFunction) => {
//   next(createError(404));
// });

// // error handler
// app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   res.status(err.status || 500);
//   res.render('error');
// });

// Create a connection to the database สำหรับ typeORM
// AppDataSource.initialize().then(async () => {
//   console.log('Connected to the database.');
//   // คุณสามารถเพิ่มโค้ดอื่นๆ ที่เกี่ยวข้องกับการใช้งาน TypeORM ที่นี่

//   // Start the Express server
// const server = app.listen(process.env.PORT || 3502, () => {
//   const addr = server.address();

//   if (addr && typeof addr === 'object' && 'address' in addr && 'port' in addr) {
//     const addressInfo = addr as AddressInfo;
//     console.log(`Server is running on http://${addressInfo.address}:${addressInfo.port}`);
//   } else {
//     console.log(`Server is running on ${addr}`);
//   }
// });

// }).catch((error: any) => console.log('Error: ', error));


AppDataSource.initialize()
  .then(async () => {
    console.log('Connected to the database.');

    // 1) ประกาศตัวแปร service ให้ callback ใช้งานได้
    let t1m!: T1MTaskService;

    // 2) สร้าง Mock Gateway แล้วโยน callback กลับมาที่ service
    const gw = new MockMrsGateway({
      onOpenFinished : (p) => t1m.onOpenFinished(p),
      onCloseFinished: (p) => t1m.onCloseFinished(p),
    });

    // 3) สร้างบริการ T1M โดยฉีด gateway เข้าไป
    t1m = new T1MTaskService(gw);

    // 4) สร้าง Orchestrator แล้วส่ง T1M เข้าไป (ถ้าฝั่ง WRS พร้อมค่อยฉีดเพิ่ม)
    const orchestrator = new OrchestratedTaskService(t1m /*, wrsService */);

    // 5) ผูก routes ที่ต้องใช้บริการเหล่านี้ (ก่อน 404 handler เสมอ)
    app.use('/api/tasks', createTasksRouter(orchestrator));  // POST /api/tasks, POST /api/tasks/:id/confirm
    // app.use('/api', createMrsEventsRouter(t1m));      // POST /api/mrs/events/* (webhook/หรือไม่ใช้กับ mock ก็ได้)

    // 6) 404 handler ใส่ "ท้ายสุด" หลัง mount routes ทั้งหมดแล้ว
    app.use((req: Request, res: Response, next: NextFunction) => {
      next(createError(404));
    });

    // 7) error handler ก็อยู่ท้ายสุดเช่นกัน
    app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};
      res.status(err.status || 500);
      res.render('error');
    });

    // 8) Start server (ครั้งเดียว)
    const server = app.listen(process.env.PORT || 3502, () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        console.log(`Server is running on http://${addr.address}:${(addr as any).port}`);
      } else {
        console.log(`Server is running on ${addr}`);
      }
    });
  })
  .catch((error: any) => console.log('Error: ', error));

// AppDataSource.initialize()
//   .then(async () => {
//     console.log('Connected to the database.');

//     let t1m!: T1MTaskService;

//     // --- เลือก gateway จาก ENV ---
//     const useMqtt = (process.env.MRS_GATEWAY ?? 'mock').toLowerCase() === 'mqtt';

//     let gw: MrsGateway;

//     if (useMqtt) {
//       // MQTT จริง
//       gw = new MqttMrsGateway(
//         process.env.MQTT_URL || 'mqtt://localhost:1883',        // broker URL
//         { username: process.env.MQTT_USER, password: process.env.MQTT_PASS }, // creds (ถ้ามี)
//         { 
//           ackTimeoutMs: Number(process.env.MQTT_ACK_TIMEOUT_MS ?? 10000),     // 10s
//           topicPrefix: process.env.MQTT_TOPIC_PREFIX ?? 'mrs' 
//         },
//         {
//           // callback อีเวนต์จบงาน (ให้ behavior เหมือน mock)
//           onOpenFinished : (p) => t1m.onOpenFinished(p),
//           onCloseFinished: (p) => t1m.onCloseFinished(p),
//         }
//       );

//       // (ทางเลือก) ถ้าคุณทำ MrsSyncService แล้วค่อยเปิดใช้งาน:
//       // const sync = new MrsSyncService(AppDataSource, gw as MqttMrsGateway);
//       // sync.start();

//     } else {
//       // โหมด dev/mock (ไม่มีระบบจริง)
//       gw = new MockMrsGateway({
//         onOpenFinished : (p) => t1m.onOpenFinished(p),
//         onCloseFinished: (p) => t1m.onCloseFinished(p),
//       });
//     }

//     // 3) สร้างบริการ T1M โดยฉีด gateway เข้าไป
//     t1m = new T1MTaskService(gw);

//     // 4) สร้าง Orchestrator แล้วส่ง T1M เข้าไป (ถ้าฝั่ง WRS พร้อมค่อยฉีดเพิ่ม)
//     const orchestrator = new OrchestratedTaskService(t1m /*, wrsService */);

//     // 5) ผูก routes ที่ต้องใช้บริการเหล่านี้ (ก่อน 404 handler เสมอ)
//     app.use('/api/tasks', createTasksRouter(orchestrator));  // POST /api/tasks, POST /api/tasks/:id/confirm
//     // app.use('/api', createMrsEventsRouter(t1m));      // POST /api/mrs/events/* (webhook/หรือไม่ใช้กับ mock ก็ได้)

//     // 6) 404 handler ใส่ "ท้ายสุด" หลัง mount routes ทั้งหมดแล้ว
//     app.use((req: Request, res: Response, next: NextFunction) => {
//       next(createError(404));
//     });

//     // 7) error handler ก็อยู่ท้ายสุดเช่นกัน
//     app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
//       res.locals.message = err.message;
//       res.locals.error = req.app.get('env') === 'development' ? err : {};
//       res.status(err.status || 500);
//       res.render('error');
//     });

//     // 8) Start server (ครั้งเดียว)
//     const server = app.listen(process.env.PORT || 3502, () => {
//       const addr = server.address();
//       if (addr && typeof addr === 'object') {
//         console.log(`Server is running on http://${addr.address}:${(addr as any).port}`);
//       } else {
//         console.log(`Server is running on ${addr}`);
//       }
//     });
//   })
//   .catch((error: any) => console.log('Error: ', error));
export default app;
