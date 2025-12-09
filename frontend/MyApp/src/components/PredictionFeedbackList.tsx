import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Modal,
    TouchableWithoutFeedback
} from 'react-native';

// --- 1. DEFINE YOUR CLASSES HERE ---
// These should match the keys in your backend class_map.json
const WASTE_CLASSES = [
    "BIODEGRADABLE",
    "CARDBOARD",
    "GLASS",
    "METAL",
    "PAPER",
    "PLASTIC"
];

export interface DetectionItem {
    id: string;
    label: string;
    confidence: number;
    box_2d?: number[];
}
export interface FeedbackData {
    detectionId: string;
    originalLabel: string;
    status: 'correct' | 'wrong_label' | 'ghost';
    correctedLabel?: string;
    box_2d?: number[];
}

interface Props {
    detections: DetectionItem[];
    onSubmit: (feedback: FeedbackData[]) => void;
}
export default function PredictionFeedbackList({ detections, onSubmit }: Props) {
    const [feedbackMap, setFeedbackMap] = useState<Record<string, FeedbackData>>({});

    // State for the Category Picker Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [activeDetectionId, setActiveDetectionId] = useState<string | null>(null);

    const handleStatus = (item: DetectionItem, status: FeedbackData['status']) => {
        // If they click FALSE, we automatically open the picker
        if (status === 'wrong_label') {
            setActiveDetectionId(item.id);
            setModalVisible(true);
        }

        setFeedbackMap(prev => ({
            ...prev,
            [item.id]: {
                detectionId: item.id,
                originalLabel: item.label,
                status: status,
                // Preserve existing correction if they are just toggling back to wrong_label
                correctedLabel: status === 'wrong_label' ? prev[item.id]?.correctedLabel : undefined,
                box_2d: item.box_2d
            }
        }));
    };

    const handleCategorySelect = (category: string) => {
        if (activeDetectionId) {
            setFeedbackMap(prev => ({
                ...prev,
                [activeDetectionId]: {
                    ...prev[activeDetectionId],
                    correctedLabel: category
                }
            }));
        }
        setModalVisible(false);
        setActiveDetectionId(null);
    };

    const renderItem = ({ item }: { item: DetectionItem }) => {
        const feedback = feedbackMap[item.id] || {};
        const isStatus = (s: string) => feedback.status === s;

        return (
            <View style={styles.card}>
                <Text style={styles.title}>
                    📦 {item.label.toUpperCase()} <Text style={styles.conf}>{(item.confidence * 100).toFixed(0)}%</Text>
                </Text>

                <View style={styles.row}>
                    <TouchableOpacity
                        style={[styles.btn, isStatus('correct') && styles.btnSuccess]}
                        onPress={() => handleStatus(item, 'correct')}
                    >
                        <Text style={styles.btnText}>✅ True</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btn, isStatus('wrong_label') && styles.btnWarn]}
                        onPress={() => handleStatus(item, 'wrong_label')}
                    >
                        <Text style={styles.btnText}>❌ False</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btn, isStatus('ghost') && styles.btnErr]}
                        onPress={() => handleStatus(item, 'ghost')}
                    >
                        <Text style={styles.btnText}>🚫 Bad Box</Text>
                    </TouchableOpacity>
                </View>

                {/* Show Selected Category or "Select" Button if False is picked */}
                {isStatus('wrong_label') && (
                    <TouchableOpacity
                        style={styles.selectorBtn}
                        onPress={() => {
                            setActiveDetectionId(item.id);
                            setModalVisible(true);
                        }}
                    >
                        <Text style={styles.selectorText}>
                            {feedback.correctedLabel
                                ? `Corrected to: ${feedback.correctedLabel}`
                                : "👇 Select Correct Category..."}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Validate Results:</Text>

            <FlatList
                data={detections}
                renderItem={renderItem}
                keyExtractor={i => i.id}
                scrollEnabled={false}
            />

            <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => onSubmit(Object.values(feedbackMap))}
            >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Submit Feedback</Text>
            </TouchableOpacity>

            {/* --- MODAL FOR CATEGORY SELECTION --- */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select Correct Category</Text>
                            <FlatList
                                data={WASTE_CLASSES}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => handleCategorySelect(item)}
                                    >
                                        <Text style={styles.modalItemText}>{item}</Text>
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
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 20, width: '100%' },
    header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#eee', elevation: 2 },
    title: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
    conf: { color: '#888', fontWeight: 'normal', fontSize: 14 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    btn: { paddingVertical: 10, paddingHorizontal: 5, borderRadius: 8, backgroundColor: '#f5f5f5', flex: 1, marginHorizontal: 3, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
    btnText: { fontSize: 12, fontWeight: '600' },

    // Status Colors
    btnSuccess: { backgroundColor: '#e8f5e9', borderColor: '#4caf50' },
    btnWarn: { backgroundColor: '#fffde7', borderColor: '#fbc02d' },
    btnErr: { backgroundColor: '#ffebee', borderColor: '#ef5350' },

    // Selector Button
    selectorBtn: { marginTop: 10, padding: 12, backgroundColor: '#e3f2fd', borderRadius: 8, borderWidth: 1, borderColor: '#2196f3', alignItems: 'center' },
    selectorText: { color: '#1565c0', fontWeight: 'bold' },

    submitBtn: { backgroundColor: '#2196F3', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, elevation: 3 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '60%' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalItemText: { fontSize: 16, textAlign: 'center', color: '#333' },
    closeBtn: { marginTop: 20, padding: 15, backgroundColor: '#ddd', borderRadius: 10, alignItems: 'center' },
    closeBtnText: { fontWeight: 'bold', color: '#555' }
});