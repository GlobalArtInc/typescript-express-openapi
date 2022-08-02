"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logMessage = exports.logEvent = exports.logException = exports.Severity = exports.SubTopic = exports.Topic = void 0;
var Topic;
(function (Topic) {
    Topic["Unknown"] = "unknown";
    Topic["paymentProcessed"] = "payment processed";
    Topic["Init"] = "init";
    Topic["Api"] = "api";
    Topic["Adapter"] = "adapter";
    Topic["Integration"] = "integration";
    Topic["Config"] = "config";
    Topic["Message"] = "message";
    Topic["MessageCount"] = "message-count";
    Topic["Rabbitmq"] = "rabbitmq";
    Topic["Handler"] = "handler";
    Topic["Timer"] = "timer";
})(Topic = exports.Topic || (exports.Topic = {}));
var SubTopic;
(function (SubTopic) {
    SubTopic["Unknown"] = "unknown";
    SubTopic["Rabbitmq"] = "rabbitmq";
    SubTopic["Rest"] = "rest";
    SubTopic["ScenarioTranslation"] = "scenariotranslation";
    SubTopic["Telegram"] = "telegram";
    SubTopic["Vk"] = "vk";
    SubTopic["Viber"] = "viber";
    SubTopic["Jivo"] = "jivo";
    SubTopic["Google"] = "google";
    SubTopic["Common"] = "common";
    SubTopic["InfiniteLoopBan"] = "infiniteloopban";
    SubTopic["Noinit"] = "noinit";
    SubTopic["OldMessagesFix"] = "OldMessagesFix";
    SubTopic["AnalyticsFix"] = "AnalyticsFix";
    SubTopic["LongTimerEvent"] = "LongTimerEvent";
    SubTopic["User"] = "user";
    SubTopic["Client"] = "client";
    SubTopic["Role"] = "role";
})(SubTopic = exports.SubTopic || (exports.SubTopic = {}));
var Severity;
(function (Severity) {
    Severity["Emergency"] = "emerg";
    Severity["Alert"] = "alert";
    Severity["Critical"] = "crit";
    Severity["Error"] = "err";
    Severity["Warning"] = "warning";
    Severity["Notice"] = "notice";
    Severity["Informational"] = "info";
    Severity["Debug"] = "debug";
})(Severity = exports.Severity || (exports.Severity = {}));
var LogType;
(function (LogType) {
    LogType["exception"] = "exception";
    LogType["event"] = "event";
    LogType["message"] = "message";
})(LogType || (LogType = {}));
function getStack() {
    return new Error().stack;
}
function makeFlatObject(obj) {
    try {
        if (typeof obj !== 'object' && obj !== null) {
            return { value: obj };
        }
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = `${value}\n`;
        }
        return result;
    }
    catch (e) {
        console.log(e);
    }
    return {};
}
let logException = function (topic, severity, exception, subtopic = SubTopic.Unknown) {
    try {
        if (process.env.is_running_tests)
            return;
        console.log(JSON.stringify({
            message: exception.message,
            stack: exception.stack,
            catchStack: getStack(),
            topic,
            severity,
            logType: LogType.exception,
            subtopic
        }));
    }
    catch (e) {
        console.log(e);
    }
};
exports.logException = logException;
function logEvent(topic, severity, obj, subtopic = SubTopic.Unknown) {
    try {
        if (process.env.is_running_tests)
            return;
        console.log(JSON.stringify(Object.assign(Object.assign({ topic,
            subtopic,
            severity, stack: getStack() }, makeFlatObject(obj)), { logType: LogType.event })));
    }
    catch (e) {
        console.log(e);
    }
}
exports.logEvent = logEvent;
function logMessage(topic, severity, message, subtopic = SubTopic.Unknown) {
    try {
        if (process.env.is_running_tests)
            return;
        console.log(JSON.stringify({
            topic,
            subtopic,
            severity,
            stack: getStack(),
            logType: LogType.message,
            message
        }));
    }
    catch (e) {
        console.log(e);
    }
}
exports.logMessage = logMessage;
exports.default = {
    Topic, SubTopic, Severity,
};
