import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider, Card, Button } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Define colors
const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  textPrimary: '#212121',
  textSecondary: '#757575',
  muted: '#BDBDBD',
  white: '#FFFFFF',
};

// Home Screen Component
function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Welcome to ZimBuzz! 🇿🇼</Text>
        <Text style={styles.welcomeSubtitle}>
          Discover Zimbabwe's rising content creators
        </Text>
      </View>

      <Card style={styles.card} elevation={2}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons 
              name="lightbulb" 
              size={24} 
              color={colors.secondary} 
            />
            <Text style={styles.cardTitle}>Creator Tip of the Day</Text>
          </View>
          <Text style={styles.cardContent}>
            Consistency is key! Post regularly to keep your audience engaged and grow your following.
          </Text>
          <Button mode="outlined" style={styles.tipButton}>
            Save Tip
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card} elevation={2}>
        <Card.Content>
          <Text style={styles.cardTitle}>Featured Creators</Text>
          <Text style={styles.cardContent}>
            Discover talented creators from Zimbabwe making waves in the digital space.
          </Text>
          <Button mode="contained" style={styles.button}>
            Explore Creators
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card} elevation={2}>
        <Card.Content>
          <Text style={styles.cardTitle}>Brand Opportunities</Text>
          <Text style={styles.cardContent}>
            Connect with brands looking for authentic voices to represent their products.
          </Text>
          <Button mode="contained" style={styles.button}>
            View Campaigns
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

// Creators Screen Component
function CreatorsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Creators</Text>
        <Text style={styles.sectionSubtitle}>
          Rising stars from Zimbabwe
        </Text>
      </View>

      {[1, 2, 3].map((item) => (
        <Card key={item} style={styles.card} elevation={2}>
          <Card.Content>
            <View style={styles.creatorHeader}>
              <MaterialCommunityIcons 
                name="account-star" 
                size={40} 
                color={colors.primary} 
              />
              <View style={styles.creatorInfo}>
                <Text style={styles.creatorName}>Creator {item}</Text>
                <Text style={styles.creatorBio}>Content Creator • 10K followers</Text>
              </View>
            </View>
            <Text style={styles.cardContent}>
              Creating amazing content about Zimbabwean culture and lifestyle.
            </Text>
            <View style={styles.buttonRow}>
              <Button mode="outlined" style={styles.smallButton}>
                Follow
              </Button>
              <Button mode="contained" style={styles.smallButton}>
                View Profile
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

// Campaigns Screen Component
function CampaignsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Brand Campaigns</Text>
        <Text style={styles.sectionSubtitle}>
          Opportunities for creators
        </Text>
      </View>

      {[1, 2, 3].map((item) => (
        <Card key={item} style={styles.card} elevation={2}>
          <Card.Content>
            <View style={styles.campaignHeader}>
              <Text style={styles.campaignBrand}>Brand {item}</Text>
              <View style={styles.budgetContainer}>
                <MaterialCommunityIcons 
                  name="currency-usd" 
                  size={16} 
                  color={colors.secondary} 
                />
                <Text style={styles.budgetText}>$500</Text>
              </View>
            </View>
            <Text style={styles.cardContent}>
              Looking for authentic voices to showcase our latest products to Zimbabwean audiences.
            </Text>
            <View style={styles.buttonRow}>
              <Button mode="outlined" style={styles.smallButton}>
                Save
              </Button>
              <Button mode="contained" style={styles.smallButton}>
                Apply Now
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

// Simple Screen Components for other tabs
function TrendsScreen() {
  return (
    <View style={styles.centerContainer}>
      <MaterialCommunityIcons name="trending-up" size={64} color={colors.primary} />
      <Text style={styles.centerTitle}>Trends Screen</Text>
      <Text style={styles.centerSubtitle}>Coming Soon</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.centerContainer}>
      <MaterialCommunityIcons name="account-circle" size={64} color={colors.primary} />
      <Text style={styles.centerTitle}>Profile Screen</Text>
      <Text style={styles.centerSubtitle}>Coming Soon</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

                switch (route.name) {
                  case 'Home':
                    iconName = focused ? 'home' : 'home-outline';
                    break;
                  case 'Creators':
                    iconName = focused ? 'account-star' : 'account-star-outline';
                    break;
                  case 'Campaigns':
                    iconName = focused ? 'briefcase' : 'briefcase-outline';
                    break;
                  case 'Trends':
                    iconName = focused ? 'trending-up' : 'trending-up';
                    break;
                  case 'Profile':
                    iconName = focused ? 'account-circle' : 'account-circle-outline';
                    break;
                  default:
                    iconName = 'help-circle-outline';
                }

                return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.muted,
              headerStyle: {
                backgroundColor: colors.primary,
              },
              headerTintColor: colors.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              tabBarStyle: {
                backgroundColor: colors.surface,
                borderTopColor: colors.muted,
                paddingTop: 5,
                paddingBottom: 5,
                height: 60,
              },
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'FobZim' }} />
            <Tab.Screen name="Creators" component={CreatorsScreen} />
            <Tab.Screen name="Campaigns" component={CampaignsScreen} />
            <Tab.Screen name="Trends" component={TrendsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
          </Tab.Navigator>
          <StatusBar style="light" backgroundColor={colors.primary} />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  centerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: colors.textPrimary,
  },
  centerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  welcomeSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  cardContent: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
  },
  tipButton: {
    borderColor: colors.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallButton: {
    flex: 1,
  },
  creatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  creatorBio: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  campaignBrand: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.secondary,
    marginLeft: 4,
  },
  spacer: {
    height: 20,
  },
});