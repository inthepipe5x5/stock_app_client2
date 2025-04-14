import { Suspense, useEffect, useRef, useState } from 'react';
import { RelativePathString, Stack, useLocalSearchParams, useRouter, router } from 'expo-router';
import { Platform, StyleSheet, useColorScheme, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Pressable } from '@/components/ui/pressable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { HStack } from '@/components/ui/hstack';
import Colors from '@/constants/Colors';
// import * as ImagePicker from 'expo-image-picker';
import { VStack } from '@/components/ui/vstack';
import { Image } from '@/components/ui/image';
import { useUserSession } from '@/components/contexts/UserSessionProvider';
import defaultSession, { access_level, draft_status, product, task } from '@/constants/defaultSession';
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { checkAccess } from '@/lib/supabase/auth';
import supabase from '@/lib/supabase/supabase';
import { Spinner } from '@/components/ui/spinner';
import { SkeletonText } from '@/components/ui/skeleton';
import { set } from 'react-hook-form';
import { formatDatetimeObject } from '@/utils/date';
import { TaskHelper } from '@/lib/supabase/ResourceHelper';

import { Database } from '@/lib/supabase/dbTypes';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Box } from 'lucide-react-native';
import { FloatingFooter } from '@/components/navigation/Footer';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogBody, AlertDialogBackdrop } from "@/components/ui/alert-dialog";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import React from "react";
import { cn } from '@gluestack-ui/nativewind-utils/cn';
import { TaskActions } from '@/components/navigation/ResourceActionSheet';
import {
    Actionsheet,
    ActionsheetContent,
    ActionsheetItem,
    ActionsheetItemText,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper,
    ActionsheetBackdrop,
} from "@/components/ui/actionsheet";

export function DeleteTaskDialog({
    task_id,
    showAlertDialog,
    handleClose,
    userAccess,
}: {
    status?: { status: "loading" | "success" | "error", message: string } | null;
    task_id: string;
    userAccess: boolean | null;
    showAlertDialog: boolean;
    handleClose: () => void;
}) {
    const [status, setStatus] = useState<{ status: "loading" | "success" | "error", message: string } | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    // const [showAlertDialog, setShowAlertDialog] = React.useState(true);
    return (
        <>
            <AlertDialog
                isOpen={showAlertDialog}
                onClose={handleClose}
                size="md"
                avoidKeyboard={true}
                closeOnOverlayClick={true}
                isKeyboardDismissable={true}
            >
                <AlertDialogBackdrop />
                <AlertDialogContent className={cn("bg-white dark:bg-gray-800 shadow-lg",
                    status?.status === "error" ? "border-error-500 bg-500 bg-error-400" :
                        status?.status === "loading" ?
                            "border-info-500 bg-info-500" :
                            "border-success-500 bg-success-500")}>
                    {userAccess ? (
                        <>
                            <AlertDialogHeader>
                                <Heading className={cn("text-typography-950 font-semibold",
                                    status?.status === "error" ? "text-typography-50" : status?.status === "loading" ? "text-warning-500" : "text-success-500"
                                )} size="md">
                                    {status?.status ?? "Are you sure you want to delete this task?"}
                                </Heading>
                            </AlertDialogHeader>
                            <AlertDialogBody className={cn("mt-3 mb-4",
                                status?.status === "error" ? "text-typography-50" : status?.status === "loading" ? "text-info-500" : "text-success-500"
                            )}>
                                <Text size="sm">
                                    Deleting the task will remove it permanently and cannot be undone. Please confirm if you want to proceed.
                                </Text>
                            </AlertDialogBody>
                            <AlertDialogFooter className="">
                                <Button
                                    variant="outline"
                                    action="secondary"
                                    onPress={handleClose}
                                    size="sm"
                                >
                                    <ButtonText>Cancel</ButtonText>
                                </Button>
                                {!['success', 'error'].includes(status?.status ?? '') || !!!userAccess ?
                                    (
                                        <Button size="sm"
                                            disabled={loading || !!!userAccess}
                                            onPress={async () => {
                                                setLoading(true);
                                                const { data, error } = await supabase
                                                    .from('tasks')
                                                    .delete()
                                                    .filter('task_id', 'eq', task_id)
                                                    .select('*')
                                                    .single();
                                                if (error) {
                                                    console.error("Error deleting task", error);
                                                    setStatus({ status: "error", message: error.message });
                                                    setLoading(false);
                                                    return;
                                                }
                                                console.log("Task deleted", data);
                                                setStatus({ status: "success", message: "Task deleted successfully" });
                                                handleClose();
                                            }}>
                                            {loading ? <ButtonSpinner /> : <ButtonText>Delete</ButtonText>}
                                        </Button>
                                    ) : null}
                            </AlertDialogFooter>
                        </>
                    ) : (
                        <>
                            <AlertDialogHeader>
                                <Heading className="text-error-700 font-semibold" size="md">
                                    You do not have permission to delete this task.
                                </Heading>
                            </AlertDialogHeader>
                            <AlertDialogBody className="mt-3 mb-4">
                                <Text size="sm" className="text-error-500 text-semibold">
                                    Please contact the task owner or the household manager for assistance.
                                </Text>
                            </AlertDialogBody>
                            <AlertDialogFooter className="">
                                <Button
                                    variant="outline"
                                    action="secondary"
                                    onPress={handleClose}
                                    size="sm"
                                >
                                    <ButtonText>Close</ButtonText>
                                </Button>
                            </AlertDialogFooter>
                        </>
                    )}
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
type task_assignment = Database['public']['Tables']['task_assignments']['Row'];


export function CompleteTaskDialog({
    showAlertDialog,
    handleClose,
    userAccess,
    task,
    task_id,
    householdId,
}: {
    status?: { status: "loading" | "success" | "error", message: string } | null;
    userAccess: boolean | null;
    showAlertDialog: boolean;
    handleClose: () => void;
    task: Partial<task>;
    task_id: string | null;
    householdId: string | null;
}) {
    const [status, setStatus] = useState<{ status: "loading" | "success" | "error", message: string } | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    return (
        <>
            <AlertDialog
                isOpen={showAlertDialog}
                onClose={handleClose}
                size="md"
                avoidKeyboard={true}
                closeOnOverlayClick={true}
                isKeyboardDismissable={true}
            >
                <AlertDialogBackdrop />
                <AlertDialogContent className={cn(
                    "bg-white dark:bg-gray-800 shadow-lg",
                    status?.status === "error" ? "border-error-500 bg-error-400" :
                        status?.status === "loading" ? "border-info-500 bg-info-500" :
                            "border-success-500 bg-success-500"
                )}>
                    {userAccess ? (
                        <>
                            <AlertDialogHeader>
                                <Heading className={cn(
                                    "text-typography-950 font-semibold",
                                    status?.status === "error" ? "text-typography-50" :
                                        status?.status === "loading" ? "text-warning-500" :
                                            "text-success-500"
                                )} size="md">
                                    {status?.status ?? "Are you sure you want to mark this task as complete?"}
                                </Heading>
                            </AlertDialogHeader>
                            <AlertDialogBody className={cn(
                                "mt-3 mb-4",
                                status?.status === "error" ? "text-typography-50" :
                                    status?.status === "loading" ? "text-info-500" :
                                        "text-success-500"
                            )}>
                                <Text size="sm">
                                    Completing the task will update its status to "completed". Please confirm if you want to proceed.
                                </Text>
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button
                                    variant="outline"
                                    action="secondary"
                                    onPress={handleClose}
                                    size="sm"
                                >
                                    <ButtonText>Cancel</ButtonText>
                                </Button>
                                {!['success', 'error'].includes(status?.status ?? '') || !!!userAccess ? (
                                    <Button
                                        size="sm"
                                        disabled={loading || !!!userAccess}
                                        onPress={async () => {
                                            setLoading(true);
                                            try {
                                                const { data, error } = await supabase.from('tasks')
                                                    .upsert({ ...task, completion_status: 'completed' }, {
                                                        onConflict: 'task_id',
                                                    })
                                                    .select('*')
                                                    .single();
                                                if (error) {
                                                    console.error("Error completing task", error);
                                                    setStatus({ status: "error", message: error.message });
                                                    setLoading(false);
                                                    return;
                                                }
                                                console.log("Task completed", data);
                                                setStatus({ status: "success", message: "Task marked as completed successfully" });
                                                router.replace({
                                                    pathname: '/(tabs)/households/[household_id]/tasks/[task_id]/complete' as RelativePathString,
                                                    params: {
                                                        task_id: task_id,
                                                        household_id: householdId,
                                                    },
                                                });
                                            } catch (err) {
                                                console.error("Unexpected error completing task", err);
                                                setStatus({ status: "error", message: "An unexpected error occurred" });
                                            } finally {
                                                setLoading(false);
                                                handleClose();
                                            }
                                        }}
                                    >
                                        {loading ? <ButtonSpinner /> : <ButtonText>Complete</ButtonText>}
                                    </Button>
                                ) : null}
                            </AlertDialogFooter>
                        </>
                    ) : (
                        <>
                            <AlertDialogHeader>
                                <Heading className="text-error-700 font-semibold" size="md">
                                    You do not have permission to complete this task.
                                </Heading>
                            </AlertDialogHeader>
                            <AlertDialogBody className="mt-3 mb-4">
                                <Text size="sm" className="text-error-500 text-semibold">
                                    Please contact the task owner or the household manager for assistance.
                                </Text>
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button
                                    variant="outline"
                                    action="secondary"
                                    onPress={handleClose}
                                    size="sm"
                                >
                                    <ButtonText>Close</ButtonText>
                                </Button>
                            </AlertDialogFooter>
                        </>
                    )}
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default function TaskDetailView() {
    const globalContext = useUserSession();
    const { state } = globalContext || defaultSession;
    const params = useLocalSearchParams();
    const { task_id, household_id } = params;
    const router = useRouter();
    const title = params?.title?.[0] ?? 'Permissions Required';
    const message = params?.message?.[0] ?? 'Please grant the following permissions to proceed.';
    const nextURL = params?.nextURL?.[0];
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const colors = Colors[useColorScheme() ?? 'light'];
    const oppositeColors = Colors[useColorScheme() === 'light' ? 'dark' : 'light'];
    const [taskAssignment, setTaskAssignment] = useState<Partial<task_assignment> | null>(null);
    const [taskId, setTaskId] = useState<string | null>(task_id?.[0] ?? null);
    const [householdId, setHouseholdId] = useState<string | null>(household_id?.[0] ?? null);
    const [userAccess, setUserAccess] = useState<boolean | null>(null);
    const [task, setTask] = useState<Partial<task | Database['public']['Tables']['tasks']['Row']> | null>(null);
    const [relatedProduct, setRelatedProduct] = useState<Partial<product> | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const taskHelper = useRef<any | null>(null);
    const animatedValueRef = useRef<any | null>(new Animated.Value(0)).current;
    const [showActionSheet, setShowActionSheet] = useState<boolean>(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState<"confirm" | "delete" | null>(false);
    const qc = useQueryClient();
    const slideDown = () => {
        setShowActionSheet(true);
        Animated.timing(animatedValueRef, {
            toValue: 235,
            duration: 300,
            useNativeDriver: false
        }).start();
    };

    const slideUp = () => {
        Animated.timing(animatedValueRef, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false
        }).start(() => setShowConfirmDialog(null));
    };

    const toggleActionSheet = () => {
        //actionsheet hidden => show actionsheet
        if (!showActionSheet) {
            slideUp();
        } else {
            //actionsheet shown => hide actionsheet
            slideDown();
        }
    }



    const handleRedirect = ({
        pathname,
        params,
    }:
        {
            pathname?: string | undefined;
            params?: { [key: string]: any } | undefined;
        } = {
            pathname: nextURL,
            params: {
                message: [...(message ?? 'Page not found')],
                dismissToURL: nextURL,
                nextURL: nextURL,
            }
        }) => {

        return !!!pathname && router.canGoBack() ?
            router.back() :
            router.canDismiss() ?
                router.dismiss() :
                router.replace({
                    pathname: (pathname ?? "/+notfound") as RelativePathString,
                    params: {
                        dismissToURL: nextURL,
                        nextURL,
                        ...params,
                    },
                });
    };

    const handleDismiss = (params: { [key: string]: any } | null = null) => {
        const redirectTo = !!params ? { pathname: nextURL, params } : { pathname: nextURL };
        if (nextURL) {
            handleRedirect(redirectTo);
        } else {
            router.canDismiss() ? router.dismissTo({ ...redirectTo, pathname: redirectTo.pathname as RelativePathString }) : router.dismissAll();
        }
    };

    //useQuery to fetch task & assignment details 
    const { data: combinedData, isLoading, error, ...queryOptions } = useQuery({
        queryKey: ['taskData', { task_id: taskId, household_id: householdId, user_id: state?.user?.user_id }],
        queryFn: async () => {
            const [taskAssignment, taskDetails, relatedProductQuery] = await Promise.all([
                supabase
                    .from('task_assignments')
                    .select('*')
                    .eq('task_id', taskId)
                    .eq('user_id', state?.user?.user_id)
                    .single(),
                supabase
                    .from('tasks')
                    .select('*')
                    .eq('task_id', taskId)
                    .single(),
                supabase
                    .from('products')
                    .select('*')
                    .eq('task_id', taskId)
                    .limit(10)
            ]);

            if (taskAssignment.error) {
                console.error("Error fetching task assignment", taskAssignment.error);
                throw new Error(taskAssignment.error.message);
            }

            if (taskDetails.error) {
                console.error("Error fetching task details", taskDetails.error);
                throw new Error(taskDetails.error.message);
            }
            if (relatedProductQuery.error) {
                console.error("Error fetching task details", relatedProductQuery.error);
                throw new Error(relatedProductQuery.error.message);
            }

            return {
                taskAssignment: taskAssignment.data,
                taskDetails: taskDetails.data,
                relatedProduct: relatedProductQuery.data,
            };
        },
        enabled: !!taskId && !!state?.user?.user_id && !!householdId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: true,
    });

    //effect to set base state variables
    useEffect(() => {
        const checkUserAccess = async () => {
            if (state?.user?.user_id && taskId && householdId) {
                const hasAccess = await checkAccess({
                    household_id: householdId,
                    user_id: state.user.user_id,
                    created_by: task?.created_by as string,
                    draft_status: task?.draft_status ?? "guest" as draft_status,
                });
                console.log("User Access", hasAccess);
                //set user access to true if user has access
                if (hasAccess) {
                    setTaskId(taskId);
                    setUserAccess(true);
                    return true;
                }
                //set user access to false if user does not have access

                handleDismiss({ message: "You do not have access to this task." });
                setUserAccess(false)
                return false;
            };
            //set combinedData
            if (combinedData) {
                const { taskAssignment, taskDetails, relatedProduct } = combinedData;
                setTaskId(taskDetails?.id ?? taskDetails?.task_id ?? taskAssignment?.task_id ?? null);
                setTask(taskDetails);
                setTaskAssignment(taskAssignment);
                setRelatedProduct(relatedProduct?.[0] ?? null);
                taskHelper.current = new TaskHelper(taskAssignment, taskDetails, relatedProduct?.[0] ?? null);
                setLoading(false);

                checkUserAccess();
            } else if (!!!combinedData || queryOptions.isError || queryOptions?.isLoadingError) {
                console.error("Error fetching task data", error);
                handleDismiss({ message: error?.message ?? "You do not have access to this task or it cannot be viewed at this time" });
                setLoading(false);
                setUserAccess(false);
            }
            // const newTheme = !!state?.user?.preferences?.theme && ['light', 'dark'].includes(state?.user?.preferences?.theme ?? "") ? state?.user?.preferences?.theme : useColorScheme() ?? 'light'
            if (!!!theme) {
                let newTheme;
                switch (state?.user?.preferences?.theme) {
                    case 'system':
                        newTheme = useColorScheme() === 'light' ? 'dark' : 'light';
                        break;
                    case 'light':
                    case 'dark':
                        newTheme = state?.user?.preferences?.theme;
                        break;
                    default:
                        newTheme = useColorScheme() === 'light' ? 'dark' : 'light';
                        break;
                }
                //set color scheme based on user preferences or device appearance
                setTheme(newTheme as "light" | "dark");
            }
            //note userAccess can be null which means we are still checking access
            if (!!!state || !Object.values(state).every(Boolean) || userAccess === false) {
                console.log("User is not authenticated", { state });
                //set user access to false
                setUserAccess(false);
                //redirect to auth screen if user is not authenticated
                handleRedirect({
                    pathname: "/(auth)/(signin)",
                    params: {
                        message: "You need to be logged in to access this page.",
                        nextURL: nextURL,
                    },
                });
            }
        }
    }, [state, combinedData, userAccess]);

    const FallBack = () => {
        return (<ThemedView className="flex-col flex-1 items-center justify-center mb-6 px-5 mx-5">
            <ThemedText type="default">Loading...</ThemedText>
            <Spinner size={'large'} color={colors.accent} />
            <SkeletonText
                speed={2}
                gap={2}
                _lines={2}
                className='w-[20%] flex-start'
            />
            <SkeletonText
                speed={2}
                gap={2}
                _lines={5}
                className='w-[90%] flex-auto'
            />
        </ThemedView>)
    }
    const TaskActionButtons = () => {
        return (
            <Box className="flex-col sm:flex-row">
                <Button
                    className="px-4 py-2 mr-0 mb-3 sm:mr-3 sm:mb-0 sm:flex-1"
                    onPress={() => {
                        setShowConfirmDialog(null);
                        slideUp();
                    }}
                    action={loading || isLoading ? 'secondary' : 'primary'}
                    disabled={[userAccess, loading, isLoading, !combinedData, !task, !taskAssignment].some(Boolean)}
                >
                    <ButtonText size="sm">Edit Task</ButtonText>
                </Button>
                <Button
                    variant="outline"
                    disabled={[userAccess, loading, isLoading, !combinedData, !task, !taskAssignment].some(Boolean)}
                    className="px-4 py-2 border-outline-300 sm:flex-1"
                    onPress={() => {
                        setShowConfirmDialog('delete');
                        if (showActionSheet) {
                            toggleActionSheet();
                        }
                    }}
                >
                    <ButtonText size="sm" className="text-typography-600">
                        Delete Task
                    </ButtonText>
                </Button>
            </Box>
        )
    }
    if (isLoading || loading) {
        return (
            <SafeAreaView style={[styles.centered, styles.container]} >
                {Platform.OS === 'android' ? <StatusBar style="light" /> : <StatusBar style="auto" />}
                <Stack.Screen
                    options={{
                        headerShown: true,
                        title: title ?? "Task Detail",
                        headerStyle: { backgroundColor: colors.primary.main },
                        headerTintColor: colors.accent,
                    }}
                />
                <FallBack />
            </SafeAreaView>
        );
    }
    if (error) {
        console.error("Error fetching task data", error);
        return (
            <SafeAreaView style={[styles.centered, styles.container]} >
                {Platform.OS === 'android' ? <StatusBar style="light" /> : <StatusBar style="auto" />}
                <Stack.Screen
                    options={{
                        headerShown: true,
                        title: title ?? "Task Detail",
                        headerStyle: { backgroundColor: colors.primary.main },
                        headerTintColor: colors.accent,
                    }}
                />
                <VStack space="md" className="flex-col items-center justify-center mb-6 px-5 mx-5">
                    <ThemedText type="default" className="text-center py-6 my-6">
                        {error.message}
                    </ThemedText>
                    <Pressable
                        onPress={() => router.canGoBack() ? router.back() : router.canDismiss() ? router.dismiss() : router.replace({
                            pathname: '/+not-found' as RelativePathString,
                            params:
                            {
                                title: "Task Not Found",
                                message: error?.message ?? "You do not have access to this task.",
                            }

                        })}
                        className="bg-primary px-4 py-2 rounded-md"
                    >
                        <ThemedText type="link" className="text-white">
                            Go Back
                        </ThemedText>
                    </Pressable>
                </VStack>
            </SafeAreaView >
        );
    }

    return (
        <SafeAreaView style={[styles.centered, styles.container]} >
            {Platform.OS === 'android' ? <StatusBar style="light" /> : <StatusBar style="auto" />}
            < Stack.Screen
                options={{
                    headerShown: true,
                    title: title ?? "Task Detail",
                    headerStyle: { backgroundColor: colors.primary.main },
                    headerTintColor: colors.accent,
                }}
            />
            < ThemedView style={
                [
                    styles.container,
                    styles?.centered,
                    {
                        paddingHorizontal: 20,
                        backgroundColor: colors.background,
                        borderRadius: 50,
                        overflow: 'hidden',
                        width: '100%',
                        // paddingVertical: 2,
                        marginVertical: 20,
                        shadowColor: '#808080',
                        shadowOffset: {
                            width: 5,
                            height: 50,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.5,
                        elevation: 5,
                    },
                ]} >
                {showConfirmDialog === 'delete' && !!userAccess ? (
                    <DeleteTaskDialog
                        task_id={taskId as string}
                        showAlertDialog={showConfirmDialog === 'delete'}
                        userAccess={userAccess}
                        handleClose={() => setShowConfirmDialog(null)}
                    />
                )
                    :
                    null
                }
                {showConfirmDialog === 'complete' && !!userAccess ? (
                    <CompleteTaskDialog
                        task_id={taskId as string}
                        showAlertDialog={showConfirmDialog === 'complete'}
                        userAccess={userAccess}
                        handleClose={() => setShowConfirmDialog(null)}
                        task={task as Partial<task>}
                        householdId={householdId as string}
                    />
                )
                    :
                    null
                }
                {combinedData ? (
                    <Suspense fallback={
                        <FallBack />
                    }>
                        <VStack space='md' className="flex-col items-center justify-center mb-6 px-5 mx-5">
                            <ThemedText
                                type="title"
                                className="text-3xl font-bold py-6 my-6 text-align-center"
                            >
                                {task?.task_name ?? title}
                            </ThemedText>
                            {!!relatedProduct?.photo_url ?
                                <Image
                                    className="rounded-full my-6 py-5 h-1/2 w-1/2 aspect-[263/240]"
                                    source={{ uri: relatedProduct?.photo_url as string }}
                                    resizeMethod="auto"
                                    alt={`Related ${relatedProduct?.product_name ?? "Product"} Image`}
                                /> :
                                null}
                            <ThemedView className="flex-row items-center justify-center mb-6 px-5 mx-5">
                                {/* <ThemedText type="default" className="text-center py-6 my-6">
                                {taskHelper?.current?. ?? !!task?.due_date ? 'Due' + formatDatetimeObject(new Date(task?.due_date)) : "Due Date"}
                            </ThemedText>
 */}
                                {
                                    !!task && taskHelper.current ?
                                        taskHelper.current?.getBadge(
                                            null
                                        ) : null
                                }
                                <ThemedText type="subtitle" className="text-center py-6 my-6">
                                    {taskHelper.current?.getStatus() ?? "Assigned"}
                                    {/* {task?.completion_status ?? "Assigned"} */}
                                </ThemedText>
                            </ThemedView>
                            <ThemedText
                                type="default"
                                className="text-center py-6 my-6">
                                {task?.description ?? message}
                            </ThemedText>
                        </VStack>
                        <VStack space="md" className="flex-col items-center justify-center mb-6 px-5 mx-5">

                        </VStack>
                        <Pressable
                            onPress={handleDismiss}
                            style={{
                                backgroundColor: colors.accent,
                                flexDirection: 'row',
                                paddingVertical: 15,
                                marginBottom: 30,
                                borderRadius: 5,
                                paddingHorizontal: 20,
                            }}
                        >
                            <HStack style={styles.buttonContent}>
                                <ThemedText type="link" style={{ color: colors.navigation.default }}>
                                    Dismiss
                                </ThemedText>
                            </HStack>
                        </Pressable>
                    </Suspense>) : <FallBack />}
                <Actionsheet
                    isOpen={showActionSheet}
                    defaultIsOpen={false}
                    closeOnOverlayClick={true}
                    isKeyboardDismissable={true}
                    trapFocus={false}
                    // snapPoints={[0, 100, 200]}
                    // onOpen={() => {
                    //     cameraRef.current?.pausePreview();
                    //     // setShowActionSheet(true);
                    //     console.log("Actionsheet opened", { showActionSheet });
                    // }}
                    // onClose={() => {
                    //     cameraRef.current?.resumePreview();
                    // }}
                    preventScroll={false} // ensure scroll is not prevented when open
                >
                    <ActionsheetBackdrop />
                    <ActionsheetContent
                    // style={{ maxHeight: height * 0.75 }}
                    >
                        {!!combinedData && !!task ?
                            <TaskActions
                                data={task as Partial<task>}
                                handleEdit={async () => {
                                    setShowActionSheet(false);
                                    slideUp();
                                    qc.prefetchQuery({
                                        queryFn: async () => {
                                            const { data, error } = await supabase
                                                .from('tasks')
                                                .select('*')
                                                .eq('task_id', taskId)
                                                .single();
                                            if (error) {
                                                console.error("Error fetching task details", error);
                                                throw new Error(error.message);
                                            }
                                            return data;
                                        },
                                        queryKey: ['taskData', { task_id: taskId, household_id: householdId, user_id: state?.user?.user_id }],
                                    })
                                    router.push({
                                        pathname: '/(tabs)/households/[household_id]/tasks/[task_id]/edit' as RelativePathString,
                                        params: {
                                            task_id: taskId,
                                            household_id: householdId,
                                        },
                                    });
                                }}
                                handleDelete={() => {
                                    setShowActionSheet(false);
                                    slideDown();
                                    setShowConfirmDialog('delete')
                                }}
                                handleShare={() => {
                                    setShowActionSheet(false);
                                    slideUp();
                                    router.push({
                                        pathname: '/(tabs)/households/[household_id]/tasks/[task_id]/share' as RelativePathString,
                                        params: {
                                            task_id: taskId,
                                            household_id: householdId,
                                        },
                                    });
                                }}
                                handleClose={() => {
                                    setShowActionSheet(false);
                                    slideUp();
                                }}
                                // handleComplete={() => setShowConfirmDialog('complete')}
                                handleReschedule={() => {
                                    setShowActionSheet(false);
                                    slideUp();
                                    router.push({
                                        pathname: '/(tabs)/households/[household_id]/tasks/[task_id]/reschedule' as RelativePathString,
                                        params: {
                                            task_id: taskId,
                                            household_id: householdId,
                                        },
                                    });
                                }}
                            /> : null}
                        <ActionsheetItem
                            onPress={() => {
                                setShowActionSheet(false);
                                slideUp();
                            }}
                            className="flex-row items-center justify-center mb-6 px-5 mx-5"
                        >Cancel</ActionsheetItem>
                        <ActionsheetDragIndicatorWrapper>
                            <ActionsheetDragIndicator />
                        </ActionsheetDragIndicatorWrapper>

                    </ActionsheetContent>
                </Actionsheet>
                <FloatingFooter>
                    <TaskActionButtons />
                </FloatingFooter>
            </ThemedView >
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 32,
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        marginTop: 15,
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        width: '80%',
    },
    buttonContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
