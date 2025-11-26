#!/usr/bin/env python3
"""
Quick single prompt tester for SD WebUI
Test individual prompts quickly to iterate and improve
"""

import requests
import base64
from PIL import Image
import io
from pathlib import Path
import time

class QuickPromptTester:
    def __init__(self, webui_url="http://127.0.0.1:7860"):
        self.webui_url = webui_url
        self.output_dir = Path("quick_tests")
        self.output_dir.mkdir(exist_ok=True)
        
    def check_connection(self):
        """Check if SD WebUI is running"""
        try:
            response = requests.get(f"{self.webui_url}/sdapi/v1/options", timeout=5)
            return response.status_code == 200
        except requests.RequestException:
            return False
    
    def test_prompt(self, prompt, negative_prompt="", filename_prefix="test"):
        """Test a single prompt quickly"""
        
        if not self.check_connection():
            print("❌ Cannot connect to SD WebUI. Make sure it's running with --api flag")
            return None
        
        payload = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "steps": 20,  # Quick generation
            "cfg_scale": 7,
            "width": 768,
            "height": 512,
            "sampler_name": "Euler a",
            "seed": -1,
            "restore_faces": False,  # Disable to prevent issues
            "enable_hr": False,  # Disable high-res to prevent errors
            "hr_additional_modules": []  # Prevent None errors
        }
        
        try:
            print("🎨 Generating image...")
            print(f"Prompt: {prompt[:100]}...")
            
            start_time = time.time()
            response = requests.post(f"{self.webui_url}/sdapi/v1/txt2img", json=payload, timeout=90)
            
            if response.status_code == 200:
                result = response.json()
                if 'images' in result and len(result['images']) > 0:
                    # Decode and save image
                    image_data = base64.b64decode(result['images'][0])
                    image = Image.open(io.BytesIO(image_data))
                    
                    timestamp = int(time.time())
                    filename = f"{filename_prefix}_{timestamp}.png"
                    image_path = self.output_dir / filename
                    image.save(image_path)
                    
                    duration = time.time() - start_time
                    print(f"✅ Generated in {duration:.1f}s")
                    print(f"💾 Saved: {image_path}")
                    return str(image_path)
                else:
                    print("❌ No image data received")
                    return None
            else:
                print(f"❌ API error: {response.status_code}")
                if response.text:
                    print(f"Error details: {response.text[:200]}")
                return None
                
        except Exception as e:
            print(f"❌ Error: {e}")
            return None

def main():
    print("=== Quick Prompt Tester for SD WebUI ===")
    
    tester = QuickPromptTester()
    
    # Test prompts - based on your current needs
    test_prompts = {
        "realistic_parliament": {
            "prompt": "Professional photorealistic photograph of Norwegian parliament chamber during formal session. Politicians in dark business suits seated in semicircular wooden benches. Formal government setting, high quality photography, well-lit interior, architectural details of Stortinget building, formal parliamentary procedure in session.",
            "negative": "cartoon, anime, sketch, blurry, low quality, distorted faces, text, watermark, comic style",
            "description": "Realistic parliamentary photography"
        },
        
        "clean_diagram": {
            "prompt": "Clean technical diagram of Norwegian parliament chamber layout. Architectural drawing style, parliamentary seating arrangement, formal government building interior, educational diagram, professional illustration, clean lines, neutral colors, infographic style.",
            "negative": "cartoon, people, faces, sketchy, messy, colorful, childish, text, watermark",
            "description": "Technical architectural diagram"
        },
        
        "minimal_professional": {
            "prompt": "Minimalist professional illustration of parliamentary chamber. Clean modern design, formal seating layout, neutral professional colors, simple elegant style, government building interior, architectural focus, high quality digital art.",
            "negative": "cartoon, busy, cluttered, bright colors, childish, text, comic style",
            "description": "Minimal professional style"
        },
        
        "educational_realistic": {
            "prompt": "Educational illustration of Norwegian parliamentary procedures in realistic style. Professional parliamentary chamber, formal government session, high quality educational content, documentary style, formal business setting, architectural details.",
            "negative": "cartoon, anime, childish, comic book, bright colors, sketchy, text overlays",
            "description": "Educational realistic style"
        }
    }
    
    print(f"\nTesting {len(test_prompts)} different prompt styles...")
    print("This will help identify what works best for parliamentary illustrations.\n")
    
    for name, prompt_data in test_prompts.items():
        print(f"--- Testing: {prompt_data['description']} ---")
        
        result = tester.test_prompt(
            prompt_data['prompt'],
            prompt_data['negative'],
            name
        )
        
        if result:
            print(f"✅ Success: {name}")
        else:
            print(f"❌ Failed: {name}")
        
        print()
        time.sleep(1)  # Brief pause between tests
    
    print(f"🎯 All tests complete! Check images in: {tester.output_dir}")

if __name__ == "__main__":
    main()