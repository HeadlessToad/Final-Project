// src/components/ui/command.tsx

import * as React from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ViewProps, Pressable, PressableProps } from "react-native";
import { Search } from "lucide-react-native";
import { styled } from "nativewind";
import { cn } from "./utils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "./alert-dialog"; // Use our converted component

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);

// --- 1. Command Root (Wrapper) ---
interface CommandProps extends ViewProps {
  className?: string;
  // This component will not have internal filtering logic; it's a wrapper.
}

/**
 * @function Command
 * @description The main container for the search interface.
 */
export function Command({ className, ...props }: CommandProps) {
  return (
    <StyledView
      data-slot="command"
      className={cn(
        "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex h-full w-full flex-col overflow-hidden rounded-md",
        className,
      )}
      {...props}
    />
  );
}

// --- 2. CommandDialog (Mobile Modal Wrapper) ---
interface CommandDialogProps extends React.ComponentProps<typeof AlertDialog> {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * @function CommandDialog
 * @description Wraps the search interface in a full-screen or centered modal (using AlertDialog).
 */
export function CommandDialog({
  title = "Quick Search",
  description = "Filter items...",
  children,
  open,
  onOpenChange,
  ...props
}: CommandDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange} {...props}>
      <AlertDialogContent className="overflow-hidden p-0 w-full h-full max-w-full sm:h-auto sm:max-w-lg">
        <StyledView className="flex h-full flex-col">
          {/* We skip sr-only header for mobile */}
          {children}
        </StyledView>
      </AlertDialogContent>
    </AlertDialog>
  );
}


// --- 3. CommandInput (TextInput with Search Icon) ---
interface CommandInputProps extends React.ComponentProps<typeof TextInput> {
  className?: string;
}

/**
 * @function CommandInput
 * @description The search box component.
 */
export function CommandInput({ className, ...props }: CommandInputProps) {
  return (
    <StyledView
      data-slot="command-input-wrapper"
      className="flex h-12 items-center gap-2 border-b border-gray-200 dark:border-gray-700 px-3"
    >
      <Search className="size-5 shrink-0 opacity-50 text-gray-500" />
      <StyledTextInput
        data-slot="command-input"
        className={cn(
          "flex h-full w-full py-3 text-base text-gray-900 dark:text-gray-100 bg-transparent outline-none disabled:opacity-50",
          "placeholder:text-gray-500",
          className,
        )}
        placeholderTextColor="rgba(107, 114, 128, 1)"
        {...props}
      />
    </StyledView>
  );
}

// --- 4. CommandList (FlatList Wrapper) ---
interface CommandListProps extends ViewProps {
  children: React.ReactNode;
  // Note: In RN, max-height and overflow are managed by the container or FlatList itself
}

/**
 * @function CommandList
 * @description The scrollable container for the results (using FlatList internally).
 * Note: You should wrap this in the screen component and pass the actual data/renderItem props.
 */
export function CommandList({ className, children, ...props }: CommandListProps) {
  return (
    <StyledView
      data-slot="command-list"
      className={cn("flex-1 overflow-hidden", className)}
      {...props}
    >
      {/* We use a standard ScrollView here, but in a real app, you would swap this 
          with a FlatList for performance, managing the children as data. */}
      <StyledView className="scroll-py-1">
        {children}
      </StyledView>
    </StyledView>
  );
}

// --- 5. CommandEmpty (Empty State) ---
interface CommandEmptyProps extends ViewProps {
  children?: React.ReactNode;
}

/**
 * @function CommandEmpty
 * @description Displayed when no results are found.
 */
export function CommandEmpty(props: CommandEmptyProps) {
  return (
    <StyledView
      data-slot="command-empty"
      className="py-6 text-center"
      {...props}
    >
      <StyledText className="text-sm text-gray-500">
        {props.children || "No results found."}
      </StyledText>
    </StyledView>
  );
}

// --- 6. CommandGroup (Group Header) ---
interface CommandGroupProps extends ViewProps {
  heading?: string; // We use a simple prop instead of cmkd-group-heading attribute
  className?: string;
  children: React.ReactNode;
}

/**
 * @function CommandGroup
 * @description Groups related command items with an optional header.
 */
export function CommandGroup({ heading, className, children, ...props }: CommandGroupProps) {
  return (
    <StyledView
      data-slot="command-group"
      className={cn("overflow-hidden p-1", className)}
      {...props}
    >
      {heading && (
        <StyledText className="text-gray-500 dark:text-gray-400 px-2 py-1.5 text-xs font-medium">
          {heading}
        </StyledText>
      )}
      {children}
    </StyledView>
  );
}

// --- 7. CommandSeparator ---
interface CommandSeparatorProps extends ViewProps {
  className?: string;
}

/**
 * @function CommandSeparator
 * @description A horizontal line to separate groups.
 */
export function CommandSeparator({ className, ...props }: CommandSeparatorProps) {
  return (
    <StyledView
      data-slot="command-separator"
      className={cn("bg-gray-200 dark:bg-gray-700 h-px mx-2", className)}
      {...props}
    />
  );
}

// --- 8. CommandItem (Result Item) ---
interface CommandItemProps extends PressableProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * @function CommandItem
 * @description A clickable result item in the search list.
 */
export function CommandItem({ className, children, ...props }: CommandItemProps) {
  return (
    <StyledPressable
      data-slot="command-