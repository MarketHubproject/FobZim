import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Share,
  Platform
} from 'react-native';
import {
  Text,
  IconButton,
  ActivityIndicator
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PinchGestureHandler, PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');

// Colors
const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  textPrimary: '#212121',
  textSecondary: '#757575',
  muted: '#BDBDBD',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.9)',
  overlayLight: 'rgba(0, 0, 0, 0.5)'
};

interface ImageViewerModalProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
  title?: string;
  showSaveButton?: boolean;
  showShareButton?: boolean;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  visible,
  imageUri,
  onClose,
  title,
  showSaveButton = true,
  showShareButton = true
}) => {
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  // Animation values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Gesture handlers
  const pinchHandler = useAnimatedGestureHandler({
    onStart: () => {
      'worklet';
    },
    onActive: (event) => {
      'worklet';
      scale.value = Math.max(0.5, Math.min(event.scale, 3));
    },
    onEnd: () => {
      'worklet';
      if (scale.value < 1) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  const panHandler = useAnimatedGestureHandler({
    onStart: () => {
      'worklet';
    },
    onActive: (event) => {
      'worklet';
      if (scale.value > 1) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      } else {
        // Handle swipe to close
        translateY.value = event.translationY;
        opacity.value = interpolate(
          Math.abs(event.translationY),
          [0, height / 4],
          [1, 0.5],
          Extrapolate.CLAMP
        );
      }
    },
    onEnd: (event) => {
      'worklet';
      if (scale.value <= 1) {
        // Check if swipe is significant enough to close
        if (Math.abs(event.translationY) > height / 6 || Math.abs(event.velocityY) > 500) {
          runOnJS(onClose)();
        } else {
          // Return to original position
          translateY.value = withSpring(0);
          opacity.value = withSpring(1);
        }
      } else {
        // Constrain pan within bounds when zoomed
        const maxTranslateX = (width * (scale.value - 1)) / 2;
        const maxTranslateY = (height * (scale.value - 1)) / 2;
        
        translateX.value = withSpring(
          Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX.value))
        );
        translateY.value = withSpring(
          Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY.value))
        );
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      opacity: opacity.value,
    };
  });

  const handleImageLoad = () => {
    setLoading(false);
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setLoading(false);
    Alert.alert('Error', 'Failed to load image');
  };

  const resetZoom = () => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    opacity.value = withSpring(1);
  };

  const requestMediaLibraryPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media library permissions:', error);
      return false;
    }
  };

  const handleSaveImage = async () => {
    if (!imageUri || saving) return;

    try {
      setSaving(true);
      
      // Request permissions
      const hasPermission = await requestMediaLibraryPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please grant media library permission to save images.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Download the image if it's a remote URL
      let localUri = imageUri;
      if (imageUri.startsWith('http')) {
        const downloadResult = await FileSystem.downloadAsync(
          imageUri,
          FileSystem.documentDirectory + `image_${Date.now()}.jpg`
        );
        localUri = downloadResult.uri;
      }

      // Save to media library
      const asset = await MediaLibrary.saveToLibraryAsync(localUri);
      
      Alert.alert('Success', 'Image saved to gallery!', [{ text: 'OK' }]);
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleShareImage = async () => {
    if (!imageUri || sharing) return;

    try {
      setSharing(true);

      if (Platform.OS === 'web') {
        Alert.alert('Info', 'Sharing is not available on web platform');
        return;
      }

      const shareOptions = {
        title: title || 'Shared Image',
        url: imageUri,
        type: 'image/jpeg'
      };

      await Share.share({
        title: shareOptions.title,
        url: shareOptions.url
      });
    } catch (error) {
      console.error('Error sharing image:', error);
      Alert.alert('Error', 'Failed to share image. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  const handleDoubleTap = () => {
    if (scale.value > 1) {
      resetZoom();
    } else {
      scale.value = withSpring(2);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar backgroundColor={colors.black} barStyle="light-content" />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
          
          {title && (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          )}
          
          <View style={styles.headerActions}>
            {showSaveButton && (
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleSaveImage}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <MaterialCommunityIcons name="download" size={24} color={colors.white} />
                )}
              </TouchableOpacity>
            )}
            
            {showShareButton && (
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleShareImage}
                disabled={sharing}
              >
                {sharing ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <MaterialCommunityIcons name="share-variant" size={24} color={colors.white} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Image Container */}
        <View style={styles.imageContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.white} />
              <Text style={styles.loadingText}>Loading image...</Text>
            </View>
          )}
          
          <PanGestureHandler onGestureEvent={panHandler}>
            <Animated.View style={styles.gestureContainer}>
              <PinchGestureHandler onGestureEvent={pinchHandler}>
                <Animated.View style={animatedStyle}>
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={handleDoubleTap}
                    style={styles.imageWrapper}
                  >
                    <Animated.Image
                      source={{ uri: imageUri }}
                      style={styles.image}
                      resizeMode="contain"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  </TouchableOpacity>
                </Animated.View>
              </PinchGestureHandler>
            </Animated.View>
          </PanGestureHandler>
        </View>

        {/* Footer */}
        {imageLoaded && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.zoomButton} onPress={resetZoom}>
              <MaterialCommunityIcons name="fit-to-screen" size={20} color={colors.white} />
              <Text style={styles.zoomButtonText}>Reset Zoom</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.overlayLight,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gestureContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: width,
    height: height - 200, // Account for header and footer
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    color: colors.white,
    marginTop: 16,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.overlayLight,
  },
  zoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlayLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  zoomButtonText: {
    color: colors.white,
    fontSize: 14,
    marginLeft: 8,
  },
});

export default ImageViewerModal;