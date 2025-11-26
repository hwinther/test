#!/usr/bin/env python3
"""
Safe Stable Diffusion WebUI Generator
Uses conservative settings to avoid WebUI errors
"""

import requests
import base64
from PIL import Image
import io
from pathlib import Path
import time
import json

class SafeSDWebUIGenerator:
    def __init__(self, webui_url="http://127.0.0.1:7860"):
        self.webui_url = webui_url
        self.output_dir = Path("safe_generated_images")
        self.output_dir.mkdir(exist_ok=True)
        
    def check_connection(self):
        try:
            response = requests.get(f"{self.webui_url}/sdapi/v1/options", timeout=5)
            return response.status_code == 200
        except requests.RequestException:
            return False
    
    def get_safe_payload(self, prompt, negative_prompt=""):
        """Generate safe payload that avoids WebUI errors"""
        return {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "steps": 25,
            "cfg_scale": 7.0,
            "width": 768,
            "height": 512,
            "sampler_name": "Euler a",  # Safe, basic sampler
            "seed": -1,
            "restore_faces": False,  # Disable to avoid issues
            "enable_hr": False,  # Disable high-res to avoid the error
            "hr_scale": 1.0,  # Default values
            "hr_upscaler": "None",  # Avoid upscaler issues
            "hr_additional_modules": [],  # Explicitly set as empty list
            "do_not_save_samples": False,
            "do_not_save_grid": True,
            "batch_size": 1,
            "n_iter": 1
        }
    
    def generate_safe_image(self, prompt, negative_prompt="", filename_prefix="safe_test"):
        """Generate image with safe settings"""
        
        if not self.check_connection():
            print("❌ Cannot connect to SD WebUI")
            return None
        
        payload = self.get_safe_payload(prompt, negative_prompt)
        
        try:
            print(f"🎨 Generating: {filename_prefix}")
            print(f"Prompt: {prompt[:60]}...")
            
            start_time = time.time()
            response = requests.post(f"{self.webui_url}/sdapi/v1/txt2img", json=payload, timeout=90)
            
            if response.status_code == 200:
                result = response.json()
                if 'images' in result and len(result['images']) > 0:
                    # Save image
                    image_data = base64.b64decode(result['images'][0])
                    image = Image.open(io.BytesIO(image_data))
                    
                    timestamp = int(time.time())
                    filename = f"{filename_prefix}_{timestamp}.png"
                    image_path = self.output_dir / filename
                    image.save(image_path)
                    
                    duration = time.time() - start_time
                    print(f"✅ Generated in {duration:.1f}s: {filename}")
                    return str(image_path)
                else:
                    print("❌ No image data received")
                    return None
            else:
                print(f"❌ API error: {response.status_code}")
                if hasattr(response, 'text'):
                    print(f"Error: {response.text[:200]}")
                return None
                
        except Exception as e:
            print(f"❌ Error: {e}")
            return None

def test_safe_generation():
    """Test safe image generation with parliamentary prompts"""
    
    generator = SafeSDWebUIGenerator()
    
    # Test prompts that should work safely
    test_prompts = [
        {
            "prompt": "Professional photograph of Norwegian parliament chamber. Formal government building interior, classical architecture, semicircular seating arrangement, official parliamentary setting.",
            "negative": "cartoon, anime, text, blurry, low quality",
            "name": "parliament_chamber"
        },
        {
            "prompt": "Formal government meeting in official chamber. Politicians in dark business suits, professional parliamentary setting, traditional architecture.",
            "negative": "cartoon, casual, text, comic style, bright colors",
            "name": "formal_meeting"
        },
        {
            "prompt": "Speaker at parliamentary podium in Norwegian parliament. Professional government setting, formal business attire, official chamber architecture.",
            "negative": "cartoon, casual, text, modern, colorful",
            "name": "speaker_podium"
        }
    ]
    
    print("🏛️ Testing Safe SD WebUI Generation")
    print("=" * 45)
    
    results = []
    for i, test in enumerate(test_prompts, 1):
        print(f"\n--- Test {i}/3: {test['name']} ---")
        
        image_path = generator.generate_safe_image(
            test['prompt'],
            test['negative'],
            test['name']
        )
        
        results.append({
            'name': test['name'],
            'prompt': test['prompt'],
            'image_path': image_path,
            'success': image_path is not None
        })
        
        if i < len(test_prompts):
            time.sleep(3)  # Pause between requests
    
    # Summary
    successful = sum(1 for r in results if r['success'])
    print(f"\n🎯 Results: {successful}/{len(results)} successful")
    print(f"📁 Images saved to: {generator.output_dir}")
    
    return results

def main():
    print("=== Safe SD WebUI Generator ===")
    print("Uses conservative settings to avoid WebUI errors")
    
    results = test_safe_generation()
    
    if any(r['success'] for r in results):
        print("\n✅ Safe generation successful!")
        print("You can now use these settings for batch generation.")
    else:
        print("\n❌ Generation failed. Check WebUI status and settings.")

if __name__ == "__main__":
    main()