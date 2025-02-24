
# Backend

## Prerequisites

You need to install:

- Docker: 27.2.0
- Docker Compose: v2.29.2

### Installation

You can install all prerequisites with [this script](./prerequisites/install_prerequisites.sh) or follow [this readme](./prerequisites/Prerequisites.md)

## Launching

### Docker set up

#### [STEP 1] start docker

To run the back-end you need to use this command:

```bash
docker-compose up --build
```

#### [STEP 2] put db dump into docker (credentials inside docker-compose.yml)

Inside another terminal while `docker-compose up` is still running:

Paste the command below:

```bash
docker exec -i distributeur-backend-db mysql -uroot -p[sql_password] [database_name] < database_dump_px.sql
```

-p = password

Past the sql_password next the the prefix and change the database name

example:

sql_password = claude123
database_name = my_database_name

```bash
docker exec -i distributeur-backend-db-1 mysql -uroot -pclaude123 my_database_name < database_dump_px.sql
```

Here **database_dump_px.sql** is the dump file of the database.

##### If you encounter any problems with container or volume

remove and restart everything:

```bash
sudo docker stop $(docker ps -q)
sudo docker rm $(docker ps -a -q)
sudo docker volume prune -f
sudo systemctl restart docker
sudo docker-compose up --build
```

### Export db dump if needed

Use this commands to create a dump (a save) of the database:

```bash
(echo "CREATE DATABASE IF NOT EXISTS [database_name]; USE [database_name];" && docker exec -i distributeur-backend-db mysqldump -uroot -p[sql_root_password] --databases [database_name] --add-drop-database && echo "CREATE USER [database_user]@'%' IDENTIFIED BY [database_password]; GRANT ALL PRIVILEGES ON [database_name].* TO [database_user]@'%'; FLUSH PRIVILEGES;") > backup.sql
```

You need to replace:

- `database_user` with your database user name
- `database_password` with your database password
- `database_name` with your database name
- `sql_root_password` with your sql root password

Then the dump is configured

### Finished

backend should work properly

'happy dev !'

## Routes

You can find all information about the routes in this [readme file](routes/Readme.md)

## Back to general **distributeur** documentation

The general **distributeur** documentation is available at [here](../Readme.md)
