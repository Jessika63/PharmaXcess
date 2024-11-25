
# To start the project

## Docker set up

### [STEP 1] start docker

# if it's the first time:

```bash
docker-compose up --build
```

# otherwise:

```bash
docker-compose up
```

### [PATCH] if you encounter this error

```bash
the requirement Flask==2.3.2 (from versions: none)
155.4 ERROR: No matching distribution found for Flask==2.3.2
------
Dockerfile.app:10
--------------------
   8 |     RUN pip install --upgrade pip
   9 |     
  10 | >>> RUN pip install --no-cache-dir -r requirements.txt
  11 |     
  12 |     RUN apt-get update && apt-get install -y netcat-openbsd
--------------------
ERROR: failed to solve: process "/bin/sh -c pip install --no-cache-dir -r requirements.txt" did not complete successfully: exit code: 1
ERROR: Service 'app' failed to build : Build failed
```

here is how to solve it:

First, replace in **requirements.txt**

```txt
Flask>=2.3.3,<3.0
```

with

```txt
Flask>=2.3.0,<3.0
```

ensuite

Then, open the file located here (if it doesn’t exist, create it)
/etc/docker/daemon.json

Then replace/add Google's DNS

```json
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}
```

After modifying the file, restart Docker

```bash
sudo systemctl restart docker
```

### [STEP 2] put db dump into docker (creds inside docker-compose.yml)

inside another terminal while docker-compose up is still running:

check the name of your db container

```bash
docker ps -a
```

you should see a container named 'distributeur-backend-db-1'
once you find it, paste the command below with your container name

```bash
docker exec -i distributeur-backend-db-1 mysql -uroot -ppx_root_pwd doctors_db < database_dump_px.sql
```

u = user ; p = password
coller le user au prefix pareil pour le pwd

exemple:

user = claude
password = claude123

```bash
docker exec -i distributeur-backend-db-1 mysql -uclaude -pclaude123 doctors_db < database_dump_px.sql
```

Here, **doctors_db** is the name of the database,

and **database_dump_px.sql** is the dump file of the database.

### if you encounter any problems with container or volume

remove and restart everything:

```bash
sudo docker stop $(docker ps -q)
sudo docker rm $(docker ps -a -q)
sudo docker volume prune -f
sudo systemctl restart docker
sudo docker-compose up --build
```

### export db dump if needed

```bash
docker exec -i distributeur-backend-db-1 mysqldump -uroot -ppx_root_pwd doctors_db > backup.sql
```

then after

```sql
--
-- Current Database: `doctors_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `doctors_db` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `doctors_db`;
```

please add:

```sql
-- CREATE USER 'px_user'


CREATE USER 'px_user'@'%' IDENTIFIED BY 'px_pwd';
GRANT ALL PRIVILEGES ON doctors_db.* TO 'px_user'@'%';
FLUSH PRIVILEGES;
```

### finished

backend should work properly

'happy dev !'

dumpconfiguré

## Installer les dépendances

Install the necessary dependencies from the **requirements.txt** file:

```bash
pip install -r requirements.txt
```

## Lancer le projet

To start the Flask server, run the following command:

```bash
python app.py
```
