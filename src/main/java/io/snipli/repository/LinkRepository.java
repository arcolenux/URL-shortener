package io.snipli.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import io.snipli.model.Link;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
@SuppressWarnings("null")
public class LinkRepository {

    private static final String COLLECTION = "links";
    private final Firestore firestore;

    public LinkRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    /**
     * Check whether a document with the given shortCode already exists.
     */
    public boolean exists(String shortCode) {
        try {
            DocumentSnapshot snapshot = firestore.collection(COLLECTION).document(shortCode).get().get();
            return snapshot.exists();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted while checking existence", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Failed to check existence", e);
        }
    }

    /**
     * Save a new Link document to Firestore.
     */
    public void save(Link link) {
        Map<String, Object> data = new HashMap<>();
        data.put("shortCode", link.shortCode());
        data.put("originalUrl", link.originalUrl());
        data.put("totalClicks", link.totalClicks());
        data.put("createdAt", Timestamp.ofTimeSecondsAndNanos(
                link.createdAt().getEpochSecond(), link.createdAt().getNano()));
        if (link.expiresAt() != null) {
            data.put("expiresAt", Timestamp.ofTimeSecondsAndNanos(
                    link.expiresAt().getEpochSecond(), link.expiresAt().getNano()));
        }
        // lastClickedAt is null at creation time

        try {
            firestore.collection(COLLECTION).document(link.shortCode()).set(data).get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted while saving link", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Failed to save link", e);
        }
    }

    /**
     * Fetch a Link by its shortCode.
     */
    public Optional<Link> findByShortCode(String shortCode) {
        try {
            DocumentSnapshot doc = firestore.collection(COLLECTION).document(shortCode).get().get();
            if (!doc.exists()) {
                return Optional.empty();
            }
            return Optional.of(toLink(doc));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted while fetching link", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Failed to fetch link", e);
        }
    }

    /**
     * Atomically increment totalClicks and update lastClickedAt inside a transaction.
     */
    public void recordClick(String shortCode, Instant clickedAt) {
        DocumentReference docRef = firestore.collection(COLLECTION).document(shortCode);
        try {
            ApiFuture<Void> txFuture = firestore.runTransaction(transaction -> {
                DocumentSnapshot snapshot = transaction.get(docRef).get();
                if (!snapshot.exists()) {
                    return null; // silently ignore clicks for deleted links
                }
                Long clicksVal = snapshot.getLong("totalClicks");
                long currentClicks = clicksVal != null ? clicksVal : 0L;
                transaction.update(docRef, "totalClicks", currentClicks + 1);
                transaction.update(docRef, "lastClickedAt",
                        Timestamp.ofTimeSecondsAndNanos(clickedAt.getEpochSecond(), clickedAt.getNano()));
                return null;
            });
            txFuture.get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted while recording click", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Failed to record click", e);
        }
    }

    private Link toLink(DocumentSnapshot doc) {
        Timestamp createdTs = doc.getTimestamp("createdAt");
        Timestamp expiresTs = doc.getTimestamp("expiresAt");
        Timestamp lastClickedTs = doc.getTimestamp("lastClickedAt");

        return new Link(
                doc.getString("shortCode"),
                doc.getString("originalUrl"),
                Objects.requireNonNullElse(doc.getLong("totalClicks"), 0L),
                createdTs != null ? Instant.ofEpochSecond(createdTs.getSeconds(), createdTs.getNanos()) : Instant.now(),
                expiresTs != null ? Instant.ofEpochSecond(expiresTs.getSeconds(), expiresTs.getNanos()) : null,
                lastClickedTs != null ? Instant.ofEpochSecond(lastClickedTs.getSeconds(), lastClickedTs.getNanos()) : null
        );
    }
}
