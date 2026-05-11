FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# For hot reloading we rely on spring-boot:run via maven.
# In compose we map `.m2` and the source files so we don't need to wrap them here for DEV.
# But we copy them to have a complete fallback container.

COPY mvnw pom.xml ./
# Make sure mvnw is executable
RUN chmod +x ./mvnw || true

# Pre-fetch dependencies
RUN ./mvnw dependency:go-offline -B || true

COPY src ./src

EXPOSE 8080

# Default command for development mode
CMD ["./mvnw", "spring-boot:run", "-Dspring-boot.run.jvmArguments='-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005'"]
