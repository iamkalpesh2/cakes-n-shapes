import os
import re
import requests
from bs4 import BeautifulSoup

# Define paths
HTML_FILE_PATH = "/Users/kalpeshchaudhary/Projects/cakesNshapes/python-parser/insta.html"  # Path to your saved HTML file
OUTPUT_FOLDER = "public/catalog"         # Targeted directory

# Create output folder if it doesn't exist
if not os.path.exists(OUTPUT_FOLDER):
    os.makedirs(OUTPUT_FOLDER)
    print(f"Created directory: {OUTPUT_FOLDER}")

# Read the HTML content
try:
    with open(HTML_FILE_PATH, "r", encoding="utf-8") as file:
        html_content = file.read()
except FileNotFoundError:
    print(f"Error: Could not find '{HTML_FILE_PATH}'. Please place it in this folder.")
    exit()

soup = BeautifulSoup(html_content, "html.parser")
img_tags = soup.find_all("img")
print(f"Found {len(img_tags)} total image tags. Processing...")

downloaded_count = 0
skipped_count = 0

for img in img_tags:
    src = img.get("src") or img.get("data-src")
    
    if not src:
        continue
        
    # Isolate legitimate Meta/Instagram CDN links
    if "cdninstagram.com" in src or "fbcdn.net" in src:
        downloaded_count += 1
        file_name = f"cake_{downloaded_count}.jpg"
        file_path = os.path.join(OUTPUT_FOLDER, file_name)
        
        # --- THE CHECK: Skip if file already exists locally ---
        if os.path.exists(file_path):
            print(f"Skipping: {file_name} already exists.")
            skipped_count += 1
            continue
        
        print(f"Downloading image {downloaded_count}... -> {file_path}")
        
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            response = requests.get(src, headers=headers, stream=True)
            
            if response.status_code == 200:
                with open(file_path, "wb") as f:
                    for chunk in response.iter_content(1024):
                        f.write(chunk)
            else:
                print(f"Failed downloading {file_name}: HTTP status {response.status_code}")
                # Revert count tracking index if network pipeline fails
                downloaded_count -= 1 
        except Exception as e:
            print(f"Error downloading {file_name}: {e}")
            downloaded_count -= 1

print(f"\n--- Execution Complete ---")
print(f"Total files verified in pipeline: {downloaded_count}")
print(f"New images pulled: {downloaded_count - skipped_count}")
print(f"Existing images protected/skipped: {skipped_count}")