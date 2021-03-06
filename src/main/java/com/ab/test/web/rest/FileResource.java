package com.ab.test.web.rest;
import com.ab.test.service.FileService;
import com.ab.test.web.rest.util.HeaderUtil;
import com.ab.test.web.rest.util.PaginationUtil;
import com.ab.test.service.dto.FileDTO;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST controller for managing File.
 */
@RestController
@RequestMapping("/api")
public class FileResource {

    private final Logger log = LoggerFactory.getLogger(FileResource.class);

    private static final String ENTITY_NAME = "file/files";

    private final FileService fileService;

    public FileResource(FileService fileService) {
        this.fileService = fileService;
    }

    /**
     * POST  /files : Create a new file.
     *
     * @param file the file to create
     * @param description the description for file
     * @return the ResponseEntity with status 201 (Created) and with body the new fileDTO, or with status 400 (Bad Request) if the file has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/files/single-file")
    public ResponseEntity<FileDTO> createFile(@RequestParam("file") MultipartFile file,
                                              @RequestParam("description") String description) throws URISyntaxException {
        log.debug("REST request to save File");
        FileDTO result = fileService.save(file, description);
        return ResponseEntity.created(new URI("/api/files/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * POST  /files : Create a new file.
     *
     * @param files the files to create
     * @param description the description for file
     * @return the ResponseEntity with status 201 (Created) and with body the new fileDTO, or with status 400 (Bad Request) if the file has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/files/multiple-files")
    public ResponseEntity<FileDTO> createFiles(@RequestParam("files") MultipartFile[] files,
                                              @RequestParam("description") String description) throws URISyntaxException {
        log.debug("REST request to save File");
        Arrays.asList(files)
            .stream()
            .map(file -> fileService.save(file, description))
            .collect(Collectors.toList());
        return ResponseEntity.created(null)
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, null))
            .body(null);
    }

    /**
     * PUT  /files : Updates an existing file.
     *
     * @param fileDTO the fileDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated fileDTO,
     * or with status 400 (Bad Request) if the fileDTO is not valid,
     * or with status 500 (Internal Server Error) if the fileDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
//    @PutMapping("/files")
//    public ResponseEntity<FileDTO> updateFile(@Valid @RequestBody FileDTO fileDTO) throws URISyntaxException {
//        log.debug("REST request to update File : {}", fileDTO);
//        if (fileDTO.getId() == null) {
//            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
//        }
//        FileDTO result = fileService.save(file, description);
//        return ResponseEntity.ok()
//            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, fileDTO.getId().toString()))
//            .body(result);
//    }

    /**
     * GET  /files : get all the files.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of files in body
     */
    @GetMapping("/files")
    public ResponseEntity<List<FileDTO>> getAllFiles(Pageable pageable) {
        log.debug("REST request to get a page of Files");
        Page<FileDTO> page = fileService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/files");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /files/:id : get the "id" file.
     *
     * @param id the id of the fileDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the fileDTO, or with status 404 (Not Found)
     */
    @GetMapping("/files/{id}")
    public ResponseEntity<FileDTO> getFile(@PathVariable Long id) {
        log.debug("REST request to get File : {}", id);
        Optional<FileDTO> fileDTO = fileService.findOne(id);
        return ResponseUtil.wrapOrNotFound(fileDTO);
    }

    /**
     * DELETE  /files/:id : delete the "id" file.
     *
     * @param id the id of the fileDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/files/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id) {
        log.debug("REST request to delete File : {}", id);
        fileService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    @GetMapping("/files/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id, HttpServletRequest request) {
        // Load file as Resource
        Resource resource = fileService.loadFileAsResource(id);

        // Try to determine file's content type
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            log.info("Could not determine file type.");
        }

        // Fallback to the default content type if type could not be determined
        if(contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
            .body(resource);
    }
}
