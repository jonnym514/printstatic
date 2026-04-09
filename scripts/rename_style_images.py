#!/usr/bin/env python3
"""Rename generated style variant images to their file IDs and copy to webdev-static-assets."""
import json
import shutil
import os

with open('/home/ubuntu/generate_style_variant_images.json') as f:
    data = json.load(f)

results = data['results']
dest_dir = '/home/ubuntu/webdev-static-assets/product-styles'
os.makedirs(dest_dir, exist_ok=True)

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
