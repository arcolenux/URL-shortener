package io.snipli.controller;

import io.snipli.dto.*;
import io.snipli.service.LinkService;
import jakarta.servlet.http.HttpServletRequest;
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
    public ResponseEntity<CreateLinkResponse> createLink(
            @Valid @RequestBody CreateLinkRequest request,
            HttpServletRequest httpRequest
    ) {
        String userId = (String) httpRequest.getAttribute("authenticatedUserId");
        CreateLinkResponse response = linkService.shorten(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<PaginatedLinksResponse> listLinks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "all") String status,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            HttpServletRequest httpRequest
    ) {
        String userId = (String) httpRequest.getAttribute("authenticatedUserId");
        PaginatedLinksResponse response = linkService.listLinks(search, status, page, size, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(HttpServletRequest httpRequest) {
        String userId = (String) httpRequest.getAttribute("authenticatedUserId");
        DashboardResponse response = linkService.getDashboardSummary(userId);
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

    @PutMapping("/{code}")
    public ResponseEntity<LinkResponse> updateLink(
            @PathVariable String code,
            @Valid @RequestBody UpdateLinkRequest request,
            HttpServletRequest httpRequest
    ) {
        String userId = (String) httpRequest.getAttribute("authenticatedUserId");
        LinkResponse response = linkService.updateLink(code, request, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<Void> deleteLink(
            @PathVariable String code,
            HttpServletRequest httpRequest
    ) {
        String userId = (String) httpRequest.getAttribute("authenticatedUserId");
        linkService.deleteLink(code, userId);
        return ResponseEntity.noContent().build();
    }
}
