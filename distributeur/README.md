
# To start the project

## Docker setup

### Start Docker

```bash
docker-compose up --build
```

### Put DB dump into Docker (credentials inside docker-compose.yml)

```bash
docker exec -i distributeur-db-1 mysql -uroot -ppx_root_pwd doctors_db < database_dump_px.sql
```

u = user; p = password. Prefix the user and password accordingly.

Example:

user = claude
password = claude123

```bash
docker exec -i distributeur-db-1 mysql -uclaude -pclaude123 doctors_db < database_dump_px.sql
```

Next, **doctors_db** is the name of the database, and **database_dump_px.sql** is the dump file.

### Export DB dump if needed

```bash
cat database_dump_px.sql | docker exec -i distributeur-db-1 mysql -uroot -ppx_root_pwd
```

### Finished

Dump configured.

## Manual setup

### Install dependencies

Install the necessary dependencies from the **requirements.txt** file:

```bash
pip install -r requirements.txt
```

### Run the project

To start the Flask server, execute the following command:

```bash
python app.py
```

## Run the tests

To run the tests, first start the app, then execute the following command:

```bash
docker-compose run test
```

## Update Dockerfiles or docker-compose

To update the containers, run this command:

```bash
docker-compose --profile test up --build
```
