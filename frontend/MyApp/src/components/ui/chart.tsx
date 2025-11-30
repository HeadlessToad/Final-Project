// src/components/ui/chart.tsx

import * as React from "react";
import { View, Text, Dimensions, StyleProp, ViewStyle, TextStyle } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit"; // Import required chart types
import { styled } from "nativewind";
import { cn } from "./utils";

// Get screen width for responsive charts
const screenWidth = Dimensions.get("window").width;

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledText = styled(Text);

// --- 1. Type Definitions (Simplified from web Recharts) ---

export type ChartType = 'line' | 'bar';

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    // We will simplify color handling to a single hex string for RN
    color: string; 
    icon?: React.ComponentType;
  };
};

type ChartContextProps = {
  config: ChartConfig;
  chartWidth: number;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

// --- 2. Chart Container Component (Root) ---

// Extend standard View props, but remove web-specific props
interface ChartContainerProps extends React.ComponentProps<typeof View> {
  config: ChartConfig;
  chartType?: ChartType;
  chartData: any; // Data structure depends on the specific chart type
  // Theme styling for the chart itself
  chartTheme?: {
    backgroundColor: string;
    backgroundGradientFrom: string;
    backgroundGradientTo: string;
    decimalPlaces: number;
    color: (opacity: number) => string;
    labelColor: (opacity: number) => string;
    propsForDots?: object;
  };
  className?: string;
}

/**
 * @function ChartContainer
 * @description The root container for charts, setting up the context and rendering the chosen chart type.
 */
export function ChartContainer({
  className,
  children,
  config,
  chartType = 'line',
  chartData,
  chartTheme,
  ...props
}: ChartContainerProps) {
  const chartWidth = screenWidth - 48; // Full screen width minus padding (e.g., 24px on each side)
  
  const contextValue: ChartContextProps = React.useMemo(() => ({
    config,
    chartWidth,
  }), [config, chartWidth]);

  // Default theme properties based on your component's design ethos (clean, eco-contrast)
  const defaultTheme = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#f3f4f6', // light gray for subtle gradient
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue (Primary)
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // Gray (Muted)
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#3b82f6',
    },
    fillShadowGradient: 'rgba(59, 130, 246, 0.5)',
    fillShadowGradientOpacity: 0.5,
    barPercentage: 0.5,
    // Add dark mode support if needed via useColorScheme()
    ...chartTheme, 
  };
  
  // Choose the correct chart component
  const ChartComponent = chartType === 'bar' ? BarChart : LineChart;

  return (
    <ChartContext.Provider value={contextValue}>
      <StyledView
        data-slot="chart"
        className={cn("flex aspect-video justify-center text-xs p-3", className)}
        {...props}
      >
        <ChartComponent
          data={chartData}
          width={chartWidth}
          height={200} // Fixed height for mobile charts
          chartConfig={defaultTheme}
          bezier // For LineChart to make it curved
          style={{
            borderRadius: 16, // Rounded corners on the chart area
            paddingRight: 0, // Remove default right padding to fit the whole width
          }}
          // The rest of the Recharts components (Tooltip, Legend) are replaced 
          // by chart-kit's internal rendering.
          // You would use children to pass custom Tooltip/Legend components if desired.
          {...children}
        />
        {/* Render children for custom legends or tooltips if needed */}
        {/* We use a simple view container for them */}
        <StyledView className="mt-4 flex flex-col items-center">{children}</StyledView>
      </StyledView>
    </ChartContext.Provider>
  );
}


// --- 3. Placeholder for Legend Content (Replicates ChartLegendContent) ---
// Since chart-kit doesn't have a direct Legend component, this acts as a manual replacement.
interface ChartLegendContentProps extends React.ComponentProps<typeof View> {
  payload: { name: string; color: string }[];
  nameKey?: string;
  hideIcon?: boolean;
}

/**
 * @function ChartLegendContent
 * @description Manual rendering of the chart legend using the provided payload.
 */
export function ChartLegendContent({
  className,
  payload,
  hideIcon = false,
  ...props
}: ChartLegendContentProps) {
  return (
    <StyledView
      className={cn("flex flex-row items-center justify-center gap-4 pt-3", className)}
      {...props}
    >
      {payload.map((item) => (
        <StyledView
          key={item.name}
          className="flex flex-row items-center gap-1.5"
        >
          {!hideIcon && (
            <StyledView
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: item.color }}
            />
          )}
          <StyledText className="text-gray-600 dark:text-gray-400 text-xs">
            {item.name}
          </StyledText>
        </StyledView>
      ))}
    </StyledView>
  );
}

// --- Placeholder Exports (We cannot replicate Tooltip and Style components easily) ---
export const ChartTooltip = () => null;
export const ChartTooltipContent = () => null;
export const ChartStyle = () => null;
export const ChartLegend = () => null;

// --- Export the core components ---
export {
  ChartContainer,
  ChartLegendContent,
};