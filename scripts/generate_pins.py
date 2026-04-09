#!/usr/bin/env python3
"""
Generate Pinterest-optimized pin images (1000x1500px) for Print Static products.
Uses existing product CDN images as the base, adds Pinterest-friendly text overlays.
"""

import os
import requests
from PIL import Image, ImageDraw, ImageFont
import io

CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663457026858/i7wpi7roPPicgqaW78ePG8"

# Product data: (id, name, category, board, price, description, image_file)
PRODUCTS = [
    {
        "id": "weekly-planner",
        "name": "Weekly Planner Bundle",
        "category": "planners",
        "board": "Printable Planners",
        "price": "$7.99",
        "tagline": "Stay organized all week long",
        "hashtags": "#weeklyplanner #printableplanner #organizationhacks #plannerlife #freeprintable",
        "image": f"{CDN}/ps-w-weekly-planner_0877369e.png",
        "color": "#00B4D8",
    },
    {
        "id": "budget-planner",
        "name": "Budget Planner Spreadsheet",
        "category": "planners",
        "board": "Printable Planners",
        "price": "$9.99",
        "tagline": "Take control of your finances",
        "hashtags": "#budgetplanner #financeplanning #savemoney #budgeting #printable",
        "image": f"{CDN}/ps-w-budget-planner_e6369639.png",
        "color": "#2D6A4F",
    },
    {
        "id": "habit-tracker",
        "name": "Habit Tracker — 30 Day",
        "category": "planners",
        "board": "Printable Planners",
        "price": "$4.99",
        "tagline": "Build better habits in 30 days",
        "hashtags": "#habittracker #habitchallenge #selfimprovement #printable #dailyroutine",
        "image": f"{CDN}/ps-w-habit-tracker_92792418.png",
        "color": "#6B2D8B",
    },
    {
        "id": "goal-workbook",
        "name": "Goal Setting Workbook",
        "category": "planners",
        "board": "Printable Planners",
        "price": "$12.99",
        "tagline": "Turn your dreams into reality",
        "hashtags": "#goalsetting #goalworkbook #manifestation #printableworkbook #2024goals",
        "image": f"{CDN}/ps-w-goal-workbook_1449c526.png",
        "color": "#F4C430",
    },
    {
        "id": "meal-planner",
        "name": "Meal Planner + Grocery List",
        "category": "planners",
        "board": "Printable Planners",
        "price": "$5.99",
        "tagline": "Plan meals, save time & money",
        "hashtags": "#mealplanner #mealprep #grocerylist #printable #healthyeating",
        "image": f"{CDN}/ps-w-meal-planner_9c0428d4.png",
        "color": "#FF6B6B",
    },
    {
        "id": "journal-bundle",
        "name": "Daily Journal + Gratitude Bundle",
        "category": "planners",
        "board": "Printable Planners",
        "price": "$8.99",
        "tagline": "Reflect, grow, and be grateful",
        "hashtags": "#journaling #gratitudejournal #selfcare #printablejournal #mindfulness",
        "image": f"{CDN}/ps-w-journal-bundle_7050f863.png",
        "color": "#C3B1E1",
    },
    {
        "id": "resume-bundle",
        "name": "Resume Template Bundle",
        "category": "templates",
        "board": "Printable Templates & Invitations",
        "price": "$14.99",
        "tagline": "Land your dream job",
        "hashtags": "#resumetemplate #jobsearch #careeradvice #cvtemplate #getthejob",
        "image": f"{CDN}/ps-w-resume-bundle_66bde203.png",
        "color": "#1E3A5F",
    },
    {
        "id": "social-calendar",
        "name": "Social Media Content Calendar",
        "category": "templates",
        "board": "Digital Productivity & Organization",
        "price": "$11.99",
        "tagline": "Plan your content like a pro",
        "hashtags": "#contentcalendar #socialmediatips #contentcreator #digitalmarketing #printable",
        "image": f"{CDN}/ps-w-social-calendar_65cc33ed.png",
        "color": "#00B4D8",
    },
    {
        "id": "social-templates",
        "name": "Instagram Post Templates",
        "category": "templates",
        "board": "Digital Productivity & Organization",
        "price": "$19.99",
        "tagline": "Stunning posts in minutes",
        "hashtags": "#instagramtemplates #contentcreator #socialmedia #instagrammarketing #canvatemplates",
        "image": f"{CDN}/ps-w-social-templates_7080890b.png",
        "color": "#FF6B6B",
    },
    {
        "id": "notion-template",
        "name": "Notion Productivity Dashboard",
        "category": "templates",
        "board": "Digital Productivity & Organization",
        "price": "$16.99",
        "tagline": "Your ultimate Notion workspace",
        "hashtags": "#notiontemplate #notionsetup #productivity #digitalplanner #workfromhome",
        "image": f"{CDN}/ps-w-notion-template_9a5470c0.png",
        "color": "#111111",
    },
    {
        "id": "brand-kit",
        "name": "Brand Identity Kit",
        "category": "templates",
        "board": "Digital Productivity & Organization",
        "price": "$24.99",
        "tagline": "Build a brand that stands out",
        "hashtags": "#brandidentity #brandkit #smallbusiness #entrepreneur #branddesign",
        "image": f"{CDN}/ps-w-brand-kit_555ecc08.png",
        "color": "#F4C430",
    },
    {
        "id": "business-card",
        "name": "Business Card Template Pack",
        "category": "templates",
        "board": "Printable Templates & Invitations",
        "price": "$7.99",
        "tagline": "Make a lasting first impression",
        "hashtags": "#businesscard #businesscarddesign #networking #printable #smallbusiness",
        "image": f"{CDN}/ps-w-business-card_6f5d760a.png",
        "color": "#2D6A4F",
    },
    {
        "id": "wall-art-geometric",
        "name": "Geometric Wall Art Set",
        "category": "wall-art",
        "board": "Printable Wall Art",
        "price": "$9.99",
        "tagline": "Modern art for every room",
        "hashtags": "#wallart #geometricart #printablewallart #homedecor #modernart",
        "image": f"{CDN}/ps-w-wall-art-geometric_6bffca36.png",
        "color": "#111111",
    },
    {
        "id": "wall-art-quotes",
        "name": "Typography Quote Prints",
        "category": "wall-art",
        "board": "Printable Wall Art",
        "price": "$6.99",
        "tagline": "Inspire your space with words",
        "hashtags": "#quoteprint #wallquotes #inspirationalquotes #printablewallart #homedecor",
        "image": f"{CDN}/ps-w-wall-art-quotes_c4b8c1aa.png",
        "color": "#1E3A5F",
    },
    {
        "id": "wedding-invite",
        "name": "Wedding Invitation Suite",
        "category": "invitations",
        "board": "Printable Templates & Invitations",
        "price": "$29.99",
        "tagline": "Your perfect wedding starts here",
        "hashtags": "#weddinginvitation #weddingstationery #printablewedding #weddingplanning #diywedding",
        "image": f"{CDN}/ps-w-wedding-invite_5946a2a2.png",
        "color": "#FAF7F2",
    },
    {
        "id": "party-invite",
        "name": "Birthday Party Invitation Set",
        "category": "invitations",
        "board": "Printable Templates & Invitations",
        "price": "$5.99",
        "tagline": "Make your party unforgettable",
        "hashtags": "#birthdayinvitation #partyinvite #printableinvitation #birthdayparty #kidsparty",
        "image": f"{CDN}/ps-w-party-invite_3613f456.png",
        "color": "#FF6B6B",
    },
    {
        "id": "kids-activity",
        "name": "Kids Activity Sheets Pack",
        "category": "kids",
        "board": "Printable Templates & Invitations",
        "price": "$7.99",
        "tagline": "Fun learning for little ones",
        "hashtags": "#kidsactivities #printablesforkids #homeschool #kidsworksheets #learningathome",
        "image": f"{CDN}/ps-w-kids-activity_bf12f6af.png",
        "color": "#F4C430",
    },
]

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def get_text_color(bg_hex):
    """Return white or black text based on background luminance."""
    r, g, b = hex_to_rgb(bg_hex)
    luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return (255, 255, 255) if luminance < 0.5 else (17, 17, 17)

def download_image(url):
    """Download image from URL."""
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return Image.open(io.BytesIO(response.content)).convert("RGBA")
    except Exception as e:
        print(f"  Error downloading {url}: {e}")
        return None

def create_pin_image(product, output_dir):
    """Create a Pinterest-optimized pin image (1000x1500px)."""
    pin_w, pin_h = 1000, 1500
    
    # Create base canvas
    pin = Image.new("RGB", (pin_w, pin_h), (255, 255, 255))
    draw = ImageDraw.Draw(pin)
    
    # Color accent
    accent_rgb = hex_to_rgb(product["color"])
    text_color = get_text_color(product["color"])
    
    # Top header bar (brand)
    header_h = 80
    draw.rectangle([0, 0, pin_w, header_h], fill=accent_rgb)
    
    # Brand name in header
    try:
        font_brand = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
    except:
        font_brand = ImageFont.load_default()
    
    brand_text = "PRINT_STATIC"
    bbox = draw.textbbox((0, 0), brand_text, font=font_brand)
    brand_w = bbox[2] - bbox[0]
    draw.text(((pin_w - brand_w) // 2, (header_h - 32) // 2), brand_text, fill=text_color, font=font_brand)
    
    # Product image area (square, centered)
    img_area_y = header_h + 20
    img_area_h = 700
    img_area_x = 40
    img_area_w = pin_w - 80
    
    # Download and place product image
    prod_img = download_image(product["image"])
    if prod_img:
        # Resize to fit the image area while maintaining aspect ratio
        prod_img_rgb = prod_img.convert("RGB")
        prod_img_rgb.thumbnail((img_area_w, img_area_h), Image.LANCZOS)
        
        # Center in the image area
        paste_x = img_area_x + (img_area_w - prod_img_rgb.width) // 2
        paste_y = img_area_y + (img_area_h - prod_img_rgb.height) // 2
        pin.paste(prod_img_rgb, (paste_x, paste_y))
    else:
        # Placeholder if download fails
        draw.rectangle([img_area_x, img_area_y, img_area_x + img_area_w, img_area_y + img_area_h], 
                       fill=(240, 240, 240))
        draw.text((img_area_x + 20, img_area_y + img_area_h // 2), "Product Image", fill=(150, 150, 150))
    
    # Content section below image
    content_y = img_area_y + img_area_h + 30
    
    # Accent bar
    draw.rectangle([0, content_y, pin_w, content_y + 6], fill=accent_rgb)
    content_y += 30
    
    # Product name
    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 44)
        font_tagline = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 30)
        font_price = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)
        font_url = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
        font_cta = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
    except:
        font_title = font_tagline = font_price = font_url = font_cta = ImageFont.load_default()
    
    # Wrap and draw product name
    name = product["name"]
    # Simple word wrap
    words = name.split()
    lines = []
    current_line = ""
    for word in words:
        test_line = current_line + (" " if current_line else "") + word
        bbox = draw.textbbox((0, 0), test_line, font=font_title)
        if bbox[2] - bbox[0] > pin_w - 80:
            if current_line:
                lines.append(current_line)
            current_line = word
        else:
            current_line = test_line
    if current_line:
        lines.append(current_line)
    
    for line in lines:
        draw.text((40, content_y), line, fill=(17, 17, 17), font=font_title)
        content_y += 52
    
    content_y += 10
    
    # Tagline
    draw.text((40, content_y), product["tagline"], fill=(80, 80, 80), font=font_tagline)
    content_y += 50
    
    # Price badge
    price_badge_x = 40
    price_badge_y = content_y
    price_text = f"From {product['price']}"
    bbox = draw.textbbox((0, 0), price_text, font=font_price)
    badge_w = bbox[2] - bbox[0] + 40
    badge_h = bbox[3] - bbox[1] + 20
    draw.rounded_rectangle([price_badge_x, price_badge_y, price_badge_x + badge_w, price_badge_y + badge_h], 
                           radius=8, fill=accent_rgb)
    draw.text((price_badge_x + 20, price_badge_y + 10), price_text, fill=text_color, font=font_price)
    content_y += badge_h + 30
    
    # CTA button
    cta_text = "INSTANT DOWNLOAD →"
    bbox = draw.textbbox((0, 0), cta_text, font=font_cta)
    cta_w = bbox[2] - bbox[0] + 40
    cta_h = bbox[3] - bbox[1] + 20
    draw.rounded_rectangle([40, content_y, 40 + cta_w, content_y + cta_h], 
                           radius=8, fill=(17, 17, 17))
    draw.text((60, content_y + 10), cta_text, fill=(255, 255, 255), font=font_cta)
    content_y += cta_h + 20
    
    # Website URL at bottom
    url_text = "printstatic.com"
    draw.text((40, content_y), url_text, fill=(120, 120, 120), font=font_url)
    
    # Bottom accent bar
    draw.rectangle([0, pin_h - 20, pin_w, pin_h], fill=accent_rgb)
    
    # Save
    output_path = os.path.join(output_dir, f"pin_{product['id']}.jpg")
    pin.convert("RGB").save(output_path, "JPEG", quality=95)
    print(f"  ✓ Created: {output_path}")
    return output_path

def main():
    output_dir = "/home/ubuntu/pinterest_pins/images"
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Generating {len(PRODUCTS)} Pinterest pin images...")
    
    results = []
    for i, product in enumerate(PRODUCTS, 1):
        print(f"\n[{i}/{len(PRODUCTS)}] {product['name']}")
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
    
    print(f"\n✅ Done! Generated {len(results)} pin images in {output_dir}")
    
    # Save metadata
    import json
    with open("/home/ubuntu/pinterest_pins/pin_metadata.json", "w") as f:
        json.dump(results, f, indent=2)
    print("📋 Metadata saved to pin_metadata.json")

if __name__ == "__main__":
    main()
