# PharmaXcess

To init server you need : 
- npm
- docker

First, user docker to init MySQL (Docker compose is coming soon) : 
- docker pull mysql:latest
- docker run --name mysql-container -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=mydatabase -e MYSQL_USER=myuser -e MYSQL_PASSWORD=mypassword -p 3306:3306 -d mysql:latest

Then go to web_server/ and type `npm install`
To run the project type `npm run start`