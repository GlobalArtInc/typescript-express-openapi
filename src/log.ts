import chalk from 'chalk';

export enum Topic {
    Unknown = 'unknown',
    paymentProcessed = 'payment processed',

    Init = 'init',
    Api = 'api',
    Adapter = 'adapter',
    Integration = 'integration',
    Config = 'config',
    Message = 'message',
    MessageCount = 'message-count',
    Rabbitmq = 'rabbitmq',
    Handler = 'handler',
    Timer = 'timer',
}

export enum SubTopic {
    Unknown = 'unknown',

    Rabbitmq = 'rabbitmq',
    Rest = 'rest',
    ScenarioTranslation = 'scenariotranslation',
    Telegram = 'telegram',
    Vk = 'vk',
    Viber = 'viber',
    Jivo = 'jivo',
    Google = 'google',
    Common = 'common',
    InfiniteLoopBan = 'infiniteloopban',
    Noinit = 'noinit',

    OldMessagesFix = 'OldMessagesFix',
    AnalyticsFix = 'AnalyticsFix',
    LongTimerEvent = 'LongTimerEvent',

    User = 'user',
    Client = 'client',
    Role = 'role'
}

export enum Severity {
    Emergency = 'emerg',
    Alert = 'alert',
    Critical = 'crit',
    Error = 'err',
    Warning = 'warning',
    Notice = 'notice',
    Informational = 'info',
    Debug = 'debug',
}

enum LogType {
    exception = 'exception',
    event = 'event',
    message = 'message'
}

function getStack() {
    return new Error().stack;
}

function makeFlatObject(obj: any) {
    try {
        if (typeof obj !== 'object' && obj !== null) {
            return { value: obj };
        }
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = `${value}\n`;
        }
        return result;
    } catch (e) {
        console.log(e);
    }
    return {};
}

export let logException = function (topic: Topic, severity: Severity, exception: Error, subtopic: SubTopic = SubTopic.Unknown) {
    try {
            if (process.env.is_running_tests) return;
            console.log(JSON.stringify({
                message: exception.message,
                stack: exception.stack,
                catchStack: getStack(),
                topic,
                severity,
                logType: LogType.exception,
                subtopic
            }));
    } catch (e) {
        console.log(e);
    }
};

export function logEvent(topic: string, severity: Severity, obj: { [key: string]: string | number }, subtopic = SubTopic.Unknown) {
    try {
        if (process.env.is_running_tests) return;
        console.log(JSON.stringify({
            topic,
            subtopic,
            severity,
            stack: getStack(),
            ...makeFlatObject(obj),
            logType: LogType.event
        }));
    } catch (e) {
        console.log(e);
    }
}

export function logMessage(topic: string, severity: Severity, message: string, subtopic = SubTopic.Unknown) {
    try {
        if (process.env.is_running_tests) return;
        console.log(JSON.stringify({
            topic,
            subtopic,
            severity,
            stack: getStack(),
            logType: LogType.message,
            message
        }));
    } catch (e) {
        console.log(e);
    }
}

export default {
    Topic, SubTopic, Severity,
};
