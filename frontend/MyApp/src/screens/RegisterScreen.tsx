// src/screens/RegisterScreen.tsx

import * as React from 'react';
import { View, Text, ScrollView, Alert, Pressable, PressableProps } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { User, Mail, Lock, Camera } from 'lucide-react-native';
import { styled } from 'nativewind';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// --- Import Converted UI Components ---
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '../components/ui/form';

// --- Context Hooks (Assumed to be functional) ---
import { useAuth } from '../context/AuthContext'; 

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

// --- 1. Validation Schema (Zod) ---
const RegisterSchema = z.object({
  displayName: z.string().min(2, { message: "Your full name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof RegisterSchema>;

/**
 * @function RegisterScreen
 * @description The screen allowing users to sign up for a new account.
 */
export function RegisterScreen() {
  const navigation = useNavigation();
  const { signUp, loading, error } = useAuth(); // Assume useAuth provides sign-up logic
  const [isPhotoSelected, setIsPhotoSelected] = React.useState(false); // Simulate photo status

  // 2. Initialize react-hook-form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: 'onBlur',
  });

  // 3. Form Submission Handler
  const onSubmit = (data: RegisterFormValues) => {
    console.log("Attempting sign-up with:", data);
    
    signUp(data.email, data.password, data.displayName).catch(() => {
        // Error handling managed by AuthContext, UI handles display via 'error' state
    });
  };

  // 4. Placeholder for Image Picker
  const handlePhotoChange = () => {
    // NOTE: This would launch Expo ImagePicker, handle upload, and set URL.
    Alert.alert("Profile Photo", "Launching Expo ImagePicker...");
    setIsPhotoSelected(true); // Simulate selection
  };
  
  // 5. Display Error (From AuthContext)
  React.useEffect(() => {
    if (error) {
      Alert.alert("Registration Failed", error);
    }
  }, [error]);


  // Map CSS variables to NativeWind classes
  const SURFACE_VARIANT_BG = 'bg-gray-200 dark:bg-gray-700'; // var(--surface-variant)
  const PRIMARY_BG = 'bg-green-600 dark:bg-green-700'; // var(--primary)
  const ON_SURFACE_VARIANT = 'text-gray-500 dark:text-gray-400'; // var(--on-surface-variant)
  const PRIMARY_COLOR = 'text-green-600 dark:text-green-400';
  const SURFACE_COLOR = 'border-white dark:border-gray-800'; // var(--surface)


  return (
    <StyledView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Header 
        // NOTE: 'welcome' screen is the likely destination for 'onBack'
        onBack={() => navigation.navigate('WelcomeScreen' as never)} 
        title="Register" 
      />
      
      <StyledScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}>
        <StyledView className="mb-8">
          <StyledText className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            Create Account
          </StyledText>
          <StyledText className={ON_SURFACE_VARIANT}>
            Join us and start making a difference
          </StyledText>
        </StyledView>

        {/* Profile Photo Placeholder */}
        <StyledView className="flex justify-center mb-8">
          <StyledView className="relative">
            
            {/* Avatar Image/Fallback (w-24 h-24) */}
            <Avatar className="size-24 border-4" style={{ borderColor: SURFACE_COLOR }}>
              <StyledView 
                className={cn(
                  "size-full rounded-full flex items-center justify-center", 
                  SURFACE_VARIANT_BG
                )}
              >
                {/* Conditional rendering for user icon or selected photo thumbnail */}
                {isPhotoSelected ? (
                    <StyledText>IMG</StyledText> // Placeholder for AvatarImage 
                ) : (
                    <AvatarFallback>
                        <User size={40} className={ON_SURFACE_VARIANT} />
                    </AvatarFallback>
                )}
              </StyledView>
            </Avatar>

            {/* Camera Button */}
            <Pressable
              onPress={handlePhotoChange}
              className={cn("absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg", PRIMARY_BG)}
            >
              <Camera size={16} className="text-white" />
            </Pressable>
          </StyledView>
        </StyledView>

        <Form {...form}>
          <StyledView className="space-y-4 mb-6">
            
            {/* Full Name Field */}
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your name"
                      icon={<User size={20} />}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={form.formState.errors.displayName?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
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
                      icon={<Mail size={20} />}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={form.formState.errors.email?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Create a password"
                      icon={<Lock size={20} />}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={form.formState.errors.password?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      icon={<Lock size={20} />}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={form.formState.errors.confirmPassword?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </StyledView>

          {/* Action Buttons */}
          <StyledView className="space-y-4">
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={form.handleSubmit(onSubmit)}
              isLoading={loading}
            >
              Create Account
            </Button>

            {/* Login Link */}
            <StyledText className={cn("text-center text-sm mt-6", ON_SURFACE_VARIANT)}>
              Already have an account?{' '}
              <Pressable
                onPress={() => navigation.navigate('LoginScreen' as never)}
                className="active:opacity-70"
              >
                <StyledText className={cn(PRIMARY_COLOR, 'font-semibold')}>
                  Login
                </StyledText>
              </Pressable>
            </StyledText>
          </StyledView>
        </Form>
      </StyledScrollView>
    </StyledView>
  );
}