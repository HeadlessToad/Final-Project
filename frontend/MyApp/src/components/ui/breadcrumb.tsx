// src/components/ui/breadcrumb.tsx

import * as React from "react";
import { View, Text, Pressable, ViewProps, TextProps } from "react-native";
import { ChevronRight, MoreHorizontal } from "lucide-react-native";
import { styled } from "nativewind";
import { cn } from "./utils"; // Utility for merging class names

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

// --- 1. Breadcrumb Root Component ---
interface BreadcrumbProps extends ViewProps {}

/**
 * @function Breadcrumb
 * @description The root navigation container (equivalent to <nav>).
 */
export function Breadcrumb(props: BreadcrumbProps) {
  // In React Native, the 'nav' role is implicit or handled by AccessibilityLabel
  return (
    <StyledView
      accessibilityRole="navigation"
      accessibilityLabel="breadcrumb"
      data-slot="breadcrumb"
      {...props}
    />
  );
}

// --- 2. BreadcrumbList Component ---
interface BreadcrumbListProps extends ViewProps {
  className?: string;
}

/**
 * @function BreadcrumbList
 * @description The container for the breadcrumb items (equivalent to <ol>).
 */
export function BreadcrumbList({ className, ...props }: BreadcrumbListProps) {
  return (
    <StyledView
      accessibilityRole="list"
      data-slot="breadcrumb-list"
      className={cn(
        // Flexbox equivalent of the web styling: flex-wrap, items-center, gaps
        "flex flex-row flex-wrap items-center gap-x-1.5 text-sm sm:gap-x-2.5",
        "text-gray-500 dark:text-gray-400", // Muted foreground text color
        className,
      )}
      {...props}
    />
  );
}

// --- 3. BreadcrumbItem Component ---
interface BreadcrumbItemProps extends ViewProps {
  className?: string;
}

/**
 * @function BreadcrumbItem
 * @description Wrapper for a single breadcrumb link/page (equivalent to <li>).
 */
export function BreadcrumbItem({ className, ...props }: BreadcrumbItemProps) {
  return (
    <StyledView
      accessibilityRole="listitem"
      data-slot="breadcrumb-item"
      className={cn("inline-flex flex-row items-center gap-x-1.5", className)}
      {...props}
    />
  );
}

// --- 4. BreadcrumbLink Component ---
// asChild is not needed in RN as we use Pressable for linking functionality
interface BreadcrumbLinkProps extends React.ComponentProps<typeof Pressable> {
  className?: string;
  textClassName?: string;
}

/**
 * @function BreadcrumbLink
 * @description An actionable link in the breadcrumb trail (equivalent to <a>).
 */
export function BreadcrumbLink({ className, children, textClassName, ...props }: BreadcrumbLinkProps) {
  return (
    <StyledPressable
      data-slot="breadcrumb-link"
      accessibilityRole="link"
      className={cn(
        "hover:opacity-80 transition-opacity", // RN uses opacity/Pressable state for hover/active feedback
        className
      )}
      {...props}
    >
      <StyledText className={cn("text-sm", textClassName)}>
        {children}
      </StyledText>
    </StyledPressable>
  );
}

// --- 5. BreadcrumbPage Component (Current Page) ---
interface BreadcrumbPageProps extends TextProps {
  className?: string;
}

/**
 * @function BreadcrumbPage
 * @description The non-clickable, currently active page (equivalent to <span> with styling).
 */
export function BreadcrumbPage({ className, ...props }: BreadcrumbPageProps) {
  return (
    <StyledText
      data-slot="breadcrumb-page"
      accessibilityRole="text" // Not a true link
      accessibilityState={{ disabled: true }}
      accessibilityCurrent="page"
      className={cn(
        "text-gray-900 dark:text-gray-100 font-semibold", // Text-foreground, more prominent
        className
      )}
      {...props}
    />
  );
}

// --- 6. BreadcrumbSeparator Component ---
interface BreadcrumbSeparatorProps extends ViewProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * @function BreadcrumbSeparator
 * @description The divider between breadcrumb items (default is ChevronRight icon).
 */
export function BreadcrumbSeparator({ children, className, ...props }: BreadcrumbSeparatorProps) {
  return (
    <StyledView
      accessibilityRole="presentation"
      aria-hidden="true"
      data-slot="breadcrumb-separator"
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      {/* Default icon sizing adapted for Lucide RN */}
      {children ?? <ChevronRight size={14} className="text-gray-500 dark:text-gray-400" />}
    </StyledView>
  );
}

// --- 7. BreadcrumbEllipsis Component ---
interface BreadcrumbEllipsisProps extends ViewProps {
  className?: string;
}

/**
 * @function BreadcrumbEllipsis
 * @description Used to condense long breadcrumb lists (shows "..." icon).
 */
export function BreadcrumbEllipsis({ className, ...props }: BreadcrumbEllipsisProps) {
  return (
    <StyledView
      accessibilityRole="presentation"
      aria-hidden="true"
      data-slot="breadcrumb-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal size={16} className="text-gray-500 dark:text-gray-400" />
      {/* SR-only text is typically not needed in RN unless implementing a complex custom accessibility solution */}
    </StyledView>
  );
}

// --- Combined Export ---
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};