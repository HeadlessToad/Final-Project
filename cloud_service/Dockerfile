FROM python:3.9-slim
WORKDIR /app
# Install CPU-only Torch first
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
# FIX: Use 'libgl1' instead of the old 'libgl1-mesa-glx'
RUN apt-get update && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY serviceAccountKey.json .
COPY main.py .
COPY shared ./shared
COPY weights ./weights
EXPOSE 8080
CMD ["python", "main.py"]
