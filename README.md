# CI/CD Code Samples

Un exemple de la procédure CI/CD avec un API en NodeJS.

## Instructions d'utilisation

Le projet est conçu pour un VSCode Dev Container. Relancez le projet dans un DevContainer, et ouvrez un terminal.

Avant de lancer le serveur il faut d'abord préparer la base de données :

```bash
mycli -h dbms -u root < ./dbms/ddl/init.sql
mycli -h dbms -u root < ./dbms/ddl/ddl.sql
```

Ensuite, on peut lancer le serveur avec :

```bash
npm run server
```

## Tests Postman

Un export des tests pour Postman se trouve dans [./src/test/postman/api.postman_collection.json](./src/test/postman/api.postman_collection.json)


## Docker Registry

Le container `vscode_api` utilise une image Docker personnalisé. Les instructions pour sa création et déploiement sont :

```bash
# Terminal ouvert à la racine de ce projet

# Build l'image en local
docker compose -f docker-compose.dev.yml build vscode_api

# Trouver l'image
docker image ls | grep "vscode_api"  

# Retagger l'image avec l'adresse du repo at le numéro de version
# Remplacer `api-code-samplesgit-vscode_api`  avec le bon nom d'image trouvé dans l'étape précédente
docker tag api-code-samplesgit-vscode_api rg.fr-par.scw.cloud/api-code-samples-vscode/vscode_api:1.0.0

# Créer une clé de connexion chez scaleway
SCW_SECRET_KEY=
docker login rg.fr-par.scw.cloud/api-code-samples-vscode -u nologin --password-stdin <<< "$SCW_SECRET_KEY"

# Envoyer l'image dans le dépôt docker sur Scaleway
docker push rg.fr-par.scw.cloud/api-code-samples-vscode/vscode_api:1.0.0
``````