//screen to create a task and invite users

import { ThemedView } from "@/components/ThemedView";
import { Text } from "@/components/ui/text";
import {
    Button,
    ButtonText,
    ButtonIcon,
    ButtonSpinner,
} from "@/components/ui/button";
import { Appearance, Image as RNImage } from "react-native";
import { useRef, useState } from "react";
import { ArrowLeftCircle, ArrowRightCircle, Camera, CameraOff, CircleX, Images } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Redirect, RelativePathString, router, useLocalSearchParams } from "expo-router";
import { Database } from "@/lib/supabase/dbTypes";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import { FloatingFooter } from "@/components/navigation/Footer";
import SubmitButton from "@/components/navigation/SubmitButton";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import defaultSession from "@/constants/defaultSession";
import ResourceBackgroundMedia from "@/screens/content/ResourceBackgroundMedia";
import ImageViewer from "@/components/ImageViewer";
import { Controller, set, useForm } from "react-hook-form";
import GalleryUploader from "@/screens/(tabs)/scan/GalleryView";
import { Modal, ModalBackdrop, ModalContent } from "@/components/ui/modal";
import { Pressable } from "react-native";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { FormControl, FormControlError, FormControlLabel } from "@/components/ui/form-control";
import { Divider } from "@/components/ui/divider";
import { Menu, MenuItem } from "@/components/ui/menu";
import { HStack } from "@/components/ui/hstack";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import supabase from "@/lib/supabase/supabase";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { CurrentQuantityStatus, UnitMeasurements } from "@/lib/schemas/enums";
import Colors from "@/constants/Colors";

type taskType = Database['public']['Tables']['tasks']['Row'];
type taskAssignmentType = Database['public']['Tables']['task_assignments']['Row'];
type taskInsert = {
    id: string | null
    task_name: string
    is_automated?: boolean
    completion_status?:
    | Database["public"]["Enums"]["completion_status"]
    | null
    automation_trigger?: Database["public"]["Enums"]["current_quantity_status"] | null
    created_by?: string | null
    created_dt?: string | null
    description?: string | null
    draft_status?: Database["public"]["Enums"]["draft_status"] | null
    due_date: string | null
    is_template?: boolean | null
    last_updated_by?: string | null
    product_id?: string | null
    recurrence_end_date?: string | null
    recurrence_interval?: unknown | null
    updated_dt?: string | null
}

// Function to create an initial task object with default values
const createInitialTask = (
    userId: string,
    productId?: string | null): taskInsert => {
    return {
        id: null,
        task_name: '',
        completion_status: 'assigned',
        created_by: userId,
        due_date: new Date().toISOString(),
        created_dt: new Date().toISOString(),
        last_updated_by: userId,
        description: "",
        draft_status: 'draft',
        is_template: false,
        product_id: productId ?? null,
        is_automated: false,
        automation_trigger: null,
        recurrence_end_date: null,
        recurrence_interval: null,
        updated_dt: new Date().toISOString()
    }
}
/**
 * The function creates an object with task assignment details including task ID, assigned to, assigned
 * by, and timestamps to be inserted into 
 * @param  - The `createInitTaskAssignmentObject` function takes in an object with three properties:
 * `assignedTo`, `userId`, and `taskId`, all of which are of type string. The function then returns an
 * object with the following properties:
 * @returns The function `createInitTaskAssignmentObject` returns an object with the following
 * properties:
 * - `task_id` set to the value of `taskId`
 * - `assigned_to` set to the value of `assignedTo`
 * - `assigned_by` set to the value of `userId`
 * - `updated_at` set to the current date and time in ISO format
 * - `created_at` set to
 */

export const createInitTaskAssignmentObject = (
    { assignedTo, userId, taskId }: {
        assignedTo: string,
        userId: string,
        taskId: string
    }
) => {
    return {
        task_id: taskId,
        assigned_to: assignedTo,
        assigned_by: userId,
        // status: 'assigned',
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
    }
}

const newTaskForm = (props: {
    initialData?: taskInsert
    onSubmit: (task: taskInsert) => void
}) => {
    const globalContext = useUserSession();
    const user = globalContext?.state?.user || defaultSession?.user;
    const [task, setTask] = useState<taskInsert>(createInitialTask(user?.user_id ?? "" as string));
    const [taskAssignments, setTaskAssignments] = useState<taskAssignmentType[]>([]);
    const params = useLocalSearchParams<{
        household_id: string,
        user_id: string
    }>();

    const qc = useQueryClient();
    const householdMembers = qc.getQueryData<taskAssignmentType[]>(['userHousehold', params?.household_id]);

    const form = useForm<taskInsert>({
        defaultValues: props?.initialData ?? task,
        mode: "onBlur",
        reValidateMode: "onBlur",
    });

    return (
        < ThemedView className="flex-1 p-4 m-4 rounded-lg shadow-md flex-col md:flex-row gap-4 bg-white dark:bg-gray-800" >
            {/**Main Column */}
            <ThemedView className="flex-1 flex-col p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <Heading className="text-lg font-bold mb-4">New Task</Heading>
                <Divider className="mb-4 w-[90%] justify-center align-center" />

                <ThemedView className="flex-1 flex-col p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    {/* Task Form Fields */}
                </ThemedView>

                <ThemedView className="flex-1 flex-col p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    {/* Task Assignment Fields */}
                </ThemedView>
            </ThemedView>
        </ThemedView >
    );
}

export default function CreateTaskView() {
    const params = useLocalSearchParams();

    return (
        <ResourceBackgroundMedia
            source={params?.media?.[0] ?? null}
            resizeMode="cover"
            className="flex-1 bg-cover"
            unsplashSource={{
                source: "https://unsplash.com/photos/white-ceramic-mug-with-coffee-on-top-of-a-planner-aQfhbxailCs?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash",
                author: "Estée Janssens",
                authorLink: "https://unsplash.com/@esteejanssens?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
            }}
        >
            {/*
            
      
            
            <newTaskForm
                onSubmit={(task) => {
                    console.log("Task submitted: ", task);
                }}
            /> */}
        </ResourceBackgroundMedia>
    )

} 