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

@RestController
@RequestMapping(path = "/api/ocr", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class OCRController {

    private final OCRService ocrService = new OCRService();

    /**
     * POST /api/ocr/upload
     * Accepts a multipart/form-data image file and returns extracted first/last name
     * and the full OCRed text.
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