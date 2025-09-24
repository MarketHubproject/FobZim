import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';

// Colors
const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  textPrimary: '#212121',
  textSecondary: '#757575',
  muted: '#BDBDBD',
  white: '#FFFFFF'
};

interface TypingIndicatorProps {
  visible: boolean;
  typingUser?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  visible, 
  typingUser = 'Someone' 
}) => {
  const dot1Ref = useRef(new Animated.Value(0)).current;
  const dot2Ref = useRef(new Animated.Value(0)).current;
  const dot3Ref = useRef(new Animated.Value(0)).current;
  const containerOpacityRef = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in container
      Animated.timing(containerOpacityRef, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Animate dots in sequence
      const animateDots = () => {
        const animateDot = (dotRef: Animated.Value, delay: number) => {
          return Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dotRef, {
              toValue: -8,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dotRef, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            })
          ]);
        };

        Animated.loop(
          Animated.parallel([
            animateDot(dot1Ref, 0),
            animateDot(dot2Ref, 200),
            animateDot(dot3Ref, 400),
          ])
        ).start();
      };

      animateDots();
    } else {
      // Fade out container
      Animated.timing(containerOpacityRef, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, dot1Ref, dot2Ref, dot3Ref, containerOpacityRef]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { opacity: containerOpacityRef }
      ]}
    >
      <View style={styles.content}>
        <View style={styles.avatar}>
          <View style={styles.avatarPlaceholder} />
        </View>
        
        <View style={styles.bubble}>
          <View style={styles.dotsContainer}>
            <Animated.View 
              style={[
                styles.dot, 
                { transform: [{ translateY: dot1Ref }] }
              ]} 
            />
            <Animated.View 
              style={[
                styles.dot, 
                { transform: [{ translateY: dot2Ref }] }
              ]} 
            />
            <Animated.View 
              style={[
                styles.dot, 
                { transform: [{ translateY: dot3Ref }] }
              ]} 
            />
          </View>
        </View>
      </View>
      
      <Text style={styles.typingText}>
        {typingUser} is typing...
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.muted,
    opacity: 0.7,
  },
  bubble: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 30,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.muted,
  },
  typingText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginLeft: 44,
    marginTop: 4,
  },
});

export default TypingIndicator;