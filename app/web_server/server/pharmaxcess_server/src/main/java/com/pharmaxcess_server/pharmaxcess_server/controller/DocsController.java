package com.pharmaxcess_server.pharmaxcess_server.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Controller that handles requests for serving API documentation.
 * This controller serves the generated API documentation (typically from Swagger) stored in the 
 * {@code target/site/apidocs} directory.
 */
@RestController
@RequestMapping("/docs")
public class DocsController {

    // Directory where the generated API documentation is stored
    private static final String DOCS_DIR = Paths.get("").toAbsolutePath().toString() + "/target/site/apidocs";

    /**
     * Handles HTTP GET requests to fetch the API documentation's index page (index.html).
     * This method returns the index.html file as a resource that can be served to the user.
     *
     * @return the index.html file from the API documentation as a {@link Resource}.
     * @throws Exception if the file does not exist or is unreadable.
     */
    @GetMapping
    public Resource getDocumentationIndex() throws Exception {
        // Resolve the path to the index.html file in the documentation directory
        Path filePath = Paths.get(DOCS_DIR).resolve("index.html").normalize();
        Resource resource = new UrlResource(filePath.toUri());

        // Check if the file exists and is readable
        if (!resource.exists() || !resource.isReadable()) {
            throw new RuntimeException("Le fichier index.html est introuvable.");
        }
        return resource;
    }
}