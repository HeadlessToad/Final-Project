// src/components/LocationVerificationCard.tsx
// ============================================================================
// COMPONENT PURPOSE:
// This component displays a UI card showing the status of the user's GPS 
// location verification compared to the nearest recycling center.
// It handles multiple states: Loading, Success, Warning, Error, and Not Found.
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  MapPin,
  Navigation,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react-native';
import { Center } from '../data/recyclingData';
import { formatDistance } from '../services/locationVerificationService';

// Centralized color palette for consistent UI theming across different card states
const COLORS = {
  primary: '#4CAF50',        // Green for success/actions
  error: '#F44336',          // Red for errors
  warning: '#FF9800',        // Orange for warnings (too far)
  gray: '#9E9E9E',           // Gray for neutral/disabled
  white: '#FFFFFF',
  text: '#1B5E20',           // Dark green text
  onSurfaceVariant: '#616161', 
  successBg: '#E8F5E9',      // Light green background
  errorBg: '#FFEBEE',        // Light red background
  warningBg: '#FFF3E0',      // Light orange background
  grayBg: '#F5F5F5',         // Light gray background
};

// Interface defining all the properties this component expects to receive
interface LocationVerificationCardProps {
  isLoading: boolean;              // True if currently fetching GPS/calculating
  isVerified: boolean | null;      // True if user is close enough to the center
  nearestCenter: Center | null;    // The closest center object data
  distanceMeters: number | null;   // Distance to the nearest center in meters
  errorMessage: string | null;     // Text to display if an error occurred (e.g., GPS off)
  hasMatchingCenters: boolean;     // True if the current waste type is recyclable in this city
  onRetry: () => void;             // Callback to re-trigger the location check
  onOk?: () => void;               // Callback to close the modal / go back to home
  onTakeMeThere?: () => void;      // Callback to navigate to the map screen
}

export default function LocationVerificationCard({
  isLoading,
  isVerified,
  nearestCenter,
  distanceMeters,
  errorMessage,
  hasMatchingCenters,
  onRetry,
  onOk,
  onTakeMeThere,
}: LocationVerificationCardProps) {

  // --------------------------------------------------------------------------
  // STATE 1: LOADING
  // Shown while the app is actively trying to get the user's GPS coordinates
  // --------------------------------------------------------------------------
  if (isLoading) {
    return (
      <View style={[styles.card, styles.loadingCard]}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Verifying your location...</Text>
      </View>
    );
  }

  // --------------------------------------------------------------------------
  // STATE 2: NO MATCHING CENTERS
  // Shown if the AI detected an item (like Biodegradable) that has no 
  // registered bins in the local database.
  // --------------------------------------------------------------------------
  if (!hasMatchingCenters) {
    return (
      <View style={[styles.card, styles.grayCard]}>
        <AlertTriangle size={24} color={COLORS.gray} />
        <View style={styles.cardContent}>
          <Text style={styles.grayTitle}>No Centers Available</Text>
          <Text style={styles.subtitle}>
            {errorMessage || 'No recycling centers accept this type of waste.'}
          </Text>
          {onOk && (
            <TouchableOpacity style={styles.standardButton} onPress={onOk}>
              <Text style={styles.standardButtonText}>Back to Home</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // --------------------------------------------------------------------------
  // STATE 3: VERIFIED (SUCCESS)
  // Shown when the user is standing within the required radius of the bin.
  // --------------------------------------------------------------------------
  if (isVerified === true) {
    return (
      <View style={[styles.card, styles.successCard]}>
        <CheckCircle size={24} color={COLORS.primary} />
        <View style={styles.cardContent}>
          <Text style={styles.successTitle}>Location Verified!</Text>
          {nearestCenter && (
            <Text style={styles.subtitle}>You're at {nearestCenter.name}</Text>
          )}
          {onOk && (
            <TouchableOpacity style={styles.successButton} onPress={onOk}>
              <Text style={styles.successButtonText}>Awesome! Back to Home</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // --------------------------------------------------------------------------
  // STATE 4: NOT VERIFIED BUT BINS EXIST (WARNING)
  // Shown when the user is too far from the nearest bin. Offers a map route.
  // --------------------------------------------------------------------------
  if (isVerified === false && nearestCenter && distanceMeters !== null) {
    return (
      <View style={[styles.card, styles.warningCard]}>
        <AlertCircle size={24} color={COLORS.warning} />
        <View style={styles.cardContent}>
          <Text style={styles.warningTitle}>Not at a Recycling Center</Text>
          <Text style={styles.subtitle}>
            Visit a recycling center to earn points for this item.
          </Text>

          {/* Displays the specific center name and formatted distance */}
          <View style={styles.centerInfo}>
            <MapPin size={16} color={COLORS.onSurfaceVariant} />
            <Text style={styles.centerName} numberOfLines={1}>
              {nearestCenter.name}
            </Text>
            <Text style={styles.distanceText}>
              {formatDistance(distanceMeters)}
            </Text>
          </View>

          {/* Action buttons: Cancel (OK) or Navigate to Map (Take me there) */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.okButton}
              onPress={onOk}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.takeMeThereButton}
              onPress={onTakeMeThere}
            >
              <Navigation size={18} color={COLORS.white} />
              <Text style={styles.takeMeThereText}>Take me there</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // --------------------------------------------------------------------------
  // STATE 5: ERROR
  // Shown for system errors (e.g., Location permissions denied, no GPS signal)
  // --------------------------------------------------------------------------
  if (errorMessage) {
    return (
      <View style={[styles.card, styles.errorCard]}>
        <XCircle size={24} color={COLORS.error} />
        <View style={styles.cardContent}>
          <Text style={styles.errorTitle}>Verification Failed</Text>
          <Text style={styles.subtitle}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --------------------------------------------------------------------------
  // STATE 6: DEFAULT / INITIAL
  // Fallback state prompting the user to start the verification process
  // --------------------------------------------------------------------------
  return (
    <View style={[styles.card, styles.grayCard]}>
      <MapPin size={24} color={COLORS.gray} />
      <View style={styles.cardContent}>
        <Text style={styles.grayTitle}>Location Verification Required</Text>
        <Text style={styles.subtitle}>
          Submit feedback to verify your location and earn points.
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// STYLESHEET
// Contains all layout, spacing, colors, and typography for the component.
// ============================================================================
const styles = StyleSheet.create({
  // Base card container
  card: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: 'flex-start',
  },
  
  // Background colors for different states
  loadingCard: { backgroundColor: COLORS.grayBg, justifyContent: 'center', alignItems: 'center' },
  successCard: { backgroundColor: COLORS.successBg },
  warningCard: { backgroundColor: COLORS.warningBg },
  errorCard:   { backgroundColor: COLORS.errorBg },
  grayCard:    { backgroundColor: COLORS.grayBg },
  
  // Text content wrapper
  cardContent: { flex: 1, marginLeft: 12 },
  
  // Typography for titles
  successTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  warningTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.warning },
  errorTitle:   { fontSize: 16, fontWeight: 'bold', color: COLORS.error },
  grayTitle:    { fontSize: 16, fontWeight: 'bold', color: COLORS.gray },
  subtitle:     { fontSize: 13, color: COLORS.onSurfaceVariant, marginTop: 4 },
  
  // Layout for the nearest center information block
  centerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  centerName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  distanceText: { fontSize: 13, color: COLORS.onSurfaceVariant, fontWeight: 'bold' },
  loadingText:  { marginLeft: 10, color: COLORS.onSurfaceVariant, fontSize: 14 },
  
  // Button layouts
  buttonRow: { flexDirection: 'row', marginTop: 12, gap: 10 },
  
  // Standard flex buttons (used in the warning state row)
  okButton: {
    flexGrow: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  okButtonText: { color: COLORS.text, fontWeight: 'bold' },
  takeMeThereButton: {
    flexGrow: 2,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  takeMeThereText: { color: COLORS.white, fontWeight: 'bold', marginLeft: 8 },
  
  // Standalone buttons
  retryButton: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  retryText: { color: COLORS.text, fontWeight: '600' },
  
  // Fixed logic buttons with alignSelf: 'flex-start' to prevent stretching bugs
  successButton: {
    marginTop: 15,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-start', 
  },
  successButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  
  standardButton: {
    marginTop: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  standardButtonText: { color: COLORS.text, fontWeight: 'bold' },
});