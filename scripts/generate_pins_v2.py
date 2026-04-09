#!/usr/bin/env python3
"""
Generate Pinterest-optimized pin images (1000x1500px) for Print Static products.
Version 2: Better layout with larger text, more visual impact.
"""

import os
import requests
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import io

CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663457026858/i7wpi7roPPicgqaW78ePG8"

PRODUCTS = [
    {"id": "weekly-planner", "name": "Weekly Planner Bundle", "board": "Printable Planners", "price": "$7.99", "tagline": "Stay organized all week long", "hashtags": "#weeklyplanner #printableplanner #organizationhacks #plannerlife", "image": f"{CDN}/ps-w-weekly-planner_0877369e.png", "color": "#00B4D8"},
    {"id": "budget-planner", "name": "Budget Planner Spreadsheet", "board": "Printable Planners", "price": "$9.99", "tagline": "Take control of your finances", "hashtags": "#budgetplanner #financeplanning #savemoney #budgeting", "image": f"{CDN}/ps-w-budget-planner_e6369639.png", "color": "#2D6A4F"},
    {"id": "habit-tracker", "name": "Habit Tracker — 30 Day", "board": "Printable Planners", "price": "$4.99", "tagline": "Build better habits in 30 days", "hashtags": "#habittracker #habitchallenge #selfimprovement #dailyroutine", "image": f"{CDN}/ps-w-habit-tracker_92792418.png", "color": "#6B2D8B"},
    {"id": "goal-workbook", "name": "Goal Setting Workbook", "board": "Printable Planners", "price": "$12.99", "tagline": "Turn your dreams into reality", "hashtags": "#goalsetting #goalworkbook #manifestation #2024goals", "image": f"{CDN}/ps-w-goal-workbook_1449c526.png", "color": "#E67E22"},
    {"id": "meal-planner", "name": "Meal Planner + Grocery List", "board": "Printable Planners", "price": "$5.99", "tagline": "Plan meals, save time & money", "hashtags": "#mealplanner #mealprep #grocerylist #healthyeating", "image": f"{CDN}/ps-w-meal-planner_9c0428d4.png", "color": "#E74C3C"},
    {"id": "journal-bundle", "name": "Daily Journal + Gratitude Bundle", "board": "Printable Planners", "price": "$8.99", "tagline": "Reflect, grow, and be grateful", "hashtags": "#journaling #gratitudejournal #selfcare #mindfulness", "image": f"{CDN}/ps-w-journal-bundle_7050f863.png", "color": "#8E44AD"},
    {"id": "resume-bundle", "name": "Resume Template Bundle", "board": "Printable Templates & Invitations", "price": "$14.99", "tagline": "Land your dream job", "hashtags": "#resumetemplate #jobsearch #careeradvice #getthejob", "image": f"{CDN}/ps-w-resume-bundle_66bde203.png", "color": "#2C3E50"},
    {"id": "social-calendar", "name": "Social Media Content Calendar", "board": "Digital Productivity & Organization", "price": "$11.99", "tagline": "Plan your content like a pro", "hashtags": "#contentcalendar #socialmediatips #contentcreator #digitalmarketing", "image": f"{CDN}/ps-w-social-calendar_65cc33ed.png", "color": "#00B4D8"},
    {"id": "social-templates", "name": "Instagram Post Templates", "board": "Digital Productivity & Organization", "price": "$19.99", "tagline": "Stunning posts in minutes", "hashtags": "#instagramtemplates #contentcreator #socialmedia #canvatemplates", "image": f"{CDN}/ps-w-social-templates_7080890b.png", "color": "#C0392B"},
    {"id": "notion-template", "name": "Notion Productivity Dashboard", "board": "Digital Productivity & Organization", "price": "$16.99", "tagline": "Your ultimate Notion workspace", "hashtags": "#notiontemplate #notionsetup #productivity #digitalplanner", "image": f"{CDN}/ps-w-notion-template_9a5470c0.png", "color": "#2C3E50"},
    {"id": "brand-kit", "name": "Brand Identity Kit", "board": "Digital Productivity & Organization", "price": "$24.99", "tagline": "Build a brand that stands out", "hashtags": "#brandidentity #brandkit #smallbusiness #entrepreneur", "image": f"{CDN}/ps-w-brand-kit_555ecc08.png", "color": "#D4AC0D"},
    {"id": "business-card", "name": "Business Card Template Pack", "board": "Printable Templates & Invitations", "price": "$7.99", "tagline": "Make a lasting first impression", "hashtags": "#businesscard #networking #printable #smallbusiness", "image": f"{CDN}/ps-w-business-card_6f5d760a.png", "color": "#1ABC9C"},
    {"id": "wall-art-geometric", "name": "Geometric Wall Art Set", "board": "Printable Wall Art", "price": "$9.99", "tagline": "Modern art for every room", "hashtags": "#wallart #geometricart #printablewallart #homedecor", "image": f"{CDN}/ps-w-wall-art-geometric_6bffca36.png", "color": "#2C3E50"},
    {"id": "wall-art-quotes", "name": "Typography Quote Prints", "board": "Printable Wall Art", "price": "$6.99", "tagline": "Inspire your space with words", "hashtags": "#quoteprint #wallquotes #inspirationalquotes #homedecor", "image": f"{CDN}/ps-w-wall-art-quotes_c4b8c1aa.png", "color": "#2980B9"},
    {"id": "wedding-invite", "name": "Wedding Invitation Suite", "board": "Printable Templates & Invitations", "price": "$29.99", "tagline": "Your perfect wedding starts here", "hashtags": "#weddinginvitation #weddingstationery #diywedding #weddingplanning", "image": f"{CDN}/ps-w-wedding-invite_5946a2a2.png", "color": "#BDC3C7"},
    {"id": "party-invite", "name": "Birthday Party Invitation Set", "board": "Printable Templates & Invitations", "price": "$5.99", "tagline": "Make your party unforgettable", "hashtags": "#birthdayinvitation #partyinvite #printableinvitation #kidsparty", "image": f"{CDN}/ps-w-party-invite_3613f456.png", "color": "#E74C3C"},
    {"id": "kids-activity", "name": "Kids Activity Sheets Pack", "board": "Printable Templates & Invitations", "price": "$7.99", "tagline": "Fun learning for little ones", "hashtags": "#kidsactivities #printablesforkids #homeschool #learningathome", "image": f"{CDN}/ps-w-kids-activity_bf12f6af.png", "color": "#F39C12"},
]

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def get_text_color(bg_hex):
    r, g, b = hex_to_rgb(bg_hex)
    luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return (255, 255, 255) if luminance < 0.55 else (17, 17, 17)

def download_image(url):
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return Image.open(io.BytesIO(response.content)).convert("RGBA")
    except Exception as e:
        print(f"  Error downloading {url}: {e}")
        return None

def wrap_text(draw, text, font, max_width):
    """Wrap text to fit within max_width."""
    words = text.split()
    lines = []
    current_line = ""
    for word in words:
        test_line = current_line + (" " if current_line else "") + word
        bbox = draw.textbbox((0, 0), test_line, font=font)
        if bbox[2] - bbox[0] > max_width and current_line:
            lines.append(current_line)
            current_line = word
        else:
            current_line = test_line
    if current_line:
        lines.append(current_line)
    return lines

def create_pin_image(product, output_dir):
    """Create a Pinterest-optimized pin image (1000x1500px)."""
    pin_w, pin_h = 1000, 1500
    
    # White background
    pin = Image.new("RGB", (pin_w, pin_h), (252, 252, 252))
    draw = ImageDraw.Draw(pin)
    
    accent_rgb = hex_to_rgb(product["color"])
    text_on_accent = get_text_color(product["color"])
    
    # === IMAGE SECTION (top 65% of pin) ===
    img_section_h = 975  # 65% of 1500
    
    # Download and place product image
    prod_img = download_image(product["image"])
    if prod_img:
        prod_img_rgb = prod_img.convert("RGB")
        # Fill the image section
        prod_img_rgb = prod_img_rgb.resize((pin_w, img_section_h), Image.LANCZOS)
        pin.paste(prod_img_rgb, (0, 0))
    else:
        draw.rectangle([0, 0, pin_w, img_section_h], fill=(230, 230, 230))
    
    # Gradient overlay at bottom of image for text readability
    gradient = Image.new("RGBA", (pin_w, 200), (0, 0, 0, 0))
    grad_draw = ImageDraw.Draw(gradient)
    for i in range(200):
        alpha = int(180 * (i / 200))
        grad_draw.line([(0, i), (pin_w, i)], fill=(0, 0, 0, alpha))
    pin.paste(gradient, (0, img_section_h - 200), gradient)
    
    # Brand badge on image (top-left)
    badge_x, badge_y = 30, 30
    badge_w, badge_h = 220, 50
    badge_bg = Image.new("RGBA", (badge_w, badge_h), (*accent_rgb, 230))
    pin.paste(badge_bg, (badge_x, badge_y), badge_bg)
    
    try:
        font_brand = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
    except:
        font_brand = ImageFont.load_default()
    
    draw2 = ImageDraw.Draw(pin)
    draw2.text((badge_x + 15, badge_y + 14), "PRINT_STATIC", fill=text_on_accent, font=font_brand)
    
    # === CONTENT SECTION (bottom 35%) ===
    content_y = img_section_h + 0
    
    # Accent color bar
    draw2.rectangle([0, content_y, pin_w, content_y + 8], fill=accent_rgb)
    content_y += 8
    
    # White content area
    draw2.rectangle([0, content_y, pin_w, pin_h], fill=(255, 255, 255))
    content_y += 30
    
    # Load fonts
    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
        font_tagline = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 32)
        font_price = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 34)
        font_cta = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 26)
        font_url = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22)
    except:
        font_title = font_tagline = font_price = font_cta = font_url = ImageFont.load_default()
    
    # Product name (wrapped)
    name_lines = wrap_text(draw2, product["name"], font_title, pin_w - 80)
    for line in name_lines:
        draw2.text((40, content_y), line, fill=(20, 20, 20), font=font_title)
        content_y += 58
    
    content_y += 5
    
    # Tagline
    draw2.text((40, content_y), product["tagline"], fill=(90, 90, 90), font=font_tagline)
    content_y += 50
    
    content_y += 10
    
    # Price + CTA row
    price_text = f"From {product['price']}"
    bbox = draw2.textbbox((0, 0), price_text, font=font_price)
    price_badge_w = bbox[2] - bbox[0] + 36
    price_badge_h = 50
    
    # Price badge
    draw2.rounded_rectangle([40, content_y, 40 + price_badge_w, content_y + price_badge_h], 
                            radius=10, fill=accent_rgb)
    draw2.text((40 + 18, content_y + 9), price_text, fill=text_on_accent, font=font_price)
    
    # CTA button
    cta_text = "INSTANT DOWNLOAD →"
    cta_x = 40 + price_badge_w + 20
    bbox = draw2.textbbox((0, 0), cta_text, font=font_cta)
    cta_w = bbox[2] - bbox[0] + 30
    draw2.rounded_rectangle([cta_x, content_y, cta_x + cta_w, content_y + price_badge_h], 
                            radius=10, fill=(30, 30, 30))
    draw2.text((cta_x + 15, content_y + 12), cta_text, fill=(255, 255, 255), font=font_cta)
    
    content_y += price_badge_h + 20
    
    # Website URL
    draw2.text((40, content_y), "printstatic.com", fill=(150, 150, 150), font=font_url)
    
    # Bottom accent strip
    draw2.rectangle([0, pin_h - 12, pin_w, pin_h], fill=accent_rgb)
    
    # Save
    output_path = os.path.join(output_dir, f"pin_{product['id']}.jpg")
    pin.save(output_path, "JPEG", quality=95)
    print(f"  ✓ {product['name']}")
    return output_path

def main():
    output_dir = "/home/ubuntu/pinterest_pins/images"
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Generating {len(PRODUCTS)} Pinterest pin images (v2)...")
    
    results = []
    for i, product in enumerate(PRODUCTS, 1):
        print(f"[{i}/{len(PRODUCTS)}] ", end="")
        path = create_pin_image(product, output_dir)
        results.append({
            "id": product["id"],
            "name": product["name"],
            "board": product["board"],
            "price": product["price"],
            "tagline": product["tagline"],
            "hashtags": product["hashtags"],
            "path": path,
        })
    
    print(f"\n✅ Done! Generated {len(results)} pin images")
    
    import json
    with open("/home/ubuntu/pinterest_pins/pin_metadata.json", "w") as f:
        json.dump(results, f, indent=2)
    print("📋 Metadata saved to pin_metadata.json")

if __name__ == "__main__":
    main()
