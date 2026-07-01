import base64
from PIL import Image, ImageDraw, ImageFont
import io

def generate_watermark():
    # Width: 380, Height: 44
    img = Image.new('RGBA', (380, 44), color=(0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    try:
        # Load Arial bold or regular font
        font = ImageFont.truetype("arialbd.ttf", 32)
    except Exception as e:
        print(f"Could not load arialbd.ttf: {e}. Falling back to default.")
        font = ImageFont.load_default()

    # Draw a clean, rounded dark pill background for readability
    # Draw dark translucent pill
    draw.rounded_rectangle([4, 4, 376, 40], radius=8, fill=(0, 0, 0, 130))

    # Draw the text in semi-transparent bright white
    # Position: center aligned text
    draw.text((22, 6), "fullsizepost.online", fill=(255, 255, 255, 240), font=font)

    # Save to buffer
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    
    print("BASE64_START")
    print(base64.b64encode(buf.getvalue()).decode('utf-8'))
    print("BASE64_END")

if __name__ == "__main__":
    generate_watermark()
