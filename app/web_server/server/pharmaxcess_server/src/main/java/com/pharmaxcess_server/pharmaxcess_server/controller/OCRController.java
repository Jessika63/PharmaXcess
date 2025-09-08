package com.pharmaxcess_server.pharmaxcess_server.controller;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pharmaxcess_server.pharmaxcess_server.service.OCRService;
import com.pharmaxcess_server.pharmaxcess_server.dto.NamesResponse;

import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.util.*;

/**
 * REST controller for handling OCR (Optical Character Recognition) operations on uploaded images.
 * <p>
 * Provides endpoints for uploading prescription images and extracting relevant
 * information such as patient first and last names, as well as the raw OCR text.
 * </p>
 */
@RestController
@RequestMapping(path = "/api/ocr", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class OCRController {

    private final OCRService ocrService = new OCRService();

    /**
     * Handles the upload of an image file and extracts text content using OCR.
     * <p>
     * This endpoint accepts a multipart/form-data request containing an image
     * of a prescription. It processes the image with Tesseract OCR, extracts
     * the patient's first and last names when possible, and returns both the
     * raw OCR text and extracted values.
     * </p>
     *
     * @param file the uploaded image file containing the prescription (must not be null)
     * @return a {@link ResponseEntity} containing a {@link NamesResponse} with:
     *         <ul>
     *             <li>raw OCR text</li>
     *             <li>extracted first name (if found)</li>
     *             <li>extracted last name (if found)</li>
     *             <li>error message if OCR or file handling failed</li>
     *         </ul>
     */
    @PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NamesResponse> uploadAndExtract(
            @RequestParam("file") @NotNull MultipartFile file
    ) {
        try {
            String rawText = ocrService.performOcr(file);
            Map<String, String> names = ocrService.extractNamesFromText(rawText);

            NamesResponse resp = new NamesResponse();
            resp.setRawText(rawText);
            resp.setFirstName(names.getOrDefault("firstName", null));
            resp.setLastName(names.getOrDefault("lastName", null));
            resp.setHints(names);

            return ResponseEntity.ok(resp);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(NamesResponse.withError("Invalid file or cannot read image: " + e.getMessage()));
        } catch (TesseractException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(NamesResponse.withError("OCR failed: " + e.getMessage()));
        }
    }
}
