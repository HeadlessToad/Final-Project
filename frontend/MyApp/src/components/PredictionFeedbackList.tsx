// components/PredictionFeedbackList.tsx
// ============================================================================
// COMPONENT PURPOSE:
// Shows model-detected bounding boxes as a list of cards for user validation.
// Supports user-drawn additional boxes, per-class emoji rendering, "ghost" 
// styling for bad boxes, and requires confirmation when all feedback is empty.
// ============================================================================

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";

// ----------------------------------------------------------------------------
// CONSTANTS & CONFIGURATION
// ----------------------------------------------------------------------------

// Maps classification labels to their corresponding UI emojis
const CLASS_EMOJI: Record<string, string> = {
  cardboard: "📦",
  glass: "🍾",
  metal: "🥫",
  paper: "📄",
  plastic: "🧴",
  trash: "🗑️",
};

// Available categories for the correction modal when a user marks a detection as "False"
const WASTE_CLASSES = [
  { id: "cardboard", label: "Cardboard",    emoji: "📦" },
  { id: "glass",     label: "Glass",        emoji: "🍾" },
  { id: "metal",     label: "Metal",        emoji: "🥫" },
  { id: "paper",     label: "Paper",        emoji: "📄" },
  { id: "plastic",   label: "Plastic",      emoji: "🧴" },
  { id: "trash",     label: "General Waste",emoji: "🗑️" },
];

// ----------------------------------------------------------------------------
// INTERFACES & TYPES
// ----------------------------------------------------------------------------

// Represents a single bounding box detection (either from ML or user-drawn)
export interface DetectionItem {
  id: string;
  label: string;
  confidence: number;
  box_2d?: number[];
}

// Represents the validation feedback provided by the user for a specific detection
export interface FeedbackData {
  detectionId: string;
  originalLabel: string;
  status: "correct" | "wrong_label" | "ghost";
  correctedLabel?: string;
  box_2d?: number[];
}

interface Props {
  detections: DetectionItem[];
  /** Additional boxes drawn by the user manually on the image */
  userDrawnDetections?: DetectionItem[];
  onSubmit: (feedback: FeedbackData[]) => void;
  /** Fires on every status change so parent can react (e.g., update box colors on the SVG) */
  onFeedbackChange?: (map: Record<string, FeedbackData>) => void;
  /** Called when the user wants to delete one of their custom drawn boxes */
  onDeleteUserDrawnBox?: (id: string) => void;
}

export default function PredictionFeedbackList({
  detections,
  userDrawnDetections = [],
  onSubmit,
  onFeedbackChange,
  onDeleteUserDrawnBox,
}: Props) {
  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  
  // Tracks the user's validation decisions for all model detections
  const [feedbackMap, setFeedbackMap] = useState<Record<string, FeedbackData>>({});
  
  // Controls the visibility of the category correction modal
  const [modalVisible, setModalVisible] = useState(false);
  
  // Stores the ID of the detection currently being corrected in the modal
  const [activeDetectionId, setActiveDetectionId] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------

  // Centralized state updater that also fires the parent callback
  const updateMap = (newMap: Record<string, FeedbackData>) => {
    setFeedbackMap(newMap);
    onFeedbackChange?.(newMap);
  };

  // Triggered when the user taps "True", "False", or "Bad Box" on a detection card
  const handleStatus = (item: DetectionItem, status: FeedbackData["status"]) => {
    // If the label is wrong, open the modal to let them choose the correct one
    if (status === "wrong_label") {
      setActiveDetectionId(item.id);
      setModalVisible(true);
    }
    
    // Update the feedback state for this specific detection
    updateMap({
      ...feedbackMap,
      [item.id]: {
        detectionId: item.id,
        originalLabel: item.label,
        status,
        // Preserve the corrected label only if the status is still "wrong_label"
        correctedLabel:
          status === "wrong_label" ? feedbackMap[item.id]?.correctedLabel : undefined,
        box_2d: item.box_2d,
      },
    });
  };

  // Triggered when the user selects a new category from the correction modal
  const handleCategorySelect = (category: string) => {
    if (activeDetectionId) {
      updateMap({
        ...feedbackMap,
        [activeDetectionId]: {
          ...feedbackMap[activeDetectionId],
          correctedLabel: category,
        },
      });
    }
    setModalVisible(false);
    setActiveDetectionId(null);
  };

  // Validates and packages all feedback data before sending it to the parent component
  const handleSubmit = () => {
    const modelFeedback = Object.values(feedbackMap);
    
    // Auto-approve user-drawn boxes since the user explicitly added them
    const userDrawnFeedback: FeedbackData[] = userDrawnDetections.map((d) => ({
      detectionId: d.id,
      originalLabel: d.label,
      status: "correct",
      box_2d: d.box_2d,
    }));

    // Check if there is at least one useful piece of feedback (not marked as a 'ghost'/bad box)
    const hasValid =
      modelFeedback.some((f) => f.status !== "ghost") || userDrawnFeedback.length > 0;

    // Prevent submission of totally empty/useless data without user confirmation
    if (!hasValid) {
      Alert.alert(
        "No Useful Feedback",
        "All boxes are marked as bad. The image will stay in the review queue for others. Are you sure you want to skip?",
        [
          { text: "No, go back", style: "cancel" },
          { text: "Yes, skip it", onPress: () => onSubmit([]) },
        ]
      );
      return;
    }
    
    // Combine and submit both model feedback and user-drawn feedback
    onSubmit([...modelFeedback, ...userDrawnFeedback]);
  };

  // --------------------------------------------------------------------------
  // LIST RENDERING
  // --------------------------------------------------------------------------

  // Combine model detections and user-drawn detections into a single array for the FlatList
  type ListItem = DetectionItem & { isUserDrawn?: boolean };
  const allItems: ListItem[] = [
    ...detections,
    ...userDrawnDetections.map((d) => ({ ...d, isUserDrawn: true as const })),
  ];

  // Renders individual cards for both model detections and user-drawn detections
  const renderItem = ({ item }: { item: ListItem }) => {
    const emoji = CLASS_EMOJI[item.label.toLowerCase()] ?? "♻️";

    // --- RENDER BRANCH 1: USER-DRAWN BOXES ---
    // Simpler UI card since user-drawn boxes are automatically assumed "correct"
    if (item.isUserDrawn) {
      return (
        <View style={styles.userDrawnCard}>
          <View style={styles.userDrawnBadge}>
            <Text style={styles.userDrawnBadgeText}>✏️ Added by you</Text>
          </View>
          <View style={styles.userDrawnRow}>
            <Text style={styles.userDrawnLabel}>
              {emoji} {item.label.toUpperCase()}
            </Text>
            <TouchableOpacity
              style={styles.deleteBoxBtn}
              onPress={() => onDeleteUserDrawnBox?.(item.id)}
            >
              <Text style={styles.deleteBoxBtnText}>🗑️ Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // --- RENDER BRANCH 2: MODEL DETECTIONS ---
    // Full interactive card allowing True/False/Ghost validation
    const feedback: Partial<FeedbackData> = feedbackMap[item.id] ?? {};
    const isStatus = (s: string) => feedback.status === s;
    const isGhost = isStatus("ghost");

    return (
      <View style={[styles.card, isGhost && styles.cardGhost]}>
        {/* Title and Confidence Score */}
        <Text style={[styles.title, isGhost && styles.titleGhost]}>
          {emoji} {item.label.toUpperCase()}{" "}
          <Text style={styles.conf}>{(item.confidence * 100).toFixed(0)}%</Text>
        </Text>

        {/* Validation Action Buttons */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.btn, isStatus("correct") && styles.btnSuccess]}
            onPress={() => handleStatus(item, "correct")}
          >
            <Text style={styles.btnText}>✅ True</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, isStatus("wrong_label") && styles.btnWarn]}
            onPress={() => handleStatus(item, "wrong_label")}
          >
            <Text style={styles.btnText}>❌ False</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, isGhost && styles.btnErr]}
            onPress={() => handleStatus(item, "ghost")}
          >
            <Text style={styles.btnText}>👻 Bad Box</Text>
          </TouchableOpacity>
        </View>

        {/* Ghost UI Feedback */}
        {isGhost && (
          <View style={styles.ghostBadge}>
            <Text style={styles.ghostBadgeText}>Box hidden from view</Text>
          </View>
        )}

        {/* Dynamic Category Selector (Appears only if marked as "False") */}
        {isStatus("wrong_label") && (
          <TouchableOpacity
            style={styles.selectorBtn}
            onPress={() => {
              setActiveDetectionId(item.id);
              setModalVisible(true);
            }}
          >
            <Text style={styles.selectorText}>
              {feedback.correctedLabel
                ? `Corrected to: ${feedback.correctedLabel.toUpperCase()}`
                : "👇 Select Correct Category..."}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // --------------------------------------------------------------------------
  // MAIN RENDER
  // --------------------------------------------------------------------------
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <Text style={styles.header}>Validate Results:</Text>
      <Text style={styles.subHeader}>
        Draw extra boxes on the image above, or review the detected ones below.
      </Text>

      {/* Detection Cards List */}
      <FlatList
        data={allItems}
        renderItem={renderItem}
        keyExtractor={(i) => i.id}
        scrollEnabled={false} // Handled by parent ScrollView
      />

      {/* Final Submit Button */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitBtnText}>Submit Feedback</Text>
      </TouchableOpacity>

      {/* Category Correction Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            {/* Inner feedback stops touches from closing the modal */}
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Correct Category</Text>
                <FlatList
                  data={WASTE_CLASSES}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => handleCategorySelect(item.id)}
                    >
                      <Text style={styles.modalItemText}>
                        {item.emoji} {item.label.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// ============================================================================
// STYLESHEET
// ============================================================================
const styles = StyleSheet.create({
  // Main container and headers
  container: { marginTop: 20, width: "100%" },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 4, color: "#333" },
  subHeader: { fontSize: 13, color: "#888", marginBottom: 12, fontStyle: "italic" },

  // Base card styling for model detections
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 2,
  },
  cardGhost: {
    backgroundColor: "#f5f5f5",
    opacity: 0.65,
    borderColor: "#ddd",
  },
  
  // Title and Confidence
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  titleGhost: { color: "#999" },
  conf: { color: "#888", fontWeight: "normal", fontSize: 14 },
  
  // Action Buttons row (True/False/Ghost)
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    flex: 1,
    marginHorizontal: 3,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  btnText: { fontSize: 12, fontWeight: "600" },
  btnSuccess: { backgroundColor: "#e8f5e9", borderColor: "#4caf50" },
  btnWarn: { backgroundColor: "#fffde7", borderColor: "#fbc02d" },
  btnErr: { backgroundColor: "#ffebee", borderColor: "#ef5350" },

  // Ghost indicator badge
  ghostBadge: {
    marginTop: 2,
    padding: 6,
    backgroundColor: "#eeeeee",
    borderRadius: 6,
    alignItems: "center",
  },
  ghostBadgeText: { color: "#999", fontSize: 12 },

  // User-drawn box specific styles
  userDrawnCard: {
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: "#2196F3",
  },
  userDrawnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  userDrawnLabel: { fontSize: 15, fontWeight: "bold", color: "#1565C0" },
  deleteBoxBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF5350",
    gap: 4,
  },
  deleteBoxBtnText: { color: "#C62828", fontSize: 12, fontWeight: "600" },
  userDrawnBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#BBDEFB",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  userDrawnBadgeText: { color: "#1565C0", fontSize: 12, fontWeight: "600" },

  // Correction Modal button (appears when False is selected)
  selectorBtn: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2196f3",
    alignItems: "center",
  },
  selectorText: { color: "#1565c0", fontWeight: "bold" },

  // Final Submit Button
  submitBtn: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
  },
  submitBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },

  // Category Correction Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
  modalItemText: { fontSize: 16, textAlign: "center", color: "#333" },
  closeBtn: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#ddd",
    borderRadius: 10,
    alignItems: "center",
  },
  closeBtnText: { fontWeight: "bold", color: "#555" },
});