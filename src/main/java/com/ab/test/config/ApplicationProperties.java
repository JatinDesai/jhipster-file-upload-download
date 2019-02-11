package com.ab.test.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to Test.
 * <p>
 * Properties are configured in the application.yml file.
 * See {@link io.github.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {
    public final File file = new File();


    public File getFile() {
        return file;
    }


    public static class File {
        private String uploadDir = "";

        public File() {
        }

        public String getUploadDir() {
            return uploadDir;
        }

        public void setUploadDir(String uploadDir) {
            this.uploadDir = uploadDir;
        }
    }

}
