```bash
docker run -d \
  --name nodejs_be_plgrnd \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=nodejs_be_plgrnd \
  -e MYSQL_USER=user \
  -e MYSQL_PASSWORD=password \
  -p 3306:3306 \
  mysql:8.0
```
