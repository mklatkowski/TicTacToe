FROM openjdk:latest
WORKDIR /app
COPY . /app
RUN ./mvnw clean package
EXPOSE 8080
CMD ["java", "-jar", "target/tic-tac-toe-0.0.1-SNAPSHOT.jar"]