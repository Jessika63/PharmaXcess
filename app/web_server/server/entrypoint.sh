#!/bin/sh

cd /app/pharmaxcess_server

echo "Compiling the source code..."
mvn clean install

echo "Starting the application..."
java -jar target/pharmaxcess_server-0.0.1-SNAPSHOT.jar