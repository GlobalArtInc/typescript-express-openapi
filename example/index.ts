import express from 'express';
import { Api } from '../src/index'
import swaggerUi from 'swagger-ui-express';
import testController from "./testController";

export default class Example {
    public app: express.Express = express();

    public init() {
        this.app.use(express.json());
        this.app.use('*', (req, res, next) => {
            res.setHeader('user_id', 2334)
            next();
        })
        this.app.use((req, res, next) => {
            res.setHeader('authorization', 'dev');
            next();
        })
        const apiHelper = new Api.ApiHelper(this.app);
        testController(apiHelper);
        const docs = apiHelper.createDocsStub({
            info: 'test_info',
            version: "1.0.0",
            title: 'test_title',
            baseApiPath: '/',
            tags: [
                {
                    name: 'test',
                    description: 'test tag'
                }
            ]
        });
        apiHelper.initSwagger(docs);
        this.app.get('/', (req, res) => {
            return res.send(docs);
        });
        this.app.listen(3001, function () {
            console.log("Dev server is started")
            return;
        });
    }
}
new Example().init();

// const app = express();
// app.use(express.json());
//
// const apiHelper = new Api.ApiHelper(app);
// apiHelper.add('/asd', 'GET', {
//     example: {},
//     header_params: [],
//     body_params: [],
//     query_params: [
//         {
//             name: 'dev',
//             type: 'string',
//             description: 'dev',
//             required: true
//         }
//     ],
//     checks: []
// }, {
//     response: {
//         ok: { '$ref': '#/components/property/ok' },
//     },
//     description: 'Метод проверки токена сброса пароля',
//     summary: 'Метод проверки токена сброса пароля',
//     tags: ['auth']
// }, (req, res) => {
//     // @ts-ignore
//     res.json('asd')
// })
//
// const docs = apiHelper.createDocsStub("1", "1", "2", "/", [
//     {name: 'auth', description: 'test'}
// ]);
// apiHelper.initSwagger(docs)
//
// app.get('/', (req ,res) => {
//     res.send(docs)
// })

// export default class Example {
//     init(app: express.Express) {
//         const docs = Api.createDocsStub(
//             'Внешнее API',
//             '0.0.11',
//             'Внешнее API',
//             'base',
//             'api',
//             [
//                 {
//                     description: 'Методы работы с авторизацией',
//                     name: 'auth',
//                 },
//                 {
//                     description: 'Методы работы с файлами',
//                     name: 'file',
//                 },
//             ],
//         );
//         const apiHelper: Api.ApiHelper = new Api.ApiHelper(app, docs.paths);
//
//         apiHelper.add('/asd', 'get', {
//             example: {},
//             header_params: [],
//             body_params: [],
//             query_params: [
//                 {
//                     name: 'dev',
//                     type: 'string',
//                     description: 'dev',
//                     required: true
//                 }
//             ],
//             checks: []
//         }, {
//             response: {
//                 ok: { '$ref': '#/components/property/ok' },
//             },
//             description: 'Метод проверки токена сброса пароля',
//             summary: 'Метод проверки токена сброса пароля',
//             tags: ['auth']
//         }, (req, res) => {
//             res.json('asd')
//         })
//
//         app.get('/api/docs', async (req, res) => {
//             res.setHeader('Access-Control-Allow-Origin', '*');
//             res.json(docs);
//         });
//         app.use('/swagger', swaggerUi.serve, swaggerUi.setup(docs));
//     }
//
//     start() {
//         const app = express();
//         app.use(express.json());
//
//         this.init(app);
//         // Инициализация продюсеров и консьюмеров кафки
//         // produceAndConsume(db);
//
//         app.listen(8080, function () {
//             console.log("Dev server is started")
//             return;
//         });
//     }
// }
// new Example().start()
