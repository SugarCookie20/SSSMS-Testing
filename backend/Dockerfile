# Stage 1: Build
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
ARG CACHEBUST=1
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime with Python Support
FROM eclipse-temurin:25-jdk-alpine
WORKDIR /app

# Stage 3: Copy JAR
COPY --from=build /app/target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]