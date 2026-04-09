"""
Generate real, well-designed PDF files for all Print Static products.
Each PDF is a functional, print-ready template matching the product description.
"""
import os
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas
from reportlab.graphics.shapes import Drawing, Rect, Line, Circle, String
from reportlab.graphics import renderPDF

OUTPUT_DIR = "/home/ubuntu/product_pdfs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

TEAL = colors.HexColor("#00B4A6")
DARK = colors.HexColor("#0D0D0D")
LIGHT_GRAY = colors.HexColor("#F5F5F5")
MID_GRAY = colors.HexColor("#CCCCCC")
TEXT_GRAY = colors.HexColor("#666666")
WHITE = colors.white

def make_header(c, title, subtitle, page_w, page_h, accent=TEAL):
    """Draw a clean header bar at the top of the page."""
    # Top accent bar
    c.setFillColor(accent)
    c.rect(0, page_h - 0.6*inch, page_w, 0.6*inch, fill=1, stroke=0)
    # Title
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(0.5*inch, page_h - 0.42*inch, title)
    # Subtitle
    c.setFont("Helvetica", 9)
    c.drawRightString(page_w - 0.5*inch, page_h - 0.42*inch, subtitle)
    # Bottom line
    c.setStrokeColor(DARK)
    c.setLineWidth(0.5)
    c.line(0.5*inch, page_h - 0.75*inch, page_w - 0.5*inch, page_h - 0.75*inch)

def make_footer(c, page_w, text="PRINT_STATIC · printstatic.com · Print unlimited copies · Yours forever"):
    c.setFillColor(MID_GRAY)
    c.setFont("Helvetica", 7)
    c.drawCentredString(page_w / 2, 0.3*inch, text)

# ─── 1. Weekly Planner Bundle ─────────────────────────────────────────────────
def gen_weekly_planner():
    path = f"{OUTPUT_DIR}/weekly-planner.pdf"
    c = canvas.Canvas(path, pagesize=letter)
    W, H = letter

    make_header(c, "WEEKLY PLANNER", "Week of: ___________________", W, H)
    make_footer(c, W)

    days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]
    col_w = (W - inch) / 7
    top_y = H - 1.1*inch
    box_h = 4.5*inch

    for i, day in enumerate(days):
        x = 0.5*inch + i * col_w
        # Day header
        c.setFillColor(DARK)
        c.rect(x, top_y - 0.3*inch, col_w - 4, 0.3*inch, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(x + (col_w-4)/2, top_y - 0.2*inch, day)
        # Box
        c.setStrokeColor(MID_GRAY)
        c.setLineWidth(0.5)
        c.rect(x, top_y - 0.3*inch - box_h, col_w - 4, box_h, fill=0, stroke=1)
        # Lines inside
        c.setStrokeColor(LIGHT_GRAY)
        for j in range(1, 9):
            ly = top_y - 0.3*inch - box_h + j * (box_h / 9)
            c.line(x + 4, ly, x + col_w - 8, ly)

    # Notes section
    notes_y = top_y - 0.3*inch - box_h - 0.3*inch
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(0.5*inch, notes_y, "NOTES & PRIORITIES")
    c.setStrokeColor(MID_GRAY)
    c.rect(0.5*inch, notes_y - 1.5*inch, W - inch, 1.4*inch, fill=0, stroke=1)
    for j in range(1, 5):
        ly = notes_y - j * (1.4*inch / 5)
        c.setStrokeColor(LIGHT_GRAY)
        c.line(0.6*inch, ly, W - 0.6*inch, ly)

    c.save()
    print(f"✓ {path}")

# ─── 2. Budget Planner Spreadsheet ───────────────────────────────────────────
def gen_budget_planner():
    path = f"{OUTPUT_DIR}/budget-planner.pdf"
    c = canvas.Canvas(path, pagesize=letter)
    W, H = letter

    make_header(c, "MONTHLY BUDGET PLANNER", "Month: ___________________  Year: _______", W, H)
    make_footer(c, W)

    y = H - 1.1*inch
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(DARK)
    c.drawString(0.5*inch, y, "INCOME")

    headers = ["Source", "Budgeted", "Actual", "Difference"]
    col_ws = [2.8*inch, 1.3*inch, 1.3*inch, 1.3*inch]
    rows = ["Salary / Wages", "Freelance / Side Income", "Other Income", "TOTAL INCOME"]

    y -= 0.35*inch
    x = 0.5*inch
    c.setFillColor(DARK)
    c.rect(x, y - 0.25*inch, sum(col_ws), 0.25*inch, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 8)
    cx = x
    for h, cw in zip(headers, col_ws):
        c.drawString(cx + 4, y - 0.17*inch, h)
        cx += cw

    c.setFillColor(DARK)
    c.setFont("Helvetica", 8)
    for i, row in enumerate(rows):
        ry = y - 0.25*inch - (i+1)*0.28*inch
        bg = LIGHT_GRAY if i % 2 == 0 else WHITE
        if row.startswith("TOTAL"):
            bg = colors.HexColor("#E8F8F7")
            c.setFont("Helvetica-Bold", 8)
        else:
            c.setFont("Helvetica", 8)
        c.setFillColor(bg)
        c.rect(x, ry - 0.04*inch, sum(col_ws), 0.28*inch, fill=1, stroke=0)
        c.setFillColor(DARK)
        c.drawString(x + 4, ry + 0.06*inch, row)
        cx2 = x + col_ws[0]
        for cw in col_ws[1:]:
            c.setStrokeColor(MID_GRAY)
            c.line(cx2, ry - 0.04*inch, cx2, ry + 0.24*inch)
            cx2 += cw
        c.setStrokeColor(MID_GRAY)
        c.line(x, ry - 0.04*inch, x + sum(col_ws), ry - 0.04*inch)

    # Expenses section
    y2 = y - 0.25*inch - len(rows)*0.28*inch - 0.4*inch
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(DARK)
    c.drawString(0.5*inch, y2, "EXPENSES")

    expense_cats = ["Housing / Rent", "Utilities", "Groceries", "Transportation",
                    "Insurance", "Subscriptions", "Entertainment", "Clothing",
                    "Healthcare", "Savings / Investments", "Debt Payments", "Other", "TOTAL EXPENSES"]

    y2 -= 0.35*inch
    c.setFillColor(DARK)
    c.rect(x, y2 - 0.25*inch, sum(col_ws), 0.25*inch, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 8)
    cx = x
    for h, cw in zip(headers, col_ws):
        c.drawString(cx + 4, y2 - 0.17*inch, h)
        cx += cw

    for i, row in enumerate(expense_cats):
        ry = y2 - 0.25*inch - (i+1)*0.24*inch
        bg = LIGHT_GRAY if i % 2 == 0 else WHITE
        if row.startswith("TOTAL"):
            bg = colors.HexColor("#E8F8F7")
            c.setFont("Helvetica-Bold", 8)
        else:
            c.setFont("Helvetica", 8)
        c.setFillColor(bg)
        c.rect(x, ry - 0.04*inch, sum(col_ws), 0.24*inch, fill=1, stroke=0)
        c.setFillColor(DARK)
        c.drawString(x + 4, ry + 0.04*inch, row)
        cx2 = x + col_ws[0]
        for cw in col_ws[1:]:
            c.setStrokeColor(MID_GRAY)
            c.line(cx2, ry - 0.04*inch, cx2, ry + 0.2*inch)
            cx2 += cw
        c.setStrokeColor(MID_GRAY)
        c.line(x, ry - 0.04*inch, x + sum(col_ws), ry - 0.04*inch)

    c.save()
    print(f"✓ {path}")

# ─── 3. Habit Tracker ─────────────────────────────────────────────────────────
def gen_habit_tracker():
    path = f"{OUTPUT_DIR}/habit-tracker.pdf"
    c = canvas.Canvas(path, pagesize=letter)
    W, H = letter

    make_header(c, "30-DAY HABIT TRACKER", "Month: ___________________  Goal: ___________________", W, H)
    make_footer(c, W)

    habits = [
        "Exercise / Workout", "Drink 8 glasses of water", "Read for 30 minutes",
        "Meditate / Mindfulness", "No social media after 9pm", "Sleep 8 hours",
        "Healthy eating", "Journal / Gratitude", "Learn something new", "Connect with someone",
    ]

    days = list(range(1, 31))
    cell_size = (W - 2.5*inch) / 30
    habit_col_w = 2.3*inch
    top_y = H - 1.1*inch

    # Day headers
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 6)
    for i, d in enumerate(days):
        x = 0.5*inch + habit_col_w + i * cell_size
        c.drawCentredString(x + cell_size/2, top_y - 0.18*inch, str(d))

    # Habit rows
    for r, habit in enumerate(habits):
        row_y = top_y - 0.3*inch - r * 0.42*inch
        bg = LIGHT_GRAY if r % 2 == 0 else WHITE
        c.setFillColor(bg)
        c.rect(0.5*inch, row_y - 0.38*inch, W - inch, 0.38*inch, fill=1, stroke=0)
        c.setFillColor(DARK)
        c.setFont("Helvetica", 8)
        c.drawString(0.55*inch, row_y - 0.22*inch, habit)
        # Day cells
        for i in range(30):
            cx = 0.5*inch + habit_col_w + i * cell_size
            c.setStrokeColor(MID_GRAY)
            c.setLineWidth(0.3)
            c.rect(cx, row_y - 0.36*inch, cell_size - 1, 0.34*inch, fill=0, stroke=1)

    # Legend
    legend_y = top_y - 0.3*inch - len(habits) * 0.42*inch - 0.3*inch
    c.setFont("Helvetica", 8)
    c.setFillColor(TEXT_GRAY)
    c.drawString(0.5*inch, legend_y, "✓ = Completed   ✗ = Missed   ○ = Partial   — = N/A")

    c.save()
    print(f"✓ {path}")

# ─── 4. Goal Setting Workbook ─────────────────────────────────────────────────
def gen_goal_workbook():
    path = f"{OUTPUT_DIR}/goal-workbook.pdf"
    c = canvas.Canvas(path, pagesize=letter)
    W, H = letter

    make_header(c, "GOAL SETTING WORKBOOK", "Quarter: _______  Year: _______", W, H)
    make_footer(c, W)

    y = H - 1.2*inch
    sections = [
        ("MY BIG GOAL", 1.0*inch),
        ("WHY THIS MATTERS TO ME", 0.8*inch),
        ("3 MILESTONES TO HIT", 1.2*inch),
        ("POTENTIAL OBSTACLES", 0.7*inch),
        ("HOW I'LL OVERCOME THEM", 0.7*inch),
        ("DAILY ACTIONS (Top 3)", 0.9*inch),
        ("ACCOUNTABILITY CHECK-IN", 0.6*inch),
        ("REWARD WHEN ACHIEVED", 0.5*inch),
    ]

    for title, box_h in sections:
        c.setFillColor(TEAL)
        c.rect(0.5*inch, y - 0.22*inch, W - inch, 0.22*inch, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 8)
        c.drawString(0.6*inch, y - 0.15*inch, title)
        c.setStrokeColor(MID_GRAY)
        c.setLineWidth(0.5)
        c.rect(0.5*inch, y - 0.22*inch - box_h, W - inch, box_h, fill=0, stroke=1)
        # Lines inside
        num_lines = max(2, int(box_h / (0.22*inch)))
        for j in range(1, num_lines):
            ly = y - 0.22*inch - box_h + j * (box_h / num_lines)
            c.setStrokeColor(LIGHT_GRAY)
            c.line(0.6*inch, ly, W - 0.6*inch, ly)
        y -= (0.22*inch + box_h + 0.12*inch)

    c.save()
    print(f"✓ {path}")

# ─── 5. Meal Planner + Grocery List ──────────────────────────────────────────
def gen_meal_planner():
    path = f"{OUTPUT_DIR}/meal-planner.pdf"
    c = canvas.Canvas(path, pagesize=letter)
    W, H = letter

    make_header(c, "MEAL PLANNER + GROCERY LIST", "Week of: ___________________", W, H)
    make_footer(c, W)

    days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
    meals = ["Breakfast", "Lunch", "Dinner", "Snack"]
    left_w = W * 0.6 - 0.5*inch
    right_w = W * 0.4 - 0.1*inch
    top_y = H - 1.1*inch
    col_w = left_w / len(days)
    row_h = 0.75*inch

    # Day headers
    for i, day in enumerate(days):
        x = 0.5*inch + i * col_w
        c.setFillColor(DARK)
        c.rect(x, top_y - 0.25*inch, col_w - 2, 0.25*inch, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(x + (col_w-2)/2, top_y - 0.17*inch, day)

    for r, meal in enumerate(meals):
        ry = top_y - 0.25*inch - r * row_h
        c.setFillColor(TEAL if r == 0 else LIGHT_GRAY)
        c.rect(0.5*inch - 0.05*inch, ry - row_h, 0.05*inch + 0.4*inch, row_h, fill=1, stroke=0)
        c.setFillColor(WHITE if r == 0 else DARK)
        c.setFont("Helvetica-Bold", 7)
        c.saveState()
        c.translate(0.5*inch + 0.15*inch, ry - row_h/2)
        c.rotate(90)
        c.drawCentredString(0, 0, meal.upper())
        c.restoreState()
        for i in range(len(days)):
            x = 0.5*inch + i * col_w
            c.setStrokeColor(MID_GRAY)
            c.setLineWidth(0.3)
            c.rect(x + 0.35*inch, ry - row_h + 2, col_w - 0.37*inch - 2, row_h - 4, fill=0, stroke=1)

    # Grocery list
    gx = 0.5*inch + left_w + 0.2*inch
    gy = top_y
    c.setFillColor(DARK)
    c.rect(gx, gy - 0.25*inch, right_w, 0.25*inch, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(gx + 4, gy - 0.17*inch, "GROCERY LIST")
    cats = ["Produce", "Meat & Fish", "Dairy", "Pantry", "Frozen", "Other"]
    cat_y = gy - 0.25*inch
    for cat in cats:
        c.setFillColor(LIGHT_GRAY)
        c.rect(gx, cat_y - 0.22*inch, right_w, 0.22*inch, fill=1, stroke=0)
        c.setFillColor(DARK)
        c.setFont("Helvetica-Bold", 7)
        c.drawString(gx + 4, cat_y - 0.15*inch, cat.upper())
        cat_y -= 0.22*inch
        for _ in range(4):
            c.setStrokeColor(MID_GRAY)
            c.setLineWidth(0.3)
            c.rect(gx + 4, cat_y - 0.22*inch, 8, 8, fill=0, stroke=1)
            c.setFont("Helvetica", 7)
            c.setFillColor(DARK)
            c.drawString(gx + 16, cat_y - 0.15*inch, "")
            c.setStrokeColor(LIGHT_GRAY)
            c.line(gx + 16, cat_y - 0.18*inch, gx + right_w - 4, cat_y - 0.18*inch)
            cat_y -= 0.22*inch
        cat_y -= 0.05*inch

    c.save()
    print(f"✓ {path}")

# ─── Generic lined page generator ─────────────────────────────────────────────
def gen_lined_journal(path, title, subtitle, prompts=None):
    c = canvas.Canvas(path, pagesize=letter)
    W, H = letter
    make_header(c, title, subtitle, W, H)
    make_footer(c, W)
    y = H - 1.2*inch
    if prompts:
        for prompt in prompts:
            c.setFillColor(TEAL)
            c.rect(0.5*inch, y - 0.2*inch, W - inch, 0.2*inch, fill=1, stroke=0)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 8)
            c.drawString(0.6*inch, y - 0.14*inch, prompt)
            y -= 0.2*inch
            for _ in range(4):
                c.setStrokeColor(MID_GRAY)
                c.line(0.5*inch, y - 0.05*inch, W - 0.5*inch, y - 0.05*inch)
                y -= 0.28*inch
            y -= 0.1*inch
    else:
        while y > 0.8*inch:
            c.setStrokeColor(MID_GRAY)
            c.line(0.5*inch, y, W - 0.5*inch, y)
            y -= 0.3*inch
    c.save()
    print(f"✓ {path}")

# ─── Resume template ──────────────────────────────────────────────────────────
def gen_resume():
    path = f"{OUTPUT_DIR}/resume-bundle.pdf"
    c = canvas.Canvas(path, pagesize=letter)
    W, H = letter

    # Left sidebar
    c.setFillColor(DARK)
    c.rect(0, 0, 2.2*inch, H, fill=1, stroke=0)

    # Name area
    c.setFillColor(TEAL)
    c.rect(0, H - 1.8*inch, 2.2*inch, 1.8*inch, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(0.2*inch, H - 0.8*inch, "YOUR NAME")
    c.setFont("Helvetica", 10)
    c.drawString(0.2*inch, H - 1.1*inch, "Job Title Here")
    c.setFont("Helvetica", 8)
    c.drawString(0.2*inch, H - 1.4*inch, "email@example.com")
    c.drawString(0.2*inch, H - 1.6*inch, "(555) 000-0000")

    # Sidebar sections
    sidebar_sections = [
        ("SKILLS", ["Skill One", "Skill Two", "Skill Three", "Skill Four", "Skill Five"]),
        ("EDUCATION", ["Degree, Major", "University Name", "2018 – 2022"]),
        ("LANGUAGES", ["English — Native", "Spanish — Intermediate"]),
        ("INTERESTS", ["Interest One", "Interest Two", "Interest Three"]),
    ]
    sy = H - 2.1*inch
    for section_title, items in sidebar_sections:
        c.setFillColor(TEAL)
        c.setFont("Helvetica-Bold", 8)
        c.drawString(0.2*inch, sy, section_title)
        c.setStrokeColor(TEAL)
        c.line(0.2*inch, sy - 0.05*inch, 2.0*inch, sy - 0.05*inch)
        sy -= 0.25*inch
        c.setFillColor(WHITE)
        c.setFont("Helvetica", 8)
        for item in items:
            c.drawString(0.2*inch, sy, item)
            sy -= 0.2*inch
        sy -= 0.15*inch

    # Main content
    mx = 2.4*inch
    my = H - 0.8*inch
    main_sections = [
        ("PROFESSIONAL SUMMARY", [
            "Results-driven professional with X years of experience in [industry].",
            "Proven track record of [achievement]. Passionate about [field].",
            "Seeking a challenging role where I can leverage my skills in [area].",
        ]),
        ("WORK EXPERIENCE", [
            "Job Title | Company Name | 2022 – Present",
            "• Accomplished [X] resulting in [Y% improvement]",
            "• Led a team of [N] to deliver [project] on time and under budget",
            "• Implemented [process] that reduced [metric] by [amount]",
            "",
            "Previous Job Title | Company Name | 2019 – 2022",
            "• Managed [responsibility] across [scope]",
            "• Collaborated with [teams] to achieve [outcome]",
        ]),
        ("PROJECTS", [
            "Project Name | github.com/yourname/project",
            "Brief description of the project, technologies used, and impact.",
        ]),
    ]
    for section_title, lines in main_sections:
        c.setFillColor(DARK)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(mx, my, section_title)
        c.setStrokeColor(TEAL)
        c.setLineWidth(1.5)
        c.line(mx, my - 0.08*inch, W - 0.4*inch, my - 0.08*inch)
        my -= 0.3*inch
        c.setFillColor(TEXT_GRAY)
        c.setFont("Helvetica", 8.5)
        for line in lines:
            if line.startswith("Job Title") or line.startswith("Previous"):
                c.setFont("Helvetica-Bold", 8.5)
                c.setFillColor(DARK)
            else:
                c.setFont("Helvetica", 8.5)
                c.setFillColor(TEXT_GRAY)
            c.drawString(mx, my, line)
            my -= 0.22*inch
        my -= 0.15*inch

    c.save()
    print(f"✓ {path}")

# ─── Social Media Content Calendar ────────────────────────────────────────────
def gen_social_calendar():
    path = f"{OUTPUT_DIR}/social-calendar.pdf"
    c = canvas.Canvas(path, pagesize=letter)
    W, H = letter
    make_header(c, "SOCIAL MEDIA CONTENT CALENDAR", "Month: ___________________  Platform: ___________________", W, H)
    make_footer(c, W)

    platforms = ["Instagram", "TikTok", "LinkedIn", "Twitter/X", "Facebook"]
    days_of_week = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
    weeks = 4
    col_w = (W - inch) / 7
    row_h = 1.1*inch
    top_y = H - 1.1*inch

    # Headers
    for i, day in enumerate(days_of_week):
        x = 0.5*inch + i * col_w
        c.setFillColor(DARK)
        c.rect(x, top_y - 0.25*inch, col_w - 2, 0.25*inch, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(x + (col_w-2)/2, top_y - 0.17*inch, day)

    for w in range(weeks):
        for d in range(7):
            x = 0.5*inch + d * col_w
            y = top_y - 0.25*inch - w * row_h
            c.setStrokeColor(MID_GRAY)
            c.setLineWidth(0.3)
            c.rect(x, y - row_h, col_w - 2, row_h, fill=0, stroke=1)
            # Date number
            c.setFillColor(TEAL)
            c.setFont("Helvetica-Bold", 8)
            c.drawString(x + 3, y - 0.15*inch, str(w*7 + d + 1))
            # Platform checkboxes
            c.setFont("Helvetica", 6)
            c.setFillColor(TEXT_GRAY)
            for pi, plat in enumerate(platforms[:3]):
                c.rect(x + 3, y - 0.3*inch - pi*0.18*inch, 6, 6, fill=0, stroke=1)
                c.drawString(x + 12, y - 0.26*inch - pi*0.18*inch, plat)

    c.save()
    print(f"✓ {path}")

# ─── Simple template generator ────────────────────────────────────────────────
def gen_simple_template(filename, title, subtitle, content_blocks):
    path = f"{OUTPUT_DIR}/{filename}.pdf"
    c = canvas.Canvas(path, pagesize=letter)
    W, H = letter
    make_header(c, title, subtitle, W, H)
    make_footer(c, W)
    y = H - 1.2*inch
    for block_title, block_lines in content_blocks:
        if y < 1.5*inch:
            c.showPage()
            make_header(c, title, subtitle, W, H)
            make_footer(c, W)
            y = H - 1.2*inch
        c.setFillColor(TEAL)
        c.rect(0.5*inch, y - 0.22*inch, W - inch, 0.22*inch, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(0.6*inch, y - 0.15*inch, block_title)
        y -= 0.22*inch
        c.setFillColor(DARK)
        c.setFont("Helvetica", 8.5)
        for line in block_lines:
            c.setStrokeColor(LIGHT_GRAY)
            c.line(0.5*inch, y - 0.05*inch, W - 0.5*inch, y - 0.05*inch)
            if line:
                c.drawString(0.6*inch, y + 0.02*inch, line)
            y -= 0.28*inch
        y -= 0.12*inch
    c.save()
    print(f"✓ {path}")

# ─── Wall Art ─────────────────────────────────────────────────────────────────
def gen_wall_art_geometric():
    path = f"{OUTPUT_DIR}/wall-art-geometric.pdf"
    c = canvas.Canvas(path, pagesize=letter)
    W, H = letter

    # Background
    c.setFillColor(DARK)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Geometric shapes
    c.setStrokeColor(TEAL)
    c.setLineWidth(1.5)
    cx, cy = W/2, H/2

    # Outer hexagon-like polygon
    import math
    def polygon(cx, cy, r, n, rotation=0):
        pts = []
        for i in range(n):
            angle = math.radians(rotation + i * 360/n)
            pts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
        return pts

    for r, lw in [(2.5*inch, 2), (2.0*inch, 1.5), (1.5*inch, 1), (1.0*inch, 0.8)]:
        pts = polygon(cx, cy, r, 6, rotation=30)
        c.setLineWidth(lw)
        c.setStrokeColor(TEAL if r == 2.5*inch else WHITE)
        p = c.beginPath()
        p.moveTo(*pts[0])
        for pt in pts[1:]:
            p.lineTo(*pt)
        p.close()
        c.drawPath(p, fill=0, stroke=1)

    # Center diamond
    c.setStrokeColor(TEAL)
    c.setLineWidth(2)
    d = 0.5*inch
    p = c.beginPath()
    p.moveTo(cx, cy + d)
    p.lineTo(cx + d, cy)
    p.lineTo(cx, cy - d)
    p.lineTo(cx - d, cy)
    p.close()
    c.drawPath(p, fill=0, stroke=1)

    # Title
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(cx, H - 1.2*inch, "GEOMETRIC")
    c.setFillColor(TEAL)
    c.setFont("Helvetica", 14)
    c.drawCentredString(cx, H - 1.6*inch, "MINIMALIST WALL ART")
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 8)
    c.drawCentredString(cx, 0.5*inch, "PRINT_STATIC · printstatic.com")

    c.save()
    print(f"✓ {path}")

def gen_wall_art_quotes():
    path = f"{OUTPUT_DIR}/wall-art-quotes.pdf"
    c = canvas.Canvas(path, pagesize=letter)
    W, H = letter

    c.setFillColor(colors.HexColor("#FAFAF8"))
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Border
    c.setStrokeColor(DARK)
    c.setLineWidth(3)
    c.rect(0.4*inch, 0.4*inch, W - 0.8*inch, H - 0.8*inch, fill=0, stroke=1)
    c.setLineWidth(1)
    c.rect(0.55*inch, 0.55*inch, W - 1.1*inch, H - 1.1*inch, fill=0, stroke=1)

    # Quote
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(W/2, H*0.65, '"The best time')
    c.drawCentredString(W/2, H*0.57, 'to plant a tree')
    c.setFillColor(TEAL)
    c.drawCentredString(W/2, H*0.49, 'was 20 years ago.')
    c.setFillColor(DARK)
    c.drawCentredString(W/2, H*0.41, 'The second best')
    c.drawCentredString(W/2, H*0.33, 'time is now."')

    c.setFont("Helvetica", 12)
    c.drawCentredString(W/2, H*0.26, '— Chinese Proverb')

    c.setStrokeColor(TEAL)
    c.setLineWidth(2)
    c.line(W/2 - 1*inch, H*0.23, W/2 + 1*inch, H*0.23)

    c.setFont("Helvetica", 8)
    c.setFillColor(TEXT_GRAY)
    c.drawCentredString(W/2, 0.65*inch, "PRINT_STATIC · printstatic.com")

    c.save()
    print(f"✓ {path}")

# ─── Invitation templates ─────────────────────────────────────────────────────
def gen_wedding_invite():
    path = f"{OUTPUT_DIR}/wedding-invite.pdf"
    c = canvas.Canvas(path, pagesize=letter)
    W, H = letter

    c.setFillColor(colors.HexColor("#FDFBF7"))
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Decorative border
    c.setStrokeColor(colors.HexColor("#C9A96E"))
    c.setLineWidth(2)
    c.rect(0.5*inch, 0.5*inch, W - inch, H - inch, fill=0, stroke=1)
    c.setLineWidth(0.5)
    c.rect(0.65*inch, 0.65*inch, W - 1.3*inch, H - 1.3*inch, fill=0, stroke=1)

    gold = colors.HexColor("#C9A96E")
    c.setFillColor(gold)
    c.setFont("Helvetica", 11)
    c.drawCentredString(W/2, H - 1.5*inch, "Together with their families")

    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 32)
    c.drawCentredString(W/2, H - 2.2*inch, "Emma & James")

    c.setFillColor(gold)
    c.setFont("Helvetica", 10)
    c.drawCentredString(W/2, H - 2.7*inch, "request the honor of your presence")
    c.drawCentredString(W/2, H - 2.95*inch, "at their wedding celebration")

    c.setStrokeColor(gold)
    c.setLineWidth(1)
    c.line(W/2 - 1.5*inch, H - 3.2*inch, W/2 + 1.5*inch, H - 3.2*inch)

    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(W/2, H - 3.7*inch, "Saturday, the Fourteenth of June")
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(W/2, H - 4.1*inch, "2025")

    c.setFillColor(TEXT_GRAY)
    c.setFont("Helvetica", 10)
    c.drawCentredString(W/2, H - 4.6*inch, "at four o'clock in the afternoon")
    c.drawCentredString(W/2, H - 4.85*inch, "The Grand Venue · 123 Elegant Street · City, State")

    c.setStrokeColor(gold)
    c.line(W/2 - 1.5*inch, H - 5.1*inch, W/2 + 1.5*inch, H - 5.1*inch)

    c.setFillColor(DARK)
    c.setFont("Helvetica", 9)
    c.drawCentredString(W/2, H - 5.5*inch, "Reception to follow · Black tie preferred")
    c.drawCentredString(W/2, H - 5.75*inch, "RSVP by May 1st · rsvp@example.com")

    c.setFillColor(TEXT_GRAY)
    c.setFont("Helvetica", 7)
    c.drawCentredString(W/2, 0.75*inch, "PRINT_STATIC · printstatic.com · Customize and print at home")

    c.save()
    print(f"✓ {path}")

def gen_party_invite():
    path = f"{OUTPUT_DIR}/party-invite.pdf"
    c = canvas.Canvas(path, pagesize=letter)
    W, H = letter

    c.setFillColor(DARK)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Colorful confetti dots
    import random
    random.seed(42)
    confetti_colors = [TEAL, colors.HexColor("#FF6B6B"), colors.HexColor("#FFD93D"), colors.HexColor("#6BCB77")]
    for _ in range(60):
        cx2 = random.uniform(0.3*inch, W - 0.3*inch)
        cy2 = random.uniform(0.3*inch, H - 0.3*inch)
        r2 = random.uniform(3, 8)
        c.setFillColor(random.choice(confetti_colors))
        c.circle(cx2, cy2, r2, fill=1, stroke=0)

    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 48)
    c.drawCentredString(W/2, H - 1.8*inch, "YOU'RE INVITED!")

    c.setFillColor(TEAL)
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(W/2, H - 2.5*inch, "🎉 Birthday Party 🎉")

    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(W/2, H - 3.3*inch, "[Name]'s")
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(W/2, H - 3.75*inch, "[Age] Birthday Bash!")

    details = [
        ("📅 DATE", "Saturday, [Month] [Day], [Year]"),
        ("⏰ TIME", "[Start Time] – [End Time]"),
        ("📍 LOCATION", "[Venue Name]"),
        ("", "[Address, City, State]"),
        ("🎁 RSVP", "[Phone/Email] by [Date]"),
    ]
    dy = H - 4.5*inch
    for label, val in details:
        c.setFillColor(TEAL)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(1.5*inch, dy, label)
        c.setFillColor(WHITE)
        c.setFont("Helvetica", 9)
        c.drawString(3.0*inch, dy, val)
        dy -= 0.3*inch

    c.setFillColor(TEXT_GRAY)
    c.setFont("Helvetica", 7)
    c.drawCentredString(W/2, 0.4*inch, "PRINT_STATIC · printstatic.com")

    c.save()
    print(f"✓ {path}")

# ─── Kids Activity Sheets ─────────────────────────────────────────────────────
def gen_kids_activity():
    path = f"{OUTPUT_DIR}/kids-activity.pdf"
    c = canvas.Canvas(path, pagesize=letter)
    W, H = letter

    # Colorful header
    c.setFillColor(TEAL)
    c.rect(0, H - 1.2*inch, W, 1.2*inch, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(W/2, H - 0.7*inch, "🎨 FUN ACTIVITY SHEETS 🎨")
    c.setFont("Helvetica", 10)
    c.drawCentredString(W/2, H - 1.0*inch, "Learn · Play · Create")

    # Activity 1: Dot-to-dot numbers
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(0.5*inch, H - 1.6*inch, "Connect the Dots!")
    import math
    dots_cx, dots_cy = 2.5*inch, H - 3.5*inch
    n_dots = 12
    r_dots = 1.2*inch
    c.setFont("Helvetica-Bold", 9)
    for i in range(n_dots):
        angle = math.radians(-90 + i * 360/n_dots)
        dx = dots_cx + r_dots * math.cos(angle)
        dy = dots_cy + r_dots * math.sin(angle)
        c.setFillColor(TEAL)
        c.circle(dx, dy, 5, fill=1, stroke=0)
        c.setFillColor(DARK)
        c.drawCentredString(dx, dy - 12, str(i+1))

    # Activity 2: Maze placeholder
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(4.5*inch, H - 1.6*inch, "Find Your Way!")
    c.setStrokeColor(DARK)
    c.setLineWidth(2)
    c.rect(4.5*inch, H - 4.5*inch, 3.0*inch, 2.7*inch, fill=0, stroke=1)
    # Simple maze lines
    maze_lines = [
        (4.5, H/72 - 4.5 + 2.7, 5.5, H/72 - 4.5 + 2.7),
    ]
    c.setLineWidth(1.5)
    c.setStrokeColor(DARK)
    for x1f, y1f, x2f, y2f in [
        (4.5*inch, H-2.5*inch, 5.5*inch, H-2.5*inch),
        (5.5*inch, H-2.5*inch, 5.5*inch, H-3.0*inch),
        (5.0*inch, H-3.0*inch, 6.5*inch, H-3.0*inch),
        (6.5*inch, H-3.0*inch, 6.5*inch, H-3.8*inch),
        (5.5*inch, H-3.8*inch, 6.5*inch, H-3.8*inch),
        (5.5*inch, H-3.5*inch, 5.5*inch, H-3.8*inch),
        (4.5*inch, H-3.5*inch, 5.0*inch, H-3.5*inch),
    ]:
        c.line(x1f, y1f, x2f, y2f)
    c.setFont("Helvetica", 8)
    c.setFillColor(TEXT_GRAY)
    c.drawString(4.55*inch, H - 4.35*inch, "START →")
    c.drawString(7.1*inch, H - 2.0*inch, "← END")

    # Activity 3: Coloring area
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(0.5*inch, H - 5.0*inch, "Color Me!")
    c.setStrokeColor(DARK)
    c.setLineWidth(2)
    # Simple sun outline
    sun_cx, sun_cy = 1.5*inch, H - 6.5*inch
    c.circle(sun_cx, sun_cy, 0.6*inch, fill=0, stroke=1)
    for i in range(8):
        angle = math.radians(i * 45)
        c.line(sun_cx + 0.7*inch*math.cos(angle), sun_cy + 0.7*inch*math.sin(angle),
               sun_cx + 1.0*inch*math.cos(angle), sun_cy + 1.0*inch*math.sin(angle))

    # Simple house outline
    hx, hy = 3.5*inch, H - 6.8*inch
    c.rect(hx, hy, 1.5*inch, 1.0*inch, fill=0, stroke=1)
    p = c.beginPath()
    p.moveTo(hx - 0.1*inch, hy + 1.0*inch)
    p.lineTo(hx + 0.75*inch, hy + 1.7*inch)
    p.lineTo(hx + 1.6*inch, hy + 1.0*inch)
    p.close()
    c.drawPath(p, fill=0, stroke=1)
    c.rect(hx + 0.55*inch, hy, 0.4*inch, 0.55*inch, fill=0, stroke=1)

    make_footer(c, W)
    c.save()
    print(f"✓ {path}")

# ─── Notion template (PDF preview) ────────────────────────────────────────────
def gen_notion_template():
    path = f"{OUTPUT_DIR}/notion-template.pdf"
    c = canvas.Canvas(path, pagesize=letter)
    W, H = letter

    make_header(c, "NOTION PRODUCTIVITY DASHBOARD", "Setup Guide & Template Overview", W, H)
    make_footer(c, W)

    y = H - 1.2*inch
    sections = [
        ("📋 TASK MANAGEMENT", [
            "• Inbox — capture all new tasks immediately",
            "• Today — tasks due or scheduled for today",
            "• This Week — weekly planning view",
            "• Projects — grouped by project with status tracking",
            "• Completed — archive of finished tasks",
        ]),
        ("📅 DAILY PLANNER", [
            "• Morning routine checklist",
            "• Top 3 priorities for the day",
            "• Time blocks: Morning / Afternoon / Evening",
            "• End-of-day reflection prompts",
        ]),
        ("🎯 GOALS TRACKER", [
            "• Quarterly goals with progress bars",
            "• Weekly milestones linked to goals",
            "• Habit tracking integration",
            "• Review & retrospective templates",
        ]),
        ("📚 READING LIST", [
            "• Books: To Read / Reading / Completed",
            "• Key takeaways and notes per book",
            "• Rating system and recommendations",
        ]),
        ("💰 FINANCE TRACKER", [
            "• Monthly budget vs. actual spending",
            "• Income and expense logging",
            "• Savings goals progress",
        ]),
        ("🔧 SETUP INSTRUCTIONS", [
            "1. Duplicate this template to your Notion workspace",
            "2. Customize database properties to match your workflow",
            "3. Set up recurring templates for daily/weekly reviews",
            "4. Connect integrations (calendar, email) as needed",
            "5. Share with team members and set permissions",
        ]),
    ]

    for section_title, lines in sections:
        if y < 2.0*inch:
            c.showPage()
            make_header(c, "NOTION PRODUCTIVITY DASHBOARD", "Setup Guide & Template Overview", W, H)
            make_footer(c, W)
            y = H - 1.2*inch
        c.setFillColor(TEAL)
        c.rect(0.5*inch, y - 0.22*inch, W - inch, 0.22*inch, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(0.6*inch, y - 0.15*inch, section_title)
        y -= 0.22*inch
        c.setFillColor(DARK)
        c.setFont("Helvetica", 8.5)
        for line in lines:
            c.drawString(0.7*inch, y - 0.05*inch, line)
            y -= 0.22*inch
        y -= 0.12*inch

    c.save()
    print(f"✓ {path}")

# ─── Brand Identity Kit ────────────────────────────────────────────────────────
def gen_brand_kit():
    path = f"{OUTPUT_DIR}/brand-kit.pdf"
    c = canvas.Canvas(path, pagesize=letter)
    W, H = letter

    make_header(c, "BRAND IDENTITY KIT", "Your Brand Name Here", W, H)
    make_footer(c, W)

    y = H - 1.2*inch

    # Color palette section
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(0.5*inch, y, "COLOR PALETTE")
    y -= 0.35*inch

    palette = [
        ("#0D0D0D", "Primary Dark", "CMYK: 0/0/0/95"),
        ("#00B4A6", "Brand Teal", "CMYK: 100/0/8/29"),
        ("#F5F5F5", "Light Gray", "CMYK: 0/0/0/4"),
        ("#666666", "Text Gray", "CMYK: 0/0/0/60"),
        ("#FFFFFF", "White", "CMYK: 0/0/0/0"),
    ]
    for i, (hex_color, name, cmyk) in enumerate(palette):
        x = 0.5*inch + i * 1.3*inch
        c.setFillColor(colors.HexColor(hex_color))
        c.setStrokeColor(MID_GRAY)
        c.rect(x, y - 0.7*inch, 1.1*inch, 0.7*inch, fill=1, stroke=1)
        c.setFillColor(DARK)
        c.setFont("Helvetica-Bold", 7)
        c.drawString(x, y - 0.85*inch, name)
        c.setFont("Helvetica", 6)
        c.drawString(x, y - 0.97*inch, hex_color)
        c.drawString(x, y - 1.08*inch, cmyk)

    y -= 1.3*inch

    # Typography section
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(0.5*inch, y, "TYPOGRAPHY")
    y -= 0.3*inch

    type_specs = [
        ("Heading 1", "Helvetica-Bold", 28, "Space Grotesk Bold · 28pt · -0.02em tracking"),
        ("Heading 2", "Helvetica-Bold", 20, "Space Grotesk Bold · 20pt"),
        ("Body Text", "Helvetica", 10, "Space Grotesk Regular · 10pt · 1.6 line height"),
        ("Caption", "Helvetica", 8, "Space Mono · 8pt · uppercase labels"),
    ]
    for font_name, font, size, spec in type_specs:
        c.setFont(font, size)
        c.setFillColor(DARK)
        c.drawString(0.5*inch, y, font_name)
        c.setFont("Helvetica", 7)
        c.setFillColor(TEXT_GRAY)
        c.drawString(3.0*inch, y - 2, spec)
        y -= (size/72*inch + 0.15*inch)

    y -= 0.1*inch

    # Logo usage
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(0.5*inch, y, "LOGO USAGE GUIDELINES")
    y -= 0.25*inch

    guidelines = [
        "✓  Always maintain clear space equal to the height of the logo mark on all sides",
        "✓  Use the primary dark version on light backgrounds",
        "✓  Use the white version on dark or colored backgrounds",
        "✗  Do not stretch, rotate, or distort the logo",
        "✗  Do not use unapproved colors or add effects (shadows, gradients)",
        "✗  Do not place the logo on busy or low-contrast backgrounds",
    ]
    c.setFont("Helvetica", 8.5)
    for g in guidelines:
        c.setFillColor(TEAL if g.startswith("✓") else colors.HexColor("#FF6B6B"))
        c.drawString(0.5*inch, y, g[:2])
        c.setFillColor(DARK)
        c.drawString(0.7*inch, y, g[2:])
        y -= 0.22*inch

    c.save()
    print(f"✓ {path}")

# ─── Business Card Template ────────────────────────────────────────────────────
def gen_business_card():
    path = f"{OUTPUT_DIR}/business-card.pdf"
    c = canvas.Canvas(path, pagesize=letter)
    W, H = letter

    make_header(c, "BUSINESS CARD TEMPLATE PACK", "Print at 3.5\" × 2\" · 300 DPI recommended", W, H)
    make_footer(c, W)

    card_w = 3.5*inch
    card_h = 2.0*inch
    margin = 0.4*inch
    cols = 2
    rows = 4

    for row in range(rows):
        for col in range(cols):
            x = margin + col * (card_w + 0.3*inch)
            y = H - 1.5*inch - row * (card_h + 0.25*inch) - card_h

            # Card background
            c.setFillColor(DARK)
            c.rect(x, y, card_w, card_h, fill=1, stroke=0)

            # Teal accent bar
            c.setFillColor(TEAL)
            c.rect(x, y + card_h - 0.25*inch, card_w, 0.25*inch, fill=1, stroke=0)

            # Content
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 12)
            c.drawString(x + 0.15*inch, y + card_h - 0.6*inch, "YOUR NAME")
            c.setFont("Helvetica", 8)
            c.setFillColor(TEAL)
            c.drawString(x + 0.15*inch, y + card_h - 0.8*inch, "Job Title · Company")
            c.setFillColor(WHITE)
            c.setFont("Helvetica", 7.5)
            c.drawString(x + 0.15*inch, y + 0.55*inch, "✉  email@example.com")
            c.drawString(x + 0.15*inch, y + 0.38*inch, "📞  (555) 000-0000")
            c.drawString(x + 0.15*inch, y + 0.21*inch, "🌐  www.yourwebsite.com")

            # Cut marks
            c.setStrokeColor(MID_GRAY)
            c.setLineWidth(0.3)
            for cx2, cy2 in [(x, y), (x+card_w, y), (x, y+card_h), (x+card_w, y+card_h)]:
                c.line(cx2 - 0.1*inch, cy2, cx2 - 0.05*inch, cy2)
                c.line(cx2 + 0.05*inch, cy2, cx2 + 0.1*inch, cy2)
                c.line(cx2, cy2 - 0.1*inch, cx2, cy2 - 0.05*inch)
                c.line(cx2, cy2 + 0.05*inch, cx2, cy2 + 0.1*inch)

    c.save()
    print(f"✓ {path}")

# ─── Run all generators ────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("Generating product PDFs...")
    gen_weekly_planner()
    gen_budget_planner()
    gen_habit_tracker()
    gen_goal_workbook()
    gen_meal_planner()
    gen_lined_journal(
        f"{OUTPUT_DIR}/journal-bundle.pdf",
        "DAILY JOURNAL + GRATITUDE BUNDLE",
        "Date: ___________________",
        prompts=[
            "Today I am grateful for...",
            "My intention for today is...",
            "One thing that would make today great...",
            "Daily affirmation:",
            "End of day reflection — what went well?",
            "What could I have done better?",
            "Tomorrow I will focus on...",
        ]
    )
    gen_resume()
    gen_social_calendar()
    gen_simple_template(
        "social-templates",
        "INSTAGRAM POST TEMPLATES",
        "Canva-compatible · 1080×1080px",
        [
            ("TEMPLATE 1 — QUOTE POST", ["Headline text (large, centered)", "Subheading or author credit", "Your handle: @yourbrand", "Background: solid color or gradient"]),
            ("TEMPLATE 2 — PRODUCT SHOWCASE", ["Product image (full bleed)", "Product name overlay (bottom third)", "Price or CTA badge (top right)", "Brand logo watermark"]),
            ("TEMPLATE 3 — TIP / CAROUSEL SLIDE 1", ["Hook headline: '5 Ways to...'", "Teaser text below", "Swipe indicator arrow", "Consistent brand colors"]),
            ("TEMPLATE 4 — BEFORE & AFTER", ["Left half: Before", "Right half: After", "Divider line with label", "Results caption below"]),
            ("TEMPLATE 5 — TESTIMONIAL", ["Customer quote in large text", "Customer name and photo", "Star rating graphic", "Brand logo footer"]),
        ]
    )
    gen_notion_template()
    gen_brand_kit()
    gen_business_card()
    gen_wall_art_geometric()
    gen_wall_art_quotes()
    gen_wedding_invite()
    gen_party_invite()
    gen_kids_activity()
    gen_simple_template(
        "instagram-templates-guide",
        "INSTAGRAM POST TEMPLATES — USAGE GUIDE",
        "Print Static · Digital Download",
        [
            ("INCLUDED FILES", ["• 5 Canva template links (editable)", "• 10 PNG mockup previews", "• Font pairing guide PDF", "• Color palette swatches"]),
            ("HOW TO USE", ["1. Click the Canva link for your chosen template", "2. Sign in to Canva (free account works)", "3. Click 'Use template' to create your copy", "4. Edit text, colors, and images to match your brand", "5. Download as PNG or JPG and post!"]),
        ]
    )
    print(f"\n✅ All PDFs generated in {OUTPUT_DIR}/")
    import os
    files = os.listdir(OUTPUT_DIR)
    print(f"Total files: {len(files)}")
    for f in sorted(files):
        size = os.path.getsize(f"{OUTPUT_DIR}/{f}")
        print(f"  {f} ({size:,} bytes)")
