#!/usr/bin/env python3
"""
Rename generated product variant images to their file IDs and upload to CDN.
"""
import json
import shutil
import os

# Load results
with open('/home/ubuntu/generate_color_variant_images.json') as f:
    data = json.load(f)

results = data['results']
dest_dir = '/home/ubuntu/webdev-static-assets/product-variants'
os.makedirs(dest_dir, exist_ok=True)

# Copy each image with its file_id as the filename
copied = []
for r in results:
    out = r['output']
    file_id = out['file_id']
    src = out['image_file']
    dst = os.path.join(dest_dir, f"{file_id}.png")
    if os.path.exists(src):
        shutil.copy2(src, dst)
        copied.append(dst)
        print(f"Copied: {file_id}.png")
    else:
        print(f"MISSING: {src}")

print(f"\nTotal copied: {len(copied)}")

# Print the list of files to upload
print("\nFiles to upload:")
for f in sorted(copied):
    print(f)
