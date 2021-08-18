import { Logger } from "tslog";

const logger = new Logger({
    displayLoggerName: true,
    displayFunctionName: false,
    dateTimePattern: "hour:minute:second",
    displayFilePath: "hidden",
    name: "doorman",
});

export default function getLogger(loggerName: string) {
    return logger.getChildLogger({
        name: loggerName
    });
}