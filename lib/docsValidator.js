"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiHelper = void 0;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ limits: { fileSize: 1024 * 1024 * 25 } });
function validateNumber(number) {
    return { ok: !isNaN(Number(number)), value: Number(number) };
}
function validateString(value) {
    return { ok: (typeof (value === null || value === void 0 ? void 0 : value.toString())) == 'string', value: value === null || value === void 0 ? void 0 : value.toString() };
}
function validateAny(value) {
    return { ok: true, value };
}
function validateBoolean(value) {
    return { ok: ((value + '') == 'true') || ((value + '') == 'false'), value: (value + '') == 'true' };
}
function validate(value, type) {
    const validations = {
        'number': validateNumber,
        'string': validateString,
        'boolean': validateBoolean,
        'any': validateAny
    };
    if (type in validations) {
        return validations[type](value);
    }
    return { ok: false, value: null };
}
let apiPath = '';
const regexp = /\{(.*?)\}/g;
class ApiHelper {
    constructor(app) {
        this.app = app;
        this.paths = {};
        this.baseApiPaths = [];
        this.baseUrl = '';
        this.tempData = {};
    }
    add(url, method, parameters, docs, callback, middleWares = []) {
        this.addDocs(method, url, parameters, docs);
        let func = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let argument_result = {};
                let express_req = req;
                let collected_params = [];
                let url_params = req.params;
                let i;
                for (i in parameters.body_params) {
                    let body_param = parameters.body_params[i];
                    if (!Object.keys(req.body).includes(body_param.name)) {
                        if (body_param.required) {
                            return res.json({ ok: false, error: 'missing_body_param', name: body_param.name });
                        }
                        continue;
                    }
                    collected_params.push({ value: req.body[body_param.name], detail: body_param });
                }
                for (i in parameters.header_params) {
                    let header_param = parameters.header_params[i];
                    const resHeaders = res.getHeaders();
                    const reqHeaders = req.headers;
                    if (!res.getHeader(header_param.name)) {
                        if (header_param.required) {
                            return res.json({ ok: false, error: 'missing_header_param', name: header_param.name });
                        }
                        continue;
                    }
                    collected_params.push({ value: res.getHeader(header_param.name), detail: header_param });
                }
                for (i in parameters.query_params) {
                    let query_param = parameters.query_params[i];
                    if (!Object.keys(req.query).includes(query_param.name)) {
                        if (query_param.required) {
                            return res.json({ ok: false, error: 'missing_query_param', name: query_param.name });
                        }
                        continue;
                    }
                    collected_params.push({ value: req.query[query_param.name], detail: query_param });
                }
                for (i in collected_params) {
                    let param = collected_params[i];
                    let validation = validate(param.value, param.detail.type);
                    if (!validation.ok) {
                        return res.json({ ok: false, error: 'invalid_param', name: param.detail.name, type: param.detail.type });
                    }
                    argument_result[param.detail.name] = validation.value;
                }
                if (parameters.is_file_upload) {
                    argument_result.file = req.file;
                }
                if (url_params) {
                    for (let i in url_params) {
                        argument_result[i] = req.params[i];
                    }
                }
                if (req.url.indexOf('/ws/')) {
                    argument_result.express_req = express_req;
                }
                yield callback(argument_result, res);
            }
            catch (e) {
                console.log(e);
                res.json({
                    ok: false,
                    error: 'unknown'
                });
            }
        });
        const parsedUrl = url.replace(regexp, ':$1').toLowerCase();
        for (const middleWare of middleWares) {
            switch (method.toLowerCase()) {
                case 'get':
                    this.app.get(parsedUrl, middleWare);
                    break;
                case 'post':
                    this.app.post(parsedUrl, middleWare);
                    break;
                case 'put':
                    this.app.put(parsedUrl, middleWare);
                    break;
                case 'delete':
                    this.app.delete(parsedUrl, middleWare);
                    break;
            }
        }
        if (!this.tempData[parsedUrl.toLowerCase()]) {
            this.tempData[parsedUrl.toLowerCase()] = {};
        }
        this.tempData[parsedUrl.toLowerCase()][method.toLowerCase()] = {
            func,
            parameters
        };
    }
    addDocs(method, url, parameters, data, paths = []) {
        var _a, _b, _c;
        if (!this.paths[url]) {
            this.paths[url] = {};
        }
        let methodDocs = {};
        methodDocs.operationId = method.toLowerCase() + '_' + url.replace(/\//g, '_').replace(regexp, '_$1_');
        methodDocs.description = data.description;
        methodDocs.summary = data.summary;
        methodDocs.tags = data.tags;
        methodDocs.responses = {};
        methodDocs.responses['200'] = {};
        methodDocs.responses['200'].description = '#/components/description/alwaysok';
        methodDocs.responses['200'].content = {};
        methodDocs.responses['200'].content['application/json'] = {};
        methodDocs.responses['200'].content['application/json'].schema = {};
        methodDocs.responses['200'].content['application/json'].schema.type = 'object';
        methodDocs.responses['200'].content['application/json'].schema.properties = data.response;
        if ((_a = parameters.header_params) === null || _a === void 0 ? void 0 : _a.length) {
            let i;
            methodDocs.parameters = [];
            for (i in parameters.header_params) {
                const header_item = parameters.header_params[i];
                if (!header_item.show)
                    continue;
                methodDocs.parameters.push({
                    name: header_item.name,
                    description: header_item.description,
                    required: header_item.required,
                    in: 'header',
                    schema: { type: header_item.type }
                });
            }
        }
        if ((_b = parameters.query_params) === null || _b === void 0 ? void 0 : _b.length) {
            let i;
            methodDocs.parameters = [];
            for (i in parameters.query_params) {
                const query_item = parameters.query_params[i];
                methodDocs.parameters.push({
                    name: query_item.name,
                    description: query_item.description,
                    required: query_item.required,
                    in: 'query',
                    schema: { type: query_item.type }
                });
            }
        }
        if ((_c = parameters.path_params) === null || _c === void 0 ? void 0 : _c.length) {
            let i;
            methodDocs.parameters = [];
            for (i in parameters.path_params) {
                const path_item = parameters.path_params[i];
                methodDocs.parameters.push({
                    name: path_item.name,
                    description: path_item.description,
                    required: path_item.required,
                    in: 'path',
                    schema: { type: path_item.type }
                });
                if (path_item.enum && path_item.values) {
                    methodDocs.parameters[0].schema.enum = [];
                    for (const value of path_item === null || path_item === void 0 ? void 0 : path_item.values) {
                        methodDocs.parameters[0].schema.enum.push(value);
                    }
                }
            }
        }
        if (parameters.body_params.length > 0) {
            methodDocs.requestBody = {};
            methodDocs.requestBody.description = data.bodyDesc;
            methodDocs.requestBody.required = false;
            methodDocs.requestBody.content = {};
            const contentType = parameters.is_file_upload ? 'multipart/form-data' : 'application/json';
            methodDocs.requestBody.content[contentType] = {};
            methodDocs.requestBody.content[contentType].schema = {};
            let schema = methodDocs.requestBody.content[contentType].schema;
            schema.type = 'object';
            schema.required = [];
            schema.properties = {};
            schema.example = {};
            let i;
            if (parameters.is_file_upload) {
                schema.properties['file'] = {
                    type: 'string',
                    format: 'binary'
                };
            }
            for (i in parameters.body_params) {
                let parameter = parameters.body_params[i];
                if (parameter.required) {
                    methodDocs.requestBody.required = true;
                    schema.required.push(parameter.name);
                }
                schema.properties[parameter.name] = {
                    type: parameter.type,
                    description: parameter.description
                };
                //@ts-ignore
                //TODO: Fix
                schema.example[parameter.name] = parameters.example[parameter.name];
            }
            if (!schema.required.length) {
                delete schema.required;
            }
        }
        this.paths[url][method.toLowerCase()] = methodDocs;
    }
    createRequests() {
        let pathsFirst = [];
        let pathsBack = [];
        for (const path in this.paths) {
            const item = this.paths[path];
            for (const p of this.baseApiPaths) {
                if (path.match(regexp)) {
                    pathsBack.push({ path: path.replace(/\{(.*?)\}/g, ':$1'), item });
                }
                else {
                    pathsFirst.push({ path, item });
                }
            }
        }
        const paths = pathsFirst.concat(pathsBack);
        for (const itemPath of paths) {
            for (const baseApiPath of this.baseApiPaths) {
                const { path, item } = itemPath;
                const p = baseApiPath + path;
                for (const method of Object.keys(item)) {
                    const tempData = this.tempData[path.toLowerCase()][method];
                    if (method.toLowerCase() == 'get') {
                        this.app.get(p, tempData.func);
                    }
                    else if (method.toLowerCase() == "delete") {
                        this.app.delete(p, tempData.func);
                    }
                    else if (method.toLowerCase() == "put") {
                        if (tempData.parameters.is_file_upload) {
                            this.app.put(p, upload.single('file'), tempData.func);
                        }
                        else {
                            this.app.put(p, tempData.func);
                        }
                    }
                    else {
                        if (tempData.parameters.is_file_upload) {
                            this.app.post(p, upload.single('file'), tempData.func);
                        }
                        else {
                            this.app.post(p, tempData.func);
                        }
                    }
                    if (tempData.parameters.is_hide_swagger) {
                        delete this.paths[path][method];
                    }
                    if (this.paths[path] && Object.keys(this.paths[path]).length === 0) {
                        delete this.paths[path];
                    }
                }
            }
        }
    }
    initServer() {
        this.app.use((req, res, next) => {
            var _a, _b;
            res.setHeader('Access-Control-Allow-Origin', (_b = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.origin) !== null && _b !== void 0 ? _b : '*');
            res.setHeader('Access-Control-Allow-Credentials', "true");
            res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });
    }
    createDocsStub(data) {
        const { info, version, baseApiPath, defaultPath, title, tags } = data;
        this.baseApiPaths = baseApiPath;
        this.baseUrl = defaultPath;
        this.initServer();
        this.createRequests();
        return {
            openapi: '3.0.0', info: {
                description: info,
                version, title,
            },
            baseUrl: defaultPath !== null && defaultPath !== void 0 ? defaultPath : '',
            tags,
            paths: this.paths,
            components: {
                description: {
                    alwaysok: `Always return 2xx. Error indication in the field status: not 2xx.`
                },
                property: {
                    ok: { type: 'number', example: 200, description: `2xx - if the operation was successful. or not 2xx if the operation was error` }
                }
            }
        };
    }
    initSwagger(docs, path = '/swagger') {
        this.app.get(path, (req, res) => res.send(docs));
        this.app.use(`${path === '/swagger' ? path + '.json' : path}`, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(docs));
    }
}
exports.ApiHelper = ApiHelper;
