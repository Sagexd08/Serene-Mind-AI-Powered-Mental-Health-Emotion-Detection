import os
import shutil
import random

# ----------------- CONFIG -----------------
src_path = "C:/dataset/facialdata"    
dst_path = "./facialdata" 
img_extensions = ('.jpg', '.jpeg', '.png')
# -----------------------------------------

# create destination folder
os.makedirs(dst_path, exist_ok=True)

# collect image counts per folder
folder_images = {}
for folder in os.listdir(src_path):
    folder_path = os.path.join(src_path, folder)
    if os.path.isdir(folder_path):
        images = [f for f in os.listdir(folder_path) if f.lower().endswith(img_extensions)]
        folder_images[folder] = images

# find the minimum number of images across all folders
min_count = min(len(images) for images in folder_images.values())
print(f"Minimum images per class: {min_count}")

# copy min_count images to balanced dataset folder
for folder, images in folder_images.items():
    dst_folder = os.path.join(dst_path, folder)
    os.makedirs(dst_folder, exist_ok=True)

    sampled_images = random.sample(images, min_count)
    for img in sampled_images:
        shutil.copy2(os.path.join(src_path, folder, img), os.path.join(dst_folder, img))

print("Balanced dataset created successfully!")
