FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt /app/
COPY requirements_ignored.txt /app/

RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir -r requirements_ignored.txt

RUN apt-get update && apt-get install -y libzbar0
RUN apt-get update && apt-get install -y netcat-openbsd

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
