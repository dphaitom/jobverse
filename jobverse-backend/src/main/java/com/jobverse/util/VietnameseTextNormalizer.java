package com.jobverse.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

/**
 * Utility class for normalizing Vietnamese text
 * Removes diacritics and converts to lowercase for search purposes
 *
 * Examples:
 * "Hồ Chí Minh" → "ho chi minh"
 * "Lập Trình Viên" → "lap trinh vien"
 * "Đà Nẵng" → "da nang"
 */
public class VietnameseTextNormalizer {

    private static final Pattern DIACRITICS_PATTERN = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

    /**
     * Normalize Vietnamese text by removing diacritics and converting to lowercase
     *
     * @param text The text to normalize
     * @return Normalized text without diacritics in lowercase
     */
    public static String normalize(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }

        // Convert to lowercase first
        String normalized = text.toLowerCase();

        // Replace Vietnamese characters that don't have direct NFD decomposition
        normalized = normalized.replace('đ', 'd');
        normalized = normalized.replace('Đ', 'd');

        // Normalize using NFD (Canonical Decomposition)
        // This separates base characters from diacritics
        normalized = Normalizer.normalize(normalized, Normalizer.Form.NFD);

        // Remove all diacritics
        normalized = DIACRITICS_PATTERN.matcher(normalized).replaceAll("");

        // Remove extra whitespace
        normalized = normalized.trim().replaceAll("\\s+", " ");

        return normalized;
    }

    /**
     * Check if two Vietnamese texts match when normalized
     *
     * @param text1 First text
     * @param text2 Second text
     * @return true if normalized texts match
     */
    public static boolean matches(String text1, String text2) {
        return normalize(text1).equals(normalize(text2));
    }

    /**
     * Check if text contains search term (case and diacritic insensitive)
     *
     * @param text The text to search in
     * @param searchTerm The term to search for
     * @return true if normalized text contains normalized search term
     */
    public static boolean contains(String text, String searchTerm) {
        if (text == null || searchTerm == null) {
            return false;
        }
        return normalize(text).contains(normalize(searchTerm));
    }
}
