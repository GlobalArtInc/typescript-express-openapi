import * as express from 'express';
interface ParameterDetail {
    name: string;
    type: string;
    description: string;
    required: boolean;
    show?: boolean;
}
interface Parameters<T> {
    example: T;
    path_params?: ParameterDetail[];
    body_params: ParameterDetail[];
    is_file_upload?: boolean;
    query_params?: ParameterDetail[];
    header_params: ParameterDetail[];
    checks: ((obj: T) => Promise<boolean>)[];
}
interface Docs {
    description: string;
    summary: string;
    tags: string[];
    bodyDesc?: string;
    response: object;
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
    tags: Tags[];
}
interface ExpressReq {
    express_req: express.Request;
}
declare type Methods = "GET" | "POST" | "PUT" | "DELETE";
export declare class ApiHelper {
    app: express.Express;
    paths: any;
    tempData: any;
    constructor(app: express.Express);
    add<T>(url: string, method: Methods, parameters: Parameters<T>, docs: Docs, callback: ((params: T & ExpressReq, res: express.Response) => any), middleWares?: any[]): void;
    addDocs<T>(method: string, url: string, parameters: Parameters<T>, data: Docs, paths?: any): void;
    createRequests(): void;
    initServer(): void;
    createDocsStub(data: CreateDocsStub): {
        openapi: string;
        info: {
            description: string;
            version: string;
            title: string;
        };
        tags: Tags[];
        paths: any;
        components: {
            description: {
                alwaysok: string;
            };
            property: {
                ok: {
                    type: string;
                    example: number;
                    description: string;
                };
            };
        };
    };
    initSwagger(docs: object, path?: string): void;
}
export {};
