import * as AppInfo from "../app.json";

//TODO:find a better way to handle app name 
// const appName = "Home Scan";
const appInfo = AppInfo.expo;
const appName = appInfo.name;

export default appName;
export { appInfo };