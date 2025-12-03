// src/App.tsx
// This is a backup code for the App.tsx file demonstrating
// CRUD operations with Firebase Firestore in a React Native app.
import React, { useEffect, useState, } from 'react';
import {
    StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator
} from 'react-native';
import { db } from './firebaseConfig';
import {
    collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy
} from 'firebase/firestore';
import { TestItem } from './types';

export default function App() {
    const [items, setItems] = useState<TestItem[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [loading, setLoading] = useState(true);

    // 1. READ: Real-time listener
    useEffect(() => {
        // We order by timestamp so the list doesn't jump around randomly
        const q = query(collection(db, "test-items"), orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedItems: TestItem[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as TestItem));

            setItems(fetchedItems);
            setLoading(false);
        });

        return () => unsubscribe(); // Cleanup listener to prevent memory leaks
    }, []);

    // 2. CREATE: Add item to DB
    const handleAddItem = async () => {
        if (!newItemName.trim()) return;
        try {
            await addDoc(collection(db, "test-items"), {
                name: newItemName,
                status: 'active',
                timestamp: Date.now()
            });
            setNewItemName('');
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    // 3. UPDATE: Modify an item
    const handleUpdateItem = async (id: string) => {
        const itemRef = doc(db, "test-items", id);
        try {
            // Simulating a state change (e.g., verifying ML model received it)
            await updateDoc(itemRef, {
                status: 'processed'
            });
        } catch (e) {
            console.error("Error updating document: ", e);
        }
    };

    // 4. DELETE: Remove item
    const handleDeleteItem = async (id: string) => {
        const itemRef = doc(db, "test-items", id);
        try {
            await deleteDoc(itemRef);
        } catch (e) {
            console.error("Error deleting document: ", e);
        }
    };

    const renderItem = ({ item }: { item: TestItem }) => (
        <View style={styles.itemContainer}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemText}>{item.name}</Text>
                <Text style={[
                    styles.statusText,
                    { color: item.status === 'processed' ? 'green' : 'orange' }
                ]}>
                    {item.status.toUpperCase()}
                </Text>
            </View>
            <View style={styles.buttons}>
                <TouchableOpacity onPress={() => handleUpdateItem(item.id)} style={styles.btnUpdate}>
                    <Text style={styles.btnText}>Process</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={styles.btnDelete}>
                    <Text style={styles.btnText}>X</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Server Connection Test</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter data payload..."
                    value={newItemName}
                    onChangeText={setNewItemName}
                />
                <TouchableOpacity onPress={handleAddItem} style={styles.btnAdd}>
                    <Text style={styles.btnText}>Send</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    style={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#f5f5f5' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    inputContainer: { flexDirection: 'row', marginBottom: 20 },
    input: { flex: 1, backgroundColor: 'white', padding: 15, borderRadius: 8, marginRight: 10 },
    btnAdd: { backgroundColor: '#2196F3', justifyContent: 'center', padding: 15, borderRadius: 8 },
    btnText: { color: 'white', fontWeight: 'bold' },
    list: { flex: 1 },
    itemContainer: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, alignItems: 'center', justifyContent: 'space-between' },
    itemInfo: { flexDirection: 'column' },
    itemText: { fontSize: 16, fontWeight: 'bold' },
    statusText: { fontSize: 12, marginTop: 4 },
    buttons: { flexDirection: 'row' },
    btnUpdate: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, marginRight: 5 },
    btnDelete: { backgroundColor: '#F44336', padding: 10, borderRadius: 5 },
});