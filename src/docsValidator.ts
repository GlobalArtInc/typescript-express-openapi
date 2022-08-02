import * as express from 'express';
import swaggerUi from "swagger-ui-express";
import multer from 'multer';
import path from 'path';
const upload = multer({ limits: { fileSize: 1024 * 1024 * 25 } });

interface ParameterDetail {
    name: string;
    type: string;
    description: string;
    required: boolean;
    show?: boolean;
}

interface Parameters<T> {
    example: T;
    path_params?: ParameterDetail[],
    body_params: ParameterDetail[];
    is_file_upload?: boolean;
    query_params?: ParameterDetail[];
    header_params: ParameterDetail[];
    checks: ((obj: T) => Promise<boolean>)[];
}

interface Validation {
    ok: boolean;
    value: any;
}

interface Docs {
    description: string;
    summary: string;
    tags: string[],
    bodyDesc?: string,
    response: object
}

interface Tags {
    name: string;
    description: string;
}

interface CreateDocsStub {
    info: string;
    version: string;
    title: string;
    baseApiPath: string;
    tags: Tags[]

}

interface ExpressReq {
    express_req: express.Request
}

type Methods = "GET" | "POST" | "PUT" | "DELETE"

function validateNumber(number: any) : Validation {
    return { ok: !isNaN(Number(number)), value: Number(number) };
}
function validateString(value: any) : Validation {
    return { ok: (typeof value?.toString()) == 'string', value: value?.toString() };
}
function validateAny(value: any) : Validation {
    return { ok: true, value };
}
function validateBoolean(value: any) : Validation {
    return { ok: ((value + '') == 'true') || ((value + '') == 'false'), value: (value + '')  == 'true' };
}

function validate(value: any, type: string) : Validation {
    const validations : any = {
        'number': validateNumber,
        'string': validateString,
        'boolean': validateBoolean,
        'any': validateAny
    };
    if (type in validations) {
        return validations[type](value);
    }
    return {ok: false, value: null};
}


let apiPath: string = ''
const regexp = /\{(.*?)\}/g;


export class ApiHelper {
    public paths: any = {};
    public tempData: any = {};

    constructor(
        public app: express.Express,
    ) {}

    add<T>(url: string, method: Methods, parameters: Parameters<T>, docs: Docs,
           callback: ((params: T & ExpressReq, res: express.Response) => any), middleWares: any[] = []) {

        this.addDocs(method, url, parameters, docs);
        let func = async (req: express.Request, res: express.Response) => {
            try {
                let argument_result: any = {};
                let express_req: express.Request = req;
                let collected_params: {value: any, detail: ParameterDetail}[] = [];
                let url_params = req.params;
                let i: any;
                for (i in parameters.body_params) {
                    let body_param = parameters.body_params[i];
                    if (!Object.keys(req.body).includes(body_param.name)) {
                        if (body_param.required) {
                            return res.json({ ok: false, error: 'missing_body_param', name: body_param.name });
                        }
                        continue ;
                    }
                    collected_params.push({ value: req.body[body_param.name], detail: body_param });
                }
                for (i in parameters.header_params) {
                    let header_param = parameters.header_params[i];
                    const resHeaders = res.getHeaders();
                    const reqHeaders = req.headers;
                    
                    if(!res.getHeader(header_param.name)) {
                        if (header_param.required) {
                            return res.json({ ok: false, error: 'missing_header_param', name: header_param.name });
                        }
                        continue;
                    } 
                    collected_params.push({ value: res.getHeader(header_param.name), detail: header_param });
                }
                for (i in parameters.query_params) {
                    let query_param = parameters.query_params![i];
                    if (!Object.keys(req.query).includes(query_param.name)) {
                        if (query_param.required) {
                            return res.json({ ok: false, error: 'missing_query_param', name: query_param.name });
                        }
                        continue ;
                    }
                    collected_params.push({ value: req.query[query_param.name], detail: query_param });
                }
                for (i in collected_params) {
                    let param = collected_params[i];
                    let validation : Validation = validate(param.value, param.detail.type);
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
                        argument_result[i] = req.params[i]
                    }
                }
                if (req.url.indexOf('/ws/')) {
                    argument_result.express_req = express_req;
                }
                await callback(argument_result, res);
            } catch (e) {
                console.log(e);
                res.json({
                    ok: false,
                    error: 'unknown'
                })
            }
        }
        const parsedUrl = url.replace(regexp, ':$1').toLowerCase()
        for(const middleWare of middleWares) {
            switch(method.toLowerCase()) {
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

        if(!this.tempData[parsedUrl.toLowerCase()]) {
            this.tempData[parsedUrl.toLowerCase()] = {};
        }
        this.tempData[parsedUrl.toLowerCase()][method.toLowerCase()] = {
            func,
            parameters
        };
    }

    addDocs<T>(method: string, url: string, parameters: Parameters<T>,
               data: Docs, paths: any = []) {
        if(!this.paths[url]) {
            this.paths[url] = {};
        }
        let methodDocs: any = {};
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
        if(parameters.header_params?.length) {
            let i: any;
            methodDocs.parameters = [];
            for (i in parameters.header_params) {
                const header_item: ParameterDetail = parameters.header_params[i];
                if(!header_item.show) continue;
                methodDocs.parameters.push({ 
                    name: header_item.name, 
                    description: header_item.description, 
                    required: header_item.required,
                    in: 'header',
                    schema: { type: header_item.type }
                });
            }
        }
        if (parameters.query_params?.length) {
            let i: any;
            methodDocs.parameters = [];
            for (i in parameters.query_params) {
                const query_item: ParameterDetail = parameters.query_params[i];
                methodDocs.parameters.push({ 
                    name: query_item.name, 
                    description: query_item.description, 
                    required: query_item.required,
                    in: 'query',
                    schema: { type: query_item.type }
                });
            }
        }
        if(parameters.path_params?.length) {
            let i: any;
            methodDocs.parameters = [];
            for(i in parameters.path_params) {
                const path_item: ParameterDetail = parameters.path_params[i];
                methodDocs.parameters.push({ 
                    name: path_item.name, 
                    description: path_item.description, 
                    required: path_item.required,
                    in: 'path',
                    schema: { type: path_item.type }
                });
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
            if(parameters.is_file_upload) {
               schema.properties['file'] = {
                type: 'string',
                format: 'binary'
               }
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

        for(const path in this.paths) {
            const item = this.paths[path];
            if(path.match(regexp)) {
                pathsBack.push({ path: path.replace(/\{(.*?)\}/g, ':$1'), item })
            } else {
                pathsFirst.push({ path, item })
            }
        }
        const paths = pathsFirst.concat(pathsBack);
        
        for(const itemPath of paths) {
            const { path, item } = itemPath;
            for(const method of Object.keys(item)) {
                const tempData = this.tempData[path.toLowerCase()][method];
                if (method.toLowerCase() == 'get') {
                    this.app.get(path, tempData.func);
                } else if (method.toLowerCase() == "delete") {
                    this.app.delete(path, tempData.func);
                } else if (method.toLowerCase() == "put") {
                    if (tempData.parameters.is_file_upload) {
                        this.app.put(path, upload.single('file'), tempData.func);
                    } else {
                        this.app.put(path, tempData.func);
                    }
                } else {
                    if (tempData.parameters.is_file_upload) {
                        this.app.post(path, upload.single('file'), tempData.func);
                    } else {
                        this.app.post(path, tempData.func);
                    }
                }
            }
        }
    }

    initServer() {
        this.app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', req.headers?.origin ?? '*');
            res.setHeader('Access-Control-Allow-Credentials', "true");
            res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });
    }

    createDocsStub (data: CreateDocsStub) {
        const { info, version, title, tags } = data;
        this.initServer();
        this.createRequests();
        
        return {
            openapi: '3.0.0', info: {
                description: info,
                version, title,
            },
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

    initSwagger(docs: object, path = '/swagger') {
        this.app.get(`${path}.json`, (req, res) => res.send(docs));
        this.app.use(path, swaggerUi.serve, swaggerUi.setup(docs));
    }
}
