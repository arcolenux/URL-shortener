package io.snipli.controller;

import io.snipli.dto.CreateLinkRequest;
import io.snipli.dto.CreateLinkResponse;
import io.snipli.dto.LinkStatsResponse;
import io.snipli.service.LinkService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/links")
public class LinkController {

    private final LinkService linkService;

    public LinkController(LinkService linkService) {
        this.linkService = linkService;
    }

    @PostMapping
    public ResponseEntity<CreateLinkResponse> createLink(@Valid @RequestBody CreateLinkRequest request) {
        CreateLinkResponse response = linkService.shorten(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{code}/stats")
    public ResponseEntity<LinkStatsResponse> getStats(@PathVariable String code) {
        LinkStatsResponse stats = linkService.getStats(code);
        return ResponseEntity.ok(stats);
    }
}
