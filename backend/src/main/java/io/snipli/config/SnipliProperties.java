package io.snipli.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "snipli")
public class SnipliProperties {

    private String baseUrl;
    private String apiKey;
    private Jwt jwt = new Jwt();
    private Gcp gcp = new Gcp();

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public Jwt getJwt() {
        return jwt;
    }

    public void setJwt(Jwt jwt) {
        this.jwt = jwt;
    }

    public Gcp getGcp() {
        return gcp;
    }

    public void setGcp(Gcp gcp) {
        this.gcp = gcp;
    }

    public static class Jwt {
        private String secret = "snipli-super-secure-jwt-signing-key-production-grade-256bit-min-length-required!";
        private long expirationMs = 86400000L; // 24 hours

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public long getExpirationMs() {
            return expirationMs;
        }

        public void setExpirationMs(long expirationMs) {
            this.expirationMs = expirationMs;
        }
    }

    public static class Gcp {
        private String projectId;
        private CloudTasks cloudTasks = new CloudTasks();

        public String getProjectId() {
            return projectId;
        }

        public void setProjectId(String projectId) {
            this.projectId = projectId;
        }

        public CloudTasks getCloudTasks() {
            return cloudTasks;
        }

        public void setCloudTasks(CloudTasks cloudTasks) {
            this.cloudTasks = cloudTasks;
        }
    }

    public static class CloudTasks {
        private String queue;
        private String location;
        private String handlerUrl;

        public String getQueue() {
            return queue;
        }

        public void setQueue(String queue) {
            this.queue = queue;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public String getHandlerUrl() {
            return handlerUrl;
        }

        public void setHandlerUrl(String handlerUrl) {
            this.handlerUrl = handlerUrl;
        }
    }
}
