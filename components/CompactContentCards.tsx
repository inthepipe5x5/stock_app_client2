import React from "react";
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
} from "lucide-react-native";
import { View } from "./ui/view";

export type ContentBadge = React.FunctionComponent | JSX.Element | null | undefined;

export type ContentCardContent = {
    header?: {
        text: string;
        size?: string;
        style?: any;
        className?: string;
        badge?: {
            text: string;
            Icon: LucideIcon;
            badgeType: "error" | "warning" | "success" | "info" | "muted";
        }
    };
    heading?: {
        text: string;
        style?: any;
        className?: string;
        badge?: {
            text: string;
            Icon: LucideIcon;
            badgeType: "error" | "warning" | "success" | "info" | "muted";
        }

    };
    description?: {
        text: string;
        size?: string;
        style?: any;
        className?: string;
        badge?: {
            text: string;
            Icon: LucideIcon;
            badgeType: "error" | "warning" | "success" | "info" | "muted";
        }

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
        badge?: {
            text: string;
            Icon: LucideIcon;
            badgeType: "error" | "warning" | "success" | "info" | "muted";
        }
        space?: string;
        style?: any;
        className?: string;
    };
    boxStyle?: any;
    boxClassName?: string;
}


export const ContentBadge = (props: {
    text: string;
    Icon?: LucideIcon;
    action?: "error" | "warning" | "success" | "info" | "muted";
    size?: "sm" | "md" | "lg";
    className?: string;
}) => {
    const { text, Icon, ...badgeProps } = props || null;
    return (
        <Badge className={"className" in props ? `ml-1 ${props?.className}` : "ml-1"} size="sm" {...badgeProps}>
            {!text && typeof text === 'string' ? < BadgeText className="text-xs" /> : null}
            {!Icon && React.isValidElement(Icon) ? < BadgeIcon className="ml-1" as={Icon} /> : null}
        </Badge>
    );
};


type ContainerSpacing = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'xs' | '3xl' | '4xl'


export const actionPropMapper = (value: string): "error" | "warning" | "success" | "info" | "muted" => {
    switch (value) {
        case 'overdue': //task
        case 'empty': //product stock
        case 'red': //color
            return 'error';
        case 'needs attention': //product stock //task
        case 'partial': //product stock
        case 'yellow':
            return 'warning';
        case 'completed':
        case 'full':
        case 'green':
            return 'success';

        case 'assigned':
        case 'automated':
        case 'blue':
            return 'info';

        case 'gray':
        default:
            return 'muted';
    }
};

export const iconMapper = (value: string): LucideIcon => {
    switch (value) {
        case 'overdue': //task
        case 'empty': //product stock
        case 'red': //color
            return AlertCircle;
        case 'needs attention': //product stock //task
        case 'partial': //product stock
        case 'yellow':
            return AlertTriangle;
        case 'completed':
        case 'full':
        case 'green':
            return CheckCircle;

        case 'assigned':
        case 'automated':
        case 'blue':
            return Info;

        case 'gray':
        default:
            return Circle;
    }
}

export function CompactContentCard(item: ContentCardContent) {
    return (
        <View>
            {!!item ? (
                <Box style={item.boxStyle} className={`mt-5 border-solid border-gray-300 px-5 ${item.boxClassName}`}>
                    {!!item?.header ? (
                        <Text size={item?.header?.size as ContainerSpacing ?? 'md'} style={item.header.style} className={`font-bold ${item.header.className}`}>
                            {item.header.text}
                        </Text>
                    ) : null}
                    {!!item?.heading ? (
                        <Heading style={item.heading.style} className={item.heading.className}>
                            {item.heading.text}
                        </Heading>
                    ) : null}
                    {!!item?.description ? (
                        <Text size={item.description.size as ContainerSpacing ?? 'sm'} style={item.description.style} className={`mt-1.5 ${item.description.className}`}>
                            {item.description.text}
                        </Text>
                    ) : null}
                    {!!item?.footer ? (
                        <HStack space={item.footer.space as ContainerSpacing ?? 'sm'} style={item.footer.style} className={`mt-3 h-5 ${item.footer.className}`}>
                            {item.footer.items.map((footerItem, footerIndex) => (
                                <React.Fragment key={footerIndex}>
                                    <Text size={footerItem.size as ContainerSpacing ?? 'xs'} style={footerItem.style} className={footerItem.className}>
                                        {footerItem.text}
                                    </Text>

                                    {item.footer && footerIndex < item.footer.items.length - 1 ? (
                                        <Divider orientation='vertical' style={footerItem.dividerStyle} className={`bg-gray-300 ${footerItem.dividerClassName}`} />
                                    ) : null}

                                    {item?.footer?.badge ? !!item?.footer?.badge.Icon ? (
                                        <ContentBadge
                                            text={item.footer.badge.text}
                                            Icon={item.footer.badge.Icon}
                                        />) : (
                                        <ContentBadge
                                            text={item.footer.badge.text}
                                        />
                                    ) : null}
                                </React.Fragment>
                            ))}
                        </HStack>
                    ) : null}
                </Box>
            ) : (
                <Box className={`mt-5 border-r-2 border-gray-300 px-5`}>
                    <Text size="md" className="font-bold">
                        No data available
                    </Text>
                    <Skeleton className="w-20 h-5" />
                </Box>
            )}
        </View>
    );
}

//utility functions to map data to a content card
export const mapSingleTaskToContentCard = (task: Partial<task>): ContentCardContent => {
    
    let badge = null;
    if (task.due_date && new Date() > new Date(task.due_date)) {
        badge = {
            text: 'Overdue',
            Icon: AlertCircle,
            badgeType: 'error',
        };
    } else {

        switch (task.completion_status) {
            case 'done':
                badge = {
                    text: 'Done',
                    Icon: CheckCircle,
                    badgeType: 'success',
                };
                break;
            case 'assigned':
                badge = {
                    text: 'Assigned',
                    Icon: Info,
                    badgeType: 'info',
                };
                break;
            case 'in progress':
                badge = {
                    text: 'In Progress',
                    Icon: Info,
                    badgeType: 'info',
                };
                break;
            case 'blocked':
                badge = {
                    text: 'Blocked',
                    Icon: AlertTriangle,
                    badgeType: 'warning',
                };
                break;
            case 'archived':
                badge = {
                    text: 'Archived',
                    Icon: Circle,
                    badgeType: 'muted',
                };
                break;
            case 'overdue':
                badge = {
                    text: 'Overdue',
                    Icon: AlertCircle,
                    badgeType: 'error',
                };
                break;
            default:
                badge = {
                    text: 'Assigned',
                    Icon: Info,
                    badgeType: 'info',
                };
                break;
        }

    }

    return ({
        header: {
            text: task.task_name || '',
        },
        description: {
            text: task.description || '',
        },
        footer: {
            items: [
                {
                    text: `Due: ${task.due_date || ''}`,
                },
            ],
            badge: badge as { text: string; Icon: LucideIcon; badgeType: "muted" | "error" | "success" | "info" | "warning"; },
        },
    });
};

export const mapSingleProductToContentCard = (product: Partial<product>): ContentCardContent => {
    return ({
        header: {
            text: product.product_name || '',
        },
        description: {
            text: product.description || '',
        },
        footer: {
            items: [
                {
                    text: `Stock: ${product.current_quantity || 0}`,
                },
            ],
            badge: product.current_quantity_status !== undefined ? (
                product.current_quantity_status === "empty" ? {
                    text: 'Empty',
                    Icon: AlertCircle,
                    badgeType: 'error',
                } : product.current_quantity_status === "quarter" ? {
                    text: 'Quarter Full',
                    Icon: AlertTriangle,
                    badgeType: 'warning',
                } : product.current_quantity_status === "half" ? {
                    text: 'Half Full',
                    Icon: Info,
                    badgeType: 'info',
                } : product.current_quantity_status === "full" ? {
                    text: 'Full',
                    Icon: CheckCircle,
                    badgeType: 'success',
                } : undefined
            ) : undefined,
        },
    });
};

// export function TaskCompactContentCardList(tasks: Partial<task>[]) {
//     const content = mapTasksToContent(tasks);
//     return (
//         <>
//             {content.map((item, index) => (
//                 <CompactContentCard key={index} {...item} />
//             ))}
//         </>
//     );
// }

// export function ProductCompactContentCardList(products: Partial<product>[]) {
//     const content = mapProductsToContent(products);
//     return (
//         <>
//             {content.map((item, index) => (
//                 <CompactContentCard key={index} {...item} />
//             ))}
//         </>
//     );
// }
