import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { LogOut, Trash2, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#4CAF50',
  background: '#F9F9F9',
  white: '#FFFFFF',
  text: '#1B5E20',
  textSecondary: '#616161',
  danger: '#D32F2F',
  border: '#E0E0E0',
};

export default function SettingsScreen() {
  const [loading, setLoading] = useState(false);


  const handleLogout = () => {
      signOut(auth);
      // AppNavigator handles the navigation back to Welcome
  };

  // // --- DELETE ACCOUNT HANDLER ---
  // const handleDeleteAccountPress = () => {
  //   Alert.alert(
  //     "Delete Account",
  //     "Are you sure you want to delete your account? This action cannot be undone and all your data (points, history) will be lost.",
  //     [
  //       { text: "Cancel", style: "cancel" },
  //       { 
  //         text: "Delete Forever", 
  //         style: "destructive", 
  //         onPress: performDelete 
  //       }
  //     ]
  //   );
  // };

  // const performDelete = async () => {
  //   setLoading(true);
  //   try {
  //     await deleteAccount();
  //   } catch (error: any) {
  //     setLoading(false);
  //     // Firebase requires a recent login to delete sensitive info
  //     if (error.code === 'auth/requires-recent-login') {
  //       Alert.alert(
  //         "Security Check Required", 
  //         "For your security, please Log Out and Log In again before deleting your account."
  //       );
  //     } else {
  //       Alert.alert("Error", "Could not delete account. Please try again.");
  //     }
  //   }
  // };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.danger} />
        <Text style={{marginTop: 10, color: COLORS.textSecondary}}>Deleting Account...</Text>
      </View>
    );
  }

  // --- UI COMPONENT: Setting Row ---
  const SettingRow = ({ icon: Icon, title, onPress, isDestructive = false }: any) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconContainer, isDestructive && styles.destructiveIcon]}>
          <Icon size={20} color={isDestructive ? COLORS.danger : COLORS.text} />
        </View>
        <Text style={[styles.rowTitle, isDestructive && styles.destructiveText]}>{title}</Text>
      </View>
      <ChevronRight size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      
      {/* Account Actions Section */}
      <Text style={styles.sectionTitle}>ACCOUNT</Text>
      <View style={styles.section}>
        <SettingRow 
          icon={LogOut} 
          title="Log Out" 
          onPress={handleLogout} 
          isDestructive 
        />
        {/* <View style={styles .divider} />
        <SettingRow 
          icon={Trash2} 
          title="Delete Account" 
          onPress={handleDeleteAccountPress} 
          isDestructive 
        /> */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 10,
    marginLeft: 5,
    marginTop: 10,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  destructiveIcon: {
    backgroundColor: '#FFEBEE',
  },
  rowTitle: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  destructiveText: {
    color: COLORS.danger,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 60, 
  },
  versionText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 20,
    fontSize: 12,
  },
});