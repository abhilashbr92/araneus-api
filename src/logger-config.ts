const path = require("path");

export const LoggerStreams = [
    { level: 'debug', stream: require('file-stream-rotator').getStream({ filename: path.join(__dirname + "/logs", "%DATE%-debug.stream.log"), date_format: "YYYY-MM-DD", frequency: "daily", max_logs: 7 }) },
    { level: 'error', stream: require('file-stream-rotator').getStream({ filename: path.join(__dirname + "/logs", "%DATE%-error.stream.log"), date_format: "YYYY-MM-DD", frequency: "daily", max_logs: 7 }) },
    { level: 'fatal', stream: require('file-stream-rotator').getStream({ filename: path.join(__dirname + "/logs", "%DATE%-fatal.stream.log"), date_format: "YYYY-MM-DD", frequency: "daily", max_logs: 7 }) },
    { level: 'info', stream: require('file-stream-rotator').getStream({ filename: path.join(__dirname + "/logs", "%DATE%-info.stream.log"), date_format: "YYYY-MM-DD", frequency: "daily", max_logs: 7 }) },
    { level: 'trace', stream: require('file-stream-rotator').getStream({ filename: path.join(__dirname + "/logs", "%DATE%-trace.stream.log"), date_format: "YYYY-MM-DD", frequency: "daily", max_logs: 7 }) },
    { level: 'warn', stream: require('file-stream-rotator').getStream({ filename: path.join(__dirname + "/logs", "%DATE%-warn.stream.log"), date_format: "YYYY-MM-DD", frequency: "daily", max_logs: 7 }) },
];