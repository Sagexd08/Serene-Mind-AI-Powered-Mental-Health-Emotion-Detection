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

# get counts sorted
counts = sorted(len(images) for images in folder_images.values())
second_min_count = counts[1] if len(counts) > 1 else counts[0]  # second smallest

print(f"Balancing dataset up to second smallest class size: {second_min_count}")

# copy up to second_min_count images to balanced dataset folder
for folder, images in folder_images.items():
    dst_folder = os.path.join(dst_path, folder)
    os.makedirs(dst_folder, exist_ok=True)

    sample_count = min(len(images), second_min_count)
    sampled_images = random.sample(images, sample_count)
    
    for img in sampled_images:
        shutil.copy2(os.path.join(src_path, folder, img), os.path.join(dst_folder, img))

print("Balanced dataset created successfully!")
