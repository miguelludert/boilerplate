python3 -m venv venv
source venv/bin/activate
pnpm install
docker-compose up -d
python bootstrap.py "$@"
