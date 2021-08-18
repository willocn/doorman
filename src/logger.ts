import { Logger } from "tslog";

const logger = new Logger({
    displayLoggerName: false,
    displayFunctionName: false,
    dateTimePattern: "hour:minute:second"
});
export default logger;