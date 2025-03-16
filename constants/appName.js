import * as AppInfo from "../app.json";

//TODO:find a better way to handle app name 
// const appName = "Home Scan";
const { appName, slug: appSlug, ...appInfo } = AppInfo.expo;

export default appName;
export { appSlug, appInfo };