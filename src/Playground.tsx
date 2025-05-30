import React, { useState } from 'react';
import {
	SafeAreaView,
	ScrollView,
	StatusBar,
	useColorScheme,
	useWindowDimensions,
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Modal,
	FlatList,
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import ShaderExample from './ShaderExample';
import { PokemonCard } from './PokemonCard';
import { LuffyExample } from './LuffyExample';
import {
	ShaderContainer,
	KaleidoscopeShader,
	SparkleShader,
	GlowShader,
	BloomGlowShader,
	MetallicShader,
} from './shader';

type BaseComponent = 'pokemon-card' | 'shader-canvas' | 'luffy-canvas';
type ShaderEffect = 'none' | 'sparkle' | 'glow' | 'bloom' | 'metallic' | 'shiny' | 'all';
type DisplayMode = 'circular' | 'original' | 'fullscreen';
type ShaderType = 'kaleidoscope' | 'sparkle' | 'glow' | 'bloom' | 'metallic' | 'example';
type ImageOption = 'pokemon-card' | 'trump' | 'wild-charge';

interface DropdownOption {
	label: string;
	value: string;
}

interface DropdownProps {
	title: string;
	options: DropdownOption[];
	selectedValue: string;
	onSelect: (value: string) => void;
	isDarkMode: boolean;
	textColor: string;
}

function CustomDropdown({ title, options, selectedValue, onSelect, isDarkMode, textColor }: DropdownProps) {
	const [isVisible, setIsVisible] = useState(false);
	
	const selectedLabel = options.find(option => option.value === selectedValue)?.label || 'Select Option';

	const renderDropdownItem = ({ item }: { item: DropdownOption }) => (
		<TouchableOpacity
			style={[
				styles.dropdownItem,
				{
					backgroundColor: item.value === selectedValue 
						? '#007AFF' 
						: (isDarkMode ? '#333' : '#fff'),
				}
			]}
			onPress={() => {
				onSelect(item.value);
				setIsVisible(false);
			}}
		>
			<Text style={[
				styles.dropdownItemText,
				{
					color: item.value === selectedValue ? '#fff' : textColor,
				}
			]}>
				{item.label}
			</Text>
		</TouchableOpacity>
	);

	return (
		<View style={styles.dropdownWrapper}>
			<Text style={[styles.dropdownTitle, { color: textColor }]}>{title}</Text>
			<TouchableOpacity
				style={[styles.dropdownButton, { 
					backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
					borderColor: isDarkMode ? '#555' : '#ccc'
				}]}
				onPress={() => setIsVisible(true)}
			>
				<Text style={[styles.dropdownButtonText, { color: textColor }]}>
					{selectedLabel}
				</Text>
				<Text style={[styles.dropdownArrow, { color: textColor }]}>▼</Text>
			</TouchableOpacity>

			<Modal
				visible={isVisible}
				transparent={true}
				animationType="fade"
				onRequestClose={() => setIsVisible(false)}
			>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={() => setIsVisible(false)}
				>
					<View style={[
						styles.dropdownModal,
						{
							backgroundColor: isDarkMode ? '#222' : '#fff',
							borderColor: isDarkMode ? '#555' : '#ccc',
						}
					]}>
						<View style={styles.modalHeader}>
							<Text style={[styles.modalTitle, { color: textColor }]}>
								{title}
							</Text>
							<TouchableOpacity
								style={styles.closeButton}
								onPress={() => setIsVisible(false)}
							>
								<Text style={[styles.closeButtonText, { color: textColor }]}>✕</Text>
							</TouchableOpacity>
						</View>
						<FlatList
							data={options}
							renderItem={renderDropdownItem}
							keyExtractor={(item) => item.value}
							style={styles.optionsList}
							showsVerticalScrollIndicator={false}
						/>
					</View>
				</TouchableOpacity>
			</Modal>
		</View>
	);
}

function Playground(): React.JSX.Element {
	const isDarkMode = useColorScheme() === 'dark';
	const { width, height } = useWindowDimensions();

	// Separate state for each dropdown
	const [baseComponent, setBaseComponent] = useState<BaseComponent>('pokemon-card');
	const [shaderEffect, setShaderEffect] = useState<ShaderEffect>('shiny');
	const [displayMode, setDisplayMode] = useState<DisplayMode>('circular');
	const [shaderType, setShaderType] = useState<ShaderType>('kaleidoscope');
	const [selectedImage, setSelectedImage] = useState<ImageOption>('pokemon-card');

	const backgroundStyle = {
		backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
	};

	const textColor = isDarkMode ? Colors.lighter : Colors.darker;

	// Dropdown options
	const baseComponentOptions: DropdownOption[] = [
		{ label: '🃏 Pokemon Card', value: 'pokemon-card' },
		{ label: '🎨 Shader Canvas', value: 'shader-canvas' },
		{ label: '🎭 Luffy Animation', value: 'luffy-canvas' },
	];

	const shaderEffectOptions: DropdownOption[] = [
		{ label: '🚫 None', value: 'none' },
		{ label: '✨ Sparkle', value: 'sparkle' },
		{ label: '🌟 Glow', value: 'glow' },
		{ label: '💫 Bloom', value: 'bloom' },
		{ label: '🥇 Metallic', value: 'metallic' },
		{ label: '✨ Shiny', value: 'shiny' },
		{ label: '🎆 All Effects', value: 'all' },
	];

	const displayModeOptions: DropdownOption[] = [
		{ label: '⭕ Circular Mask', value: 'circular' },
		{ label: '🖼️ Original Shape', value: 'original' },
		{ label: '📱 Fullscreen', value: 'fullscreen' },
	];

	const shaderTypeOptions: DropdownOption[] = [
		{ label: '🔮 Kaleidoscope', value: 'kaleidoscope' },
		{ label: '✨ Sparkle Shader', value: 'sparkle' },
		{ label: '🌟 Glow Shader', value: 'glow' },
		{ label: '💫 Bloom Shader', value: 'bloom' },
		{ label: '🥇 Metallic Shader', value: 'metallic' },
		{ label: '🎨 Example Demo', value: 'example' },
	];

	const imageOptions: DropdownOption[] = [
		{ label: '🃏 Pokemon Card', value: 'pokemon-card' },
		{ label: '🇺🇸 Trump Photo', value: 'trump' },
		{ label: '⚡ Wild Charge (Original)', value: 'wild-charge' },
	];

	const getImageUrl = (imageOption: ImageOption): string | undefined => {
		switch (imageOption) {
			case 'pokemon-card':
				return "https://ipfs.io/ipfs/QmWxapmp4HA1bMSQqF53ubhnVB6CXwWPaiTax2GnAnGDaj";
			case 'trump':
				return "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Donald_Trump_August_19%2C_2015_%28cropped%29.jpg/1200px-Donald_Trump_August_19%2C_2015_%28cropped%29.jpg";
			case 'wild-charge':
				return undefined; // This will use the default wild_charge.png with mask
			default:
				return undefined;
		}
	};

	const renderSelectedComponent = () => {
		// Handle Luffy canvas separately
		if (baseComponent === 'luffy-canvas') {
			return <LuffyExample />;
		}

		// Handle shader canvas
		if (baseComponent === 'shader-canvas') {
			let shaderCode = KaleidoscopeShader;
			switch (shaderType) {
				case 'sparkle':
					shaderCode = SparkleShader;
					break;
				case 'glow':
					shaderCode = GlowShader;
					break;
				case 'bloom':
					shaderCode = BloomGlowShader;
					break;
				case 'metallic':
					shaderCode = MetallicShader;
					break;
				case 'example':
					return <ShaderExample width={width} height={height} />;
				default:
					shaderCode = KaleidoscopeShader;
			}
			
			const canvasHeight = displayMode === 'fullscreen' ? height : height * 0.8;
			return <ShaderContainer width={width} height={canvasHeight} SkSLCode={shaderCode} />;
		}

		// Handle Pokemon card with combinations
		if (baseComponent === 'pokemon-card') {
			// Determine shader type based on selected effect
			let pokemonShaderType: 'sparkle' | 'glow' | 'bloom' | 'metallic' | 'both' | 'all' | 'shiny' | 'original' | 'none' = 'shiny';
			
			if (shaderEffect === 'none') {
				pokemonShaderType = 'none';
			} else if (shaderEffect === 'all') {
				pokemonShaderType = 'all';
			} else {
				pokemonShaderType = shaderEffect as any;
			}

			// Determine mask shape based on display mode
			const useCircularMask = displayMode !== 'original';

			// Get the image URL based on selection
			const imageUrl = getImageUrl(selectedImage);

			return (
				<PokemonCard
					imageUrl={imageUrl}
					shaderType={pokemonShaderType}
					maxWidth={displayMode === 'fullscreen' ? width : width * 0.9}
					useCircularMask={useCircularMask}
				/>
			);
		}

		// Fallback
		return <ShaderExample width={width} height={height} />;
	};

	return (
		<SafeAreaView style={backgroundStyle}>
			<StatusBar
				barStyle={isDarkMode ? 'light-content' : 'dark-content'}
				backgroundColor={backgroundStyle.backgroundColor}
			/>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				style={backgroundStyle}>

				{/* Multiple Dropdown Controls */}
				<View style={styles.controlsContainer}>
					<Text style={[styles.mainTitle, { color: textColor }]}>Mix & Match Options</Text>
					<Text style={[styles.subtitle, { color: textColor }]}>
						Combine different components, effects, and display modes
					</Text>
					
					{/* First Row */}
					<View style={styles.dropdownRow}>
						<View style={styles.dropdownHalf}>
							<CustomDropdown
								title="Base Component"
								options={baseComponentOptions}
								selectedValue={baseComponent}
								onSelect={(value) => setBaseComponent(value as BaseComponent)}
								isDarkMode={isDarkMode}
								textColor={textColor}
							/>
						</View>

						{baseComponent === 'pokemon-card' && (
							<View style={styles.dropdownHalf}>
								<CustomDropdown
									title="Image Selection"
									options={imageOptions}
									selectedValue={selectedImage}
									onSelect={(value) => setSelectedImage(value as ImageOption)}
									isDarkMode={isDarkMode}
									textColor={textColor}
								/>
							</View>
						)}

						{baseComponent === 'shader-canvas' && (
							<View style={styles.dropdownHalf}>
								<CustomDropdown
									title="Shader Type"
									options={shaderTypeOptions}
									selectedValue={shaderType}
									onSelect={(value) => setShaderType(value as ShaderType)}
									isDarkMode={isDarkMode}
									textColor={textColor}
								/>
							</View>
						)}

						{baseComponent === 'luffy-canvas' && (
							<View style={styles.dropdownHalf}>
								{/* Empty placeholder for luffy canvas */}
							</View>
						)}
					</View>

					{/* Second Row - Only show for pokemon-card and shader-canvas */}
					{(baseComponent === 'pokemon-card' || baseComponent === 'shader-canvas') && (
						<View style={styles.dropdownRow}>
							{baseComponent === 'pokemon-card' && (
								<>
									<View style={styles.dropdownHalf}>
										<CustomDropdown
											title="Shader Effect"
											options={shaderEffectOptions}
											selectedValue={shaderEffect}
											onSelect={(value) => setShaderEffect(value as ShaderEffect)}
											isDarkMode={isDarkMode}
											textColor={textColor}
										/>
									</View>
									
									<View style={styles.dropdownHalf}>
										<CustomDropdown
											title="Display Mode"
											options={displayModeOptions}
											selectedValue={displayMode}
											onSelect={(value) => setDisplayMode(value as DisplayMode)}
											isDarkMode={isDarkMode}
											textColor={textColor}
										/>
									</View>
								</>
							)}

							{baseComponent === 'shader-canvas' && (
								<>
									<View style={styles.dropdownHalf}>
										<CustomDropdown
											title="Display Mode"
											options={displayModeOptions}
											selectedValue={displayMode}
											onSelect={(value) => setDisplayMode(value as DisplayMode)}
											isDarkMode={isDarkMode}
											textColor={textColor}
										/>
									</View>
									<View style={styles.dropdownHalf}>
										{/* Empty placeholder for shader canvas second option */}
									</View>
								</>
							)}
						</View>
					)}
				</View>

				{/* Render Selected Component */}
				<View style={styles.debugContainer}>
					<Text style={[styles.debugText, { color: textColor }]}>
						Current: {baseComponent} | {baseComponent === 'pokemon-card' ? `${selectedImage} + ${shaderEffect} + ${displayMode}` : baseComponent === 'shader-canvas' ? `${shaderType} + ${displayMode}` : 'animation'}
					</Text>
				</View>
				{renderSelectedComponent()}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	controlsContainer: {
		padding: 12,
		paddingBottom: 6,
	},
	mainTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 3,
	},
	subtitle: {
		fontSize: 13,
		opacity: 0.7,
		marginBottom: 12,
	},
	dropdownWrapper: {
		marginBottom: 10,
		marginHorizontal: 4,
	},
	dropdownTitle: {
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 4,
	},
	dropdownButton: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 10,
		borderRadius: 6,
		borderWidth: 1,
		minHeight: 40,
	},
	dropdownButtonText: {
		fontSize: 14,
		flex: 1,
	},
	dropdownArrow: {
		fontSize: 10,
		marginLeft: 6,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	dropdownModal: {
		width: '100%',
		maxHeight: '70%',
		borderRadius: 10,
		borderWidth: 1,
		overflow: 'hidden',
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	modalTitle: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	closeButton: {
		padding: 4,
	},
	closeButtonText: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	optionsList: {
		maxHeight: 300,
	},
	dropdownItem: {
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		minHeight: 44,
		justifyContent: 'center',
	},
	dropdownItemText: {
		fontSize: 14,
	},
	debugContainer: {
		padding: 12,
		marginBottom: 8,
	},
	debugText: {
		fontSize: 12,
		opacity: 0.7,
	},
	dropdownRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	dropdownHalf: {
		flex: 1,
	},
});

export default Playground;
