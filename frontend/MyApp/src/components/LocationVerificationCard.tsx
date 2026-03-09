// src/components/LocationVerificationCard.tsx
// Displays location verification status and nearest recycling center suggestion

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

const COLORS = {
  primary: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  gray: '#9E9E9E',
  white: '#FFFFFF',
  text: '#1B5E20',
  onSurfaceVariant: '#616161',
  successBg: '#E8F5E9',
  errorBg: '#FFEBEE',
  warningBg: '#FFF3E0',
  grayBg: '#F5F5F5',
};

interface LocationVerificationCardProps {
  isLoading: boolean;
  isVerified: boolean | null;
  nearestCenter: Center | null;
  distanceMeters: number | null;
  errorMessage: string | null;
  hasMatchingCenters: boolean;
  onRetry: () => void;
  onOk?: () => void;           // "OK" button - goes back to home
  onTakeMeThere?: () => void;  // "Take me there" - opens map view focused on center
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

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.card, styles.loadingCard]}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Verifying your location...</Text>
      </View>
    );
  }

  // No matching centers (e.g., BIODEGRADABLE)
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
            <TouchableOpacity style={styles.okButton} onPress={onOk}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Verified - user is at a recycling center
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
            <TouchableOpacity style={[styles.okButton, { marginTop: 12 }]} onPress={onOk}>
              <Text style={styles.okButtonText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Not verified but has centers - show nearest center with two action buttons
  if (isVerified === false && nearestCenter && distanceMeters !== null) {
    return (
      <View style={[styles.card, styles.warningCard]}>
        <AlertCircle size={24} color={COLORS.warning} />
        <View style={styles.cardContent}>
          <Text style={styles.warningTitle}>Not at a Recycling Center</Text>
          <Text style={styles.subtitle}>
            Visit a recycling center to earn points for this item.
          </Text>

          <View style={styles.centerInfo}>
            <MapPin size={16} color={COLORS.onSurfaceVariant} />
            <Text style={styles.centerName} numberOfLines={1}>
              {nearestCenter.name}
            </Text>
            <Text style={styles.distanceText}>
              {formatDistance(distanceMeters)}
            </Text>
          </View>

          {/* Two action buttons: OK and Take me there */}
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

  // Error state (permission denied, GPS error, etc.)
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

  // Default/initial state - prompt to verify
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

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: 'flex-start',
  },
  loadingCard: {
    backgroundColor: COLORS.grayBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 10,
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
  },
  successCard: {
    backgroundColor: COLORS.successBg,
  },
  warningCard: {
    backgroundColor: COLORS.warningBg,
  },
  errorCard: {
    backgroundColor: COLORS.errorBg,
  },
  grayCard: {
    backgroundColor: COLORS.grayBg,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.warning,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.error,
  },
  grayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gray,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
  },
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
  distanceText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  okButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  okButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  takeMeThereButton: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  takeMeThereText: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  retryButton: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  retryText: {
    color: COLORS.text,
    fontWeight: '600',
  },
});
