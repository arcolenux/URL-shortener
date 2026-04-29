# ==================================
# Stage 1: Build
# ==================================
FROM gradle:8-jdk21 AS builder

WORKDIR /app
COPY build.gradle.kts settings.gradle.kts ./
COPY src ./src

RUN gradle bootJar --no-daemon -x test

# ==================================
# Stage 2: Runtime
# ==================================
FROM eclipse-temurin:21-jre-alpine

RUN addgroup -S snipli && adduser -S snipli -G snipli -u 1001

WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

RUN chown -R snipli:snipli /app
USER 1001

EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
