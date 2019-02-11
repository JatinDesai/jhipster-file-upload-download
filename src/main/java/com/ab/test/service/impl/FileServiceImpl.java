package com.ab.test.service.impl;

import com.ab.test.config.ApplicationProperties;
import com.ab.test.domain.User;
import com.ab.test.exception.FileStorageException;
import com.ab.test.exception.MyFileNotFoundException;
import com.ab.test.repository.UserRepository;
import com.ab.test.security.SecurityUtils;
import com.ab.test.service.FileService;
import com.ab.test.domain.File;
import com.ab.test.repository.FileRepository;
import com.ab.test.service.dto.FileDTO;
import com.ab.test.service.mapper.FileMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.ZonedDateTime;
import java.util.Optional;

/**
 * Service Implementation for managing File.
 */
@Service
@Transactional
public class FileServiceImpl implements FileService {

    private final Logger log = LoggerFactory.getLogger(FileServiceImpl.class);

    private final FileRepository fileRepository;

    private final FileMapper fileMapper;

    private final Path fileStorageLocation;

    private final UserRepository userRepository;

    public FileServiceImpl(FileRepository fileRepository, FileMapper fileMapper, ApplicationProperties applicationProperties, UserRepository userRepository) {
        this.fileRepository = fileRepository;
        this.fileMapper = fileMapper;

        this.fileStorageLocation = Paths.get(applicationProperties.getFile().getUploadDir())
            .toAbsolutePath().normalize();
        this.userRepository = userRepository;

        createDirectories(this.fileStorageLocation);
    }

    private void createDirectories(Path location) {
        try {
            Files.createDirectories(location);
        } catch (Exception ex) {
            throw new FileStorageException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    /**
     * Save a file.
     *
     *
     * @param file
     * @param description
     * @return the persisted entity
     */
    @Override
    public FileDTO save(MultipartFile file, String description) {
        log.debug("Request to save File");

        // Normalize file name
        String fileName = StringUtils.cleanPath(file.getOriginalFilename());

        try {
            // Check if the file's name contains invalid characters
            if(fileName.contains("..")) {
                throw new FileStorageException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            File fileOb = new File();
            fileOb.setDescription(description);
            fileOb.setTitle(fileName);
            fileOb.setCreationDate(ZonedDateTime.now());
            User user = getUser();
            fileOb.setUser(user);
            fileOb = fileRepository.save(fileOb);

            // Copy file to the target location (Replacing existing file with the same name)
            fileName = getFileNameWithUser(fileOb, user);
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            createDirectories(targetLocation);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return fileMapper.toDto(fileOb);
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    private String getFileNameWithUser(File fileOb, User user) {
        return user.getLogin() + java.io.File.separatorChar + fileOb.getId() + java.io.File.separatorChar + fileOb.getTitle();
    }

    private User getUser() {
        return userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin().get()).get();
    }

    /**
     * Get all the files.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public Page<FileDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Files");
        return fileRepository.findByUserIsCurrentUser(pageable)
            .map(fileMapper::toDto);
    }


    /**
     * Get one file by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<FileDTO> findOne(Long id) {
        log.debug("Request to get File : {}", id);
        return fileRepository.findById(id)
            .map(fileMapper::toDto);
    }

    /**
     * Delete the file by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete File : {}", id);        fileRepository.deleteById(id);
    }

    public Resource loadFileAsResource(Long id) {
        try {
            File fileObj = fileRepository.findById(id).get();
            User user = getUser();
            String fileName = getFileNameWithUser(fileObj, user);
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if(resource.exists()) {
                return resource;
            } else {
                throw new MyFileNotFoundException("File not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new MyFileNotFoundException("File not found ", ex);
        }
    }
}
