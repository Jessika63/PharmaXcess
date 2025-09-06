FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt /app/

RUN apt-get update && \
    apt-get install -y \
        libzbar0 \
        netcat-openbsd \
        libgl1 \
        libglib2.0-0 \
        tesseract-ocr \
        && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

EXPOSE 5000

RUN mkdir -p /data
COPY scripts/init_medicine.sh /init_medicine.sh
RUN sed -i 's/\r$//' /init_medicine.sh && chmod +x /init_medicine.sh

ENTRYPOINT ["/init_medicine.sh"]
CMD ["python", "app.py"]
