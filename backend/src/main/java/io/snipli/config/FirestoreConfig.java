package io.snipli.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirestoreConfig {

    private static final Logger log = LoggerFactory.getLogger(FirestoreConfig.class);

    @Value("${snipli.gcp.project-id:snipli-508615}")
    private String projectId;

    @Value("${snipli.gcp.credentials-path:#{null}}")
    private String credentialsPath;

    @Bean
    public Firestore firestore() throws IOException {
        FirestoreOptions.Builder optionsBuilder = FirestoreOptions.newBuilder()
                .setProjectId(projectId);

        GoogleCredentials credentials = null;
        if (credentialsPath != null && !credentialsPath.isBlank()) {
            File file = new File(credentialsPath);
            if (file.exists()) {
                log.info("Loading GCP credentials from configured path: {}", file.getAbsolutePath());
                credentials = GoogleCredentials.fromStream(new FileInputStream(file));
            }
        }

        if (credentials == null) {
            String[] candidatePaths = {
                    "snipli-508615-8cab64a0fba1.json",
                    "snipli-service-account.json",
                    "backend/snipli-508615-8cab64a0fba1.json",
                    "backend/snipli-service-account.json"
            };
            for (String candidate : candidatePaths) {
                File file = new File(candidate);
                if (file.exists()) {
                    log.info("Discovered GCP credentials key at: {}", file.getAbsolutePath());
                    credentials = GoogleCredentials.fromStream(new FileInputStream(file));
                    break;
                }
            }
        }

        if (credentials != null) {
            optionsBuilder.setCredentials(credentials);
        }

        return optionsBuilder.build().getService();
    }
}

