// src/screens/ForgotPasswordScreen.tsx

import * as React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Mail } from 'lucide-react-native';
import { styled } from 'nativewind';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// UI Components
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '../components/ui/form';

// Context
import { useAuth } from '../context/AuthContext';

// ⭐ FIX: Import cn
import { cn } from '../components/ui/utils';

// Styled components
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

// Validation
const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>;

export function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { loading: authLoading, error: authError } = useAuth();

  const [sent, setSent] = React.useState(false);
  const [emailSentTo, setEmailSentTo] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsSending(true);

    try {
      // Simulate success
      setEmailSentTo(data.email);
      setSent(true);
      Alert.alert("Success", "Password reset link sent! Check your email.");
    } catch (e) {
      Alert.alert("Reset Failed", authError || "Failed to send link.");
    } finally {
      setIsSending(false);
    }
  };

  // Style constants
  const PRIMARY_COLOR = "text-green-600 dark:text-green-400";
  const PRIMARY_LIGHT_BG = "bg-green-100 dark:bg-green-800/50";
  const ON_SURFACE_VARIANT = "text-gray-500 dark:text-gray-400";
  const ON_SURFACE_TEXT = "text-gray-900 dark:text-gray-100";

  return (
    <StyledView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Header
        onBack={navigation.goBack}
        title={!sent ? "Forgot Password" : "Check Your Email"}
      />

      <StyledScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32 }}>
        <Form {...form}>
          <StyledView className="flex-1">

            {/* --- FORM STATE --- */}
            {!sent ? (
              <StyledView className="flex-1">
                <StyledView className="mb-8">
                  <StyledText className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                    Reset Password
                  </StyledText>
                  <StyledText className={ON_SURFACE_VARIANT}>
                    Enter your email address and we'll send a link to reset your password.
                  </StyledText>
                </StyledView>

                <StyledView className="space-y-4 mb-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            icon={<Mail size={20} />}
                            error={form.formState.errors.email?.message}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </StyledView>

                <Button
                  variant="primary"
                  size="large"
                  fullWidth
                  onPress={form.handleSubmit(onSubmit)}
                  isLoading={isSending}
                >
                  Send Reset Link
                </Button>
              </StyledView>
            ) : (
              /* --- SUCCESS STATE --- */
              <StyledView className="text-center pt-8 flex-1 items-center">
                <StyledView
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
                    PRIMARY_LIGHT_BG
                  )}
                >
                  <Mail size={40} className={PRIMARY_COLOR} />
                </StyledView>

                <StyledText className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                  Check Your Email
                </StyledText>

                <StyledText className={cn("text-base mb-8 text-center", ON_SURFACE_VARIANT)}>
                  We've sent a password reset link to{" "}
                  <StyledText className={cn(ON_SURFACE_TEXT, "font-semibold")}>
                    {emailSentTo}
                  </StyledText>
                </StyledText>

                <Button
                  variant="primary"
                  size="large"
                  fullWidth
                  onPress={() => navigation.navigate("LoginScreen" as never)}
                  className="mt-auto"
                >
                  Back to Login
                </Button>
              </StyledView>
            )}

          </StyledView>
        </Form>
      </StyledScrollView>
    </StyledView>
  );
}
