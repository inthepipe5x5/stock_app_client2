// import Captcha from "@/components/Captcha";
// import DashboardLayout from "@/screens/_layout";

// export default function CaptchaRoute() {
//     return (
//         <DashboardLayout
//             title="Captcha"
//             isSidebarVisible={false}
//         >
//             <Captcha />
//         </DashboardLayout>
//     );
// }
import NotFoundScreen from "@/screens/errors/notfound";
export default function CaptchaRoute() {
    return (
        // <Captcha />
        <NotFoundScreen />
    );
}