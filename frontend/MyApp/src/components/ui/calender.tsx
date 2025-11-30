// src/components/ui/calendar.tsx

import * as React from "react";
import { View, Text, StyleProp, ViewStyle, TextStyle } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { Calendar as RNC, CalendarProps as RNCProps } from 'react-native-calendars';
import { styled } from "nativewind";
import { cn } from "./utils";

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledChevronLeft = styled(ChevronLeft);
const StyledChevronRight = styled(ChevronRight);

// --- Replicate the button variants styles for calendar navigation buttons ---
// NOTE: We don't need to import the actual button component, just its resulting class string.
const navButtonClasses = "size-7 bg-transparent p-0 opacity-50 active:opacity-100 border border-gray-300 rounded-md dark:border-gray-700";

// --- Custom Header Component (Replicates caption, nav, and buttons) ---
const CalendarHeader = React.memo(({ date, onPressArrow, theme }: any) => {
    // Determine the month and year
    const monthYear = new Date(date).toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <StyledView className="flex flex-row justify-between pt-1 relative items-center w-full">
            {/* Nav Button Previous */}
            <StyledView className="absolute left-1">
                <StyledView className={navButtonClasses} onPress={() => onPressArrow('left')}>
                    <StyledChevronLeft className="size-4 text-gray-900 dark:text-gray-100" />
                </StyledView>
            </StyledView>

            {/* Caption Label */}
            <StyledText className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {monthYear}
            </StyledText>
            
            {/* Nav Button Next */}
            <StyledView className="absolute right-1">
                <StyledView className={navButtonClasses} onPress={() => onPressArrow('right')}>
                    <StyledChevronRight className="size-4 text-gray-900 dark:text-gray-100" />
                </StyledView>
            </StyledView>
        </StyledView>
    );
});


// --- Calendar Component ---

// Omit web-specific props and merge with RN Calendar props
interface CalendarProps extends Omit<RNCProps, 'theme' | 'renderHeader'> {
    className?: string;
    // The date format is different in RN, we simplify it here
    selectedDate?: string; 
    onDayPress?: (dateString: string) => void;
}

/**
 * @function Calendar
 * @description A fully customized mobile calendar component built on top of react-native-calendars,
 * styled using NativeWind to match the DayPicker component design.
 * @param {CalendarProps} props - Props for configuring the calendar.
 */
export function Calendar({
    className,
    selectedDate,
    onDayPress,
    ...props
}: CalendarProps) {

    // Theme object to pass custom styles to RNC
    const customTheme = {
        // Colors from your web classes
        backgroundColor: 'transparent',
        calendarBackground: 'transparent',
        textSectionTitleColor: '#6b7280', // muted-foreground
        selectedDayBackgroundColor: '#3b82f6', // primary (blue-600)
        selectedDayTextColor: '#ffffff', // primary-foreground
        todayTextColor: '#10b981', // green for today
        dayTextColor: '#1f2937', // foreground
        textDisabledColor: '#d1d5db', // muted-foreground for disabled
        dotColor: '#3b82f6',
        
        // Font styles
        textDayFontWeight: '400',
        textMonthFontWeight: '600',
        textDayHeaderFontWeight: '400',
        textDayFontSize: 14,
        textMonthFontSize: 16,
        textDayHeaderFontSize: 12,
        
        // Custom styling for day selection shape (to match rounded-md)
        'stylesheet.day.basic': {
            base: {
                width: 32, // size-8
                height: 32, // size-8
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6, // rounded-md
            },
            selected: {
                backgroundColor: '#3b82f6',
            },
            // Mapping other states like today, disabled, etc., would require complex theme overrides.
        }
    };

    const handleDayPress = React.useCallback((day: { dateString: string }) => {
        onDayPress?.(day.dateString);
    }, [onDayPress]);


    return (
        <StyledView className={cn("p-3 w-full", className)}>
            <RNC
                // General appearance and settings
                current={selectedDate || new Date().toISOString().split('T')[0]} // Set current month
                onDayPress={handleDayPress}
                markingType={'dot'} // Use dots for marked dates if needed
                enableSwipeMonths={true}

                // Custom Header/Navigation
                renderHeader={(date) => (
                    <CalendarHeader
                        date={date}
                        onPressArrow={(direction: 'left' | 'right') => {
                            // This part would require handling month change logic 
                            // manually or finding a way to trigger RNC's internal state.
                            // RNC typically handles month changes internally on arrow press.
                            // We return the date to the custom header to display the title.
                        }}
                        theme={customTheme}
                    />
                )}
                
                // Day Styling (Marked Dates and Selected Day)
                markedDates={{
                    // Mark the selected day
                    ...(selectedDate ? {
                        [selectedDate]: {
                            selected: true,
                            marked: true,
                            selectedColor: customTheme.selectedDayBackgroundColor,
                        },
                    } : {}),
                    // You would add ClassificationHistory dates here for display
                    // '2025-11-20': { marked: true, dotColor: 'green' } 
                }}

                // Pass the theme object
                theme={customTheme}
                
                // Day component customization (optional, for finer control over the button/day style)
                // dayComponent={({ date, state, marking }) => {
                //     // ... custom day rendering logic to precisely match buttonVariants({ variant: "ghost" })
                //     return <Text>{date.day}</Text>;
                // }}

                {...props}
            />
        </StyledView>
    );
}

export { Calendar };