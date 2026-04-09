#!/usr/bin/env python3
"""
Automate posting Pinterest pins using the browser.
Uses the existing browser session via CDP.
"""

import json
import time
import subprocess
import sys

# Load pin metadata
with open("/home/ubuntu/pinterest_pins/pin_metadata.json") as f:
    pins = json.load(f)

# Board URL mapping
BOARD_URLS = {
    "Printable Planners": "printable-planners",
    "Printable Wall Art": "printable-wall-art",
    "Printable Templates & Invitations": "printable-templates-invitations",
    "Digital Productivity & Organization": "digital-productivity-organization",
}

PRODUCT_URLS = {
    "weekly-planner": "https://www.printstatic.com/products/weekly-planner",
    "budget-planner": "https://www.printstatic.com/products/budget-planner",
    "habit-tracker": "https://www.printstatic.com/products/habit-tracker",
    "goal-workbook": "https://www.printstatic.com/products/goal-workbook",
    "meal-planner": "https://www.printstatic.com/products/meal-planner",
    "journal-bundle": "https://www.printstatic.com/products/journal-bundle",
    "resume-bundle": "https://www.printstatic.com/products/resume-bundle",
    "social-calendar": "https://www.printstatic.com/products/social-calendar",
    "social-templates": "https://www.printstatic.com/products/social-templates",
    "notion-template": "https://www.printstatic.com/products/notion-template",
    "brand-kit": "https://www.printstatic.com/products/brand-kit",
    "business-card": "https://www.printstatic.com/products/business-card",
    "wall-art-geometric": "https://www.printstatic.com/products/wall-art-geometric",
    "wall-art-quotes": "https://www.printstatic.com/products/wall-art-quotes",
    "wedding-invite": "https://www.printstatic.com/products/wedding-invite",
    "party-invite": "https://www.printstatic.com/products/party-invite",
    "kids-activity": "https://www.printstatic.com/products/kids-activity",
}

print(f"Total pins to post: {len(pins)}")
for i, pin in enumerate(pins, 1):
    print(f"\n[{i}/{len(pins)}] {pin['name']} → Board: {pin['board']}")
    print(f"  Image: {pin['path']}")
    print(f"  URL: {PRODUCT_URLS.get(pin['id'], 'https://www.printstatic.com')}")
