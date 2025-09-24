import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Chip,
  Switch,
  Surface,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CampaignLocation } from '../../types/campaign';

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

// Zimbabwe cities for quick selection
const ZIMBABWE_CITIES = [
  'Harare',
  'Bulawayo', 
  'Chitungwiza',
  'Mutare',
  'Epworth',
  'Gweru',
  'Kwekwe',
  'Kadoma',
  'Masvingo',
  'Chinhoyi',
  'Marondera',
  'Ruwa',
  'Chegutu',
  'Zvishavane',
  'Bindura',
  'Beitbridge',
  'Redcliff',
  'Victoria Falls',
  'Hwange',
  'Chiredzi',
];

// Popular international cities
const POPULAR_CITIES = [
  'London, UK',
  'New York, USA',
  'Cape Town, South Africa',
  'Johannesburg, South Africa',
  'Dubai, UAE',
  'Lagos, Nigeria',
  'Nairobi, Kenya',
  'Accra, Ghana',
  'Toronto, Canada',
  'Sydney, Australia',
];

interface LocationSelectorProps {
  location: CampaignLocation | null;
  onLocationChange: (location: CampaignLocation | null) => void;
  label?: string;
  required?: boolean;
  error?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  location,
  onLocationChange,
  label = "Campaign Location",
  required = false,
  error,
}) => {
  const [isRemote, setIsRemote] = useState(location?.isRemote || false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [showCityPicker, setShowCityPicker] = useState(false);

  useEffect(() => {
    if (isRemote) {
      onLocationChange({
        isRemote: true,
        country: 'Remote',
        city: '',
        coordinates: null,
      });
    } else if (!location || location.isRemote) {
      onLocationChange(null);
    }
  }, [isRemote]);

  const selectCity = (cityName: string) => {
    const isInternational = cityName.includes(',');
    const [city, country] = isInternational 
      ? cityName.split(', ') 
      : [cityName, 'Zimbabwe'];

    onLocationChange({
      isRemote: false,
      country,
      city,
      coordinates: null, // Could be enhanced with geocoding
    });
    
    setShowCityPicker(false);
    setSearchQuery('');
  };

  const handleCustomLocation = () => {
    if (customLocation.trim()) {
      const locationParts = customLocation.split(',').map(part => part.trim());
      const city = locationParts[0];
      const country = locationParts[1] || 'Zimbabwe';

      onLocationChange({
        isRemote: false,
        country,
        city,
        coordinates: null,
      });
      
      setCustomLocation('');
      setShowCityPicker(false);
    }
  };

  const clearLocation = () => {
    onLocationChange(null);
    setIsRemote(false);
    setCustomLocation('');
  };

  const filteredZimCities = ZIMBABWE_CITIES.filter(city =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIntlCities = POPULAR_CITIES.filter(city =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCurrentLocationText = () => {
    if (!location) return 'No location selected';
    if (location.isRemote) return 'Remote Work';
    if (location.city && location.country) {
      return location.country === 'Zimbabwe' 
        ? location.city 
        : `${location.city}, ${location.country}`;
    }
    return location.country || 'Unknown';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.label}>
          {label}
          {required && <Text style={styles.required}>*</Text>}
        </Text>
      </View>

      {/* Remote Toggle */}
      <Surface style={styles.remoteToggle} elevation={0}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <MaterialCommunityIcons
              name="earth"
              size={20}
              color={colors.primary}
            />
            <View style={styles.toggleText}>
              <Text variant="bodyMedium" style={styles.toggleTitle}>
                Remote Work
              </Text>
              <Text variant="bodySmall" style={styles.toggleSubtitle}>
                Campaign can be completed from anywhere
              </Text>
            </View>
          </View>
          <Switch
            value={isRemote}
            onValueChange={setIsRemote}
            thumbColor={isRemote ? colors.primary : colors.muted}
            trackColor={{ false: colors.background, true: colors.secondary }}
          />
        </View>
      </Surface>

      {/* Current Location Display */}
      {(location || isRemote) && (
        <Card style={styles.currentLocation} mode="outlined">
          <Card.Content style={styles.locationContent}>
            <View style={styles.locationInfo}>
              <MaterialCommunityIcons
                name={location?.isRemote ? "earth" : "map-marker"}
                size={18}
                color={colors.primary}
              />
              <Text variant="bodyMedium" style={styles.locationText}>
                {getCurrentLocationText()}
              </Text>
            </View>
            <Button
              mode="text"
              onPress={clearLocation}
              textColor={colors.error}
              contentStyle={styles.clearButton}
            >
              Clear
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Location Selection (only if not remote) */}
      {!isRemote && (
        <View style={styles.selectionContainer}>
          {!showCityPicker ? (
            <Button
              mode="outlined"
              onPress={() => setShowCityPicker(true)}
              icon="map-marker-plus"
              style={styles.selectButton}
              contentStyle={styles.selectButtonContent}
            >
              {location && !location.isRemote ? 'Change Location' : 'Select Location'}
            </Button>
          ) : (
            <View style={styles.cityPicker}>
              {/* Search Input */}
              <TextInput
                mode="outlined"
                placeholder="Search cities or type custom location..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                left={<TextInput.Icon icon="magnify" />}
                right={
                  searchQuery ? (
                    <TextInput.Icon 
                      icon="close" 
                      onPress={() => setSearchQuery('')} 
                    />
                  ) : undefined
                }
              />

              {/* Custom Location Input */}
              <View style={styles.customLocationContainer}>
                <TextInput
                  mode="outlined"
                  placeholder="Enter custom location (City, Country)"
                  value={customLocation}
                  onChangeText={setCustomLocation}
                  style={styles.customInput}
                  onSubmitEditing={handleCustomLocation}
                />
                <Button
                  mode="contained"
                  onPress={handleCustomLocation}
                  disabled={!customLocation.trim()}
                  style={styles.addButton}
                  contentStyle={styles.addButtonContent}
                >
                  Add
                </Button>
              </View>

              {/* City Lists */}
              <ScrollView style={styles.cityList} showsVerticalScrollIndicator={false}>
                {/* Zimbabwe Cities */}
                {filteredZimCities.length > 0 && (
                  <View style={styles.citySection}>
                    <Text variant="titleSmall" style={styles.sectionTitle}>
                      Zimbabwe Cities
                    </Text>
                    <View style={styles.cityGrid}>
                      {filteredZimCities.map((city) => (
                        <Chip
                          key={city}
                          mode="outlined"
                          onPress={() => selectCity(city)}
                          style={styles.cityChip}
                          textStyle={styles.chipText}
                          icon={() => (
                            <MaterialCommunityIcons
                              name="map-marker"
                              size={14}
                              color={colors.primary}
                            />
                          )}
                        >
                          {city}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}

                {/* International Cities */}
                {filteredIntlCities.length > 0 && (
                  <View style={styles.citySection}>
                    <Text variant="titleSmall" style={styles.sectionTitle}>
                      Popular International
                    </Text>
                    <View style={styles.cityGrid}>
                      {filteredIntlCities.map((city) => (
                        <Chip
                          key={city}
                          mode="outlined"
                          onPress={() => selectCity(city)}
                          style={styles.cityChip}
                          textStyle={styles.chipText}
                          icon={() => (
                            <MaterialCommunityIcons
                              name="earth"
                              size={14}
                              color={colors.secondary}
                            />
                          )}
                        >
                          {city}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}

                {/* No Results */}
                {searchQuery && filteredZimCities.length === 0 && filteredIntlCities.length === 0 && (
                  <View style={styles.noResults}>
                    <MaterialCommunityIcons
                      name="map-search-outline"
                      size={48}
                      color={colors.muted}
                    />
                    <Text variant="bodyMedium" style={styles.noResultsText}>
                      No cities found matching "{searchQuery}"
                    </Text>
                    <Text variant="bodySmall" style={styles.noResultsSubtext}>
                      Try using the custom location input above
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.pickerActions}>
                <Button
                  mode="text"
                  onPress={() => setShowCityPicker(false)}
                  textColor={colors.textSecondary}
                >
                  Cancel
                </Button>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Error Message */}
      {error && (
        <Text variant="bodySmall" style={styles.errorText}>
          {error}
        </Text>
      )}

      {/* Location Tips */}
      {!location && !isRemote && (
        <Surface style={styles.tipsContainer} elevation={0}>
          <MaterialCommunityIcons
            name="lightbulb-outline"
            size={16}
            color={colors.textSecondary}
          />
          <Text variant="bodySmall" style={styles.tipsText}>
            Tip: Be specific about location requirements. Remote work often attracts 
            more creators, while local campaigns can build stronger community connections.
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
    marginBottom: 12,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  required: {
    color: colors.error,
  },
  remoteToggle: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleText: {
    marginLeft: 12,
    flex: 1,
  },
  toggleTitle: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  toggleSubtitle: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  currentLocation: {
    marginBottom: 16,
    borderColor: colors.primary,
  },
  locationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    marginLeft: 8,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  clearButton: {
    minWidth: 60,
  },
  selectionContainer: {
    marginBottom: 16,
  },
  selectButton: {
    borderColor: colors.primary,
  },
  selectButtonContent: {
    flexDirection: 'row-reverse',
  },
  cityPicker: {
    maxHeight: 400,
  },
  searchInput: {
    marginBottom: 12,
  },
  customLocationContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  customInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: colors.primary,
  },
  addButtonContent: {
    height: 48,
  },
  cityList: {
    maxHeight: 200,
  },
  citySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 8,
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cityChip: {
    margin: 4,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
  },
  noResults: {
    alignItems: 'center',
    padding: 24,
  },
  noResultsText: {
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  noResultsSubtext: {
    color: colors.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.background,
    marginTop: 16,
  },
  errorText: {
    color: colors.error,
    marginTop: 8,
  },
  tipsContainer: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  tipsText: {
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});

export default LocationSelector;