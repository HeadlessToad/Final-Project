// src/components/ui/carousel.tsx

import * as React from "react";
import { View, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import { styled } from "nativewind";
import { cn } from "./utils";
import { Button } from "./button"; // Assuming the converted Button is available

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledScrollView = styled(ScrollView);

// Get the screen width to calculate the carousel item width for snapping
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Context for State Management (Simplified for RN ScrollView) ---
type CarouselContextProps = {
  orientation: "horizontal" | "vertical";
  scrollRef: React.RefObject<ScrollView>;
  itemWidth: number; // Width of a single item in pixels
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
};

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}

// --- Carousel Root Component ---
type CarouselProps = {
  orientation?: "horizontal" | "vertical";
  // The original opts is replaced by Native props:
  // viewportFraction: number; // How much of the item is visible (e.g., 0.8)
  gap?: number; // Gap between items (in pixels or using NativeWind gap classes)
};

interface CarouselComponentProps extends React.ComponentProps<typeof View>, CarouselProps {
  className?: string;
}

/**
 * @function Carousel
 * @description The root component, managing scroll logic and context for navigation.
 */
export function Carousel({
  orientation = "horizontal",
  gap = 16, // Default gap of 16px (pl-4 equivalent)
  className,
  children,
  ...props
}: CarouselComponentProps) {
  const scrollRef = React.useRef<ScrollView>(null);
  const [scrollOffset, setScrollOffset] = React.useState(0);
  const [contentWidth, setContentWidth] = React.useState(0);
  
  // Assuming a single item takes up 80% of the screen width for display purposes
  const itemWidth = SCREEN_WIDTH * 0.8;
  const itemFullWidth = itemWidth + gap;
  
  // Calculate index and scrollability
  const maxScroll = contentWidth - SCREEN_WIDTH;
  const currentItemIndex = Math.round(scrollOffset / itemFullWidth);
  const totalItems = React.Children.count(React.Children.toArray(children).find((child) => React.isValidElement(child) && child.type === CarouselContent)?.props.children);
  const canScrollPrev = scrollOffset > 0;
  const canScrollNext = scrollOffset < maxScroll - 1;

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollOffset(event.nativeEvent.contentOffset.x);
  };

  const scrollPrev = React.useCallback(() => {
    if (scrollRef.current && currentItemIndex > 0) {
      const targetOffset = (currentItemIndex - 1) * itemFullWidth;
      scrollRef.current.scrollTo({ x: targetOffset, animated: true });
    }
  }, [itemFullWidth, currentItemIndex]);

  const scrollNext = React.useCallback(() => {
    if (scrollRef.current && currentItemIndex < totalItems - 1) {
      const targetOffset = (currentItemIndex + 1) * itemFullWidth;
      scrollRef.current.scrollTo({ x: targetOffset, animated: true });
    }
  }, [itemFullWidth, currentItemIndex, totalItems]);
  
  // Context Value
  const contextValue: CarouselContextProps = React.useMemo(() => ({
    orientation,
    scrollRef,
    itemWidth,
    scrollPrev,
    scrollNext,
    canScrollPrev,
    canScrollNext,
  }), [orientation, scrollPrev, scrollNext, canScrollPrev, canScrollNext, itemWidth]);


  return (
    <CarouselContext.Provider value={contextValue}>
      <StyledView
        className={cn("relative", className)}
        role="region"
        accessibilityLabel="carousel"
        data-slot="carousel"
        {...props}
      >
        {/* Children (CarouselContent, CarouselPrevious, CarouselNext) */}
        {children}
      </StyledView>
    </CarouselContext.Provider>
  );
}

// --- CarouselContent Component ---
interface CarouselContentProps extends React.ComponentProps<typeof View> {
  className?: string;
}

/**
 * @function CarouselContent
 * @description The scrollable container, using ScrollView with snapping.
 */
export function CarouselContent({ className, children, ...props }: CarouselContentProps) {
  const { scrollRef, orientation, itemFullWidth, itemWidth } = useCarousel();

  // Map children to wrap them in CarouselItem and apply width/padding
  const content = React.Children.map(children, (child) => 
    React.isValidElement(child) ? React.cloneElement(child, { 
      style: { width: itemWidth }, // Force the width on each item
      className: child.props.className,
    } as any) : child
  );

  return (
    <StyledScrollView
      ref={scrollRef}
      horizontal={orientation === "horizontal"}
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={itemFullWidth} // Snap to the width of the item + gap
      snapToAlignment="start"
      contentContainerStyle={{ 
        paddingLeft: 16, // Initial padding equivalent to Embla's padding
        paddingRight: 16,
        gap: 16, // Use RN's built-in gap property
      }}
      // RN ScrollView replaces the web's overflow-hidden div with its native scroll behavior
      {...props}
    >
      <StyledView className={cn("flex", orientation === "horizontal" ? "flex-row" : "flex-col", className)}>
        {content}
      </StyledView>
    </StyledScrollView>
  );
}

// --- CarouselItem Component ---
interface CarouselItemProps extends React.ComponentProps<typeof View> {
  className?: string;
}

/**
 * @function CarouselItem
 * @description A wrapper for each item/slide in the carousel.
 */
export function CarouselItem({ className, children, style, ...props }: CarouselItemProps) {
  // width is forced by the CarouselContent map, so we just focus on layout
  return (
    <StyledView
      role="group"
      accessibilityRole="listitem"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0",
        // The width of the item is set dynamically in CarouselContent
        className,
      )}
      style={style}
      {...props}
    >
      {children}
    </StyledView>
  );
}

// --- Carousel Previous Button ---
interface CarouselNavButtonProps extends React.ComponentProps<typeof Button> {}

/**
 * @function CarouselPrevious
 * @description Navigates to the previous slide.
 */
export function CarouselPrevious({ className, ...props }: CarouselNavButtonProps) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  // Positioning classes are replaced by RN styles (using absolute positioning)
  const positionClasses = orientation === "horizontal"
    ? "absolute top-1/2 -mt-4 left-4" // Simple fixed position 
    : "absolute left-1/2 -ml-4 top-4 rotate-90"; // top/left relative to parent

  return (
    <Button
      data-slot="carousel-previous"
      variant="outline"
      size="icon"
      className={cn("size-8 rounded-full z-10", positionClasses, className)}
      disabled={!canScrollPrev}
      onPress={scrollPrev}
      {...props}
    >
      <ArrowLeft size={16} />
    </Button>
  );
}

// --- Carousel Next Button ---
/**
 * @function CarouselNext
 * @description Navigates to the next slide.
 */
export function CarouselNext({ className, ...props }: CarouselNavButtonProps) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  // Positioning classes are replaced by RN styles (using absolute positioning)
  const positionClasses = orientation === "horizontal"
    ? "absolute top-1/2 -mt-4 right-4" // Simple fixed position
    : "absolute left-1/2 -ml-4 bottom-4 rotate-90";

  return (
    <Button
      data-slot="carousel-next"
      variant="outline"
      size="icon"
      className={cn("size-8 rounded-full z-10", positionClasses, className)}
      disabled={!canScrollNext}
      onPress={scrollNext}
      {...props}
    >
      <ArrowRight size={16} />
    </Button>
  );
}

// --- Export the components ---
export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};