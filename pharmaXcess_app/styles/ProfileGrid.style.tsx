import { StyleSheet, Dimensions } from 'react-native';
import { ColorScheme } from './Colors';

const { width } = Dimensions.get('window');

const createStyles = (colors: ColorScheme, fontScale: number) => StyleSheet.create({
    gridContainer: {
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between',
        paddingHorizontal: 0, 
    },
    gridCard: { 
        width: (width - 60) / 2, // 2 columns with spacing 
        aspectRatio: 1, // Square 
        marginBottom: 15, 
        borderRadius: 15, 
        overflow: 'hidden',
        shadowColor: colors.shadow, 
        shadowOffset: { width: 0, height: 4}, 
        shadowOpacity: 0.2, 
        shadowRadius: 6, 
        elevation: 5, 
    },
    gridCardGradient: {
        flex: 1, 
        padding: 15, 
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridCardIcon: { 
        marginBottom: 10, 
    },
    gridCardText: { 
        fontSize: 14 * fontScale, 
        color: colors.iconPrimary, 
        fontWeight: 'bold', 
        textAlign: 'center',
    },
});

export default createStyles;
