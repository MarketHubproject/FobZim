import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Button,
  IconButton,
  Text,
  Card,
  Surface,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width: screenWidth } = Dimensions.get('window');
const imageSize = (screenWidth - 64) / 3; // 3 images per row with margins

const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  textPrimary: '#212121',
  textSecondary: '#757575',
  muted: '#BDBDBD',
  error: '#F44336',
  zimbabwe: '#FFCC02',
  white: '#FFFFFF',
};

interface ImagePickerComponentProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  required?: boolean;
  error?: string;
}

const ImagePickerComponent: React.FC<ImagePickerComponentProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  label = "Campaign Images",
  required = false,
  error,
}) => {
  const [loading, setLoading] = useState(false);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload images.',
      );
      return false;
    }
    return true;
  };

  const pickImages = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets
          .map(asset => asset.uri)
          .slice(0, maxImages - images.length);
        
        onImagesChange([...images, ...newImages]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera permissions to take photos.',
      );
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [16, 9],
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        onImagesChange([...images, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onImagesChange(newImages);
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Image',
      'Choose how you want to add an image',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImages },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.label}>
          {label}
          {required && <Text style={styles.required}>*</Text>}
        </Text>
        <Text variant="bodySmall" style={styles.counter}>
          {images.length}/{maxImages}
        </Text>
      </View>

      <Text variant="bodySmall" style={styles.subtitle}>
        Add up to {maxImages} images. First image will be the cover photo.
      </Text>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.imagesContainer}
      >
        {images.map((imageUri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            
            {/* Cover Badge */}
            {index === 0 && (
              <View style={styles.coverBadge}>
                <Text style={styles.coverText}>COVER</Text>
              </View>
            )}

            {/* Remove Button */}
            <IconButton
              icon="close-circle"
              iconColor={colors.white}
              containerColor={colors.error}
              size={20}
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            />

            {/* Reorder Handles */}
            {images.length > 1 && (
              <View style={styles.reorderContainer}>
                {index > 0 && (
                  <IconButton
                    icon="chevron-left"
                    iconColor={colors.white}
                    containerColor={`${colors.textPrimary}80`}
                    size={16}
                    style={styles.reorderButton}
                    onPress={() => reorderImages(index, index - 1)}
                  />
                )}
                {index < images.length - 1 && (
                  <IconButton
                    icon="chevron-right"
                    iconColor={colors.white}
                    containerColor={`${colors.textPrimary}80`}
                    size={16}
                    style={styles.reorderButton}
                    onPress={() => reorderImages(index, index + 1)}
                  />
                )}
              </View>
            )}
          </View>
        ))}

        {/* Add Image Button */}
        {images.length < maxImages && (
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={showImageOptions}
            disabled={loading}
          >
            <Card style={styles.addCard} mode="outlined">
              <MaterialCommunityIcons
                name={loading ? "loading" : "plus"}
                size={32}
                color={colors.primary}
                style={loading ? styles.spinning : undefined}
              />
              <Text variant="bodySmall" style={styles.addText}>
                Add Image
              </Text>
            </Card>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Quick Action Buttons */}
      <View style={styles.quickActions}>
        <Button
          mode="outlined"
          icon="camera"
          onPress={takePhoto}
          disabled={images.length >= maxImages || loading}
          style={styles.quickActionButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Take Photo
        </Button>
        
        <Button
          mode="outlined"
          icon="image-multiple"
          onPress={pickImages}
          disabled={images.length >= maxImages || loading}
          style={styles.quickActionButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Gallery
        </Button>
      </View>

      {/* Error Message */}
      {error && (
        <Text variant="bodySmall" style={styles.errorText}>
          {error}
        </Text>
      )}

      {/* Hints */}
      {images.length === 0 && (
        <Surface style={styles.hintsContainer} elevation={0}>
          <MaterialCommunityIcons
            name="lightbulb-outline"
            size={16}
            color={colors.textSecondary}
          />
          <Text variant="bodySmall" style={styles.hintsText}>
            Tips: Use high-quality images, show your product/service clearly, 
            and include lifestyle shots to attract more creators.
          </Text>
        </Surface>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  required: {
    color: colors.error,
  },
  counter: {
    color: colors.textSecondary,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: 16,
  },
  imagesContainer: {
    paddingBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: 12,
  },
  coverBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.zimbabwe,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  coverText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
  },
  reorderContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reorderButton: {
    width: 24,
    height: 24,
  },
  addButton: {
    marginRight: 12,
  },
  addCard: {
    width: imageSize,
    height: imageSize,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderWidth: 2,
    borderRadius: 12,
  },
  addText: {
    color: colors.primary,
    marginTop: 4,
    fontSize: 11,
  },
  spinning: {
    // Add rotation animation if needed
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 8,
    borderColor: colors.primary,
  },
  buttonContent: {
    flexDirection: 'row-reverse',
  },
  buttonLabel: {
    color: colors.primary,
    fontSize: 12,
  },
  errorText: {
    color: colors.error,
    marginTop: 8,
  },
  hintsContainer: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  hintsText: {
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});

export default ImagePickerComponent;