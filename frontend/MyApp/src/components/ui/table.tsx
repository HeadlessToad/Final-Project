// src/components/ui/table.tsx

import * as React from "react";
import { View, Text, ScrollView, ViewProps, TextProps, Pressable } from "react-native";
import { styled } from "nativewind";
import { cn } from "./utils"; // Utility for merging class names

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledPressable = styled(Pressable);


// --- 1. Table Root Component (Container) ---
interface TableProps extends ViewProps {
  className?: string;
}

/**
 * @function Table
 * @description The main container for the table, enabling horizontal scrolling 
 * for wide tables on mobile devices.
 */
export function Table({ className, children, ...props }: TableProps) {
  return (
    <StyledView
      data-slot="table-container"
      // w-full overflow-x-auto is replaced by a ScrollView
      className="relative w-full"
    >
      <StyledScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        // The inner content will be the table structure itself
        contentContainerStyle={cn("w-full", className)}
        {...props}
      >
        {children}
      </StyledScrollView>
    </StyledView>
  );
}

// --- 2. Table Structure Wrappers (View-based) ---

// Table Header (thead)
interface TableHeaderProps extends ViewProps {
  className?: string;
}

/**
 * @function TableHeader
 * @description Container for the TableRow that represents the column headings.
 */
export function TableHeader({ className, ...props }: TableHeaderProps) {
  return (
    <StyledView 
      data-slot="table-header" 
      className={cn("bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600", className)} 
      {...props} 
    />
  );
}

// Table Body (tbody)
interface TableBodyProps extends ViewProps {
  className?: string;
}

/**
 * @function TableBody
 * @description Container for the main rows of table data.
 */
export function TableBody({ className, ...props }: TableBodyProps) {
  return (
    <StyledView 
      data-slot="table-body" 
      className={cn("flex flex-col", className)} 
      {...props} 
    />
  );
}

// Table Footer (tfoot)
interface TableFooterProps extends ViewProps {
  className?: string;
}

/**
 * @function TableFooter
 * @description Container for summary row(s).
 */
export function TableFooter({ className, ...props }: TableFooterProps) {
  return (
    <StyledView
      data-slot="table-footer"
      className={cn(
        "bg-gray-200/50 dark:bg-gray-700/50 border-t border-gray-300 dark:border-gray-600 font-semibold",
        className,
      )}
      {...props}
    />
  );
}

// --- 3. Table Row (tr) ---
interface TableRowProps extends PressableProps {
  className?: string;
}

/**
 * @function TableRow
 * @description A single row in the table. Uses Pressable for mobile interactivity (e.g., tap for details).
 */
export function TableRow({ className, children, ...props }: TableRowProps) {
  return (
    <StyledPressable
      data-slot="table-row"
      accessibilityRole="row"
      // border-b transition-colors and hover:bg-muted/50 are handled here
      className={({ pressed }) => cn(
        "flex flex-row items-center border-b border-gray-200 dark:border-gray-700 transition-colors",
        pressed && "bg-gray-100 dark:bg-gray-700/80", // Simulate hover/active
        className,
      )}
      {...props}
    >
      {children}
    </StyledPressable>
  );
}


// --- 4. Table Head (th) ---
interface TableHeadProps extends ViewProps {
  className?: string;
}

/**
 * @function TableHead
 * @description A column header cell.
 */
export function TableHead({ className, children, ...props }: TableHeadProps) {
  return (
    <StyledView
      data-slot="table-head"
      accessibilityRole="columnheader"
      className={cn(
        "flex h-10 px-2 justify-center align-middle whitespace-nowrap",
        "text-gray-900 dark:text-gray-100 text-sm font-semibold",
        className,
      )}
      {...props}
    >
      <StyledText className="text-inherit">{children}</StyledText>
    </StyledView>
  );
}

// --- 5. Table Cell (td) ---
interface TableCellProps extends ViewProps {
  className?: string;
}

/**
 * @function TableCell
 * @description A standard data cell.
 */
export function TableCell({ className, children, ...props }: TableCellProps) {
  return (
    <StyledView
      data-slot="table-cell"
      accessibilityRole="cell"
      className={cn(
        "flex p-2 justify-center align-middle whitespace-nowrap",
        "text-gray-800 dark:text-gray-200 text-sm",
        className,
      )}
      {...props}
    >
      <StyledText className="text-inherit">{children}</StyledText>
    </StyledView>
  );
}

// --- 6. Table Caption (caption) ---
interface TableCaptionProps extends TextProps {
  className?: string;
}

/**
 * @function TableCaption
 * @description A descriptive text summary below the table.
 */
export function TableCaption({ className, children, ...props }: TableCaptionProps) {
  return (
    <StyledText
      data-slot="table-caption"
      className={cn("text-gray-500 dark:text-gray-400 mt-4 text-sm text-center", className)}
      {...props}
    >
      {children}
    </StyledText>
  );
}

// --- Final Export ---
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};