// src/components/ui/form.tsx

import * as React from "react";
import { View, Text, ViewProps, TextProps } from "react-native";
import { styled } from "nativewind";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "./utils";
// We depend on a converted Label component (must be adapted from Radix LabelPrimitive)
// Assuming we create a basic RN component for Label later.
import { Label } from "./label"; 

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledText = styled(Text);

// --- Core Re-export (The primary hook-form provider) ---
export const Form = FormProvider;

// --- Form Contexts ---
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

// --- FormField (Wrapper for Controller) ---
export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

// --- useFormField Hook (Core Logic) ---
export const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  // Using useFormState to subscribe to updates for the specific field
  const formState = useFormState({ name: fieldContext.name }); 
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState, // Contains: error, isDirty, isTouched, etc.
  };
};

// --- FormItem (Field Container) ---
interface FormItemProps extends ViewProps {
  className?: string;
}

/**
 * @function FormItem
 * @description Wrapper for a single form field (Label, Control, Message).
 */
export function FormItem({ className, children, ...props }: FormItemProps) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <StyledView
        data-slot="form-item"
        // Web 'grid gap-2' becomes simple RN 'gap-2' (Flex column by default)
        className={cn("gap-2", className)}
        {...props}
      >
        {children}
      </StyledView>
    </FormItemContext.Provider>
  );
}

// --- FormLabel ---
interface FormLabelProps extends TextProps {
  className?: string;
}

/**
 * @function FormLabel
 * @description The label for the input field.
 */
export function FormLabel({ className, children, ...props }: FormLabelProps) {
  const { error, formItemId } = useFormField();

  // We use our converted Label component here
  return (
    <Label
      data-slot="form-label"
      // Use dynamic class based on error state (simulating data-[error=true])
      className={cn(!!error && "text-red-500", className)}
      htmlFor={formItemId} // This prop is ignored in RN, but kept for context/consistency
      {...props}
    >
      {children}
    </Label>
  );
}

// --- FormControl (The Input Field Wrapper) ---

// In RN, we don't need the Slot primitive, we just render the children directly 
// and ensure the correct accessibility props are passed to the child component 
// (which will be an Input, Select, Checkbox, etc.)
interface FormControlProps extends ViewProps {
  children: React.ReactNode;
}

/**
 * @function FormControl
 * @description Provides the control element (Input, Select, etc.) with validation context.
 */
export function FormControl({ children, ...props }: FormControlProps) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  // We enforce that the child is a single element to inject props
  const child = React.Children.only(children);

  return (
     <StyledView data-slot="form-control" {...props}>
       {/* We clone the child element to inject accessibility props, 
           which is the RN equivalent of the web Slot primitive */}
       {React.cloneElement(child, {
         id: formItemId,
         'aria-describedby': !error
           ? formDescriptionId
           : `${formDescriptionId} ${formMessageId}`, // <-- FIX IS HERE: COMPLETE THE TEMPLATE STRING AND ADD `formMessageId`
         'aria-invalid': !!error,
         // We pass the error state down explicitly for conditional styling in the input component
         error: !!error, 
       })}
     </StyledView>
   );
 }