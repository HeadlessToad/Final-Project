// screens/ClassificationResultScreen.tsx

import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    PanResponder,
    Modal,
    Platform,
} from 'react-native';
import { Svg, Rect, Text as SvgText } from 'react-native-svg';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, FeedbackData } from "../types";
import { Camera, ArrowLeft, Navigation } from 'lucide-react-native';
import PredictionFeedbackList from '../components/PredictionFeedbackList';
import LocationVerificationCard from '../components/LocationVerificationCard';
import { getAuth } from "firebase/auth";
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
    verifyLocationForRecycling,
    LocationVerificationResult,
    formatDistance,
} from '../services/locationVerificationService';

// Category colors / meta for SVG + class modal
const CATEGORY_META: Record<string, { color: string; emoji: string; label: string }> = {
    cardboard: { color: '#FF9800', emoji: '📦', label: 'Cardboard' },
    glass:     { color: '#2196F3', emoji: '🍾', label: 'Glass' },
    metal:     { color: '#9C27B0', emoji: '🥫', label: 'Metal' },
    paper:     { color: '#00BCD4', emoji: '📄', label: 'Paper' },
    plastic:   { color: '#4CAF50', emoji: '🧴', label: 'Plastic' },
    trash:     { color: '#607D8B', emoji: '🗑️', label: 'General' },
};
const getCategoryColor = (label: string) => CATEGORY_META[label]?.color ?? '#2196F3';
const WASTE_CATEGORIES = Object.entries(CATEGORY_META).map(([id, m]) => ({ id, ...m }));

const getCategoryPoints = (label: string) => {
    const l = label ? label.toUpperCase() : '';
    if (l.includes('GLASS'))       return 25;
    if (l.includes('METAL'))       return 20;
    if (l.includes('PLASTIC'))     return 15;
    if (l.includes('PAPER') || l.includes('CARDBOARD') || l.includes('BIO')) return 10;
    return 5;
};

interface UserDrawnBox {
    id: string;
    label: string;
    displayX: number;
    displayY: number;
    displayWidth: number;
    displayHeight: number;
    yolo: [number, number, number, number];
}

interface ActiveBox {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

interface ClassVerificationResult {
    className: string;
    verification: LocationVerificationResult;
    potentialPoints: number;
    pointsAwarded: number;
}

type ClassificationResultProps = NativeStackScreenProps<RootStackParamList, "ClassificationResult">;

export default function ClassificationResultScreen({ navigation, route }: ClassificationResultProps) {
    const { resultData, imageUri } = route.params;

    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [feedbackMap, setFeedbackMap] = useState<Record<string, FeedbackData>>({});
    // Single-class modal state
    const [locationVerification, setLocationVerification] = useState<LocationVerificationResult | null>(null);
    const [verifyingClass, setVerifyingClass] = useState('');
    // Multi-class modal state
    const [multiClassResults, setMultiClassResults] = useState<ClassVerificationResult[]>([]);
    const [isMultiClassModal, setIsMultiClassModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);

    // Drawing state
    const [userDrawnBoxes, setUserDrawnBoxes] = useState<UserDrawnBox[]>([]);
    const [currentBox, setCurrentBox] = useState<ActiveBox | null>(null);
    const [pendingBox, setPendingBox] = useState<ActiveBox | null>(null);
    const [classModalVisible, setClassModalVisible] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);

    // Image geometry
    const [containerLayout, setContainerLayout] = useState({ width: 1, height: 1 });
    const [imageNaturalSize, setImageNaturalSize] = useState({ width: 1, height: 1 });
    const containerRef = useRef<View>(null);
    const containerPageOffset = useRef({ x: 0, y: 0 });

    // ─── Image geometry ───────────────────────────────────────────────────────
    const getImageGeometry = () => {
        const { width: cW, height: cH } = containerLayout;
        const { width: imgW, height: imgH } = imageNaturalSize;
        const scale = Math.min(cW / imgW, cH / imgH);
        const renderedW = imgW * scale;
        const renderedH = imgH * scale;
        return { renderedW, renderedH, offsetX: (cW - renderedW) / 2, offsetY: (cH - renderedH) / 2 };
    };

    const normalizeBoxToYolo = (box: ActiveBox): [number, number, number, number] => {
        const { renderedW, renderedH, offsetX, offsetY } = getImageGeometry();
        const clamp = (v: number) => Math.max(0, Math.min(1, v));
        const x1 = clamp((Math.min(box.startX, box.endX) - offsetX) / renderedW);
        const y1 = clamp((Math.min(box.startY, box.endY) - offsetY) / renderedH);
        const x2 = clamp((Math.max(box.startX, box.endX) - offsetX) / renderedW);
        const y2 = clamp((Math.max(box.startY, box.endY) - offsetY) / renderedH);
        return [(x1 + x2) / 2, (y1 + y2) / 2, x2 - x1, y2 - y1];
    };

    const yoloToDisplay = (box: number[]) => {
        const { renderedW, renderedH, offsetX, offsetY } = getImageGeometry();
        const [xc, yc, bw, bh] = box;
        return {
            x: (xc - bw / 2) * renderedW + offsetX,
            y: (yc - bh / 2) * renderedH + offsetY,
            w: bw * renderedW,
            h: bh * renderedH,
        };
    };

    const handleContainerLayout = (event: any) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerLayout({ width, height });
        containerRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
            containerPageOffset.current = { x: pageX, y: pageY };
        });
    };

    const handleImageLoad = () => {
        containerRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
            containerPageOffset.current = { x: pageX, y: pageY };
        });
        Image.getSize(imageUri, (w, h) => setImageNaturalSize({ width: w, height: h }), () => {});
    };

    // ─── PanResponder ─────────────────────────────────────────────────────────
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                setIsDrawing(true);
                const lx = evt.nativeEvent.pageX - containerPageOffset.current.x;
                const ly = evt.nativeEvent.pageY - containerPageOffset.current.y;
                setCurrentBox({ startX: lx, startY: ly, endX: lx, endY: ly });
            },
            onPanResponderMove: (evt) => {
                const lx = evt.nativeEvent.pageX - containerPageOffset.current.x;
                const ly = evt.nativeEvent.pageY - containerPageOffset.current.y;
                setCurrentBox(prev => prev ? { ...prev, endX: lx, endY: ly } : null);
            },
            onPanResponderRelease: () => {
                setIsDrawing(false);
                setCurrentBox(prev => {
                    if (!prev) return null;
                    if (Math.abs(prev.endX - prev.startX) < 20 || Math.abs(prev.endY - prev.startY) < 20) return null;
                    setPendingBox(prev);
                    setClassModalVisible(true);
                    return null;
                });
            },
        })
    ).current;

    const assignClass = (label: string) => {
        if (!pendingBox) return;
        const newBox: UserDrawnBox = {
            id: `user_${Date.now()}`,
            label,
            displayX: Math.min(pendingBox.startX, pendingBox.endX),
            displayY: Math.min(pendingBox.startY, pendingBox.endY),
            displayWidth: Math.abs(pendingBox.endX - pendingBox.startX),
            displayHeight: Math.abs(pendingBox.endY - pendingBox.startY),
            yolo: normalizeBoxToYolo(pendingBox),
        };
        setUserDrawnBoxes(prev => [...prev, newBox]);
        setPendingBox(null);
        setClassModalVisible(false);
    };

    const deleteUserBox = (id: string) => {
        setUserDrawnBoxes(prev => prev.filter(b => b.id !== id));
    };

    // ─── SVG box style by feedback status ────────────────────────────────────
    const getBoxStyle = (detectionId: string) => {
        const status = feedbackMap[detectionId]?.status;
        if (status === 'ghost')       return { stroke: '#888', fillOpacity: 0.04, strokeOpacity: 0.25 };
        if (status === 'correct')     return { stroke: '#4CAF50', fillOpacity: 0.2, strokeOpacity: 1 };
        if (status === 'wrong_label') return { stroke: '#FF9800', fillOpacity: 0.2, strokeOpacity: 1 };
        return { stroke: '#2196F3', fillOpacity: 0.15, strokeOpacity: 1 };
    };

    // ─── Feedback submission ──────────────────────────────────────────────────
    const getEffectiveLabel = (item: FeedbackData): string | null => {
        if (item.status === 'ghost') return null;
        if (item.status === 'wrong_label') return item.correctedLabel || null;
        return item.originalLabel;
    };

    const handleFeedbackSubmit = async (feedbackItems: FeedbackData[]) => {
        if (feedbackItems.length === 0) {
            navigation.popToTop();
            return;
        }

        if (!resultData.image_id) {
            Alert.alert("Error", "No Image ID found. Cannot save feedback.");
            return;
        }

        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Error", "Not logged in.");
            return;
        }

        setIsSubmittingFeedback(true);
        const API_URL = "https://waste-classifier-eu-89824582784.europe-west1.run.app";

        try {
            // 1. Filter to valid items (non-ghost, with effective labels)
            type ValidItem = FeedbackData & { effectiveLabel: string };
            const validItems: ValidItem[] = feedbackItems
                .map(item => ({ ...item, effectiveLabel: getEffectiveLabel(item) }))
                .filter((item): item is ValidItem => item.effectiveLabel !== null);

            if (validItems.length === 0) {
                navigation.popToTop();
                return;
            }

            // 2. Unique classes present in the valid items
            const uniqueClasses = [...new Set(validItems.map(i => i.effectiveLabel))];

            // 3. Submit feedback to backend (once, unverified)
            const response = await fetch(`${API_URL}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_id: resultData.image_id,
                    feedback: feedbackItems,
                    user_id: user.uid,
                    location_verified: false,
                }),
            });
            let finalData = await response.json();
            if (!response.ok) throw new Error(finalData.error || "Failed to save feedback");

            // 4. Verify location for each unique class in parallel
            const verificationResults = await Promise.all(
                uniqueClasses.map(cls => verifyLocationForRecycling(cls))
            );

            // 5. If any class is verified, re-submit so backend awards points
            const anyVerified = verificationResults.some(v => v.isVerified);
            if (anyVerified) {
                const verifiedResponse = await fetch(`${API_URL}/feedback`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        image_id: resultData.image_id,
                        feedback: feedbackItems,
                        user_id: user.uid,
                        location_verified: true,
                    }),
                });
                if (verifiedResponse.ok) finalData = await verifiedResponse.json();
            }

            // 6. Save one Firestore history entry per unique class
            const classResults: ClassVerificationResult[] = [];
            for (let i = 0; i < uniqueClasses.length; i++) {
                const cls = uniqueClasses[i];
                const v = verificationResults[i];
                const pts = getCategoryPoints(cls);
                const awarded = v.isVerified ? pts : 0;
                try {
                    await addDoc(collection(db, "scans", user.uid, "results"), {
                        class_name: cls,
                        timestamp: serverTimestamp(),
                        points: awarded,
                        potential_points: pts,
                        location_verified: v.isVerified ?? false,
                        image_id: resultData.image_id,
                        nearest_center: v.nearestCenter ? {
                            id: v.nearestCenter.id,
                            name: v.nearestCenter.name,
                            latitude: v.nearestCenter.latitude,
                            longitude: v.nearestCenter.longitude,
                        } : null,
                        distance_meters: v.distanceMeters ?? null,
                    });
                } catch (firestoreError) {
                    console.error("Error saving scan to history:", firestoreError);
                }
                classResults.push({ className: cls, verification: v, potentialPoints: pts, pointsAwarded: awarded });
            }

            // 7. Show appropriate modal
            if (uniqueClasses.length === 1) {
                setVerifyingClass(uniqueClasses[0]);
                setLocationVerification(verificationResults[0]);
                setIsMultiClassModal(false);
            } else {
                setMultiClassResults(classResults);
                setIsMultiClassModal(true);
            }
            setShowLocationModal(true);

        } catch (error) {
            Alert.alert("Error", "Could not save feedback. Try again.");
            console.error(error);
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    // ─── Location modal handlers ──────────────────────────────────────────────
    const handleLocationModalOk = () => {
        setShowLocationModal(false);
        navigation.popToTop();
    };

    const handleTakeMeThere = () => {
        setShowLocationModal(false);
        if (locationVerification?.nearestCenter) {
            navigation.navigate('RecyclingCenters', {
                focusCenter: {
                    id: locationVerification.nearestCenter.id,
                    name: locationVerification.nearestCenter.name,
                    latitude: locationVerification.nearestCenter.latitude,
                    longitude: locationVerification.nearestCenter.longitude,
                },
            });
        }
    };

    const handleRetryVerification = async () => {
        if (!verifyingClass) return;
        const result = await verifyLocationForRecycling(verifyingClass);
        setLocationVerification(result);
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <View style={styles.fullContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.popToTop()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#1B5E20" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Analysis Result</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                scrollEnabled={!isDrawing}
            >
                {/* Image with SVG overlay + drawing */}
                <View
                    ref={containerRef}
                    style={styles.imageContainer}
                    onLayout={handleContainerLayout}
                >
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.resultImage}
                        resizeMode="contain"
                        onLoad={handleImageLoad}
                    />

                    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
                        {/* Model detection boxes */}
                        {(resultData.detections ?? []).map(det => {
                            if (!det.box_2d || det.box_2d.length < 4) return null;
                            const { x, y, w, h } = yoloToDisplay(det.box_2d);
                            const { stroke, fillOpacity, strokeOpacity } = getBoxStyle(det.id);
                            const meta = CATEGORY_META[det.label?.toLowerCase()] ?? { emoji: '♻️', label: det.label };
                            return (
                                <React.Fragment key={det.id}>
                                    <Rect
                                        x={x} y={y} width={w} height={h}
                                        stroke={stroke} strokeWidth={2.5}
                                        strokeOpacity={strokeOpacity}
                                        fill={stroke} fillOpacity={fillOpacity}
                                    />
                                    <SvgText x={x + 4} y={y + 14} fill={stroke} fillOpacity={strokeOpacity} fontSize={11} fontWeight="bold">
                                        {meta.emoji} {meta.label}
                                    </SvgText>
                                </React.Fragment>
                            );
                        })}

                        {/* User-drawn boxes */}
                        {userDrawnBoxes.map(box => {
                            const color = getCategoryColor(box.label);
                            const meta = CATEGORY_META[box.label] ?? { emoji: '✏️', label: box.label };
                            return (
                                <React.Fragment key={box.id}>
                                    <Rect
                                        x={box.displayX} y={box.displayY}
                                        width={box.displayWidth} height={box.displayHeight}
                                        stroke={color} strokeWidth={2.5}
                                        fill={color} fillOpacity={0.2}
                                    />
                                    <SvgText x={box.displayX + 4} y={box.displayY + 14} fill={color} fontSize={11} fontWeight="bold">
                                        {meta.emoji} {meta.label}
                                    </SvgText>
                                </React.Fragment>
                            );
                        })}

                        {/* Box being drawn */}
                        {currentBox && (() => {
                            const x = Math.min(currentBox.startX, currentBox.endX);
                            const y = Math.min(currentBox.startY, currentBox.endY);
                            return (
                                <Rect
                                    x={x} y={y}
                                    width={Math.abs(currentBox.endX - currentBox.startX)}
                                    height={Math.abs(currentBox.endY - currentBox.startY)}
                                    stroke="#2196F3" strokeWidth={2} strokeDasharray="6,4"
                                    fill="#2196F3" fillOpacity={0.1}
                                />
                            );
                        })()}
                    </Svg>

                    <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />

                    {userDrawnBoxes.length === 0 && (
                        <View style={styles.drawHint} pointerEvents="none">
                            <Text style={styles.drawHintText}>✏️ Drag to add a box</Text>
                        </View>
                    )}
                </View>

                {/* Feedback list */}
                <PredictionFeedbackList
                    detections={resultData.detections ?? []}
                    userDrawnDetections={userDrawnBoxes.map(b => ({
                        id: b.id,
                        label: b.label,
                        confidence: 1,
                        box_2d: [...b.yolo],
                    }))}
                    onFeedbackChange={setFeedbackMap}
                    onDeleteUserDrawnBox={deleteUserBox}
                    onSubmit={handleFeedbackSubmit}
                />

                {isSubmittingFeedback && (
                    <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 10 }} />
                )}

                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.outlineButton}
                        onPress={() => navigation.navigate('ScanScreen')}
                    >
                        <Camera size={20} color="#4CAF50" />
                        <Text style={styles.outlineButtonText}>Scan Again</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Class assignment modal */}
            <Modal
                visible={classModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => { setPendingBox(null); setClassModalVisible(false); }}
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
                                    <Text style={styles.categoryIcon}>{cat.emoji}</Text>
                                    <Text style={[styles.categoryLabel, { color: cat.color }]}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => { setPendingBox(null); setClassModalVisible(false); }}
                        >
                            <Text style={styles.cancelButtonText}>Cancel (discard box)</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Location verification result modal */}
            <Modal
                visible={showLocationModal}
                transparent
                animationType="fade"
                onRequestClose={handleLocationModalOk}
            >
                <View style={styles.locationModalOverlay}>
                    <View style={styles.locationModalContainer}>
                        {!isMultiClassModal ? (
                            // ── Single class ──────────────────────────────
                            <>
                                <Text style={styles.locationModalTitle}>Location Check</Text>
                                {locationVerification && (
                                    <LocationVerificationCard
                                        isLoading={false}
                                        isVerified={locationVerification.isVerified}
                                        nearestCenter={locationVerification.nearestCenter}
                                        distanceMeters={locationVerification.distanceMeters}
                                        errorMessage={locationVerification.errorMessage}
                                        hasMatchingCenters={locationVerification.hasMatchingCenters}
                                        onRetry={handleRetryVerification}
                                        onOk={handleLocationModalOk}
                                        onTakeMeThere={handleTakeMeThere}
                                    />
                                )}
                            </>
                        ) : (
                            // ── Multi class ───────────────────────────────
                            <>
                                <Text style={styles.locationModalTitle}>Multiple Items Found</Text>
                                <Text style={styles.locationModalSubtitle}>
                                    Recycling summary for this scan:
                                </Text>
                                {multiClassResults.map(result => {
                                    const meta = CATEGORY_META[result.className] ?? { emoji: '♻️', label: result.className };
                                    const verified = result.verification.isVerified;
                                    return (
                                        <View
                                            key={result.className}
                                            style={[styles.multiClassRow, verified ? styles.multiClassRowVerified : styles.multiClassRowUnverified]}
                                        >
                                            <Text style={styles.multiClassEmoji}>{meta.emoji}</Text>
                                            <View style={styles.multiClassInfo}>
                                                <Text style={styles.multiClassLabel}>{meta.label}</Text>
                                                {verified ? (
                                                    <Text style={styles.multiClassVerifiedText}>+{result.pointsAwarded} pts earned ✓</Text>
                                                ) : result.verification.nearestCenter ? (
                                                    <Text style={styles.multiClassUnverifiedText} numberOfLines={1}>
                                                        {result.verification.nearestCenter.name} · {formatDistance(result.verification.distanceMeters!)}
                                                    </Text>
                                                ) : (
                                                    <Text style={styles.multiClassUnverifiedText}>No centers nearby</Text>
                                                )}
                                            </View>
                                            {!verified && result.verification.nearestCenter && (
                                                <TouchableOpacity
                                                    style={styles.multiClassNavBtn}
                                                    onPress={() => {
                                                        setShowLocationModal(false);
                                                        navigation.navigate('RecyclingCenters', {
                                                            focusCenter: {
                                                                id: result.verification.nearestCenter!.id,
                                                                name: result.verification.nearestCenter!.name,
                                                                latitude: result.verification.nearestCenter!.latitude,
                                                                longitude: result.verification.nearestCenter!.longitude,
                                                            },
                                                        });
                                                    }}
                                                >
                                                    <Navigation size={16} color="#FFFFFF" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    );
                                })}
                                <TouchableOpacity style={styles.multiClassDoneBtn} onPress={handleLocationModalOk}>
                                    <Text style={styles.multiClassDoneBtnText}>Done</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: '#F9F9F9' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        backgroundColor: '#FFFFFF',
    },
    backButton: { paddingRight: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1B5E20' },

    content: { padding: 20, gap: 20, paddingBottom: 50 },

    imageContainer: {
        height: 300,
        backgroundColor: '#000',
        borderRadius: 15,
        overflow: 'hidden',
    },
    resultImage: { width: '100%', height: '100%' },

    drawHint: {
        position: 'absolute',
        bottom: 8,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.45)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    drawHintText: { color: '#fff', fontSize: 12 },

    actionsContainer: { marginTop: 10, paddingBottom: 20 },
    outlineButton: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#4CAF50',
        gap: 10,
    },
    outlineButtonText: { color: '#4CAF50', fontSize: 18, fontWeight: 'bold' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
    classModal: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    classModalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1B5E20', textAlign: 'center', marginBottom: 6 },
    classModalSubtitle: { fontSize: 13, color: '#616161', textAlign: 'center', marginBottom: 20 },
    categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
    categoryButton: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 2,
        backgroundColor: '#F9F9F9',
        gap: 10,
    },
    categoryIcon: { fontSize: 22 },
    categoryLabel: { fontSize: 14, fontWeight: '600' },
    cancelButton: { marginTop: 18, alignItems: 'center', paddingVertical: 10 },
    cancelButtonText: { color: '#E53935', fontSize: 14 },

    locationModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    locationModalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
    },
    locationModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1B5E20',
        marginBottom: 4,
    },
    locationModalSubtitle: {
        fontSize: 13,
        color: '#616161',
        marginBottom: 12,
    },

    // Multi-class rows
    multiClassRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
        gap: 10,
    },
    multiClassRowVerified: { backgroundColor: '#E8F5E9' },
    multiClassRowUnverified: { backgroundColor: '#FFF3E0' },
    multiClassEmoji: { fontSize: 24 },
    multiClassInfo: { flex: 1 },
    multiClassLabel: { fontSize: 15, fontWeight: '700', color: '#1B5E20' },
    multiClassVerifiedText: { fontSize: 12, color: '#4CAF50', fontWeight: '600', marginTop: 2 },
    multiClassUnverifiedText: { fontSize: 12, color: '#FF9800', marginTop: 2 },
    multiClassNavBtn: {
        backgroundColor: '#4CAF50',
        padding: 8,
        borderRadius: 8,
    },
    multiClassDoneBtn: {
        backgroundColor: '#4CAF50',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 8,
    },
    multiClassDoneBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});
