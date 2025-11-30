// src/components/ui/pagination.tsx

import * as React from "react";
import { View, Text, Pressable, ViewProps, PressableProps, TextProps } from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react-native";
import { styled } from "nativewind";
import { cn } from "./utils";
import { Button, buttonVariants } from "./button"; // Use our converted components

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);

// --- 1. Pagination Root Component ---
interface PaginationProps extends ViewProps {
  className?: string;
}

/**
 * @function Pagination
 * @description The root navigation container for pagination controls.
 */
export function Pagination({ className, ...props }: PaginationProps) {
  return (
    <StyledView
      role="navigation"
      accessibilityLabel="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

// --- 2. Pagination Content ---
interface PaginationContentProps extends ViewProps {
  className?: string;
}

/**
 * @function PaginationContent
 * @description Container for the list of pagination items.
 */
export function PaginationContent({ className, ...props }: PaginationContentProps) {
  return (
    <StyledView
      accessibilityRole="list"
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

// --- 3. Pagination Item ---
interface PaginationItemProps extends ViewProps {}

/**
 * @function PaginationItem
 * @description Wrapper for a single pagination button/link.
 */
export function PaginationItem(props: PaginationItemProps) {
  return <StyledView accessibilityRole="listitem" data-slot="pagination-item" {...props} />;
}

// --- 4. Pagination Link (Replaces <a> and leverages our Button) ---
type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size" | "onPress"> & PressableProps;

/**
 * @function PaginationLink
 * @description An actionable link (page number or navigation arrow).
 */
export function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  const variant = isActive ? "default" : "ghost"; // Use 'default' (primary color) for active state
  
  return (
    <Button
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      variant={variant}
      size={size}
      className={cn(
        // Ensure active state overrides are clean
        isActive ? "bg-blue-600 text-white" : "bg-transparent active:bg-gray-200 dark:active:bg-gray-700",
        // The default size='icon' gives a size-10 h/w for pagination circles
        size === 'icon' ? "size-10 p-0" : "", 
        className,
      )}
      {...props}
    />
  );
}

// --- 5. Pagination Previous ---
interface PaginationPreviousProps extends PressableProps {}

/**
 * @function PaginationPrevious
 * @description Button for navigating to the previous page.
 */
export function PaginationPrevious({ className, ...props }: PaginationPreviousProps) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default" // Default size is better for touch target
      className={cn("gap-1 px-2.5", className)}
      {...props}
    >
      <ChevronLeft size={20} />
      {/* Hide the text on mobile for brevity (using "hidden sm:block" equivalent) */}
      <StyledText className="hidden sm:flex text-sm">Previous</StyledText> 
    </PaginationLink>
  );
}

// --- 6. Pagination Next ---
interface PaginationNextProps extends PressableProps {}

/**
 * @function PaginationNext
 * @description Button for navigating to the next page.
 */
export function PaginationNext({ className, ...props }: PaginationNextProps) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default" // Default size is better for touch target
      className={cn("gap-1 px-2.5", className)}
      {...props}
    >
      {/* Hide the text on mobile for brevity (using "hidden sm:block" equivalent) */}
      <StyledText className="hidden sm:flex text-sm">Next</StyledText>
      <ChevronRight size={20} />
    </PaginationLink>
  );
}

// --- 7. Pagination Ellipsis (The "...") ---
interface PaginationEllipsisProps extends ViewProps {
  className?: string;
}

/**
 * @function PaginationEllipsis
 * @description Placeholder for skipped page numbers.
 */
export function PaginationEllipsis({ className, ...props }: PaginationEllipsisProps) {
  return (
    <StyledView
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-10 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal size={20} className="text-gray-500 dark:text-gray-400" />
      {/* sr-only span is omitted as the aria-hidden attribute is sufficient for RN */}
    </StyledView>
  );
}

// --- Final Export ---
export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};