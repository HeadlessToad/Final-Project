// src/screens/FeedbackScreen.tsx

import * as React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Star, CheckCircle } from "lucide-react-native";
import { styled } from "nativewind";
import { cn } from "../components/ui/utils";

// Components
import { Header } from "../components/Header";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";

// Styled
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

// Constants
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export function FeedbackScreen() {
  const navigation = useNavigation();
  const [rating, setRating] = React.useState(0);
  const [feedback, setFeedback] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = () => {
    console.log(`Submitting Feedback: Rating=${rating}, Text="${feedback}"`);
    setSubmitted(true);
  };

  // theme helper classes
  const PRIMARY_COLOR = "text-green-600 dark:text-green-400";
  const PRIMARY_FILL = "fill-green-600 dark:fill-green-400";
  const OUTLINE_COLOR = "text-gray-300 dark:text-gray-600";
  const PRIMARY_LIGHT_BG = "bg-green-100 dark:bg-green-800/50";
  const ON_SURFACE_VARIANT = "text-gray-500 dark:text-gray-400";

  return (
    <StyledView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Header onBack={navigation.goBack} title="Feedback" />

      <StyledScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingVertical: 24,
          flexGrow: 1,
        }}
      >
        {!submitted ? (
          <StyledView className="space-y-6">
            {/* Rating Card */}
            <Card className="p-6">
              <StyledText className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                How was your experience?
              </StyledText>
              <StyledText className={cn("mb-4", ON_SURFACE_VARIANT)}>
                Your feedback helps us improve GreenMind
              </StyledText>

              {/* Star Rating */}
              <StyledView className="flex flex-row gap-2 justify-center mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => setRating(star)}
                    className="p-1 active:scale-110"
                  >
                    <Star
                      size={40}
                      className={
                        star <= rating
                          ? cn(PRIMARY_COLOR, PRIMARY_FILL)
                          : OUTLINE_COLOR
                      }
                    />
                  </Pressable>
                ))}
              </StyledView>

              {rating > 0 && (
                <StyledText
                  className={cn("text-center mb-4", ON_SURFACE_VARIANT)}
                >
                  {rating === 5 && "Excellent! We're glad you love it! 🌟"}
                  {rating === 4 && "Great! Thanks for the positive feedback! 😊"}
                  {rating === 3 && "Good! We appreciate your input! 👍"}
                  {rating === 2 && "We can do better. Tell us more! 💪"}
                  {rating === 1 && "We're sorry to hear that. Help us improve! 🙏"}
                </StyledText>
              )}
            </Card>

            {/* Feedback Textarea Card */}
            <Card className="p-6">
              <StyledText className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                Tell us more (optional)
              </StyledText>

              <Textarea
                value={feedback}
                onChangeText={setFeedback}   // FIXED!
                placeholder="Share your thoughts, suggestions, or report issues..."
                className="w-full h-32"
              />
            </Card>

            <Button
              variant="primary"
              size="large"
              fullWidth
              disabled={rating === 0}
              onPress={handleSubmit} // FIXED onClick -> onPress
            >
              Submit Feedback
            </Button>
          </StyledView>
        ) : (
          /* Success View */
          <StyledView
            className="flex items-center justify-center pt-24"
            style={{ minHeight: SCREEN_HEIGHT * 0.7 }}
          >
            <StyledView className="text-center">
              {/* Circle check */}
              <StyledView
                className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6",
                  PRIMARY_LIGHT_BG
                )}
              >
                <CheckCircle size={60} className={PRIMARY_COLOR} />
              </StyledView>

              <StyledText className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Thank You!
              </StyledText>

              <StyledText
                className={cn(
                  "mb-8 px-8 text-center text-base",
                  ON_SURFACE_VARIANT
                )}
              >
                Your feedback has been submitted successfully. We appreciate you
                taking the time to help us improve.
              </StyledText>

              <StyledView className="space-y-3 w-full max-w-sm mx-auto">
                <Button
                  variant="primary"
                  size="large"
                  fullWidth
                  onPress={() => navigation.navigate("HomeScreen" as never)}
                >
                  Back to Home
                </Button>

                <Button
                  variant="text"
                  size="large"
                  fullWidth
                  onPress={() => {
                    setSubmitted(false);
                    setRating(0);
                    setFeedback("");
                  }}
                >
                  Submit Another Feedback
                </Button>
              </StyledView>
            </StyledView>
          </StyledView>
        )}
      </StyledScrollView>
    </StyledView>
  );
}
