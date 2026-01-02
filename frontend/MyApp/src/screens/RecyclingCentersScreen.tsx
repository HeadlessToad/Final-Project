// // screens/RecyclingCentersScreen.tsx

// import React, { useState, useEffect } from 'react';
// import {
//   View, Text, StyleSheet, FlatList, TouchableOpacity,
//   ActivityIndicator, Platform, Alert, Linking
// } from 'react-native';
// import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
// import * as Location from 'expo-location';
// import { NativeStackScreenProps } from "@react-navigation/native-stack";
// import { RootStackParamList } from "../types";
// import { MapPin, AlertTriangle, Eye, Navigation, XCircle } from 'lucide-react-native';
// import { BottomNavBar } from '../navigation/BottomNavBar';
// import { REAL_CENTERS, Center } from '../data/recyclingData';

// // 🔥 FIREBASE IMPORTS
// import { db } from '../firebaseConfig'; 
// import { doc, onSnapshot, setDoc, updateDoc, increment, getDoc } from 'firebase/firestore';

// // --- HELPER: Distance Calculation ---
// const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
//   const R = 6371; 
//   const dLat = deg2rad(lat2 - lat1);
//   const dLon = deg2rad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
//     Math.sin(dLon / 2) * Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return (R * c).toFixed(1);
// };
// const deg2rad = (deg: number) => deg * (Math.PI / 180);

// const COLORS = {
//   primary: '#4CAF50',
//   background: '#F9F9F9',
//   white: '#FFFFFF',
//   text: '#1B5E20',
//   error: '#F44336',
//   info: '#2196F3',
//   onSurfaceVariant: '#616161',
//   disabled: '#9E9E9E',
// };

// type RecyclingCentersProps = NativeStackScreenProps<RootStackParamList, "RecyclingCenters">;

// export default function RecyclingCentersScreen({ navigation }: RecyclingCentersProps) {
//   const [location, setLocation] = useState<Location.LocationObject | null>(null);
//   const [sortedCenters, setSortedCenters] = useState<Center[]>(REAL_CENTERS);
//   const [loading, setLoading] = useState(true);

//   // המשתנה הזה יחזיק את המידע האמיתי מהענן
//   // לדוגמה: { 101: 5, 204: 1 }
//   const [reportCounts, setReportCounts] = useState<{ [key: number]: number }>({});

//   // 🔥 1. חיבור ל-FIREBASE (האזנה לשינויים)
//   useEffect(() => {
//     // אנחנו מאזינים לכל הקולקשן של הדיווחים
//     // בגלל שזה דמו, זה בסדר. באפליקציה ענקית היינו עושים את זה אחרת.
    
//     const unsubscribeCallbacks: (() => void)[] = [];

//     // אופציה א': להאזין לכל מסמך בנפרד (יותר מדויק ללוגיקה שלנו כאן)
//     REAL_CENTERS.forEach(center => {
//         const docRef = doc(db, "reports", center.id.toString());
        
//         const unsub = onSnapshot(docRef, (docSnap) => {
//             if (docSnap.exists()) {
//                 const data = docSnap.data();
//                 setReportCounts(prev => ({
//                     ...prev,
//                     [center.id]: data.count || 0
//                 }));
//             }
//         });
//         unsubscribeCallbacks.push(unsub);
//     });

//     return () => {
//         // ניקוי ההאזנות כשהמסך נסגר
//         unsubscribeCallbacks.forEach(unsub => unsub());
//     };
//   }, []);

//   // עדכנו את החתימה של הפונקציה לקבל את כל הפרטים
//   const handleReport = (id: number, centerName: string, centerAddress: string, centerLat: number, centerLng: number) => {
//     Alert.alert(
//       "Report Issue",
//       `Is ${centerName} missing or damaged?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         { 
//           text: "Report as Missing", 
//           onPress: async () => {
//              try {
//                 const docRef = doc(db, "reports", id.toString());
//                 const docSnap = await getDoc(docRef);

//                 if (docSnap.exists()) {
//                     // אם המסמך קיים - רק מעלים את המספר
//                     await updateDoc(docRef, {
//                         count: increment(1)
//                     });
//                 } else {
//                     // 🔥 אם המסמך חדש - שומרים את כל הפרטים!
//                     // ככה הדאטה בייס יהיה מלא ומסודר
//                     await setDoc(docRef, {
//                         id: id,
//                         count: 1,
//                         name: centerName,
//                         address: centerAddress,
//                         coordinates: {
//                             latitude: centerLat,
//                             longitude: centerLng
//                         },
//                         firstReportedAt: new Date().toISOString() // אופציונלי: מתי דווח לראשונה
//                     });
//                 }
                
//                 Alert.alert("Report Sent", "Database updated successfully!");
//              } catch (error) {
//                  console.error("Error reporting:", error);
//                  Alert.alert("Error", "Could not send report.");
//              }
//           },
//           style: 'destructive'
//         }
//       ]
//     );
//   };

//   // --- NAVIGATION CHECK ---
//   const handleNavigation = (id: number, lat: number, lng: number) => {
//     const strikes = reportCounts[id] || 0;

//     // חסימה אם יש 3 דיווחים ומעלה (מהענן!)
//     if (strikes >= 3) {
//         Alert.alert(
//             "Navigation Disabled", 
//             "Multiple users have reported this point missing. Navigation is blocked for safety."
//         );
//         return; 
//     }

//     const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
//     Linking.openURL(url);
//   };

//   const openStreetView = (lat: number, lng: number) => {
//     const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}&layer=c&cbll=${lat},${lng}`;
//     Linking.openURL(url);
//   };

//   // מיקום ראשוני
//   useEffect(() => {
//     (async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         setLoading(false);
//         return;
//       }
//       let userLocation = await Location.getCurrentPositionAsync({});
//       setLocation(userLocation);

//       const userLat = userLocation.coords.latitude;
//       const userLon = userLocation.coords.longitude;

//       const sorted = [...REAL_CENTERS].sort((a, b) => {
//         const distA = parseFloat(getDistance(userLat, userLon, a.latitude, a.longitude));
//         const distB = parseFloat(getDistance(userLat, userLon, b.latitude, b.longitude));
//         return distA - distB;
//       });
//       setSortedCenters(sorted);
//       setLoading(false);
//     })();
//   }, []);

//   return (
//     <View style={styles.fullContainer}>
      
//       {/* --- MAP SECTION --- */}
//       <View style={styles.mapContainer}>
//         {loading || !location ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color={COLORS.primary} />
//             <Text style={styles.loadingText}>Locating you...</Text>
//           </View>
//         ) : (
//           <MapView
//             style={styles.map}
//             provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
//             showsUserLocation={true}
//             initialRegion={{
//               latitude: location.coords.latitude,
//               longitude: location.coords.longitude,
//               latitudeDelta: 0.1,
//               longitudeDelta: 0.1,
//             }}
//           >
//             {sortedCenters.map((center) => {
//                 // בדיקת דיווחים מה-STATE (שמתעדכן אוטומטית מהענן)
//                 const isBlocked = (reportCounts[center.id] || 0) >= 3;
                
//                 return (
//                   <Marker
//                     key={center.id}
//                     coordinate={{ latitude: center.latitude, longitude: center.longitude }}
//                     opacity={isBlocked ? 0.5 : 1} 
//                     pinColor={isBlocked ? 'grey' : 'red'}
//                   >
//                     <Callout tooltip onPress={() => handleNavigation(center.id, center.latitude, center.longitude)}>
//                       <View style={styles.calloutBubble}>
//                         <Text style={styles.calloutTitle}>{center.name}</Text>
//                         {isBlocked ? (
//                              <Text style={{color: 'red', fontWeight: 'bold'}}>⚠️ REPORTED ({reportCounts[center.id]})</Text>
//                         ) : (
//                              <Text style={styles.navigateText}>Tap to Drive 🚗</Text>
//                         )}
//                       </View>
//                     </Callout>
//                   </Marker>
//                 );
//             })}
//           </MapView>
//         )}
//       </View>

//       {/* --- LIST SECTION --- */}
//       <View style={styles.listContainer}>
//         <Text style={styles.listTitle}>Nearby Centers</Text>
//         <Text style={styles.subTitle}>Live reports from the community</Text>

//         <FlatList
//           data={sortedCenters}
//           keyExtractor={item => item.id.toString()}
//           renderItem={({ item }) => {
//             const dist = location 
//               ? getDistance(location.coords.latitude, location.coords.longitude, item.latitude, item.longitude)
//               : '?';

//             const strikes = reportCounts[item.id] || 0;
//             const isBlocked = strikes >= 3;

//             return (
//               <View style={[styles.centerCard, isBlocked && styles.disabledCard]}>
                
//                 <TouchableOpacity 
//                    style={styles.cardHeader} 
//                    onPress={() => handleNavigation(item.id, item.latitude, item.longitude)}
//                    disabled={isBlocked}
//                 >
//                     <View style={[styles.iconCircle, isBlocked && {backgroundColor: '#EEE'}]}>
//                         {isBlocked ? (
//                             <XCircle size={24} color={COLORS.disabled} />
//                         ) : (
//                             <MapPin size={24} color={COLORS.primary} />
//                         )}
//                     </View>
//                     <View style={styles.centerDetails}>
//                         <Text style={[styles.centerName, isBlocked && {color: COLORS.disabled}]}>
//                             {item.name}
//                         </Text>
//                         <Text style={styles.centerTypes}>{item.wasteTypes.join(' · ')}</Text>
//                         <Text style={styles.distanceText}>{dist} km away</Text>
//                     </View>
//                 </TouchableOpacity>

//                 <View style={styles.actionRow}>
//                     <TouchableOpacity 
//                         style={styles.actionButton} 
//                         onPress={() => handleNavigation(item.id, item.latitude, item.longitude)}
//                     >
//                         <Navigation size={18} color={isBlocked ? COLORS.disabled : COLORS.primary} />
//                         <Text style={[styles.actionText, {color: isBlocked ? COLORS.disabled : COLORS.primary}]}>
//                             {isBlocked ? "Blocked" : "Drive"}
//                         </Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity 
//                         style={styles.actionButton} 
//                         onPress={() => openStreetView(item.latitude, item.longitude)}
//                     >
//                         <Eye size={18} color={COLORS.info} />
//                         <Text style={[styles.actionText, {color: COLORS.info}]}>Photo</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity 
//                         style={styles.actionButton} 
//                         onPress={() => handleReport(item.id, item.name, item.address, item.latitude, item.longitude)}
//                     >
//                         <AlertTriangle size={18} color={isBlocked ? COLORS.disabled : COLORS.error} />
//                         <Text style={[styles.actionText, {color: isBlocked ? COLORS.disabled : COLORS.error}]}>
//                             Report ({strikes})
//                         </Text>
//                     </TouchableOpacity>
//                 </View>
//               </View>
//             );
//           }}
//         />
//       </View>

//       <BottomNavBar currentRoute="RecyclingCenters" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   fullContainer: { flex: 1, backgroundColor: COLORS.background },
//   mapContainer: { height: '35%', width: '100%' },
//   map: { width: '100%', height: '100%' },
//   loadingContainer: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5E9', height: '100%' },
//   loadingText: { marginTop: 10, color: COLORS.text },
//   calloutBubble: { backgroundColor: 'white', borderRadius: 8, padding: 10, width: 180, alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, elevation: 5, marginBottom: 5 },
//   calloutTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 5, textAlign: 'center' },
//   navigateText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 12 },
//   listContainer: { flex: 1, padding: 15, paddingBottom: 0 },
//   listTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
//   subTitle: { fontSize: 13, color: COLORS.onSurfaceVariant, marginBottom: 10 },
//   centerCard: { backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 12, padding: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3 },
//   disabledCard: { backgroundColor: '#F5F5F5', opacity: 0.8 },
//   cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
//   iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
//   centerDetails: { flex: 1 },
//   centerName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
//   centerTypes: { fontSize: 12, color: COLORS.onSurfaceVariant, marginTop: 2 },
//   distanceText: { fontSize: 12, fontWeight: 'bold', color: COLORS.distanceColor, marginTop: 2 },
//   actionRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#EEEEEE', paddingTop: 10, justifyContent: 'space-around' },
//   actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 15, paddingVertical: 8 },
//   actionText: { fontSize: 13, fontWeight: '600' }
// });

// screens/RecyclingCentersScreen.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Platform, Alert, Linking, ScrollView
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { MapPin, AlertTriangle, Eye, Navigation, XCircle, Filter } from 'lucide-react-native';
import { BottomNavBar } from '../navigation/BottomNavBar';
import { REAL_CENTERS, Center } from '../data/recyclingData'; // Make sure path is correct

// 🔥 FIREBASE IMPORTS
import { db } from '../firebaseConfig'; 
import { doc, onSnapshot, setDoc, updateDoc, increment, getDoc } from 'firebase/firestore';

// --- HELPER: Distance Calculation ---
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};
const deg2rad = (deg: number) => deg * (Math.PI / 180);

const COLORS = {
  primary: '#4CAF50',
  background: '#F9F9F9',
  white: '#FFFFFF',
  text: '#1B5E20',
  error: '#F44336',
  info: '#2196F3',
  onSurfaceVariant: '#616161',
  disabled: '#9E9E9E',
  chipSelected: '#E8F5E9',
  chipBorder: '#C8E6C9',
};

type RecyclingCentersProps = NativeStackScreenProps<RootStackParamList, "RecyclingCenters">;

export default function RecyclingCentersScreen({ navigation }: RecyclingCentersProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 🔥 CATEGORY STATE
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Firebase Realtime Data
  const [reportCounts, setReportCounts] = useState<{ [key: number]: number }>({});

  // 1. EXTRACT ALL UNIQUE CATEGORIES
  const allCategories = useMemo(() => {
      const types = new Set<string>();
      REAL_CENTERS.forEach(center => {
          center.wasteTypes.forEach(type => types.add(type));
      });
      return ["All", ...Array.from(types).sort()];
  }, []);

  // 2. FILTER AND SORT DATA
  const displayedCenters = useMemo(() => {
      if (!location) return []; // Don't show anything until we have location

      const userLat = location.coords.latitude;
      const userLon = location.coords.longitude;

      return REAL_CENTERS
        // Step A: Filter by Category
        .filter(center => {
            if (selectedCategory === "All") return true;
            return center.wasteTypes.includes(selectedCategory);
        })
        // Step B: Sort by Distance
        .sort((a, b) => {
            const distA = parseFloat(getDistance(userLat, userLon, a.latitude, a.longitude));
            const distB = parseFloat(getDistance(userLat, userLon, b.latitude, b.longitude));
            return distA - distB;
        });

  }, [location, selectedCategory]);


  // --- FIREBASE LISTENER ---
  useEffect(() => {
    const unsubscribeCallbacks: (() => void)[] = [];
    REAL_CENTERS.forEach(center => {
        const docRef = doc(db, "reports", center.id.toString());
        const unsub = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setReportCounts(prev => ({ ...prev, [center.id]: data.count || 0 }));
            }
        });
        unsubscribeCallbacks.push(unsub);
    });
    return () => unsubscribeCallbacks.forEach(unsub => unsub());
  }, []);

  // --- REPORT HANDLER ---
  const handleReport = (id: number, centerName: string, centerAddress: string, centerLat: number, centerLng: number) => {
    Alert.alert(
      "Report Issue",
      `Is ${centerName} missing or damaged?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Report as Missing", 
          onPress: async () => {
             try {
                const docRef = doc(db, "reports", id.toString());
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    await updateDoc(docRef, { count: increment(1) });
                } else {
                    await setDoc(docRef, {
                        id: id, count: 1, name: centerName, address: centerAddress,
                        coordinates: { latitude: centerLat, longitude: centerLng },
                        firstReportedAt: new Date().toISOString()
                    });
                }
                Alert.alert("Report Sent", "Database updated successfully!");
             } catch (error) {
                 console.error("Error reporting:", error);
                 Alert.alert("Error", "Could not send report.");
             }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleNavigation = (id: number, lat: number, lng: number) => {
    const strikes = reportCounts[id] || 0;
    if (strikes >= 3) {
        Alert.alert("Navigation Disabled", "Multiple users have reported this point missing.");
        return; 
    }
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
  };

  const openStreetView = (lat: number, lng: number) => {
    Linking.openURL(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}&layer=c&cbll=${lat},${lng}`);
  };

  // --- LOCATION SETUP ---
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }
      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation);
      setLoading(false);
    })();
  }, []);

  return (
    <View style={styles.fullContainer}>
      
      {/* --- MAP SECTION (Top 35%) --- */}
      <View style={styles.mapContainer}>
        {loading || !location ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Locating you...</Text>
          </View>
        ) : (
          <MapView
            style={styles.map}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            showsUserLocation={true}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            {displayedCenters.map((center) => {
                const isBlocked = (reportCounts[center.id] || 0) >= 3;
                return (
                  <Marker
                    key={center.id}
                    coordinate={{ latitude: center.latitude, longitude: center.longitude }}
                    opacity={isBlocked ? 0.5 : 1} 
                    pinColor={isBlocked ? 'grey' : 'red'}
                  >
                    <Callout tooltip onPress={() => handleNavigation(center.id, center.latitude, center.longitude)}>
                      <View style={styles.calloutBubble}>
                        <Text style={styles.calloutTitle}>{center.name}</Text>
                        {isBlocked ? (
                             <Text style={{color: 'red', fontWeight: 'bold'}}>⚠️ REPORTED ({reportCounts[center.id]})</Text>
                        ) : (
                             <Text style={styles.navigateText}>Tap to Drive 🚗</Text>
                        )}
                      </View>
                    </Callout>
                  </Marker>
                );
            })}
          </MapView>
        )}
      </View>

      {/* --- LIST SECTION (Bottom 65%) --- */}
      <View style={styles.listContainer}>
        <View style={styles.headerRow}>
            <Text style={styles.listTitle}>Nearby Centers</Text>
            <Text style={styles.resultCount}>{displayedCenters.length} found</Text>
        </View>

        {/* 🔥 CATEGORY FILTER BAR */}
        <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingRight: 20}}>
                {allCategories.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                        <TouchableOpacity 
                            key={cat} 
                            style={[styles.chip, isSelected && styles.chipActive]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>

        <FlatList
          data={displayedCenters}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => {
            const dist = location 
              ? getDistance(location.coords.latitude, location.coords.longitude, item.latitude, item.longitude)
              : '?';

            const strikes = reportCounts[item.id] || 0;
            const isBlocked = strikes >= 3;

            return (
              <View style={[styles.centerCard, isBlocked && styles.disabledCard]}>
                
                <TouchableOpacity 
                   style={styles.cardHeader} 
                   onPress={() => handleNavigation(item.id, item.latitude, item.longitude)}
                   disabled={isBlocked}
                >
                    <View style={[styles.iconCircle, isBlocked && {backgroundColor: '#EEE'}]}>
                        {isBlocked ? <XCircle size={24} color={COLORS.disabled} /> : <MapPin size={24} color={COLORS.primary} />}
                    </View>
                    <View style={styles.centerDetails}>
                        <Text style={[styles.centerName, isBlocked && {color: COLORS.disabled}]}>
                            {item.name}
                        </Text>
                        {/* Highlight matching type */}
                        <Text style={styles.centerTypes}>
                            {item.wasteTypes.map((type, i) => (
                                <Text key={i} style={type === selectedCategory ? {fontWeight:'bold', color: COLORS.primary} : {}}>
                                    {type}{i < item.wasteTypes.length - 1 ? ' · ' : ''}
                                </Text>
                            ))}
                        </Text>
                        <Text style={styles.distanceText}>{dist} km away</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleNavigation(item.id, item.latitude, item.longitude)}>
                        <Navigation size={18} color={isBlocked ? COLORS.disabled : COLORS.primary} />
                        <Text style={[styles.actionText, {color: isBlocked ? COLORS.disabled : COLORS.primary}]}>
                            {isBlocked ? "Blocked" : "Drive"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => openStreetView(item.latitude, item.longitude)}>
                        <Eye size={18} color={COLORS.info} />
                        <Text style={[styles.actionText, {color: COLORS.info}]}>Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => handleReport(item.id, item.name, item.address, item.latitude, item.longitude)}>
                        <AlertTriangle size={18} color={isBlocked ? COLORS.disabled : COLORS.error} />
                        <Text style={[styles.actionText, {color: isBlocked ? COLORS.disabled : COLORS.error}]}>
                            Report ({strikes})
                        </Text>
                    </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      </View>

      <BottomNavBar currentRoute="RecyclingCenters" />
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: COLORS.background },
  mapContainer: { height: '35%', width: '100%' },
  map: { width: '100%', height: '100%' },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5E9', height: '100%' },
  loadingText: { marginTop: 10, color: COLORS.text },
  
  calloutBubble: { backgroundColor: 'white', borderRadius: 8, padding: 10, width: 180, alignItems: 'center', elevation: 5 },
  calloutTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 5 },
  navigateText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 12 },

  listContainer: { flex: 1, padding: 15, paddingBottom: 0 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  listTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  resultCount: { fontSize: 12, color: COLORS.onSurfaceVariant },

  // 🔥 FILTER CHIPS STYLES
  filterContainer: { marginBottom: 15, height: 40 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: COLORS.chipSelected,
    borderColor: COLORS.chipBorder,
  },
  chipText: { fontSize: 13, color: COLORS.onSurfaceVariant },
  chipTextActive: { color: COLORS.primary, fontWeight: 'bold' },

  centerCard: { backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 12, padding: 12, elevation: 2 },
  disabledCard: { backgroundColor: '#F5F5F5', opacity: 0.8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  centerDetails: { flex: 1 },
  centerName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  centerTypes: { fontSize: 12, color: COLORS.onSurfaceVariant, marginTop: 2 },
  distanceText: { fontSize: 12, fontWeight: 'bold', color: COLORS.distanceColor, marginTop: 2 },
  actionRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#EEEEEE', paddingTop: 10, justifyContent: 'space-around' },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 15, paddingVertical: 8 },
  actionText: { fontSize: 13, fontWeight: '600' }
});