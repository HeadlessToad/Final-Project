import React, { useEffect, useState } from 'react';
import {
    StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator
} from 'react-native';

// --- NOTICE THE CHANGE HERE ---
// We are pointing to the src folder now
import { db } from './src/firebaseConfig';
import { TestItem } from './src/types';
import {
    collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy
} from 'firebase/firestore';

export default function App() {
    const [items, setItems] = useState<TestItem[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // 1. READ: Real-time listener
    useEffect(() => {
        try {
            const q = query(collection(db, "test-items"), orderBy("timestamp", "desc"));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedItems: TestItem[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as TestItem));

                setItems(fetchedItems);
                setLoading(false);
            }, (error) => {
                // This catches permission/connection errors
                console.error(error);
                setErrorMsg("Connection Error: " + error.message);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (err: any) {
            setErrorMsg("Init Error: " + err.message);
            setLoading(false);
        }
    }, []);

    const handleAddItem = async () => {
        if (!newItemName.trim()) return;
        try {
            await addDoc(collection(db, "test-items"), {
                name: newItemName,
                status: 'active',
                timestamp: Date.now()
            });
            setNewItemName('');
        } catch (e: any) {
            alert("Error adding: " + e.message);
        }
    };

    const handleDeleteItem = async (id: string) => {
        try {
            await deleteDoc(doc(db, "test-items", id));
        } catch (e) {
            console.error(e);
        }
    };

    const renderItem = ({ item }: { item: TestItem }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.itemText}>{item.name}</Text>
            <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={styles.btnDelete}>
                <Text style={styles.btnText}>X</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Connection Test</Text>

            {/* ERROR DISPLAY */}
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type here..."
                    value={newItemName}
                    onChangeText={setNewItemName}
                />
                <TouchableOpacity onPress={handleAddItem} style={styles.btnAdd}>
                    <Text style={styles.btnText}>Add</Text>
                </TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator /> : (
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={i => i.id}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#f5f5f5' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    errorText: { color: 'red', marginBottom: 10, textAlign: 'center' },
    inputContainer: { flexDirection: 'row', marginBottom: 20 },
    input: { flex: 1, backgroundColor: 'white', padding: 15, borderRadius: 8, marginRight: 10 },
    btnAdd: { backgroundColor: '#2196F3', justifyContent: 'center', padding: 15, borderRadius: 8 },
    btnText: { color: 'white', fontWeight: 'bold' },
    itemContainer: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, justifyContent: 'space-between', alignItems: 'center' },
    itemText: { fontSize: 16 },
    btnDelete: { backgroundColor: '#ff4444', padding: 10, borderRadius: 5 }
});