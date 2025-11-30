// src/screens/EditProfileScreen.tsx

import * as React from 'react';
import { View, Text, ScrollView, Alert, PressableProps } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { User, Mail, Camera } from 'lucide-react-native';
import { styled } from 'nativewind';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// --- Import Converted UI Components ---
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '../components/ui/form';

// --- Context Hooks and Types (Assumed to be functional) ---
import { useAuth } from '../context/AuthContext'; 
import { UserProfile } from '../types';

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

// --- 1. Validation Schema (Zod) ---
const EditProfileSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }).optional(), // Email often read-only, but kept here
});

type EditProfileFormValues = z.infer<typeof EditProfileSchema>;


/**
 * @function EditProfileScreen
 * @description Allows the user to edit their profile details (name, email) and change their photo.
 */
export function EditProfileScreen() {
  const navigation = useNavigation();
  const { profile, loading: authLoading } = useAuth(); // Get current profile data and loading state

  // 2. Initialize react-hook-form with current profile data
  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(EditProfileSchema),
    defaultValues: {
      displayName: profile?.displayName || '',
      email: profile?.email || '',
    },
    mode: 'onBlur'
  });

  // 3. Save Handler
  const handleSave = (data: EditProfileFormValues) => {
    // NOTE: This is where the update logic would call a Firestore service function.
    console.log("Attempting to update profile:", data);
    
    // SIMULATION: Assume a service hook is available
    // updateProfileService(data); 

    Alert.alert("Success", "Profile updated locally (simulated).");
    navigation.goBack(); // Navigate back to Profile screen
  };

  // 4. Placeholder for Image Picker
  const handlePhotoChange = () => {
    // NOTE: This would launch Expo ImagePicker and then handle upload/update
    Alert.alert("Photo Change", "Launching Expo ImagePicker...");
  };

  // Map CSS variables to NativeWind classes:
  const SURFACE_COLOR = 'border-white dark:border-gray-800'; // var(--surface)
  const PRIMARY_BG = 'bg-green-600 dark:bg-green-700'; // var(--primary)
  const SECONDARY_BG = 'bg-blue-600 dark:bg-blue-700'; // var(--secondary)
  const PRIMARY_TEXT = 'text-green-600 dark:text-green-400'; // var(--primary)
  const PRIMARY_GRADIENT = `from-green-600 to-blue-600`;


  return (
    <StyledView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Header
        onBack={navigation.goBack}
        title="Edit Profile"
      />

      <StyledScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}>
        <StyledView className="space-y-6">
          
          {/* Profile Photo Section */}
          <StyledView className="flex justify-center">
            <StyledView className="relative">
              
              {/* Avatar Image/Fallback (w-28 h-28) */}
              <Avatar className="size-28 border-4 z-0" style={{ borderColor: SURFACE_COLOR }}>
                <StyledView className={`flex items-center justify-center size-full rounded-full bg-gradient-to-br ${PRIMARY_GRADIENT}`}>
                  {profile?.profilePhotoUrl ? (
                    <AvatarImage source={profile.profilePhotoUrl} />
                  ) : (
                    <AvatarFallback>
                      <User size={56} className="text-white" />
                    </AvatarFallback>
                  )}
                </StyledView>
              </Avatar>

              {/* Camera Button */}
              <Button
                onPress={handlePhotoChange}
                variant="primary"
                size="icon"
                className={cn("absolute bottom-0 right-0 w-10 h-10 rounded-full p-2 z-10 shadow-lg", PRIMARY_BG)}
              >
                <Camera size={20} className="text-white" />
              </Button>
            </StyledView>
          </StyledView>

          {/* Form */}
          <Form {...form}>
            <StyledView className="space-y-4">
              
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

              {/* Email Field (Usually read-only, unless authentication method allows updates) */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        icon={<Mail size={20} />}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        // Email is often read-only/disabled
                        editable={false} 
                        error={form.formState.errors.email?.message} 
                      />
                    </FormControl>
                    {/* Display a message explaining why email might be disabled */}
                    <StyledText className="text-xs text-gray-500 mt-1">
                        Email updates require re-authentication and are typically managed separately.
                    </StyledText>
                  </FormItem>
                )}
              />
            </StyledView>
          </Form>

          {/* Actions */}
          <StyledView className="space-y-3 pt-4">
            <Button
              variant="primary"
              size="large"
              fullWidth
              onPress={form.handleSubmit(handleSave)}
              isLoading={authLoading || form.formState.isSubmitting}
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              size="large"
              fullWidth
              onPress={navigation.goBack}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
          </StyledView>
        </StyledView>
      </StyledScrollView>
    </StyledView>
  );
}