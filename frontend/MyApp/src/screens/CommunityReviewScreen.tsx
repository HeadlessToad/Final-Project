// screens/CommunityReviewScreen.tsx
// ============================================================================
// COMPONENT PURPOSE:
// This is the Community Review Screen. Here, users can help train the ML model
// by looking at "pending" (unlabeled) images, drawing bounding boxes around 
// waste items, and assigning categories. This generates fresh YOLO training data.
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  PanResponder,
  Platform,
} from 'react-native';
import { Svg, Rect, Text as SvgText } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { ArrowLeft, CheckCircle, SkipForward, HelpCircle, Trash2, Info } from 'lucide-react-native';
import { getAuth } from 'firebase/auth';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { usePrefetch } from '../context/PrefetchContext';

// Centralized color palette
const COLORS = {
  primary: '#4CAF50',
  secondary: '#8BC34A',
  background: '#F9F9F9',
  white: '#FFFFFF',
  text: '#1B5E20',
  onSurfaceVariant: '#616161',
};

// Waste categories matching the Python model's expected class names.
// Used for displaying the selection modal and coloring the drawn boxes.
const WASTE_CATEGORIES = [
  { id: 'cardboard', label: 'Cardboard', icon: '📦', color: '#FF9800' },
  { id: 'glass',     label: 'Glass',     icon: '🍾', color: '#2196F3' },
  { id: 'metal',     label: 'Metal',     icon: '🥫', color: '#9C27B0' },
  { id: 'paper',     label: 'Paper',     icon: '📄', color: '#00BCD4' },
  { id: 'plastic',   label: 'Plastic',   icon: '🧴', color: '#4CAF50' },
  { id: 'trash',     label: 'General',   icon: '🗑️', color: '#607D8B' },
];

// Helper function to map a category ID to its designated HEX color
const getCategoryColor = (label: string) =>
  WASTE_CATEGORIES.find(c => c.id === label)?.color ?? '#888';

// Key used to store the timestamp of when the user last dismissed the tutorial
const TUTORIAL_STORAGE_KEY = 'communityReview_tutorialDismissedAt';

// ----------------------------------------------------------------------------
// INTERFACES
// ----------------------------------------------------------------------------
interface PendingImage {
  image_id: string;
  image_url: string;
  created_at: string | null;
}

// Represents a finalized bounding box drawn by the user
interface DrawnBox {
  id: string;
  label: string;
  displayX: number;
  displayY: number;
  displayWidth: number;
  displayHeight: number;
  yolo: [number, number, number, number]; // [x_center, y_center, w, h] normalized 0-1
}

// Represents the temporary state of a box while the user is dragging their finger
interface ActiveBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

type CommunityReviewProps = NativeStackScreenProps<RootStackParamList, "CommunityReview">;

export default function CommunityReviewScreen({ navigation }: CommunityReviewProps) {
  const { profile } = useAuth();
  const {
    pendingImages: prefetchedImages,
    pendingImagesLoading: prefetchLoading,
    refreshPendingImages,
  } = usePrefetch();
  // Prevents double-initialisation if this effect fires more than once
  const initializedRef = useRef(false);

  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Tracks which image in the array we are viewing
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0); // Counter for Gamification/Praise

  // Drawing state
  const [drawnBoxes, setDrawnBoxes] = useState<DrawnBox[]>([]);
  const [currentBox, setCurrentBox] = useState<ActiveBox | null>(null);
  const [pendingBox, setPendingBox] = useState<ActiveBox | null>(null);
  const [classModalVisible, setClassModalVisible] = useState(false);

  // Tutorial State
  const [tutorialVisible, setTutorialVisible] = useState(false);

  // Image + container geometry (Required for calculating where the SVG boxes should be placed relative to the physical image)
  const [containerLayout, setContainerLayout] = useState({ width: 1, height: 1 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 1, height: 1 });
  const containerRef = useRef<View>(null);
  
  // pageX/Y of the container so we can translate global touch coords to local SVG coords
  const containerPageOffset = useRef({ x: 0, y: 0 });

  const API_URL = "https://waste-classifier-eu-89824582784.europe-west1.run.app";

  // ─── Tutorial logic ───────────────────────────────────────────────────────
  // Checks if we should show the intro tutorial based on AsyncStorage
  useEffect(() => {
    checkTutorial();
  }, [profile]);

  const checkTutorial = async () => {
    try {
      const dismissedAt = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
      const loginTs = profile?.lastLoginTimestamp ?? 0;
      // Show tutorial if it was never dismissed, or if it was dismissed in a previous login session
      if (!dismissedAt || Number(dismissedAt) < loginTs) {
        setTutorialVisible(true);
      }
    } catch {
      setTutorialVisible(true); // Fail-safe: show tutorial if storage read fails
    }
  };

  const dismissTutorial = async () => {
    try {
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, String(Date.now()));
    } catch {}
    setTutorialVisible(false);
  };

  // ─── Data fetching ────────────────────────────────────────────────────────
  // Use pre-fetched images from PrefetchContext when available.
  // If the prefetch is still in flight, wait for it (don't start a parallel fetch).
  // Only fall back to a direct fetch if the prefetch already finished and returned nothing.
  useEffect(() => {
    if (initializedRef.current) return;

    if (prefetchedImages !== null) {
      // Prefetch completed — use the cached images immediately
      initializedRef.current = true;
      setPendingImages(prefetchedImages);
      setLoading(false);
      // Reset the context cache so the next visit gets fresh images
      refreshPendingImages();
    } else if (!prefetchLoading) {
      // Prefetch already finished but returned nothing (failed) — fetch directly
      initializedRef.current = true;
      fetchPendingImages();
    }
    // If prefetchLoading is true, this effect re-runs when the context updates
  }, [prefetchedImages, prefetchLoading]);

  const fetchPendingImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/pending-images`);
      const data = await response.json();
      if (data.success && data.pending_images) {
        setPendingImages(data.pending_images);
      } else {
        setPendingImages([]);
      }
    } catch (error) {
      console.error("Error fetching pending images:", error);
      Alert.alert("Error", "Could not load images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Container layout & image size ───────────────────────────────────────
  
  // Captures the physical size of the View container holding the image
  const handleContainerLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerLayout({ width, height });

    // Record the container's absolute position on the screen for accurate touch translation
    containerRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
      containerPageOffset.current = { x: pageX, y: pageY };
    });
  };

  // Re-measure when the image actually loads to ensure we have the correct aspect ratio
  const handleImageLoad = () => {
    containerRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
      containerPageOffset.current = { x: pageX, y: pageY };
    });
    const currentImage = pendingImages[currentIndex];
    if (currentImage) {
      Image.getSize(currentImage.image_url, (w, h) => {
        setImageNaturalSize({ width: w, height: h });
      }, () => {});
    }
  };

  // ─── Coordinate math ─────────────────────────────────────────────────────
  
  // Calculates how the image is actually rendered inside the container (considering resizeMode="contain")
  const getImageGeometry = () => {
    const { width: cW, height: cH } = containerLayout;
    const { width: imgW, height: imgH } = imageNaturalSize;
    const scale = Math.min(cW / imgW, cH / imgH);
    const renderedW = imgW * scale;
    const renderedH = imgH * scale;
    const offsetX = (cW - renderedW) / 2;
    const offsetY = (cH - renderedH) / 2;
    return { scale, renderedW, renderedH, offsetX, offsetY };
  };

  // Translates physical pixel dimensions (from the user's touch) into YOLO format.
  // YOLO format is normalized (0.0 to 1.0) relative to the image's true size.
  const normalizeBoxToYolo = (box: ActiveBox): [number, number, number, number] => {
    const { renderedW, renderedH, offsetX, offsetY } = getImageGeometry();

    const clamp = (v: number) => Math.max(0, Math.min(1, v));

    const x1 = clamp((Math.min(box.startX, box.endX) - offsetX) / renderedW);
    const y1 = clamp((Math.min(box.startY, box.endY) - offsetY) / renderedH);
    const x2 = clamp((Math.max(box.startX, box.endX) - offsetX) / renderedW);
    const y2 = clamp((Math.max(box.startY, box.endY) - offsetY) / renderedH);

    return [
      (x1 + x2) / 2,    // x_center
      (y1 + y2) / 2,    // y_center
      x2 - x1,          // width
      y2 - y1,          // height
    ];
  };

  // ─── PanResponder (Drawing gesture handler) ───────────────────────────────
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      // User presses down -> Start drawing a new box
      onPanResponderGrant: (evt) => {
        const lx = evt.nativeEvent.pageX - containerPageOffset.current.x;
        const ly = evt.nativeEvent.pageY - containerPageOffset.current.y;
        setCurrentBox({ startX: lx, startY: ly, endX: lx, endY: ly });
      },

      // User drags finger -> Resize the box dynamically
      onPanResponderMove: (evt) => {
        const lx = evt.nativeEvent.pageX - containerPageOffset.current.x;
        const ly = evt.nativeEvent.pageY - containerPageOffset.current.y;
        setCurrentBox(prev => prev ? { ...prev, endX: lx, endY: ly } : null);
      },

      // User releases finger -> Finalize box and open Category selection modal
      onPanResponderRelease: () => {
        setCurrentBox(prev => {
          if (!prev) return null;
          const w = Math.abs(prev.endX - prev.startX);
          const h = Math.abs(prev.endY - prev.startY);
          if (w < 20 || h < 20) {
            // Box too small — treat as an accidental tap and discard it
            return null;
          }
          // Finalize — show class modal
          setPendingBox(prev);
          setClassModalVisible(true);
          return null;
        });
      },
    })
  ).current;

  // ─── Class assignment ─────────────────────────────────────────────────────
  
  // Creates the final DrawnBox object after the user selects a category
  const assignClass = (label: string) => {
    if (!pendingBox) return;

    const yolo = normalizeBoxToYolo(pendingBox);
    const { width: cW, height: cH } = containerLayout;

    const displayX = Math.min(pendingBox.startX, pendingBox.endX);
    const displayY = Math.min(pendingBox.startY, pendingBox.endY);
    const displayWidth = Math.abs(pendingBox.endX - pendingBox.startX);
    const displayHeight = Math.abs(pendingBox.endY - pendingBox.startY);

    const newBox: DrawnBox = {
      id: String(Date.now()),
      label,
      displayX,
      displayY,
      displayWidth,
      displayHeight,
      yolo,
    };

    setDrawnBoxes(prev => [...prev, newBox]);
    setPendingBox(null);
    setClassModalVisible(false);
  };

  const cancelClassAssignment = () => {
    setPendingBox(null);
    setClassModalVisible(false);
  };

  const deleteBox = (id: string) => {
    setDrawnBoxes(prev => prev.filter(b => b.id !== id));
  };

  const clearAllBoxes = () => {
    setDrawnBoxes([]);
  };

  // ─── Submission ───────────────────────────────────────────────────────────
  
  // Send the user-drawn boxes to the Flask backend to be saved as YOLO annotations
  const handleSubmit = async () => {
    if (drawnBoxes.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No boxes drawn',
        text2: 'Draw at least one bounding box before submitting.',
      });
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    const currentImage = pendingImages[currentIndex];
    if (!currentImage) return;

    setSubmitting(true);

    const boxes = drawnBoxes.map(b => ({
      label: b.label,
      box: b.yolo,
    }));

    try {
      const response = await fetch(`${API_URL}/community-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_id: currentImage.image_id,
          boxes,
          user_id: user?.uid || 'anonymous',
        }),
      });

      const data = await response.json();

      if (data.success) {
        Toast.show({
          type: 'success',
          text1: 'Thank you!',
          text2: `Saved ${boxes.length} annotation${boxes.length > 1 ? 's' : ''}.`,
        });
        setReviewedCount(prev => prev + 1);
        moveToNextImage();
      } else {
        throw new Error(data.error || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert("Error", "Could not submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Advances the carousel to the next pending image
  const moveToNextImage = () => {
    setDrawnBoxes([]);
    setImageNaturalSize({ width: 1, height: 1 });
    if (currentIndex < pendingImages.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      Alert.alert(
        "Great Job!",
        `You labeled ${reviewedCount + 1} image${reviewedCount + 1 > 1 ? 's' : ''}. Thank you for helping!`,
        [{ text: "Done", onPress: () => navigation.goBack() }]
      );
    }
  };

  // Skips the current image without annotating it
  const handleSkip = () => {
    setDrawnBoxes([]);
    setImageNaturalSize({ width: 1, height: 1 });
    if (currentIndex < pendingImages.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      Alert.alert(
        "No More Images",
        "You've gone through all available images.",
        [{ text: "Done", onPress: () => navigation.goBack() }]
      );
    }
  };

  // Triggered when user marks an image as duplicate or useless
  const handleDeleteDuplicate = () => {
    Alert.alert(
      'Remove duplicate?',
      'This image looks like a duplicate and will be permanently deleted from the review queue.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, delete', style: 'destructive', onPress: deletePendingImage },
      ]
    );
  };

  // Calls the backend to permanently delete the image from the pending queue bucket
  const deletePendingImage = async () => {
    const currentImage = pendingImages[currentIndex];
    if (!currentImage) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/pending-images/${currentImage.image_id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        Toast.show({
          type: 'info',
          text1: 'Removed',
          text2: 'Duplicate image deleted from queue.',
        });
        const newList = pendingImages.filter((_, i) => i !== currentIndex);
        setPendingImages(newList);
        setDrawnBoxes([]);
        setImageNaturalSize({ width: 1, height: 1 });
        
        // Adjust the index so we don't go out of bounds
        const nextIndex = Math.min(currentIndex, newList.length - 1);
        setCurrentIndex(nextIndex < 0 ? 0 : nextIndex);
        
        if (newList.length === 0) {
          Alert.alert('All Done!', 'No more images to review.', [
            { text: 'Done', onPress: () => navigation.goBack() },
          ]);
        }
      } else {
        Alert.alert('Error', data.error || 'Could not delete image.');
      }
    } catch {
      Alert.alert('Error', 'Could not delete image. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentImage = pendingImages[currentIndex];

  // ─── Render helpers ───────────────────────────────────────────────────────
  
  // Renders the temporary dotted blue box while the user's finger is dragging
  const renderActiveSvgBox = () => {
    if (!currentBox) return null;
    const x = Math.min(currentBox.startX, currentBox.endX);
    const y = Math.min(currentBox.startY, currentBox.endY);
    const w = Math.abs(currentBox.endX - currentBox.startX);
    const h = Math.abs(currentBox.endY - currentBox.startY);
    return (
      <Rect
        x={x} y={y} width={w} height={h}
        stroke="#2196F3" strokeWidth={2} strokeDasharray="6,4"
        fill="#2196F3" fillOpacity={0.1}
      />
    );
  };

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Us Improve</Text>
        <TouchableOpacity onPress={() => setTutorialVisible(true)} style={styles.infoButton}>
          <Info size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Conditional Rendering Based on State */}
      {loading ? (
        // STATE: Loading from API
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading images...</Text>
        </View>
      ) : pendingImages.length === 0 ? (
        // STATE: No images left in the queue
        <View style={styles.emptyContainer}>
          <HelpCircle size={60} color={COLORS.onSurfaceVariant} />
          <Text style={styles.emptyTitle}>No Images to Review</Text>
          <Text style={styles.emptyText}>All pending images have been reviewed. Check back later!</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchPendingImages}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // STATE: Images available for review
        <>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Image {currentIndex + 1} of {pendingImages.length}</Text>
            <Text style={styles.reviewedText}>Reviewed: {reviewedCount}</Text>
          </View>

          {/* Drawing Canvas Area */}
          <View
            ref={containerRef}
            style={styles.imageContainer}
            onLayout={handleContainerLayout}
          >
            {currentImage && (
              <Image
                source={{ uri: currentImage.image_url }}
                style={styles.image}
                resizeMode="contain"
                onLoad={handleImageLoad}
              />
            )}
            
            {/* SVG layer — renders finalized boxes on top of the image */}
            <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
              {drawnBoxes.map(box => {
                const color = getCategoryColor(box.label);
                const cat = WASTE_CATEGORIES.find(c => c.id === box.label);
                return (
                  <React.Fragment key={box.id}>
                    <Rect
                      x={box.displayX} y={box.displayY}
                      width={box.displayWidth} height={box.displayHeight}
                      stroke={color} strokeWidth={2.5}
                      fill={color} fillOpacity={0.15}
                    />
                    <SvgText
                      x={box.displayX + 4}
                      y={box.displayY + 14}
                      fill={color}
                      fontSize={11}
                      fontWeight="bold"
                    >
                      {cat?.icon} {cat?.label}
                    </SvgText>
                  </React.Fragment>
                );
              })}
              {/* Active dotted box being drawn */}
              {renderActiveSvgBox()}
            </Svg>
            {/* Transparent touch layer to capture PanResponder gestures */}
            <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />
          </View>

          {/* Scrollable bottom section containing instructions and controls */}
          <ScrollView
            style={styles.bottomSection}
            contentContainerStyle={styles.bottomContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Hint */}
            <Text style={styles.hintText}>
              Press &amp; drag to draw a box around each object, then assign a category.
            </Text>

            {/* List of currently drawn boxes (allowing the user to delete mistakes) */}
            {drawnBoxes.length > 0 && (
              <View style={styles.boxListContainer}>
                <View style={styles.boxListHeader}>
                  <Text style={styles.boxListTitle}>Drawn boxes ({drawnBoxes.length})</Text>
                  <TouchableOpacity onPress={clearAllBoxes}>
                    <Text style={styles.clearAllText}>Clear all</Text>
                  </TouchableOpacity>
                </View>
                {drawnBoxes.map((box, i) => {
                  const color = getCategoryColor(box.label);
                  const cat = WASTE_CATEGORIES.find(c => c.id === box.label);
                  return (
                    <View key={box.id} style={[styles.boxChip, { borderColor: color }]}>
                      <View style={[styles.boxChipDot, { backgroundColor: color }]} />
                      <Text style={styles.boxChipText}>
                        {i + 1}. {cat?.icon} {cat?.label}
                      </Text>
                      <TouchableOpacity onPress={() => deleteBox(box.id)} style={styles.deleteBoxBtn}>
                        <Trash2 size={15} color="#999" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Core Action buttons: Skip, Duplicate, Submit */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                disabled={submitting}
              >
                <SkipForward size={20} color={COLORS.onSurfaceVariant} />
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.duplicateButton}
                onPress={handleDeleteDuplicate}
                disabled={submitting}
              >
                <Trash2 size={18} color="#E53935" />
                <Text style={styles.duplicateButtonText}>Duplicate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, drawnBoxes.length === 0 && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={drawnBoxes.length === 0 || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <CheckCircle size={20} color={COLORS.white} />
                    <Text style={styles.submitButtonText}>Submit</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </>
      )}

      {/* ─── Class Assignment Modal ─────────────────────────────────────── */}
      {/* Pops up automatically when the user finishes drawing a box */}
      <Modal
        visible={classModalVisible}
        transparent
        animationType="slide"
        onRequestClose={cancelClassAssignment}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.classModal}>
            <Text style={styles.classModalTitle}>What is in the box?</Text>
            <Text style={styles.classModalSubtitle}>Select the type of waste you drew around</Text>
            <View style={styles.categoriesGrid}>
              {WASTE_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryButton, { borderColor: cat.color }]}
                  onPress={() => assignClass(cat.id)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[styles.categoryLabel, { color: cat.color }]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.cancelButton} onPress={cancelClassAssignment}>
              <Text style={styles.cancelButtonText}>Cancel (discard box)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Tutorial Modal ─────────────────────────────────────────────── */}
      {/* Shown to first-time users or via the info button in the header */}
      <Modal
        visible={tutorialVisible}
        transparent
        animationType="fade"
        onRequestClose={dismissTutorial}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tutorialModal}>
            <Text style={styles.tutorialTitle}>How to Label Images</Text>
            <Text style={styles.tutorialSubtitle}>
              Your annotations train our recycling AI — thank you!
            </Text>

            {[
              { icon: '✏️', step: '1. Draw a box', desc: 'Press and drag on the image to draw a rectangle around a single waste item.' },
              { icon: '🏷️', step: '2. Assign a category', desc: 'After releasing, pick the waste type (Plastic, Glass, etc.) for that box.' },
              { icon: '📦', step: '3. Repeat & submit', desc: 'Draw boxes for every visible item. Then tap Submit when you\'re done.' },
            ].map(({ icon, step, desc }) => (
              <View key={step} style={styles.tutorialStep}>
                <Text style={styles.tutorialStepIcon}>{icon}</Text>
                <View style={styles.tutorialStepText}>
                  <Text style={styles.tutorialStepTitle}>{step}</Text>
                  <Text style={styles.tutorialStepDesc}>{desc}</Text>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.tutorialDismiss} onPress={dismissTutorial}>
              <Text style={styles.tutorialDismissText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================================
// STYLESHEET
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Custom Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
  },
  infoButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
  },
  
  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: COLORS.onSurfaceVariant,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 10,
  },
  refreshButton: {
    marginTop: 30,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Progress Indicator (Top of the screen)
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  progressText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
  },
  reviewedText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  // Drawing canvas (Fixed height to prevent flex issues)
  imageContainer: {
    height: 260,
    backgroundColor: '#111',
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  
  // Bottom Scrollable Section (Contains instructions and buttons)
  bottomSection: {
    flex: 1,
    marginTop: 6,
  },
  bottomContent: {
    padding: 16,
    paddingBottom: 40,
  },
  hintText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 14,
    fontStyle: 'italic',
  },
  
  // List of Drawn Boxes (Chips)
  boxListContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 1,
  },
  boxListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  boxListTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
    fontSize: 14,
  },
  clearAllText: {
    color: '#E53935',
    fontSize: 13,
  },
  boxChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 6,
  },
  boxChipDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  boxChipText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  deleteBoxBtn: {
    padding: 4,
  },
  
  // Control Buttons (Skip, Duplicate, Submit)
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  skipButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.onSurfaceVariant,
    gap: 8,
  },
  skipButtonText: {
    color: COLORS.onSurfaceVariant,
    fontWeight: 'bold',
    fontSize: 16,
  },
  duplicateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E53935',
    gap: 6,
  },
  duplicateButtonText: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 13,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#A5D6A7', // Faded green when disabled
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // ─── Modals ───────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  
  // Class Assignment Modal UI
  classModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  classModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  classModalSubtitle: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  categoryButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: COLORS.background,
    gap: 10,
  },
  categoryIcon: {
    fontSize: 22,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 18,
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#E53935',
    fontSize: 14,
  },
  
  // Tutorial Modal UI
  tutorialModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  tutorialTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  tutorialSubtitle: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 22,
  },
  tutorialStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
    gap: 12,
  },
  tutorialStepIcon: {
    fontSize: 26,
    marginTop: 2,
  },
  tutorialStepText: {
    flex: 1,
  },
  tutorialStepTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 3,
  },
  tutorialStepDesc: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    lineHeight: 19,
  },
  tutorialDismiss: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tutorialDismissText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});