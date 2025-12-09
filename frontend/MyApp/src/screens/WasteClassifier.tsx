import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PredictionFeedbackList, { DetectionItem, FeedbackData } from '../components/PredictionFeedbackList';

export default function WasteClassifier() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [annotatedImageSource, setAnnotatedImageSource] = useState<string | null>(null);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [detections, setDetections] = useState<DetectionItem[]>([]);

  // 1. Pick Image
  const pickImage = async () => {
    // Ask for permission
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "You've refused to allow this app to access your photos!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setPrediction(null); // Reset previous results
      setAnnotatedImageSource(null); // Reset previous annotated image
    }
  };

  const resetForm = () => {
    setDetections([]);
    setPrediction(null);
    setAnnotatedImageSource(null);
    setImageUri(null);
  };

  // When running locally for tests - make sure ngrok is running on port 8000
  // In terminal: ngrok http 8000
  // const API_BASE_URL = "https://nia-unshattered-davin.ngrok-free.dev";

  //WHen running on Google cloud
  const API_BASE_URL = "https://waste-classifier-eu-89824582784.europe-west1.run.app";

  const classifyImage = async () => {
    if (!imageUri) return;
    setLoading(true);

    try {
      // Create Form Data
      const formData = new FormData();

      // React Native requires a specific object structure for file uploads
      formData.append("file", {
        uri: imageUri,
        name: "waste_photo.jpg",
        type: "image/jpeg",
      } as any);

      if (user && user.uid) {
        formData.append("user_id", user.uid);
        console.log("👤 Sending user ID:", user.uid);
      } else {
        console.log("👤 No user logged in.");
      }

      const apiUrl = `${API_BASE_URL}/predict`;
      const response = await axios.post(apiUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data;

      if (data.found === false) {
        Alert.alert("Nothing Found", data.message || "No recyclable objects detected.");
        setPrediction(null);
        setDetections([]);
        setAnnotatedImageSource(null);
        return; // Stop here, don't try to render anything
      }

      setPrediction(data);
      // --- NEW: Process Annotated Image ---
      if (data.annotated_image_base64) {
        // Prepend the data URI scheme for React Native Image component
        setAnnotatedImageSource(
          `data:image/jpeg;base64,${data.annotated_image_base64}`
        );
        console.log("Annotated image received.");
      } else {
        setAnnotatedImageSource(null);
        console.log("No annotated image received.");
      }
      if (data.detections) {
        setDetections(data.detections);
      }
      if (data.image_id) {
        console.log("✅ Received Image ID:", data.image_id);
        setCurrentImageId(data.image_id);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not connect to the ML Backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (feedbackItems: FeedbackData[]) => {
    // 1. Basic validation
    if (feedbackItems.length === 0) return Alert.alert("Empty", "Please select options before submitting.");

    try {
      // 2. Send Data
      const response = await axios.post(`${API_BASE_URL}/feedback`, {
        user_id: user?.uid || 'anonymous',
        image_id: currentImageId,
        feedback: feedbackItems
      });

      // 3. Get the dynamic message from the backend
      // It will say "Training data saved" OR "Image discarded (no objects)"
      const serverMessage = response.data.message || "Your feedback helps improve the model.";

      // 4. Show the specific outcome to the user
      Alert.alert("Status", serverMessage, [
        {
          text: "OK",
          onPress: () => {
            // 5. FULL RESET on press (Ready for next item)
            resetForm();
          }
        }
      ]);

    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not send feedback. Check console.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>♻️ Waste Sorter</Text>

      <Button title="Pick an Image" onPress={pickImage} />

      {imageUri && (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: annotatedImageSource || imageUri }}
            style={styles.image}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#00ff00" />
          ) : (
            <Button title="Classify Waste" onPress={classifyImage} />
          )}
        </View>
      )}

      {prediction && detections.length > 0 && (
        <>
          {/* <View style={styles.resultContainer}>
            <Text style={styles.predictionText}>
              Prediction: {prediction.prediction.toUpperCase()}
            </Text>
            <Text style={styles.confidenceText}>
              Confidence: {(prediction.confidence * 100).toFixed(1)}%
            </Text>
            <Text style={styles.tipText}>💡 {prediction.tips}</Text>
          </View> */}
          <PredictionFeedbackList
            detections={detections}
            onSubmit={handleFeedbackSubmit}
          />
        </>
      )}
    </ScrollView>
  );
}

const { width, height } = Dimensions.get("window");
const imageSize = Math.min(width, height) * 0.8;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,           // Allows content to fill screen but scroll if needed
    alignItems: "center",
    justifyContent: "center", // Keeps it centered if content is short
    padding: 20,
    paddingBottom: 50,     // Extra padding at bottom so the last button isn't stuck to the edge
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  previewContainer: { marginTop: 20, alignItems: "center" },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: 10,
    marginBottom: 10,
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
  },
  predictionText: { fontSize: 20, fontWeight: "bold", color: "#2e7d32" },
  confidenceText: { fontSize: 14, color: "#555" },
  tipText: { marginTop: 5, fontStyle: "italic" },
});
