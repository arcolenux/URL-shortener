package io.snipli.controller;

import io.snipli.dto.RecordClickRequest;
import io.snipli.service.LinkService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TaskController {

    private final LinkService linkService;

    public TaskController(LinkService linkService) {
        this.linkService = linkService;
    }

    @PostMapping("/internal/tasks/record-click")
    public ResponseEntity<Void> recordClick(@RequestBody RecordClickRequest request) {
        linkService.recordClick(request.shortCode(), request.clickedAt());
        return ResponseEntity.ok().build();
    }
}
