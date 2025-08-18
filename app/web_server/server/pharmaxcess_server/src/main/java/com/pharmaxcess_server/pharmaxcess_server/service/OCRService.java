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
 * Example Spring Boot controller exposing an endpoint for OCR of a French medical
 * prescription and extracting the patient's last name and first name.
 *
 * Recommended Maven dependencies (pom.xml):
 *
 * <!-- Spring Web -->
 * <dependency>
 *   <groupId>org.springframework.boot</groupId>
 *   <artifactId>spring-boot-starter-web</artifactId>
 * </dependency>
 *
 * <!-- Tess4J (Tesseract wrapper) -->
 * <dependency>
 *   <groupId>net.sourceforge.tess4j</groupId>
 *   <artifactId>tess4j</artifactId>
 *   <version>4.7.1</version> <!-- check for the latest version -->
 * </dependency>
 *
 * Notes:
 * - You must install Tesseract data files (tessdata) and set the datapath accordingly.
 * - For production and higher accuracy or scalability consider using a cloud OCR
 *   provider (Google Cloud Vision, Azure Cognitive Services) instead of running
 *   Tesseract in-process.
 */
@Service
public class OCRService {
    private Tesseract tesseract;

    public void OcrService() {
        tesseract = new Tesseract();
        tesseract.setDatapath("/usr/share/tessdata");
        tesseract.setLanguage("fra");
        // tesseract.setTessVariable("preserve_interword_spaces", "1");
    }

    /**
     * Performs OCR on the uploaded MultipartFile and returns the raw text.
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
     * Attempts to extract last name and first name from the OCRed text.
     * Uses several heuristics:
     *  - look for explicit labels ("Nom", "NOM", "Prénom", "Prénoms")
     *  - analyze lines for patterns like "SURNAME Firstname" where surname is all-caps
     */
    public Map<String, String> extractNamesFromText(String text) {
        Map<String, String> result = new HashMap<>();
        if (text == null || text.isEmpty()) return result;

        String[] lines = text.split("?");

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

        // 2) if labels didn't yield both, analyze lines
        if (!result.containsKey("lastName") || !result.containsKey("firstName")) {
            for (String rawLine : lines) {
                String line = rawLine.trim();
                if (line.length() < 3) continue;

                // Possible format: SURNAME Firstname (surname often in UPPERCASE)
                String[] tokens = line.split("\s+");
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

                    // Another heuristic: same line contains separators like '/' or ','
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

    private String normalizeName(String raw) {
        if (raw == null) return null;
        raw = raw.replaceAll("[^\\p{L} \\-' ]", " ").trim();
        // If the value is ALL CAPS, keep it as-is (French conventions often write surnames in uppercase)
        if (raw.equals(raw.toUpperCase(Locale.ROOT))) {
            return raw;
        }
        // Otherwise capitalize each word
        String[] parts = raw.toLowerCase(Locale.ROOT).split("\s+");
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
