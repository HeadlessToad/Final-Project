// src/components/ui/input-otp.tsx

import * as React from "react";
import { View, Text, TextInput, ViewProps, TextInputProps, NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";
import { Minus } from "lucide-react-native";
import { styled } from "nativewind";
import { cn } from "./utils";

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);

// --- Constants ---
const OTP_LENGTH = 6; // Assuming a standard 6-digit OTP

// --- Context for State Management ---
interface InputOTPContextValue {
  value: string;
  setValue: (value: string) => void;
  focusedIndex: number;
  inputRef: React.RefObject<TextInput>;
  // We need to expose the number of slots
  slots: { char: string; isActive: boolean }[];
}

const InputOTPContext = React.createContext<InputOTPContextValue | undefined>(undefined);
const useInputOTP = () => {
    const context = React.useContext(InputOTPContext);
    if (!context) {
        throw new Error("InputOTP components must be used within <InputOTP />");
    }
    return context;
};

// --- InputOTP Root Component (State Manager) ---

interface InputOTPProps extends Omit<TextInputProps, 'onChangeText'> {
  // Use RN standard props
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  maxLength?: number;
  className?: string; // For the internal TextInput
  containerClassName?: string; // For the outermost wrapper
}

/**
 * @function InputOTP
 * @description The root component managing the single hidden TextInput and the visible OTP value.
 */
export function InputOTP({
  value: controlledValue,
  onChange,
  defaultValue = "",
  maxLength = OTP_LENGTH,
  className,
  containerClassName,
  ...props
}: InputOTPProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const inputRef = React.useRef<TextInput>(null);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleChange = (newValue: string) => {
    // Trim to max length
    const trimmedValue = newValue.slice(0, maxLength);
    
    if (!isControlled) {
      setUncontrolledValue(trimmedValue);
    }
    onChange?.(trimmedValue);
    
    // Update focus index based on length
    setFocusedIndex(trimmedValue.length);
  };
  
  // Create slots array for context
  const slots = React.useMemo(() => {
    const chars = value.split('');
    return Array.from({ length: maxLength }).map((_, index) => ({
      char: chars[index] || '',
      isActive: index === focusedIndex, // Use focusedIndex to track the active slot
    }));
  }, [value, maxLength, focusedIndex]);

  const contextValue: InputOTPContextValue = React.useMemo(() => ({
    value,
    setValue: handleChange,
    focusedIndex,
    inputRef,
    slots
  }), [value, focusedIndex, maxLength]);

  return (
    <InputOTPContext.Provider value={contextValue}>
      <StyledView 
        // This outer view holds the visual representation and the hidden TextInput
        data-slot="input-otp"
        className={cn("relative flex flex-col items-center", containerClassName)}
        // Tap anywhere on the container to focus the hidden input
        onTouchEnd={() => inputRef.current?.focus()}
      >
        {/* 1. Hidden TextInput to handle native keyboard input */}
        <StyledTextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          onFocus={() => setFocusedIndex(value.length)}
          onBlur={() => setFocusedIndex(-1)}
          maxLength={maxLength}
          keyboardType="number-pad"
          textContentType="oneTimeCode" // Important for iOS auto-fill
          autoCapitalize="none"
          autoCorrect={false}
          caretHidden={true} // Hide native caret
          style={{ 
            opacity: 0, 
            position: 'absolute', 
            height: '100%', 
            width: '100%',
            zIndex: 10,
            fontSize: 1, // Keep font size minimal
          }}
          className={cn("disabled:opacity-50", className)}
          {...props}
        />
        
        {/* 2. Visible Children (InputOTPGroup, InputOTPSlot, Separator) */}
        {children}
      </StyledView>
    </InputOTPContext.Provider>
  );
}

// --- InputOTPGroup (Segmented Wrapper) ---
interface InputOTPGroupProps extends ViewProps {
  className?: string;
}

/**
 * @function InputOTPGroup
 * @description Wrapper for the individual segments/slots.
 */
export function InputOTPGroup({ className, children, ...props }: InputOTPGroupProps) {
  return (
    <StyledView
      data-slot="input-otp-group"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    >
      {children}
    </StyledView>
  );
}

// --- InputOTPSlot (Individual Segment) ---
interface InputOTPSlotProps extends ViewProps {
  index: number;
  className?: string;
}

/**
 * @function InputOTPSlot
 * @description Renders a single segment of the OTP field, showing the character and active state.
 */
export function InputOTPSlot({ index, className, ...props }: InputOTPSlotProps) {
  const { slots } = useInputOTP();
  const slot = slots[index] || { char: '', isActive: false };
  const { char, isActive } = slot;
  
  // Dynamic classes for active state (simulating data-[active=true])
  const activeClasses = isActive
    ? "border-blue-600 ring-4 ring-blue-600/50 z-10" // Example active/focus ring
    : "border-gray-300 dark:border-gray-600";
    
  // Dynamic classes for rounded corners (first/last)
  const roundedClasses = cn(
    index === 0 ? "rounded-l-md border-l" : "", 
    index === OTP_LENGTH - 1 ? "rounded-r-md border-r" : ""
  );


  return (
    <StyledView
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        // Base classes: size, flex, border (y, r for all but last, l for first)
        "relative flex h-12 w-10 items-center justify-center text-lg bg-gray-100 dark:bg-gray-700 border-y transition-all outline-none",
        activeClasses,
        roundedClasses,
        className,
      )}
      {...props}
    >
      <StyledText className="text-gray-900 dark:text-gray-100 font-medium">
        {char}
      </StyledText>
      
      {/* Animated Cursor (Simulating hasFakeCaret) */}
      {isActive && (
        <StyledView className="absolute inset-0 flex items-center justify-center">
          <StyledView className="bg-gray-900 dark:bg-gray-100 h-6 w-px animate-pulse duration-1000" />
        </StyledView>
      )}
    </StyledView>
  );
}

// --- InputOTPSeparator ---
interface InputOTPSeparatorProps extends ViewProps {}

/**
 * @function InputOTPSeparator
 * @description The visible separator between OTP groups/slots.
 */
export function InputOTPSeparator({ ...props }: InputOTPSeparatorProps) {
  return (
    <StyledView data-slot="input-otp-separator" role="separator" {...props}>
      <Minus size={20} className="text-gray-500 dark:text-gray-400" />
    </StyledView>
  );
}

// --- Final Export ---
export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };