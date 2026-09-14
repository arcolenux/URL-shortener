package io.snipli.controller;

import io.snipli.dto.*;
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

    @GetMapping
    public ResponseEntity<PaginatedLinksResponse> listLinks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "all") String status,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size
    ) {
        PaginatedLinksResponse response = linkService.listLinks(search, status, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard() {
        DashboardResponse response = linkService.getDashboardSummary();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{code}")
    public ResponseEntity<LinkResponse> getLink(@PathVariable String code) {
        LinkResponse response = linkService.getLink(code);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{code}/stats")
    public ResponseEntity<LinkStatsResponse> getStats(@PathVariable String code) {
        LinkStatsResponse stats = linkService.getStats(code);
        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<Void> deleteLink(@PathVariable String code) {
        linkService.deleteLink(code);
        return ResponseEntity.noContent().build();
    }
}
