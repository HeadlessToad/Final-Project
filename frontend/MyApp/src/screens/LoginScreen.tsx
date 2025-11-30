// src/screens/LoginScreen.tsx

import * as React from 'react';
import { View, Text, ScrollView, Alert, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg'; // For the Google icon
import { LogIn, Mail, Lock } from 'lucide-react-native';
import { styled } from 'nativewind';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// --- Import Converted UI Components ---
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/seperator';
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
const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

// --- Google Icon Component ---
const GoogleIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24">
        <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </Svg>
);

/**
 * @function LoginScreen
 * @description The screen allowing users to sign in via email/password or social login.
 */
export function LoginScreen() {
  const navigation = useNavigation();
  const { signIn, loading, error } = useAuth(); 

  // 2. Initialize react-hook-form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 3. Form Submission Handler (Email/Password)
  const onSubmit = (data: LoginFormValues) => {
    console.log("Attempting sign-in with:", data);
    signIn(data.email, data.password).catch(() => {
        // Error handled by AuthContext, only needed for UI feedback if sync is required
    });
  };
  
  // 4. Social Login Placeholder
  const handleSocialLogin = (provider: string) => {
      Alert.alert("Social Login", `Initiating login with ${provider}... (Simulation)`);
      // NOTE: Here you would call a function like signInWithGoogle()
  };
  
  // 5. Display Error (From AuthContext)
  React.useEffect(() => {
    if (error) {
      Alert.alert("Login Failed", error);
      // NOTE: In a production app, you might clear the error state in AuthContext after display
    }
  }, [error]);

  // Map CSS variables to NativeWind classes
  const ON_SURFACE_VARIANT = 'text-gray-500 dark:text-gray-400'; 
  const PRIMARY_COLOR = 'text-green-600 dark:text-green-400';
  const BACKGROUND_COLOR = 'bg-white dark:bg-gray-900'; 
  const OUTLINE_COLOR = 'border-gray-300 dark:border-gray-700'; 

  return (
    <StyledView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Header 
        // NOTE: 'welcome' screen is the likely destination for 'onBack'
        onBack={() => navigation.navigate('WelcomeScreen' as never)} 
        title="Login" 
      />
      
      <StyledScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}>
        <StyledView className="mb-8">
          <StyledText className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            Welcome Back!
          </StyledText>
          <StyledText className={ON_SURFACE_VARIANT}>
            Login to continue your eco journey
          </StyledText>
        </StyledView>

        <Form {...form}>
          <StyledView className="space-y-4 mb-6">
            
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
                      placeholder="Enter your password"
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

            {/* Forgot Password Link */}
            <StyledView className="flex flex-row justify-end">
              <Pressable
                onPress={() => navigation.navigate('ForgotPasswordScreen' as never)}
                className="active:opacity-70"
              >
                <StyledText className={cn("text-sm font-medium", PRIMARY_COLOR)}>
                  Forgot Password?
                </StyledText>
              </Pressable>
            </StyledView>

          </StyledView>
        </Form>

        {/* Action Buttons */}
        <StyledView className="space-y-4">
          <Button
            variant="primary"
            size="large"
            fullWidth
            onClick={form.handleSubmit(onSubmit)}
            isLoading={loading}
          >
            Login
          </Button>

          {/* Separator */}
          <StyledView className="relative my-6 flex items-center justify-center">
            <Separator className="w-full" />
            <StyledView className={cn(`absolute px-4 ${BACKGROUND_COLOR}`)}>
              <StyledText className={cn("text-sm", ON_SURFACE_VARIANT)}>
                or continue with
              </StyledText>
            </StyledView>
          </StyledView>

          {/* Google Button */}
          <Button
            variant="outline"
            size="large"
            fullWidth
            onClick={() => handleSocialLogin('Google')}
            icon={<GoogleIcon />}
          >
            Google
          </Button>

          {/* Register Link */}
          <StyledText className={cn("text-center text-sm mt-6", ON_SURFACE_VARIANT)}>
            Don't have an account?{' '}
            <Pressable
              onPress={() => navigation.navigate('RegisterScreen' as never)}
              className="active:opacity-70"
            >
              <StyledText className={cn(PRIMARY_COLOR, 'font-semibold')}>
                Register
              </StyledText>
            </Pressable>
          </StyledText>
        </StyledView>
      </StyledScrollView>
    </StyledView>
  );
}