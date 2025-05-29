import React, { useState } from 'react';
import {
	SafeAreaView,
	ScrollView,
	StatusBar,
	useColorScheme,
	useWindowDimensions,
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import ShaderExample from './ShaderExample';
import { PokemonCard } from './PokemonCard';
import { LuffyExample } from './LuffyExample';

function Playground(): React.JSX.Element {
	const isDarkMode = useColorScheme() === 'dark';
	const { width, height } = useWindowDimensions();

	// Toggle states for each component
	const [activeComponent, setActiveComponent] = useState<'shader' | 'luffy' | 'pokemon' | null>('shader');

	const backgroundStyle = {
		backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
	};

	const textColor = isDarkMode ? Colors.lighter : Colors.darker;

	return (
		<SafeAreaView style={backgroundStyle}>
			<StatusBar
				barStyle={isDarkMode ? 'light-content' : 'dark-content'}
				backgroundColor={backgroundStyle.backgroundColor}
			/>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				style={backgroundStyle}>

				{/* Toggle Controls */}
				<View style={styles.toggleContainer}>
					<Text style={[styles.title, { color: textColor }]}>Toggles</Text>

					<View style={styles.buttonRow}>
						<TouchableOpacity
							style={[styles.toggleButton, activeComponent === 'shader' && styles.activeButton]}
							onPress={() => setActiveComponent('shader')}>
							<Text style={[styles.buttonText, activeComponent === 'shader' && styles.activeButtonText]}>
								Shader {activeComponent === 'shader' ? '✓' : '○'}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.toggleButton, activeComponent === 'luffy' && styles.activeButton]}
							onPress={() => setActiveComponent('luffy')}>
							<Text style={[styles.buttonText, activeComponent === 'luffy' && styles.activeButtonText]}>
								Luffy {activeComponent === 'luffy' ? '✓' : '○'}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.toggleButton, activeComponent === 'pokemon' && styles.activeButton]}
							onPress={() => setActiveComponent('pokemon')}>
							<Text style={[styles.buttonText, activeComponent === 'pokemon' && styles.activeButtonText]}>
								Pokemon {activeComponent === 'pokemon' ? '✓' : '○'}
							</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Conditional Rendering */}
				{activeComponent === 'shader' && <ShaderExample width={width} height={height} />}
				{activeComponent === 'luffy' && <LuffyExample />}
				{activeComponent === 'pokemon' && (
					<PokemonCard
						imageUrl="https://ipfs.io/ipfs/QmWxapmp4HA1bMSQqF53ubhnVB6CXwWPaiTax2GnAnGDaj"
					// imageUrl="https://trumpwhitehouse.archives.gov/wp-content/uploads/2017/11/President-Trump-Official-Portrait-620x620.jpg"
					/>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	toggleContainer: {
		padding: 15,
		paddingBottom: 10,
	},
	title: {
		fontSize: 14,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	toggleButton: {
		flex: 1,
		padding: 8,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: '#ccc',
		backgroundColor: '#f5f5f5',
	},
	activeButton: {
		backgroundColor: '#007AFF',
		borderColor: '#007AFF',
	},
	buttonText: {
		fontSize: 12,
		color: '#333',
		textAlign: 'center',
		fontWeight: '500',
	},
	activeButtonText: {
		color: 'white',
		fontWeight: 'bold',
	},
	buttonRow: {
		flexDirection: 'row',
		gap: 8,
	},
});

export default Playground;
