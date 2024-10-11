# To start the project


## Docker set up


# start docker

```bash
docker-compose up --build
```


# [PATCH] if you encounter this error

```
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

d'abord remplace dans requirements
```
Flask>=2.3.3,<3.0
```
par
```
Flask>=2.3.0,<3.0
```
ensuite

ouvre le fichier situé ici (s'il existe pas, crée le)
/etc/docker/daemon.json


puis remplace / rajoute le dns de google
```json
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}
```
ensuite restart docker après avoir modifié le fichier
```
sudo systemctl restart docker
```

## put db dump into docker (creds inside docker-compose.yml)

check the name of your db container

```bash
docker ps -a
```

you should see a container named like 'distributeur-db-1' or 'distributeur_db_1'
once you find it, paste the command below with your container name

```bash
docker exec -i distributeur-db-1 mysql -uroot -ppx_root_pwd doctors_db < database_dump_px.sql
```

u = user ; p = password
coller le user au prefix pareil pour le pwd

exemple:

user = claude
password = claude123


```bash
docker exec -i distributeur-db-1 mysql -uclaude -pclaude123 doctors_db < database_dump_px.sql
```


ensuite doctors_db c'est le nom de la db

puis database_dumb_px.sql c'est le fichier du dump de db


# problems with container or volume

remove and restart everything:

```bash
sudo docker stop $(docker ps -q)
sudo docker rm $(docker ps -a -q)
sudo docker volume prune -f
sudo systemctl restart docker
sudo docker-compose up --build
```


## export db dump if needed


```bash
cat database_dump_px.sql | docker exec -i distributeur-db-1 mysql -uroot -ppx_root_pwd
```


## finished !!


dumpconfiguré

## Installer les dépendances

Installe les dépendances nécessaires à partir du fichier requirements.txt :

```bash
pip install -r requirements.txt
```

## Lancer le projet

Pour démarrer le serveur Flask, exécute la commande suivante :

```bash
python app.py
```
