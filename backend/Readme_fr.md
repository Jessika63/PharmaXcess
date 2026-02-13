# Backend

## Prérequis

Vous devez installer :

- Docker : 27.2.0
- Docker Compose : v2.29.2

### Installation

Vous pouvez installer tous les prérequis avec [ce script](../prerequisites/install_prerequisites.sh) ou suivre [ce readme](../prerequisites/Prerequisites_fr.md)

## Lancement

### Configuration Docker

#### [ÉTAPE 1] démarrer docker

Pour lancer le back-end, vous devez utiliser cette commande :

```bash
docker-compose up --build
```

#### [ÉTAPE 2] mettre le dump db dans docker (identifiants dans docker-compose.yml)

Dans un autre terminal pendant que `docker-compose up` tourne encore :

Collez la commande ci-dessous :

```bash
docker exec -i distributeur-backend-db mysql -uroot -p[sql_password] [database_name] < database_dump_px.sql
```

-p = mot de passe

Collez le mot de passe sql à la suite du préfixe et changez le nom de la base de données

exemple :

sql_password = claude123
database_name = my_database_name

```bash
docker exec -i distributeur-backend-db-1 mysql -uroot -pclaude123 my_database_name < database_dump_px.sql
```

Ici **database_dump_px.sql** est le fichier dump de la base de données.

##### Si vous rencontrez des problèmes avec le conteneur ou le volume

supprimez et redémarrez tout :

```bash
sudo docker stop $(docker ps -q)
sudo docker rm $(docker ps -a -q)
sudo docker volume prune -f
sudo systemctl restart docker
sudo docker-compose up --build
```

### Exporter le dump db si nécessaire

Utilisez ces commandes pour créer un dump (une sauvegarde) de la base de données :

```bash
(echo "CREATE DATABASE IF NOT EXISTS [database_name]; USE [database_name];" && docker exec -i distributeur-backend-db mysqldump -uroot -p[sql_root_password] --databases [database_name] --add-drop-database && echo "CREATE USER [database_user]@'%' IDENTIFIED BY [database_password]; GRANT ALL PRIVILEGES ON [database_name].* TO [database_user]@'%'; FLUSH PRIVILEGES;") > backup.sql
```

Vous devez remplacer :

- `database_user` par votre nom d'utilisateur de base de données
- `database_password` par votre mot de passe de base de données
- `database_name` par votre nom de base de données
- `sql_root_password` par votre mot de passe root sql

Ensuite le dump est configuré

### Terminé

le backend devrait fonctionner correctement

'bon dev !'

## Routes

Vous pouvez trouver toutes les informations sur les routes dans ce [fichier readme](routes/Readme.md)

## Retour à la documentation générale **distributeur**

La documentation générale **distributeur** est disponible [ici](../Readme_fr.md)
