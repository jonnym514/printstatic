"""
Generate professional placeholder PDFs for all 17 Print Static products.
Each PDF includes: product name, description, usage instructions, and a
"full version" notice so customers know what to expect.
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

OUTPUT_DIR = "/home/ubuntu/product_pdfs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Brand colors
CYAN = HexColor("#00D4C8")
INK = HexColor("#0A0A0A")
LIGHT_GRAY = HexColor("#F5F5F5")
MID_GRAY = HexColor("#888888")

PRODUCTS = [
    {
        "id": "weekly-planner",
        "name": "Weekly Planner Bundle",
        "category": "Planners",
        "price": "$7.99",
        "description": "A complete 7-day planning system with time blocks, priority lists, and a habit tracker. Designed to help you structure your week with intention.",
        "includes": [
            "52-week dated planner pages (A4 & US Letter)",
            "Daily time-block schedule (6 AM – 10 PM)",
            "Weekly priority matrix (top 3 goals)",
            "Habit tracker grid (up to 10 habits)",
            "Notes section for each day",
            "Monthly overview spread",
        ],
        "instructions": "Print on standard 8.5×11\" or A4 paper. Use a 3-ring binder or spiral bind at a local print shop for the best experience. Recommended paper weight: 24 lb bond.",
    },
    {
        "id": "budget-planner",
        "name": "Budget Planner Spreadsheet",
        "category": "Planners",
        "price": "$9.99",
        "description": "A monthly budget tracker that puts you in control of your finances. Track income, expenses, savings goals, and debt payoff all in one place.",
        "includes": [
            "12-month budget tracker pages",
            "Income & expense log",
            "Savings goal tracker",
            "Debt payoff snowball worksheet",
            "Net worth tracker",
            "Annual financial summary",
        ],
        "instructions": "Print on standard 8.5×11\" paper. For best results, print double-sided and bind in a folder. You can also use the PDF digitally with a stylus on a tablet.",
    },
    {
        "id": "habit-tracker",
        "name": "Habit Tracker — 30 Day",
        "category": "Planners",
        "price": "$4.99",
        "description": "Build lasting habits with this 30-day tracker. Monitor up to 20 habits daily with a visual grid that makes streaks satisfying to maintain.",
        "includes": [
            "30-day habit grid (up to 20 habits)",
            "Monthly habit overview",
            "Streak counter column",
            "Weekly reflection prompts",
            "Habit success rate calculator",
            "2 color variants (light & dark)",
        ],
        "instructions": "Print one sheet per month. Check off each habit daily. At the end of the month, calculate your completion rate and set goals for next month.",
    },
    {
        "id": "goal-workbook",
        "name": "Goal Setting Workbook",
        "category": "Planners",
        "price": "$12.99",
        "description": "A comprehensive annual goal-setting system that takes you from big dreams to daily actions. Includes vision board prompts, quarterly milestones, and weekly check-ins.",
        "includes": [
            "Annual vision board worksheet",
            "12-month goal breakdown",
            "Quarterly milestone planner (4 pages)",
            "Monthly focus pages",
            "Weekly action step tracker",
            "Daily intention setter",
            "Year-end review worksheet",
        ],
        "instructions": "Start at the beginning of the year or any month. Complete the vision board first, then work backwards to set quarterly and monthly goals. Review weekly.",
    },
    {
        "id": "meal-planner",
        "name": "Meal Planner + Grocery List",
        "category": "Planners",
        "price": "$5.99",
        "description": "Plan your meals for the week and never forget a grocery item again. Includes a weekly meal grid and a tear-off grocery list organized by store section.",
        "includes": [
            "Weekly meal plan grid (B, L, D, Snacks)",
            "Grocery list organized by category",
            "Pantry inventory checklist",
            "Recipe ideas section",
            "Nutrition notes column",
            "52 weekly sheets (full year)",
        ],
        "instructions": "Print weekly. Fill in your meal plan on Sunday, then use the grocery list for your shopping trip. Organize groceries by store section to save time.",
    },
    {
        "id": "journal-bundle",
        "name": "Daily Journal + Gratitude Bundle",
        "category": "Planners",
        "price": "$8.99",
        "description": "A 30-day journaling system combining morning routine prompts, gratitude practice, and evening reflection to build a powerful daily ritual.",
        "includes": [
            "Morning routine journal (30 pages)",
            "Gratitude prompt cards (30 prompts)",
            "Evening reflection pages",
            "Weekly mood tracker",
            "Monthly highlights page",
            "Blank lined journal pages",
        ],
        "instructions": "Use the morning pages first thing after waking. Complete gratitude prompts at any time. Use evening reflection pages before bed for best results.",
    },
    {
        "id": "resume-bundle",
        "name": "Resume Template Bundle",
        "category": "Templates",
        "price": "$14.99",
        "description": "Five ATS-friendly resume templates in minimal, bold, and creative styles. Compatible with Canva and Microsoft Word for easy editing.",
        "includes": [
            "5 resume templates (PDF + Canva links)",
            "Matching cover letter templates",
            "LinkedIn summary guide",
            "ATS optimization checklist",
            "Action verbs reference sheet",
            "Font & color customization guide",
        ],
        "instructions": "Open the Canva link included in this file to edit your resume. Replace placeholder text with your own information. Export as PDF before submitting to employers.",
    },
    {
        "id": "social-calendar",
        "name": "Social Media Content Calendar",
        "category": "Templates",
        "price": "$11.99",
        "description": "A 90-day content planning system with post ideas, caption templates, and hashtag banks for Instagram, TikTok, Pinterest, and more.",
        "includes": [
            "90-day content calendar grid",
            "30 caption templates per platform",
            "Hashtag bank (500+ hashtags by niche)",
            "Content pillars worksheet",
            "Engagement tracker",
            "Monthly analytics review sheet",
        ],
        "instructions": "Start by defining your 3–5 content pillars. Fill in the calendar 2 weeks at a time. Use the caption templates as starting points and customize for your voice.",
    },
    {
        "id": "social-templates",
        "name": "Instagram Post Templates",
        "category": "Templates",
        "price": "$19.99",
        "description": "50 Canva Instagram post templates covering quotes, carousels, reels covers, and stories. Fully editable with your brand colors and fonts.",
        "includes": [
            "50 Canva post templates",
            "10 quote post designs",
            "15 carousel slide sets",
            "10 reels cover templates",
            "15 story templates",
            "Brand color swap guide",
        ],
        "instructions": "Click the Canva link in this file. Duplicate the template before editing. Replace colors with your brand palette using the brand color swap guide included.",
    },
    {
        "id": "notion-template",
        "name": "Notion Productivity Dashboard",
        "category": "Templates",
        "price": "$16.99",
        "description": "An all-in-one Notion workspace with task manager, habit tracker, reading list, and journal. Duplicate to your Notion account and start immediately.",
        "includes": [
            "Notion workspace template (duplicate link)",
            "Task & project manager",
            "Habit tracker database",
            "Reading list & book notes",
            "Daily journal template",
            "Setup guide (PDF)",
        ],
        "instructions": "Click the Notion duplicate link in this file. You'll need a free Notion account. Duplicate the template to your workspace, then follow the setup guide.",
    },
    {
        "id": "brand-kit",
        "name": "Brand Identity Kit",
        "category": "Templates",
        "price": "$24.99",
        "description": "A complete brand kit with logo templates, color palette guide, font pairing guide, and brand board. Build a cohesive visual identity for your business.",
        "includes": [
            "Brand board template (Canva)",
            "Logo template set (5 variations)",
            "Color palette worksheet",
            "Font pairing guide (20 combinations)",
            "Brand voice worksheet",
            "Social media brand guidelines",
            "Business card template",
        ],
        "instructions": "Start with the brand board template in Canva. Define your colors and fonts first, then apply them consistently across all other templates in this kit.",
    },
    {
        "id": "business-card",
        "name": "Business Card Template Pack",
        "category": "Templates",
        "price": "$6.99",
        "description": "Four professional business card designs — minimal, bold, creative, and classic. Print-ready at standard 3.5×2\" size with bleed marks.",
        "includes": [
            "4 business card designs (Canva + PDF)",
            "Front and back layouts",
            "Print-ready files with bleed",
            "Digital version (no bleed)",
            "QR code placeholder",
            "Print vendor recommendations",
        ],
        "instructions": "Edit in Canva using the included link. Replace placeholder text and colors. Use the print-ready PDF (with bleed) when ordering from a print shop.",
    },
    {
        "id": "wall-art-geometric",
        "name": "Geometric Wall Art Set",
        "category": "Wall Art",
        "price": "$5.99",
        "description": "Six minimalist geometric prints in black, white, and gold. Scalable vector designs that print crisp at any size from 4×6\" to 24×36\".",
        "includes": [
            "6 geometric art prints (PDF + PNG)",
            "Sizes: 4×6, 5×7, 8×10, 11×14, 16×20, 18×24, 24×36",
            "Black, white, and gold color versions",
            "Gallery wall layout guide",
            "Frame size recommendation chart",
        ],
        "instructions": "Choose your preferred size and print at home or at a print shop. For large sizes (16×20 and above), use a professional print service for best quality.",
    },
    {
        "id": "wall-art-quotes",
        "name": "Typography Quote Prints",
        "category": "Wall Art",
        "price": "$4.99",
        "description": "Eight motivational quote prints with bold typographic layouts. Gallery wall ready with coordinating designs that work together or individually.",
        "includes": [
            "8 quote art prints (PDF + PNG)",
            "Sizes: 5×7, 8×10, 11×14",
            "Light and dark background versions",
            "Gallery wall arrangement guide",
            "Quotes: motivation, mindset, creativity",
        ],
        "instructions": "Print on matte photo paper or cardstock for the best look. Standard 8×10 frames from IKEA, Target, or Amazon work perfectly with these prints.",
    },
    {
        "id": "wedding-invite",
        "name": "Wedding Invitation Suite",
        "category": "Invitations",
        "price": "$18.99",
        "description": "An elegant wedding invitation suite including invitation, RSVP card, and envelope liner. Fully editable in Canva with your names, date, and venue.",
        "includes": [
            "Wedding invitation (5×7\")",
            "RSVP card (4×6\")",
            "Envelope liner (A7)",
            "Details card (4×6\")",
            "Save the date card",
            "Canva editing guide",
            "Print vendor recommendations",
        ],
        "instructions": "Open the Canva link in this file. Edit all text fields with your wedding details. For printing, we recommend Minted, Zola, or your local print shop. Order a proof first.",
    },
    {
        "id": "party-invite",
        "name": "Birthday Party Invitation Set",
        "category": "Invitations",
        "price": "$7.99",
        "description": "A modern birthday invitation set with matching party banner and checklist. Clean black, white, and cyan design that works for any age.",
        "includes": [
            "Birthday invitation (5×7\")",
            "Party banner (printable)",
            "Party planning checklist",
            "Thank you card template",
            "Envelope liner",
            "Digital version for email/text",
        ],
        "instructions": "Edit in Canva using the included link. For the party banner, print on cardstock and cut along the lines. String together with twine for a festive display.",
    },
    {
        "id": "kids-activity",
        "name": "Kids Activity Sheets Pack",
        "category": "Kids",
        "price": "$6.99",
        "description": "30 educational activity sheets covering alphabet tracing, counting, coloring, and puzzles. Designed for ages 3–8 to make learning fun.",
        "includes": [
            "10 alphabet tracing sheets (A–Z)",
            "8 counting & number worksheets",
            "6 coloring pages (animals & nature)",
            "6 puzzle pages (mazes, matching)",
            "Progress reward chart",
            "Parent guide with activity tips",
        ],
        "instructions": "Print on standard 8.5×11\" paper. For reusable sheets, laminate and use dry-erase markers. Print as many copies as needed — unlimited personal use.",
    },
]


def create_pdf(product: dict, output_path: str):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    header_style = ParagraphStyle(
        "Header",
        parent=styles["Normal"],
        fontSize=9,
        textColor=MID_GRAY,
        fontName="Helvetica",
        spaceAfter=2,
    )
    category_style = ParagraphStyle(
        "Category",
        parent=styles["Normal"],
        fontSize=10,
        textColor=CYAN,
        fontName="Helvetica-Bold",
        spaceAfter=6,
    )
    title_style = ParagraphStyle(
        "Title",
        parent=styles["Normal"],
        fontSize=28,
        textColor=INK,
        fontName="Helvetica-Bold",
        spaceAfter=12,
        leading=34,
    )
    price_style = ParagraphStyle(
        "Price",
        parent=styles["Normal"],
        fontSize=14,
        textColor=CYAN,
        fontName="Helvetica-Bold",
        spaceAfter=16,
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontSize=11,
        textColor=INK,
        fontName="Helvetica",
        spaceAfter=8,
        leading=16,
    )
    section_title_style = ParagraphStyle(
        "SectionTitle",
        parent=styles["Normal"],
        fontSize=12,
        textColor=INK,
        fontName="Helvetica-Bold",
        spaceBefore=16,
        spaceAfter=8,
    )
    bullet_style = ParagraphStyle(
        "Bullet",
        parent=styles["Normal"],
        fontSize=10,
        textColor=INK,
        fontName="Helvetica",
        spaceAfter=4,
        leftIndent=16,
        leading=14,
    )
    instructions_style = ParagraphStyle(
        "Instructions",
        parent=styles["Normal"],
        fontSize=10,
        textColor=HexColor("#333333"),
        fontName="Helvetica",
        spaceAfter=8,
        leading=15,
        backColor=LIGHT_GRAY,
        borderPad=8,
    )
    notice_style = ParagraphStyle(
        "Notice",
        parent=styles["Normal"],
        fontSize=9,
        textColor=MID_GRAY,
        fontName="Helvetica-Oblique",
        alignment=TA_CENTER,
        spaceAfter=4,
    )

    story = []

    # ── Top bar ──────────────────────────────────────────────────────────────
    story.append(Paragraph("PRINT_STATIC  ·  printstatic.com", header_style))
    story.append(HRFlowable(width="100%", thickness=2, color=CYAN, spaceAfter=16))

    # ── Category + Title ─────────────────────────────────────────────────────
    story.append(Paragraph(product["category"].upper(), category_style))
    story.append(Paragraph(product["name"], title_style))
    story.append(Paragraph(product["price"], price_style))

    # ── Description ──────────────────────────────────────────────────────────
    story.append(Paragraph(product["description"], body_style))
    story.append(Spacer(1, 8))

    # ── What's Included ──────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#DDDDDD"), spaceAfter=0))
    story.append(Paragraph("WHAT'S INCLUDED", section_title_style))
    for item in product["includes"]:
        story.append(Paragraph(f"→  {item}", bullet_style))

    story.append(Spacer(1, 12))

    # ── How to Use ───────────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#DDDDDD"), spaceAfter=0))
    story.append(Paragraph("HOW TO USE", section_title_style))
    story.append(Paragraph(product["instructions"], body_style))

    story.append(Spacer(1, 20))

    # ── License notice ───────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=1, color=HexColor("#EEEEEE"), spaceAfter=12))
    story.append(Paragraph(
        "Personal use only. Unlimited personal printing. Not for resale or redistribution.",
        notice_style,
    ))
    story.append(Paragraph(
        "Questions? hello@printstatic.com  ·  printstatic.com",
        notice_style,
    ))

    doc.build(story)
    print(f"  ✓ {product['id']}.pdf")


print("Generating PDFs for all 17 products...")
for product in PRODUCTS:
    path = os.path.join(OUTPUT_DIR, f"{product['id']}.pdf")
    create_pdf(product, path)

print(f"\nDone! {len(PRODUCTS)} PDFs saved to {OUTPUT_DIR}")
