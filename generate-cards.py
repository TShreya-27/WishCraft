# ==========================================
# WishCraft Template Downloader
# ==========================================
#
# Downloads copyright-free greeting images
# from the Pexels API and stores them in folders.
#
# FEATURES:
# ✅ Downloads categorized templates
# ✅ Skips images with human faces
# ✅ Organizes images into folders
# ✅ Works correctly on Windows
#
# Categories:
# - Birthday
# - Anniversary
# - Festival
# - Romantic
#
# ------------------------------------------
# SETUP
# ------------------------------------------
#
# 1. Create free account:
#    https://www.pexels.com/api/
#
# 2. Get your API key
#
# 3. Install dependencies:
#
#    pip install requests opencv-python
#
# 4. Add your API key below
#
# 5. Run:
#
#    python download_templates.py
#
# ------------------------------------------


import os
import requests
import cv2
import tempfile
import shutil

# ==========================================
# PEXELS API KEY
# ==========================================

PEXELS_API_KEY = "v8dzIjVoORy9HLPZhm4MeeTVNh5b1uGEk0QfyW0QD2MaAhw8D0S3KFsP"

# ==========================================
# SEARCH CATEGORIES
# ==========================================

categories = {

    "birthday": [
        "birthday greeting background",
        "birthday balloons aesthetic",
        "birthday decoration",
        "birthday card background"
    ],

    "anniversary": [
        "anniversary floral background",
        "luxury anniversary decoration",
        "anniversary greeting aesthetic",
        "romantic anniversary background"
    ],

    "festival": [
        "festival lights background",
        "diwali decorative background",
        "celebration festive background",
        "traditional festival aesthetic"
    ],

    "romantic": [
        "romantic roses background",
        "love aesthetic background",
        "heart decoration background",
        "valentine greeting background"
    ]
}

# ==========================================
# CONFIG
# ==========================================

TARGET_IMAGES_PER_CATEGORY = 20

PEXELS_FETCH_SIZE = 40

BASE_FOLDER = "wishcraft_templates"

# ==========================================
# CREATE BASE FOLDER
# ==========================================

os.makedirs(BASE_FOLDER, exist_ok=True)

# ==========================================
# FACE DETECTOR
# ==========================================

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades +
    "haarcascade_frontalface_default.xml"
)

# ==========================================
# PEXELS HEADERS
# ==========================================

headers = {
    "Authorization": PEXELS_API_KEY
}

# ==========================================
# FACE DETECTION FUNCTION
# ==========================================

def contains_face(image_path):

    image = cv2.imread(image_path)

    if image is None:
        return False

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30)
    )

    return len(faces) > 0

# ==========================================
# MAIN DOWNLOAD LOOP
# ==========================================

for category_name, queries in categories.items():

    print(f"\n========== {category_name.upper()} ==========")

    category_folder = os.path.join(
        BASE_FOLDER,
        category_name
    )

    os.makedirs(category_folder, exist_ok=True)

    image_counter = 1

    for query in queries:

        if image_counter > TARGET_IMAGES_PER_CATEGORY:
            break

        print(f"\nSearching: {query}")

        url = (
            f"https://api.pexels.com/v1/search"
            f"?query={query}"
            f"&per_page={PEXELS_FETCH_SIZE}"
        )

        response = requests.get(
            url,
            headers=headers
        )

        data = response.json()

        photos = data.get("photos", [])

        for photo in photos:

            if image_counter > TARGET_IMAGES_PER_CATEGORY:
                break

            try:

                image_url = photo["src"]["large2x"]

                image_response = requests.get(image_url)

                # ==================================
                # CREATE TEMP IMAGE FILE
                # ==================================

                with tempfile.NamedTemporaryFile(
                    delete=False,
                    suffix=".jpg"
                ) as temp_file:

                    temp_file.write(
                        image_response.content
                    )

                    temp_path = temp_file.name

                # ==================================
                # SKIP HUMAN FACES
                # ==================================

                if contains_face(temp_path):

                    print("Skipped image with face")

                    os.remove(temp_path)

                    continue

                # ==================================
                # SAVE VALID IMAGE
                # ==================================

                file_path = os.path.join(
                    category_folder,
                    f"{category_name}_{image_counter}.jpg"
                )

                shutil.move(temp_path, file_path)

                print(f"Saved: {file_path}")

                image_counter += 1

            except Exception as e:

                print(f"Failed image: {e}")

# ==========================================
# DONE
# ==========================================

print("\n===================================")
print("All WishCraft templates downloaded!")
print("Images with faces were skipped.")
print("===================================")