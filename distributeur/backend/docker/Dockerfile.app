FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

RUN apt-get update

RUN apt-get install -y libzbar0
RUN apt-get install -y netcat-openbsd
RUN apt-get install -y libgl1
RUN apt-get install -y libglib2.0-0
RUN apt-get install -y tesseract-ocr

RUN rm -rf /var/lib/apt/lists/*

COPY . /app

EXPOSE 5000

# Create the directory for the data
RUN mkdir -p /data

# Copy the init script
COPY scripts/init_medicine.sh /init_medicine.sh

# Convert Windows line endings to Unix
RUN sed -i 's/\r$//' /init_medicine.sh

RUN chmod +x /init_medicine.sh

ENTRYPOINT ["/init_medicine.sh"]

CMD ["python", "app.py"]
