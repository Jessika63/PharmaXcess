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

RUN pip install --default-timeout=1000 --no-cache-dir --no-build-isolation --upgrade pip setuptools wheel && \
    pip install --default-timeout=1000 --no-cache-dir --no-build-isolation -r requirements.txt --no-build-isolation --no-cache-dir --no-cache-dir --no-build-isolation --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host=files.pythonhosted.org  && \
    pip install --upgrade Flask Werkzeug

COPY . /app

EXPOSE 5000

RUN mkdir -p /data
COPY scripts/init_medicine.sh /init_medicine.sh
RUN sed -i 's/\r$//' /init_medicine.sh && chmod +x /init_medicine.sh

ENTRYPOINT ["/init_medicine.sh"]
# Use Gunicorn with multiple workers for better concurrency (avoid Flask dev server single-thread blocking on uploads)
# Use 4 workers by default — adapt to available CPU if needed.
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
