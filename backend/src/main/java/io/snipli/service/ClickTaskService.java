package io.snipli.service;

import com.google.cloud.tasks.v2.*;
import com.google.protobuf.ByteString;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.snipli.config.SnipliProperties;
import io.snipli.dto.RecordClickRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class ClickTaskService {

    private static final Logger log = LoggerFactory.getLogger(ClickTaskService.class);

    private final SnipliProperties properties;
    private final ObjectMapper objectMapper;

    public ClickTaskService(SnipliProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    /**
     * Enqueue a Cloud Tasks task to asynchronously record a click.
     */
    public void enqueueClick(String shortCode) {
        try (CloudTasksClient client = CloudTasksClient.create()) {
            SnipliProperties.CloudTasks taskConfig = properties.getGcp().getCloudTasks();

            String queuePath = QueueName.of(
                    properties.getGcp().getProjectId(),
                    taskConfig.getLocation(),
                    taskConfig.getQueue()
            ).toString();

            RecordClickRequest payload = new RecordClickRequest(shortCode, Instant.now());
            String json = objectMapper.writeValueAsString(payload);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .setUrl(taskConfig.getHandlerUrl())
                    .setHttpMethod(HttpMethod.POST)
                    .setBody(ByteString.copyFromUtf8(json))
                    .putHeaders("Content-Type", "application/json")
                    .build();

            Task task = Task.newBuilder()
                    .setHttpRequest(httpRequest)
                    .build();

            client.createTask(queuePath, task);
            log.debug("Enqueued click task for code={}", shortCode);
        } catch (Exception e) {
            log.error("Failed to enqueue click task for code={}", shortCode, e);
            // Do not throw — the redirect must not be blocked by task failures
        }
    }
}
