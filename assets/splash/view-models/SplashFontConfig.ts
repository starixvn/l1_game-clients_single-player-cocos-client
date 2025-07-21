/**
 * Splash Font Configuration
 * Manages which fonts should be preloaded during splash screen
 */

export interface SplashFontConfig {
    /** Fonts to preload during splash screen */
    essentialFonts: string[];
    /** Percentage of splash progress allocated to font loading (0-1) */
    fontLoadingProgressWeight: number;
    /** Whether to show detailed font loading progress */
    showDetailedProgress: boolean;
    /** Timeout for font loading in milliseconds */
    fontLoadingTimeout: number;
    /** Whether to continue if font loading fails */
    continueOnFontError: boolean;
}

/**
 * Default splash font configuration
 */
export const DEFAULT_SPLASH_FONT_CONFIG: SplashFontConfig = {
    essentialFonts: [
        'PingFang-Bold',      // Primary bold font
        'PingFang-Regular',   // Primary regular font
        'NotoSans-Bold',      // Fallback bold font
        'NotoSans-Regular'    // Fallback regular font
    ],
    fontLoadingProgressWeight: 0.3, // 30% of splash progress
    showDetailedProgress: true,
    fontLoadingTimeout: 30000, // 30 seconds
    continueOnFontError: true
};

/**
 * Mobile-optimized font configuration
 */
export const MOBILE_SPLASH_FONT_CONFIG: SplashFontConfig = {
    essentialFonts: [
        'PingFang-Bold',      // Primary bold font only
        'PingFang-Regular'    // Primary regular font only
    ],
    fontLoadingProgressWeight: 0.25, // 25% of splash progress (faster loading)
    showDetailedProgress: false,     // Less detailed progress for mobile
    fontLoadingTimeout: 20000,       // 20 seconds timeout
    continueOnFontError: true
};

/**
 * Performance-optimized font configuration
 */
export const PERFORMANCE_SPLASH_FONT_CONFIG: SplashFontConfig = {
    essentialFonts: [
        'PingFang-Bold'       // Only the most essential font
    ],
    fontLoadingProgressWeight: 0.2,  // 20% of splash progress
    showDetailedProgress: false,
    fontLoadingTimeout: 15000,       // 15 seconds timeout
    continueOnFontError: true
};

/**
 * Get appropriate font configuration based on platform and performance requirements
 */
export function getSplashFontConfig(): SplashFontConfig {
    // Check if we're on mobile
    if (cc.sys.isMobile) {
        return MOBILE_SPLASH_FONT_CONFIG;
    }

    // Check if we're in performance mode (could be set via URL params or config)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('performance') === 'true') {
        return PERFORMANCE_SPLASH_FONT_CONFIG;
    }

    // Default configuration
    return DEFAULT_SPLASH_FONT_CONFIG;
}

/**
 * Validate font configuration
 */
export function validateSplashFontConfig(config: SplashFontConfig): boolean {
    if (!config.essentialFonts || config.essentialFonts.length === 0) {
        cc.error('[SplashFontConfig] No essential fonts defined');
        return false;
    }

    if (config.fontLoadingProgressWeight < 0 || config.fontLoadingProgressWeight > 1) {
        cc.error('[SplashFontConfig] Invalid font loading progress weight');
        return false;
    }

    if (config.fontLoadingTimeout <= 0) {
        cc.error('[SplashFontConfig] Invalid font loading timeout');
        return false;
    }

    return true;
}

/**
 * Get font loading statistics
 */
export async function getFontLoadingStats(): Promise<{
    totalFonts: number;
    availableFonts: number;
    missingFonts: string[];
    config: SplashFontConfig;
}> {
    const config = getSplashFontConfig();
    const stats = {
        totalFonts: config.essentialFonts.length,
        availableFonts: 0,
        missingFonts: [] as string[],
        config
    };

    // Check availability of each font
    for (const fontName of config.essentialFonts) {
        try {
            const isAvailable = await import('../../common/utils/ChunkedFontLoader')
                .then(module => module.default.isChunkedFontAvailable(fontName));

            if (isAvailable) {
                stats.availableFonts++;
            } else {
                stats.missingFonts.push(fontName);
            }
        } catch (error) {
            cc.warn(`[SplashFontConfig] Error checking font ${fontName}:`, error);
            stats.missingFonts.push(fontName);
        }
    }

    return stats;
} 