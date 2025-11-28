import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function WasteClassifier() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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
    }
  };

  // 2. Send to Python Backend
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

      // IMPORTANT:
      // If using Android Emulator, use 'http://10.0.2.2:8000/api/classify'
      // If using iOS Simulator, use 'http://127.0.0.1:8000/api/classify'
      // If using a physical device, use your PC's LAN IP (e.g., http://192.168.1.5:8000/api/classify)
      const apiUrl = "http://192.168.1.115:8000/api/classify";

      const response = await axios.post(apiUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPrediction(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not connect to the ML Backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>♻️ Waste Sorter</Text>

      <Button title="Pick an Image" onPress={pickImage} />

      {imageUri && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />

          {loading ? (
            <ActivityIndicator size="large" color="#00ff00" />
          ) : (
            <Button title="Classify Waste" onPress={classifyImage} />
          )}
        </View>
      )}

      {prediction && (
        <View style={styles.resultContainer}>
          <Text style={styles.predictionText}>
            Prediction: {prediction.prediction.toUpperCase()}
          </Text>
          <Text style={styles.confidenceText}>
            Confidence: {(prediction.confidence * 100).toFixed(1)}%
          </Text>
          <Text style={styles.tipText}>💡 {prediction.tips}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  previewContainer: { marginTop: 20, alignItems: "center" },
  image: { width: 200, height: 200, borderRadius: 10, marginBottom: 10 },
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
