# To start the project


## Docker set up


# start docker

```bash
docker-compose up --build
```


## put db dump into docker (creds inside docker-compose.yml)

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
