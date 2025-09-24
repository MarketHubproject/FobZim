import React, { useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Text, Card, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/tokens';
import { createFadeAnimation, ANIMATION_DURATION, EASING } from '../utils/animations';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = 150;
const ACTION_THRESHOLD = 80;

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: string;
    color: string;
    label: string;
  };
  rightAction?: {
    icon: string;
    color: string;
    label: string;
  };
  disabled?: boolean;
}

export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  disabled = false
}: SwipeableCardProps) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isActive, setIsActive] = useState(false);
  const [leftActionTriggered, setLeftActionTriggered] = useState(false);
  const [rightActionTriggered, setRightActionTriggered] = useState(false);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { 
      useNativeDriver: true,
      listener: (event: any) => {
        if (disabled) return;
        
        const { translationX } = event.nativeEvent;
        const absX = Math.abs(translationX);
        
        // Trigger haptic feedback when crossing action threshold
        if (absX > ACTION_THRESHOLD && !isActive) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setIsActive(true);
        } else if (absX <= ACTION_THRESHOLD && isActive) {
          setIsActive(false);
        }
        
        // Check for left action trigger
        if (translationX < -ACTION_THRESHOLD && !leftActionTriggered && leftAction) {
          setLeftActionTriggered(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else if (translationX >= -ACTION_THRESHOLD && leftActionTriggered) {
          setLeftActionTriggered(false);
        }
        
        // Check for right action trigger
        if (translationX > ACTION_THRESHOLD && !rightActionTriggered && rightAction) {
          setRightActionTriggered(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else if (translationX <= ACTION_THRESHOLD && rightActionTriggered) {
          setRightActionTriggered(false);
        }
      }
    }
  );

  const onHandlerStateChange = (event: any) => {
    if (disabled) return;
    
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX, velocityX } = event.nativeEvent;
      
      // Determine if swipe should trigger action
      const shouldTriggerLeft = translationX < -SWIPE_THRESHOLD || 
        (translationX < -ACTION_THRESHOLD && velocityX < -500);
      const shouldTriggerRight = translationX > SWIPE_THRESHOLD || 
        (translationX > ACTION_THRESHOLD && velocityX > 500);
      
      if (shouldTriggerLeft && onSwipeLeft) {
        // Animate to left and trigger action
        Animated.timing(translateX, {
          toValue: -screenWidth,
          duration: ANIMATION_DURATION.NORMAL,
          easing: EASING.EASE_OUT,
          useNativeDriver: true,
        }).start(() => {
          onSwipeLeft();
          resetCard();
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else if (shouldTriggerRight && onSwipeRight) {
        // Animate to right and trigger action
        Animated.timing(translateX, {
          toValue: screenWidth,
          duration: ANIMATION_DURATION.NORMAL,
          easing: EASING.EASE_OUT,
          useNativeDriver: true,
        }).start(() => {
          onSwipeRight();
          resetCard();
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else {
        // Snap back to center
        Animated.spring(translateX, {
          toValue: 0,
          damping: 20,
          stiffness: 300,
          useNativeDriver: true,
        }).start();
      }
      
      setIsActive(false);
      setLeftActionTriggered(false);
      setRightActionTriggered(false);
    }
  };

  const resetCard = () => {
    translateX.setValue(0);
  };

  return (
    <View style={styles.swipeContainer}>
      {/* Background Actions */}
      <View style={styles.actionsContainer}>
        {/* Left Action (Swipe Right to Reveal) */}
        {leftAction && (
          <Animated.View
            style={[
              styles.leftActionContainer,
              {
                backgroundColor: leftAction.color,
                opacity: translateX.interpolate({
                  inputRange: [-screenWidth, -ACTION_THRESHOLD, 0],
                  outputRange: [1, 0.8, 0],
                  extrapolate: 'clamp',
                }),
                transform: [{
                  scale: translateX.interpolate({
                    inputRange: [-screenWidth, -ACTION_THRESHOLD, 0],
                    outputRange: [1, 1.1, 0.8],
                    extrapolate: 'clamp',
                  })
                }]
              }
            ]}
          >
            <MaterialCommunityIcons 
              name={leftAction.icon} 
              size={28} 
              color={colors.white} 
            />
            <Text style={styles.actionText}>{leftAction.label}</Text>
          </Animated.View>
        )}
        
        {/* Right Action (Swipe Left to Reveal) */}
        {rightAction && (
          <Animated.View
            style={[
              styles.rightActionContainer,
              {
                backgroundColor: rightAction.color,
                opacity: translateX.interpolate({
                  inputRange: [0, ACTION_THRESHOLD, screenWidth],
                  outputRange: [0, 0.8, 1],
                  extrapolate: 'clamp',
                }),
                transform: [{
                  scale: translateX.interpolate({
                    inputRange: [0, ACTION_THRESHOLD, screenWidth],
                    outputRange: [0.8, 1.1, 1],
                    extrapolate: 'clamp',
                  })
                }]
              }
            ]}
          >
            <MaterialCommunityIcons 
              name={rightAction.icon} 
              size={28} 
              color={colors.white} 
            />
            <Text style={styles.actionText}>{rightAction.label}</Text>
          </Animated.View>
        )}
      </View>

      {/* Main Card */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-30, 30]}
        enabled={!disabled}
      >
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [
                { 
                  translateX: translateX.interpolate({
                    inputRange: [-screenWidth * 2, screenWidth * 2],
                    outputRange: [-screenWidth, screenWidth],
                    extrapolate: 'clamp',
                  })
                },
                {
                  scale: isActive ? 1.02 : 1
                }
              ],
              elevation: isActive ? 8 : 4,
            }
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
  threshold?: number;
}

export const PullToRefresh = ({
  children,
  onRefresh,
  refreshing = false,
  threshold = 100
}: PullToRefreshProps) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        const { translationY: y } = event.nativeEvent;
        
        if (y > threshold && !canRefresh && !isRefreshing) {
          setCanRefresh(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (y <= threshold && canRefresh) {
          setCanRefresh(false);
        }
      }
    }
  );

  const onHandlerStateChange = async (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE && !isRefreshing) {
      const { translationY: y } = event.nativeEvent;
      
      if (y > threshold) {
        setIsRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Show refresh animation
        Animated.timing(translateY, {
          toValue: threshold,
          duration: ANIMATION_DURATION.FAST,
          useNativeDriver: true,
        }).start();
        
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setCanRefresh(false);
          
          // Hide refresh animation
          Animated.timing(translateY, {
            toValue: 0,
            duration: ANIMATION_DURATION.NORMAL,
            useNativeDriver: true,
          }).start();
        }
      } else {
        // Snap back
        Animated.spring(translateY, {
          toValue: 0,
          damping: 15,
          stiffness: 300,
          useNativeDriver: true,
        }).start();
        setCanRefresh(false);
      }
    }
  };

  return (
    <View style={styles.pullToRefreshContainer}>
      {/* Refresh Indicator */}
      <Animated.View
        style={[
          styles.refreshIndicator,
          {
            opacity: translateY.interpolate({
              inputRange: [0, threshold],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
            transform: [
              {
                rotate: translateY.interpolate({
                  inputRange: [0, threshold],
                  outputRange: ['0deg', '180deg'],
                  extrapolate: 'clamp',
                })
              }
            ]
          }
        ]}
      >
        <MaterialCommunityIcons
          name={isRefreshing ? 'loading' : canRefresh ? 'check' : 'arrow-down'}
          size={24}
          color={canRefresh ? colors.success : colors.primary}
        />
        <Text style={[
          styles.refreshText,
          { color: canRefresh ? colors.success : colors.primary }
        ]}>
          {isRefreshing ? 'Refreshing...' : canRefresh ? 'Release to refresh' : 'Pull to refresh'}
        </Text>
      </Animated.View>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetY={10}
        failOffsetX={[-30, 30]}
        enabled={!refreshing}
      >
        <Animated.View
          style={[
            styles.pullToRefreshContent,
            {
              transform: [
                {
                  translateY: translateY.interpolate({
                    inputRange: [0, threshold * 2],
                    outputRange: [0, threshold],
                    extrapolate: 'clamp',
                  })
                }
              ]
            }
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

interface DoubleTapProps {
  children: React.ReactNode;
  onDoubleTap?: () => void;
  onSingleTap?: () => void;
  doubleTapInterval?: number;
}

export const DoubleTapHandler = ({
  children,
  onDoubleTap,
  onSingleTap,
  doubleTapInterval = 300
}: DoubleTapProps) => {
  const lastTap = useRef(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap.current;

    if (timeSinceLastTap < doubleTapInterval) {
      // Double tap detected
      if (onDoubleTap) {
        onDoubleTap();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Double tap animation
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: ANIMATION_DURATION.FAST,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: ANIMATION_DURATION.FAST,
            useNativeDriver: true,
          })
        ]).start();
      }
    } else {
      // Single tap
      setTimeout(() => {
        const timeSinceThisTap = Date.now() - now;
        if (timeSinceThisTap >= doubleTapInterval && onSingleTap) {
          onSingleTap();
        }
      }, doubleTapInterval);
    }

    lastTap.current = now;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <View onTouchEnd={handleTap}>
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    position: 'relative',
    marginVertical: spacing.xs,
  },
  actionsContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 1,
  },
  leftActionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.md,
    marginRight: spacing.xs,
  },
  rightActionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.md,
    marginLeft: spacing.xs,
  },
  actionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  cardContainer: {
    zIndex: 2,
  },
  pullToRefreshContainer: {
    flex: 1,
  },
  refreshIndicator: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  pullToRefreshContent: {
    flex: 1,
  },
});