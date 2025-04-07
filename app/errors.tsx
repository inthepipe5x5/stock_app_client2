/*
*-----------------------------------------------------------------------------------
*  Error Page
*  This page is used to display error messages to the user. It is a generic error page that can be used for any error.
* -----------------------------------------------------------------------------------
* */

import LoadingView from "@/screens/content/LoadingView";
import ErrorScreen from "@/screens/errors/errors";
import { Suspense, useEffect } from "react";

export default function ErrorPage() {
    useEffect(() => {
        // Log the error 
        console.error("An error occurred in the app.");
        console.log()
    }, []);

    return (
        <Suspense fallback={<LoadingView />}>
            <ErrorScreen />
        </Suspense>
    )
}