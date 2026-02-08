import * as React from "react";
import { View, Text, Pressable, ViewProps } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    interpolate,
    Easing,
} from "react-native-reanimated";
import { cn } from "@/lib/utils";

const ChevronDownIcon = ({ className }: { className?: string }) => (
    <View className={cn("w-4 h-4 items-center justify-center", className)}>
        <Text className="text-base">▼</Text>
    </View>
)

type AccordionContextType = {
    activeItems: Set<string>
    toggleItem: (value: string) => void
    type?: "single" | "multiple"
}

const AccordionContext = React.createContext<AccordionContextType | null>(null)

function useAccordion() {
    const context = React.useContext(AccordionContext)
    if (!context) {
        throw new Error("Accordion components must be used within Accordion")
    }
    return context
}

type AccordionProps = ViewProps & {
    type?: "single" | "multiple"
    defaultValue?: string | string[]
    children: React.ReactNode
}

function Accordion({
    className,
    type = "single",
    defaultValue,
    children,
    ...props
}: AccordionProps) {
    const [activeItems, setActiveItems] = React.useState<Set<string>>(() => {
        if (Array.isArray(defaultValue)) {
            return new Set(defaultValue)
        }
        return defaultValue ? new Set([defaultValue]) : new Set()
    })

    const toggleItem = React.useCallback(
        (value: string) => {
            setActiveItems((prev) => {
                const newSet = new Set(prev)
                if (newSet.has(value)) {
                newSet.delete(value)
                } else {
                if (type === "single") {
                    newSet.clear()
                }
                newSet.add(value)
                }
                return newSet
            })
        },
        [type]
    )

    return (
        <AccordionContext.Provider value={{ activeItems, toggleItem, type }}>
            <View className={cn("flex w-full flex-col", className)} {...props}>
                {children}
            </View>
        </AccordionContext.Provider>
    )
}

type AccordionItemProps = ViewProps & {
    value: string
    children: React.ReactNode
}

const AccordionItemContext = React.createContext<{ value: string; isExpanded: boolean } | null>(null)

function useAccordionItem() {
    const context = React.useContext(AccordionItemContext)
    if (!context) {
        throw new Error("AccordionItem components must be used within AccordionItem")
    }
    return context;
}

function AccordionItem({ className, value, children, ...props }: AccordionItemProps) {
    const { activeItems } = useAccordion()
    const isExpanded = activeItems.has(value)

    return (
        <AccordionItemContext.Provider value={{ value, isExpanded }}>
            <View className={cn(className)} {...props}>
                {children}
            </View>
        </AccordionItemContext.Provider>
    )
}

type AccordionTriggerProps = React.ComponentProps<typeof Pressable> & {
    children: React.ReactNode
    className?: string
}

function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
    const { toggleItem } = useAccordion()
    const { value, isExpanded } = useAccordionItem()

    const rotation = useSharedValue(0)

    React.useEffect(() => {
        rotation.value = withTiming(isExpanded ? 180 : 0, {
            duration: 250,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        })
    }, [isExpanded])

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }))

    return (
        <Pressable
            onPress={() => toggleItem(value)}
            className={cn(
                "flex flex-row items-center justify-between py-4 rounded-lg",
                "active:opacity-70 transition-opacity",
                className
            )}
            {...props}
        >
            <Text className="text-sm font-medium text-foreground flex-1">
                {children}
            </Text>
        </Pressable>
    )
}

type AccordionContentProps = ViewProps & {
  children: React.ReactNode
  className?: string
}

function AccordionContent({ className, children, ...props }: AccordionContentProps) {
    const { isExpanded } = useAccordionItem()
    const height = useSharedValue(0)
    const [contentHeight, setContentHeight] = React.useState(0)
    const [measured, setMeasured] = React.useState(false)

    React.useEffect(() => {
        if (!measured || contentHeight === 0) return

        height.value = withTiming(isExpanded ? contentHeight : 0, {
            duration: 300,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        })
    }, [isExpanded, contentHeight, measured])

    const animatedStyle = useAnimatedStyle(() => {
        if (contentHeight === 0) return { height: 0, opacity: 0 }

        return {
            height: height.value,
            opacity: interpolate(height.value, [0, contentHeight], [0, 1]),
        }
    })

    return (
        <View>
            {/* Hidden measurer - rendered off-screen to capture the natural height */}
            {!measured && (
                <View
                    style={{ position: "absolute", opacity: 0, zIndex: -1 }}
                    pointerEvents="none"
                    onLayout={(event) => {
                        const h = event.nativeEvent.layout.height
                        if (h > 0) {
                            setContentHeight(h)
                            setMeasured(true)
                        }
                    }}
                >
                    <View className={cn("pb-4 pt-0", className)} {...props}>
                        {children}
                    </View>
                </View>
            )}

            {/* Animated visible content */}
            <Animated.View style={animatedStyle} className="overflow-hidden">
                <View className={cn("pb-4 pt-0", className)} {...props}>
                    {children}
                </View>
            </Animated.View>
        </View>
    )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
