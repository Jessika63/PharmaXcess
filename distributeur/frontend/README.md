### [STEP 1] run docker

docker-compose up --build


# if you encounter that kind of error:

react-app-distributeur@0.1.0 start /app
> react-scripts start
sh: 1: react-scripts: not found

here is how to solve:

```bash
rm -rf node_modules package-lock.json
npm install
docker-compose down
docker-compose up --build
```

# finished !

your app should be running, 'happy dev!'