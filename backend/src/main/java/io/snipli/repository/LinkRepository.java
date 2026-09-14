package io.snipli.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import io.snipli.model.Link;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
@SuppressWarnings("null")
public class LinkRepository {

    private static final String COLLECTION = "links";
    private final Firestore firestore;
    // In-memory cache/fallback store
    private final Map<String, Link> memoryStore = new ConcurrentHashMap<>();

    public LinkRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    /**
     * Check whether a document with the given shortCode already exists.
     */
    public boolean exists(String shortCode) {
        if (memoryStore.containsKey(shortCode)) {
            return true;
        }
        if (firestore == null) return false;
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
        memoryStore.put(link.shortCode(), link);
        if (firestore == null) return;

        Map<String, Object> data = new HashMap<>();
        data.put("shortCode", link.shortCode());
        data.put("originalUrl", link.originalUrl());
        data.put("totalClicks", link.totalClicks());
        if (link.userId() != null) {
            data.put("userId", link.userId());
        }
        data.put("createdAt", Timestamp.ofTimeSecondsAndNanos(
                link.createdAt().getEpochSecond(), link.createdAt().getNano()));
        if (link.expiresAt() != null) {
            data.put("expiresAt", Timestamp.ofTimeSecondsAndNanos(
                link.expiresAt().getEpochSecond(), link.expiresAt().getNano()));
        }
        if (link.lastClickedAt() != null) {
            data.put("lastClickedAt", Timestamp.ofTimeSecondsAndNanos(
                link.lastClickedAt().getEpochSecond(), link.lastClickedAt().getNano()));
        }

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
        if (memoryStore.containsKey(shortCode)) {
            return Optional.of(memoryStore.get(shortCode));
        }
        if (firestore == null) return Optional.empty();

        try {
            DocumentSnapshot doc = firestore.collection(COLLECTION).document(shortCode).get().get();
            if (!doc.exists()) {
                return Optional.empty();
            }
            Link link = toLink(doc);
            memoryStore.put(shortCode, link);
            return Optional.of(link);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted while fetching link", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Failed to fetch link", e);
        }
    }

    /**
     * Fetch all links from Firestore.
     */
    public List<Link> findAll() {
        if (firestore == null) {
            return new ArrayList<>(memoryStore.values());
        }

        try {
            QuerySnapshot snapshot = firestore.collection(COLLECTION)
                    .orderBy("createdAt", Query.Direction.DESCENDING)
                    .get()
                    .get();

            List<Link> list = snapshot.getDocuments().stream()
                    .map(this::toLink)
                    .collect(Collectors.toList());

            list.forEach(l -> memoryStore.put(l.shortCode(), l));
            return list;
        } catch (Exception e) {
            return new ArrayList<>(memoryStore.values());
        }
    }

    /**
     * Fetch links by owner userId.
     */
    public List<Link> findByUserId(String userId) {
        if (userId == null) {
            return findAll();
        }

        if (firestore == null) {
            return memoryStore.values().stream()
                    .filter(l -> userId.equals(l.userId()))
                    .sorted((a, b) -> b.createdAt().compareTo(a.createdAt()))
                    .collect(Collectors.toList());
        }

        try {
            QuerySnapshot snapshot = firestore.collection(COLLECTION)
                    .whereEqualTo("userId", userId)
                    .get()
                    .get();

            List<Link> list = snapshot.getDocuments().stream()
                    .map(this::toLink)
                    .sorted((a, b) -> b.createdAt().compareTo(a.createdAt()))
                    .collect(Collectors.toList());

            list.forEach(l -> memoryStore.put(l.shortCode(), l));
            return list;
        } catch (Exception e) {
            return memoryStore.values().stream()
                    .filter(l -> userId.equals(l.userId()))
                    .sorted((a, b) -> b.createdAt().compareTo(a.createdAt()))
                    .collect(Collectors.toList());
        }
    }

    /**
     * Delete a link by its short code.
     */
    public boolean delete(String shortCode) {
        memoryStore.remove(shortCode);
        if (firestore == null) return true;

        try {
            DocumentReference docRef = firestore.collection(COLLECTION).document(shortCode);
            DocumentSnapshot snapshot = docRef.get().get();
            if (!snapshot.exists()) {
                return false;
            }
            docRef.delete().get();
            return true;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted while deleting link", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Failed to delete link", e);
        }
    }

    /**
     * Atomically increment totalClicks and update lastClickedAt inside a transaction.
     */
    public void recordClick(String shortCode, Instant clickedAt) {
        Link cached = memoryStore.get(shortCode);
        if (cached != null) {
            memoryStore.put(shortCode, new Link(
                    cached.shortCode(),
                    cached.originalUrl(),
                    cached.totalClicks() + 1,
                    cached.createdAt(),
                    cached.expiresAt(),
                    clickedAt,
                    cached.userId()
            ));
        }

        if (firestore == null) return;

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
                lastClickedTs != null ? Instant.ofEpochSecond(lastClickedTs.getSeconds(), lastClickedTs.getNanos()) : null,
                doc.getString("userId")
        );
    }
}
