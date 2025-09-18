import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  Animated,
  Dimensions,
  StyleSheet
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface SearchSuggestion {
  id: string;
  text: string;
  category?: string;
  icon?: string;
}

interface UniversalSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  onSuggestionPress?: (suggestion: SearchSuggestion) => void;
  onClear?: () => void;
  showSuggestions?: boolean;
  searchHistory?: string[];
  onHistoryPress?: (term: string) => void;
  rightButtons?: React.ReactNode;
}

const { width } = Dimensions.get('window');

export default function UniversalSearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  suggestions = [],
  onSuggestionPress,
  onClear,
  showSuggestions = false,
  searchHistory = [],
  onHistoryPress,
  rightButtons
}: UniversalSearchBarProps) {
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (showSuggestions && (suggestions.length > 0 || searchHistory.length > 0)) {
      setShowSuggestionsModal(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay closing to allow suggestion taps
    setTimeout(() => setShowSuggestionsModal(false), 150);
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    animatePress();
    onSuggestionPress?.(suggestion);
    setShowSuggestionsModal(false);
  };

  const handleHistoryPress = (term: string) => {
    animatePress();
    onHistoryPress?.(term);
    setShowSuggestionsModal(false);
  };

  const handleClear = () => {
    animatePress();
    onClear?.();
  };

  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <View style={styles.suggestionContent}>
        <Feather 
          name={item.icon as any || 'search'} 
          size={16} 
          color="#666" 
          style={styles.suggestionIcon}
        />
        <View style={styles.suggestionText}>
          <Text style={styles.suggestionTitle}>{item.text}</Text>
          {item.category && (
            <Text style={styles.suggestionCategory}>{item.category}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleHistoryPress(item)}
    >
      <View style={styles.suggestionContent}>
        <Feather 
          name="clock" 
          size={16} 
          color="#999" 
          style={styles.suggestionIcon}
        />
        <Text style={styles.suggestionTitle}>{item}</Text>
      </View>
    </TouchableOpacity>
  );

  const hasSuggestions = suggestions.length > 0;
  const hasHistory = searchHistory.length > 0;

  return (
    <>
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[
          styles.searchBar,
          isFocused && styles.searchBarFocused
        ]}>
          <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor="#999"
            returnKeyType="search"
          />
          {value.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Feather name="x" size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        {rightButtons && (
          <View style={styles.rightButtons}>
            {rightButtons}
          </View>
        )}
      </Animated.View>

      <Modal
        visible={showSuggestionsModal}
        transparent={true}
        animationType="fade"
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSuggestionsModal(false)}
        >
          <View style={styles.suggestionsContainer}>
            {hasHistory && value.length === 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Feather name="clock" size={16} color="#666" />
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                </View>
                <FlatList
                  data={searchHistory}
                  renderItem={renderHistoryItem}
                  keyExtractor={(item, index) => `history-${index}`}
                  showsVerticalScrollIndicator={false}
                  style={styles.suggestionsList}
                />
              </>
            )}
            
            {hasSuggestions && (
              <>
                {hasHistory && value.length === 0 && (
                  <View style={styles.sectionDivider} />
                )}
                <View style={styles.sectionHeader}>
                  <Feather name="trending-up" size={16} color="#666" />
                  <Text style={styles.sectionTitle}>
                    {value.length > 0 ? 'Suggestions' : 'Popular Searches'}
                  </Text>
                </View>
                <FlatList
                  data={suggestions}
                  renderItem={renderSuggestion}
                  keyExtractor={item => item.id}
                  showsVerticalScrollIndicator={false}
                  style={styles.suggestionsList}
                />
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchBarFocused: {
    borderColor: '#007AFF',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingTop: 100, // Space for search bar
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    maxHeight: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 16,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    color: '#333',
  },
  suggestionCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});