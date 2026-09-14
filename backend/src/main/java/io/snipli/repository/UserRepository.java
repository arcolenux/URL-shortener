package io.snipli.repository;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import io.snipli.model.User;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;

@Repository
@SuppressWarnings("null")
public class UserRepository {

    private static final String COLLECTION = "users";
    private final Firestore firestore;
    // In-memory fallback map for local/test environments
    private final Map<String, User> memoryStore = new ConcurrentHashMap<>();

    public UserRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    public void save(User user) {
        memoryStore.put(user.getEmail().toLowerCase(), user);
        if (firestore == null) return;

        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("name", user.getName());
        data.put("email", user.getEmail().toLowerCase());
        data.put("passwordHash", user.getPasswordHash());
        data.put("workspace", user.getWorkspace());
        data.put("apiKey", user.getApiKey());
        data.put("createdAt", Timestamp.ofTimeSecondsAndNanos(
                user.getCreatedAt().getEpochSecond(), user.getCreatedAt().getNano()));

        try {
            firestore.collection(COLLECTION).document(user.getId()).set(data).get();
        } catch (Exception ignored) {
            // Fallback to memory store if firestore is unavailable locally
        }
    }

    public Optional<User> findByEmail(String email) {
        if (email == null) return Optional.empty();
        String normalized = email.toLowerCase().trim();

        if (memoryStore.containsKey(normalized)) {
            return Optional.of(memoryStore.get(normalized));
        }

        if (firestore == null) return Optional.empty();

        try {
            QuerySnapshot snapshot = firestore.collection(COLLECTION)
                    .whereEqualTo("email", normalized)
                    .limit(1)
                    .get()
                    .get();

            if (!snapshot.isEmpty()) {
                DocumentSnapshot doc = snapshot.getDocuments().get(0);
                User user = toUser(doc);
                memoryStore.put(normalized, user);
                return Optional.of(user);
            }
        } catch (Exception ignored) {
            // Fallback to memory store
        }

        return Optional.empty();
    }

    public Optional<User> findById(String id) {
        if (id == null) return Optional.empty();

        for (User u : memoryStore.values()) {
            if (id.equals(u.getId())) return Optional.of(u);
        }

        if (firestore == null) return Optional.empty();

        try {
            DocumentSnapshot doc = firestore.collection(COLLECTION).document(id).get().get();
            if (doc.exists()) {
                User user = toUser(doc);
                memoryStore.put(user.getEmail().toLowerCase(), user);
                return Optional.of(user);
            }
        } catch (Exception ignored) {
            // Fallback to memory store
        }

        return Optional.empty();
    }

    private User toUser(DocumentSnapshot doc) {
        Timestamp createdTs = doc.getTimestamp("createdAt");
        Instant created = createdTs != null
                ? Instant.ofEpochSecond(createdTs.getSeconds(), createdTs.getNanos())
                : Instant.now();

        return new User(
                doc.getString("id"),
                doc.getString("name"),
                doc.getString("email"),
                doc.getString("passwordHash"),
                doc.getString("workspace"),
                doc.getString("apiKey"),
                created
        );
    }
}
