FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt /app/

RUN python -m pip install --upgrade pip && \
    pip install --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt

RUN apt-get update && apt-get install -y --no-install-recommends netcat-openbsd && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY . /app

EXPOSE 5000

CMD ["python", "app.py"]