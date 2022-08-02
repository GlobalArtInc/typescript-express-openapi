import {ApiHelper} from "../src/docsValidator";

export function testMiddleware(req: any, res: any, next: any) {
    return res.send({
        ok: 222
    })
    next();
}

export default function testController (apiHelper: ApiHelper) {
    apiHelper.add('/test_header', 'GET', {
        example: {
            authorization: 'asd'
        },
        header_params: [
            {
                name: 'authorization',
                type: 'string',
                description: 'auth',
                required: true
            }
        ],
        body_params: [],
        is_hide_swagger: true,
        checks: []
    }, {
        response: {
            ok: {'$ref': '#/components/property/ok'},
        },
        description: 'test_description_2',
        summary: 'test_description_2',
        tags: ['test']
    }, (req, res) => {
        console.log(req.authorization)    
        res.send({
            status: 200,
            method: 'GET',
            message: "/test"
        })
    }),
    apiHelper.add('/test/{id}', 'GET', {
        example: {
            id: 1,
            string_1: 'dev'
        },
        header_params: [],
        is_file_upload: true,
        path_params: [
            {
                name: 'id',
                type: 'number',
                description: 'number',
                required: true,
            }
        ],
        body_params: [],
        query_params: [
            // {
            //     name: 'string_1',
            //     type: 'string',
            //     description: 'test_query_string_1',
            //     required: false
            // }
        ],
        checks: []
    }, {
        response: {
            status: {'$ref': '#/components/property/ok'},
        },
        description: 'test_description_1',
        summary: 'test_description_1',
        tags: ['test']
    }, (req, res) => {
        const { string_1 } = req;
        console.log(req.string_1)
        res.send({
            status: 200,
            message: `/test/${req.id}`
        })
    }, [testMiddleware]),
    apiHelper.add('/test/{id}', 'DELETE', {
        example: {
            id: 1,
            string_1: 'dev'
        },
        header_params: [],
        is_file_upload: true,
        path_params: [
            {
                name: 'id',
                type: 'number',
                description: 'number',
                required: true,
            }
        ],
        body_params: [],
        query_params: [
            // {
            //     name: 'string_1',
            //     type: 'string',
            //     description: 'test_query_string_1',
            //     required: false
            // }
        ],
        checks: []
    }, {
        response: {
            status: {'$ref': '#/components/property/ok'},
        },
        description: 'test_description_1',
        summary: 'test_description_1',
        tags: ['test']
    }, (req, res) => {
        const { string_1 } = req;
        res.send({
            status: 200,
            method: 'DELETE',
            message: `/test/${req.id}`
        })
    }, [testMiddleware]),
    apiHelper.add('/auth/connected', 'GET', {
        example: {},
        header_params: [],
        body_params: [],
        checks: []
    }, {
        response: {
            ok: {'$ref': '#/components/property/ok'},
        },
        description: 'test_description_2',
        summary: 'test_description_2',
        tags: ['test']
    }, (req, res) => {        
        res.send({
            status: 200,
            method: 'GET',
            message: "/auth/connected"
        })
    })
    apiHelper.add('/test/connected', 'GET', {
        example: {},
        header_params: [],
        body_params: [],
        checks: []
    }, {
        response: {
            ok: {'$ref': '#/components/property/ok'},
        },
        description: 'test_description_2',
        summary: 'test_description_2',
        tags: ['test']
    }, (req, res) => {        
        res.send({
            status: 200,
            method: 'GET',
            message: "/test/connected"
        })
    }),
    apiHelper.add('/enum/{value}', 'GET', {
        example: {
            value: 'value_1'
        },
        header_params: [],
        body_params: [],
        path_params: [
            {
                name: 'value',
                type: 'string',
                enum: true,
                values: [
                    'value_1',
                    'value2',
                    'value_3',
                ],
                description: 'value desc',
                required: true,
            }
        ],
        checks: []
    }, {
        response: {
            ok: {'$ref': '#/components/property/ok'},
        },
        description: 'test_description_2',
        summary: 'test_description_2',
        tags: ['test']
    }, (req, res) => {        
        res.send({
            status: 200,
            method: 'GET',
            message: "/enum"
        })
    })
}
