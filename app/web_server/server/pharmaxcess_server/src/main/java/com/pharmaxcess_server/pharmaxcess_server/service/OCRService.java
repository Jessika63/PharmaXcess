package com.pharmaxcess_server.pharmaxcess_server.service;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service class for performing OCR (Optical Character Recognition) on images using Tesseract.
 * This class is responsible for:
 * <ul>
 *   <li>Running OCR on uploaded image files</li>
 *   <li>Extracting structured information (first name, last name) from the OCRed text</li>
 *   <li>Normalizing extracted names into a standardized format</li>
 * </ul>
 *
 * <b>Notes:</b>
 * - Requires Tesseract and language data files (tessdata) installed.
 * - This service is configured to use French ("fra") language OCR.
 * - For production, consider cloud-based OCR providers for higher accuracy and scalability.
 */
@Service
public class OCRService {
    private Tesseract tesseract;

    /**
     * Default constructor for {@code OCRService}.
     * Initializes the Tesseract instance with the datapath and language configuration.
     */
    public OCRService() {
        tesseract = new Tesseract();
        tesseract.setDatapath("/usr/share/tessdata");
        tesseract.setLanguage("fra");
        // tesseract.setTessVariable("preserve_interword_spaces", "1");
    }

    /**
     * Performs OCR on the uploaded {@link MultipartFile} and returns the raw text.
     *
     * @param multipartFile the uploaded image file (e.g., prescription photo)
     * @return the extracted text as a {@link String} (may be empty if nothing recognized)
     * @throws IOException if the file cannot be read or is not a valid image
     * @throws TesseractException if an OCR error occurs while processing the image
     */
    public String performOcr(MultipartFile multipartFile) throws IOException, TesseractException {
        // Convert MultipartFile -> temporary File
        File tmp = File.createTempFile("upload-", Objects.requireNonNull(multipartFile.getOriginalFilename()));
        try (FileOutputStream fos = new FileOutputStream(tmp)) {
            fos.write(multipartFile.getBytes());
        }

        // Verify the file is a readable image
        try {
            BufferedImage img = ImageIO.read(tmp);
            if (img == null) throw new IOException("Not a readable image");
        } catch (IOException e) {
            Files.deleteIfExists(tmp.toPath());
            throw e;
        }

        try {
            String result = tesseract.doOCR(tmp);
            return result == null ? "" : result;
        } finally {
            Files.deleteIfExists(tmp.toPath());
        }
    }

    /**
     * Attempts to extract last name and first name from the OCRed text using heuristics.
     * Heuristics include:
     * <ul>
     *   <li>Explicit labels ("Nom", "Prénom")</li>
     *   <li>Patterns like "SURNAME Firstname"</li>
     *   <li>Separators such as "/", ";", ","</li>
     *   <li>Fallback regex for "LASTNAME Firstname"</li>
     * </ul>
     *
     * @param text the raw OCR text to analyze
     * @return a {@link Map} with extracted names:
     *         <ul>
     *           <li>{@code "lastName"} → detected last name (may be null)</li>
     *           <li>{@code "firstName"} → detected first name (may be null)</li>
     *         </ul>
     */
    public Map<String, String> extractNamesFromText(String text) {
        Map<String, String> result = new HashMap<>();
        if (text == null || text.isEmpty()) return result;

        String[] lines = text.split("\n");

        // 1) explicit patterns
        Pattern nomPattern = Pattern.compile("(?i)\\bNom\\b\\s*[:\\-]?\\s*([A-ZÀ-Ÿ\\- ]{2,})");
        Pattern prenomPattern = Pattern.compile("(?i)\\bPrénom\\b\\s*[:\\-]?\\s*([A-ZÀ-Ÿ][a-zà-ÿ\\- ]{1,})");

        Matcher mNom = nomPattern.matcher(text);
        if (mNom.find()) {
            String nom = mNom.group(1).trim();
            result.put("lastName", normalizeName(nom));
        }

        Matcher mPrenom = prenomPattern.matcher(text);
        if (mPrenom.find()) {
            String prenom = mPrenom.group(1).trim();
            result.put("firstName", normalizeName(prenom));
        }

        // 2) heuristics on lines if labels were not sufficient
        if (!result.containsKey("lastName") || !result.containsKey("firstName")) {
            for (String rawLine : lines) {
                String line = rawLine.trim();
                if (line.length() < 3) continue;

                // Possible format: SURNAME Firstname (surname often in UPPERCASE)
                String[] tokens = line.split("\\s+");
                if (tokens.length >= 2) {
                    String maybeSurname = tokens[0];
                    String maybeFirstname = tokens[1];

                    boolean surnameLooksLikeUpper = maybeSurname.equals(maybeSurname.toUpperCase()) && maybeSurname.length() >= 2;
                    boolean firstnameLooksLikeCap = Character.isUpperCase(maybeFirstname.charAt(0));

                    if (!result.containsKey("lastName") && surnameLooksLikeUpper && firstnameLooksLikeCap) {
                        result.put("lastName", normalizeName(maybeSurname));
                        result.put("firstName", normalizeName(maybeFirstname));
                        break;
                    }

                    // Heuristic: same line contains separators like '/' or ','
                    if (line.contains("/") || line.contains(";") || line.contains(",")) {
                        String sep = line.contains("/") ? "/" : (line.contains(";") ? ";" : ",");
                        String[] parts = line.split(Pattern.quote(sep));
                        if (parts.length >= 2) {
                            String p1 = parts[0].trim();
                            String p2 = parts[1].trim();
                            if (!result.containsKey("lastName") && p1.length() > 1) result.put("lastName", normalizeName(p1));
                            if (!result.containsKey("firstName") && p2.length() > 1) result.put("firstName", normalizeName(p2));
                            if (result.containsKey("lastName") && result.containsKey("firstName")) break;
                        }
                    }
                }
            }
        }

        // 3) fallback: try a general regex for "LASTNAME Firstname"
        if (result.isEmpty()) {
            Pattern general = Pattern.compile("([A-ZÀ-Ÿ][A-ZÀ-Ÿ\\-]{1,})\\s+([A-ZÀ-Ÿ][a-zà-ÿ\\-']{1,})");
            Matcher mg = general.matcher(text);
            if (mg.find()) {
                result.putIfAbsent("lastName", normalizeName(mg.group(1)));
                result.putIfAbsent("firstName", normalizeName(mg.group(2)));
            }
        }

        return result;
    }

    /**
     * Normalizes a name string:
     * <ul>
     *   <li>Removes unwanted characters</li>
     *   <li>Keeps uppercase if the string is entirely uppercase (surname convention)</li>
     *   <li>Otherwise capitalizes the first letter of each word</li>
     * </ul>
     *
     * @param raw the raw extracted name
     * @return the normalized name, or {@code null} if input is null
     */
    private String normalizeName(String raw) {
        if (raw == null) return null;
        raw = raw.replaceAll("[^\\p{L} \\-' ]", " ").trim();
        // If the value is ALL CAPS, keep it as-is (French conventions often write surnames in uppercase)
        if (raw.equals(raw.toUpperCase(Locale.ROOT))) {
            return raw;
        }
        // Otherwise capitalize each word
        String[] parts = raw.toLowerCase(Locale.ROOT).split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            String p = parts[i];
            if (p.isEmpty()) continue;
            sb.append(Character.toUpperCase(p.charAt(0))).append(p.substring(1));
            if (i < parts.length - 1) sb.append(' ');
        }
        return sb.toString();
    }
}
