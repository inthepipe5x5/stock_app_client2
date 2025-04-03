import React, { ReactNode } from "react";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { product, task } from "@/constants/defaultSession";
import { Skeleton } from "./ui/skeleton";
import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import {
    LucideIcon,
    AlertCircle,
    AlertTriangle,
    CheckCircle,
    Info,
    Circle,
    BadgeAlert,
    Archive,
    MailOpenIcon,
} from "lucide-react-native";
import { View } from "./ui/view";
import { findDateDifference, formatDatetimeObject } from "@/utils/date";
import { Card } from "./ui/card";

export type ContentBadge = React.FunctionComponent | JSX.Element | null | undefined;

export type ContentCardContent = {
    badge?: {
        text: string;
        Icon: LucideIcon;
        badgeType: "error" | "warning" | "success" | "info" | "muted";
    } | null | undefined;
    header?: {
        text: string;
        size?: string;
        style?: any;
        className?: string;

    };
    heading?: {
        text: string;
        style?: any;
        className?: string;
    };
    description?: {
        text: string;
        size?: string;
        style?: any;
        className?: string;
    };
    footer?: {
        items: {
            text: string;
            size?: string;
            style?: any;
            className?: string;
            dividerStyle?: any;
            dividerClassName?: string;
        }[];
        space?: string;
        style?: any;
        className?: string;
    };
    boxStyle?: any;
    boxClassName?: string;
}


export const ContentBadge = ({
    badge,
}: {
    badge?: {
        text: string;
        Icon?: LucideIcon;
        badgeType?: "error" | "warning" | "success" | "info" | "muted";
        size?: "sm" | "md" | "lg";
    };
}) => {
    if (!badge || !badge.text) return null; // Ensure badge data exists before rendering

    return (
        <Badge
            action={badge.badgeType ?? "info"}
            size={badge.size ?? "md"}
            className="px-2 py-1 rounded-full flex items-center space-x-2"
        >
            {badge.Icon && <BadgeIcon as={badge.Icon} className="w-4 h-4 px-2" />}
            <BadgeText>{badge.text}</BadgeText>
        </Badge>
    );
};



type ContainerSpacing = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'xs' | '3xl' | '4xl'

export function CompactContentCard({
    heading,
    description,
    footer,
    boxStyle,
    boxClassName,
    badge, // Optional badge slot
}: ContentCardContent & { badge?: ReactNode }) {
    console.log({ badge: badge ?? "falsy" });

    return (
        <Card style={boxStyle} className={`mt-1 px-5 ${boxClassName}`}>
            <HStack className="items-center justify-between">
                {/* Heading */}
                {!!heading && (
                    <Heading style={heading.style} className={heading.className}>
                        {heading.text}
                    </Heading>
                )}

                {/* Badge next to Heading */}
                {!!badge && badge}
            </HStack>

            {/* Description */}
            {!!description && (
                <Text
                    size={(description.size as ContainerSpacing) ?? "sm"}
                    style={description.style}
                    className={`mt-1.5 ${description.className}`}
                >
                    {description.text}
                </Text>
            )}

            {/* Footer */}
            {!!footer && (
                <HStack
                    space={(footer.space as ContainerSpacing) ?? "sm"}
                    style={footer.style}
                    className={`mt-3 h-5 ${footer.className}`}
                >
                    {footer.items.map((footerItem, footerIndex) => (
                        <React.Fragment key={footerIndex}>
                            <Text
                                size={(footerItem.size as ContainerSpacing) ?? "xs"}
                                style={footerItem.style}
                                className={footerItem.className}
                            >
                                {footerItem.text}
                            </Text>

                            {footerIndex < footer.items.length - 1 && (
                                <Divider
                                    orientation="vertical"
                                    style={footerItem.dividerStyle}
                                    className={`bg-gray-300 ${footerItem.dividerClassName}`}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </HStack>
            )}
        </Card>
    );
}


export const mapSingleTaskToContentCard = (task: Partial<task>): ContentCardContent => {
    let badge = null;
    let dateDiff = !!task.due_date ? findDateDifference(new Date(), new Date(task.due_date)) : 0;

    if (dateDiff < 0) {
        badge = {
            text: 'Overdue',
            Icon: AlertCircle,
            badgeType: 'error',
        };
    } else {
        switch (task.completion_status) {
            case 'done':
                badge = { text: 'Done', Icon: CheckCircle, badgeType: 'success' };
                break;
            case 'assigned':
                badge = { text: 'Assigned', Icon: Info, badgeType: 'info' };
                break;
            case 'in progress':
                badge = { text: 'In Progress', Icon: Info, badgeType: 'info' };
                break;
            case 'blocked':
                badge = { text: 'Blocked', Icon: AlertTriangle, badgeType: 'warning' };
                break;
            case 'archived':
                badge = { text: 'Archived', Icon: Archive, badgeType: 'muted' };
                break;
            case 'overdue':
                badge = { text: 'Overdue', Icon: AlertCircle, badgeType: 'error' };
                break;
            default:
                badge = { text: 'Assigned', Icon: MailOpenIcon, badgeType: 'info' };
                break;
        }
    }

    return {
        badge: badge as { text: string; Icon?: LucideIcon; badgeType?: "muted" | "error" | "success" | "info" | "warning"; },
        heading: {
            text: task.task_name || '',
        },
        description: {
            text: task.description || '',
        },
        footer: {
            items: [
                {
                    text: dateDiff <= 10 ? `Due in ${dateDiff} days!` : `Due: ${task.due_date || ''}`,
                },
            ],
        },
    };
};

export const mapSingleProductToContentCard = (product: Partial<product>): ContentCardContent => {
    let badge = null;

    if (product.current_quantity_status) {
        badge = {
            text: product.current_quantity_status.trim().replace("_", " "),
            Icon: iconMapper(product.current_quantity_status),
            badgeType: actionPropMapper(product.current_quantity_status),
        };
    }

    return {
        badge,
        heading: {
            text: product.product_name || '',
        },
        description: {
            text: product.description || '',
        },
        footer: {
            items: [
                {
                    text: `Stock: ${product.current_quantity || 0} / ${product.max_quantity || 0} ${product.quantity_unit || 'units'}`,
                },
                { text: `${Math.round((product.current_quantity || 0) / (product.max_quantity || 1) * 100)} %` },
            ],
        },
    };
};


