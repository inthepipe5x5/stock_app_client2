import { useState, useMemo, useCallback, createContext, useContext, useRef } from 'react'
import { useLocalSearchParams, router, usePathname, RelativePathString } from 'expo-router';

export type captchaToken = {
    token: string | null | undefined;
    date: string | null | undefined;
} | null | undefined;

type CaptchaContextProps = {
    captchaToken: captchaToken;
    setCaptchaToken: React.Dispatch<React.SetStateAction<captchaToken>>;
    redirectProps: {
        pathname: string;
        params: Record<string, any>;
    } | null;
    setRedirectProps: React.Dispatch<React.SetStateAction<{
        pathname: string;
        params: Record<string, any>;
    } | null>>;
    getCaptchaToken: () => captchaToken | null;
    updateCaptchaThenRedirect: (newToken: string) => void;
    turnstileRef: React.RefObject<any>;
} | null

export const CaptchaContext = createContext<CaptchaContextProps>(null);

export const CaptchaProvider = ({ children }: { children: React.ReactNode }) => {
    const [captchaToken, setCaptchaToken] = useState<captchaToken | null>(null);
    const [redirectProps, setRedirectProps] = useState<{
        pathname: string;
        params: Record<string, any>;
    } | null>(null);
    const turnstileRef = useRef<any>(null); // Ref to the Turnstile component
    const pathname = usePathname();
    const params = useLocalSearchParams();

    // Function to get the captcha token and redirect to the captcha page if needed
    const getCaptchaToken = useCallback(() => {
        //check captchaToken expiration
        if (captchaToken) {
            const { date } = captchaToken;
            const createdDate = new Date(date ?? '');
            const currentDate = new Date();
            const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
            const diffMinutes = Math.ceil(diffTime / (1000 * 60));
            //check if the token is older than 5 minutes
            if (diffMinutes > 5) {
                setCaptchaToken(null);
                return null;
            }
            router.setParams({ captcha: 'verified' }); // set params to verify captcha
            return captchaToken;
        }
        setRedirectProps({
            pathname: pathname,
            params: {
                ...params,
                // captcha: 'verified'
            }
        });
        // redirect to captcha page if token is not set or expired or return null
        return pathname === '/captcha' ? null : router.push({
            pathname: '/captcha' as RelativePathString,
            params: {
                nextURL: pathname,
                ...params,

            }
        }); // redirect to captcha page if token is not set or expired
        // redirect to captcha page if token is not set or expired
    }
        , [captchaToken]);

    // Function to update the captcha token and redirect to the original page
    const updateCaptchaThenRedirect = useCallback((newToken: string) => {
        setCaptchaToken({
            token: newToken,
            date: new Date().toISOString()
        });

        router.setParams({ captcha: 'verified' }); // set params to verify captcha
        //if redirectProps is not null, redirect to the original page
        !!redirectProps ?
            router.dismissTo(
                redirectProps?.pathname as RelativePathString,
                redirectProps?.params
            ) :
            router.back(); // go back to the previous page if redirectProps is not set


        setRedirectProps(null); // clear redirect props}
    }
        , []);

    const value = useMemo(() => ({
        captchaToken,
        setCaptchaToken,
        redirectProps,
        setRedirectProps,
        getCaptchaToken,
        updateCaptchaThenRedirect,
        turnstileRef,
    }), [captchaToken]);

    return (
        <CaptchaContext.Provider
            value={value as CaptchaContextProps}>
            {children}
        </CaptchaContext.Provider>);
}

export const useCaptchaContext = () => {
    const context = useContext(CaptchaContext);
    if (!context) {
        throw new Error('useCaptchaContext must be used within a CaptchaProvider');
    }
    return context;
}