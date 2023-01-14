echo "start"
docker-compose build
minikube image load gozem-app:latest
helm install gozem-app ./helm
echo "end"