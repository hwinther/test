#!/usr/bin/env python3
"""
Test multiple prompt variations to find the best style for parliamentary illustrations.
This script generates different style variations for the same content to compare results.
"""

import json
import requests
import time
from pathlib import Path
from PIL import Image
import io

class PromptVariationTester:
    def __init__(self, webui_url="http://127.0.0.1:7860"):
        self.webui_url = webui_url
        self.output_dir = Path("test_variations")
        self.output_dir.mkdir(exist_ok=True)
        
    def check_connection(self):
        """Check if SD WebUI is running and accessible"""
        try:
            response = requests.get(f"{self.webui_url}/sdapi/v1/options", timeout=5)
            return response.status_code == 200
        except requests.RequestException:
            return False
    
    def generate_prompt_variations(self, base_content="Norwegian parliamentary procedures - speaking rules"):
        """Generate different style variations for the same content"""
        
        variations = {
            "realistic_professional": {
                "style": "Professional photorealistic style",
                "prompt": f"Professional photorealistic illustration of {base_content}. Clean, modern parliamentary chamber with formal seating arrangement. Politicians in business attire during a formal session. High quality, detailed, professional photography style, good lighting, sharp focus, documentary style.",
                "negative": "cartoon, anime, sketch, blurry, low quality, distorted faces, text, watermark"
            },
            
            "technical_diagram": {
                "style": "Technical diagram/infographic style", 
                "prompt": f"Clean technical diagram illustrating {base_content}. Infographic style with clear lines, professional layout, educational diagram, architectural drawing style of parliamentary chamber, formal business illustration, technical drawing, clean vector art style.",
                "negative": "cartoon, messy, hand-drawn, sketchy, blurry, text overlays, watermark"
            },
            
            "minimal_clean": {
                "style": "Minimal clean illustration",
                "prompt": f"Minimalist clean illustration of {base_content}. Simple, elegant design with clear shapes and professional colors. Modern flat design style, parliamentary setting, formal but approachable, clean lines, professional illustration.",
                "negative": "cluttered, busy, cartoon, childish, text, watermark, messy"
            },
            
            "semi_realistic": {
                "style": "Semi-realistic educational style",
                "prompt": f"Semi-realistic educational illustration of {base_content}. Professional but approachable art style, educational textbook illustration, parliamentary chamber setting, formal attire, clear and informative, high quality digital art.",
                "negative": "cartoon, anime, childish, blurry, low quality, text overlays"
            },
            
            "architectural_focus": {
                "style": "Architectural emphasis",
                "prompt": f"Architectural illustration focusing on {base_content}. Emphasis on the Norwegian parliament building interior, formal chamber architecture, professional perspective drawing, detailed parliamentary seating, formal government setting, architectural rendering style.",
                "negative": "cartoon, sketchy, blurry, people focus, text, watermark"
            }
        }
        
        return variations
    
    def generate_image(self, prompt, negative_prompt, filename, style_name):
        """Generate a single image using SD WebUI API"""
        
        payload = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "steps": 25,
            "cfg_scale": 7,
            "width": 768,
            "height": 512,
            "sampler_name": "Euler a",
            "seed": -1,
            "restore_faces": True
        }
        
        try:
            print(f"🎨 Generating {style_name}...")
            response = requests.post(f"{self.webui_url}/sdapi/v1/txt2img", json=payload, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                if 'images' in result and len(result['images']) > 0:
                    # Decode base64 image
                    import base64
                    image_data = base64.b64decode(result['images'][0])
                    image = Image.open(io.BytesIO(image_data))
                    
                    # Save image
                    image_path = self.output_dir / f"{filename}.png"
                    image.save(image_path)
                    print(f"✅ Saved: {image_path}")
                    return str(image_path)
                else:
                    print(f"❌ No image data in response for {style_name}")
                    return None
            else:
                print(f"❌ API error for {style_name}: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error generating {style_name}: {e}")
            return None
    
    def run_test_batch(self):
        """Run a batch test of different prompt variations"""
        
        if not self.check_connection():
            print("❌ Cannot connect to SD WebUI. Make sure it's running with --api flag")
            print("Start it with: python webui.py --api")
            return
        
        print("🚀 Starting prompt variation test...")
        print(f"📁 Images will be saved to: {self.output_dir}")
        
        variations = self.generate_prompt_variations()
        results = {}
        
        for var_name, var_data in variations.items():
            print(f"\n--- Testing: {var_data['style']} ---")
            print(f"Prompt: {var_data['prompt'][:100]}...")
            
            image_path = self.generate_image(
                var_data['prompt'],
                var_data['negative'],
                f"test_{var_name}",
                var_data['style']
            )
            
            results[var_name] = {
                'style': var_data['style'],
                'image_path': image_path,
                'prompt': var_data['prompt'],
                'negative': var_data['negative'],
                'success': image_path is not None
            }
            
            # Small delay between requests
            time.sleep(2)
        
        # Save results
        results_file = self.output_dir / "test_results.json"
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        # Print summary
        print("\n🎯 Test Complete!")
        print(f"📊 Results saved to: {results_file}")
        print("\nSummary:")
        successful = 0
        for name, result in results.items():
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['style']}")
            if result['success']:
                successful += 1
        
        print(f"\n✅ Successfully generated {successful}/{len(results)} variations")
        print(f"📁 Check images in: {self.output_dir}")

def main():
    print("=== Parliamentary Illustration Prompt Variation Tester ===")
    
    tester = PromptVariationTester()
    
    print("\nThis script will test 5 different prompt styles:")
    print("1. Realistic professional photography style")
    print("2. Technical diagram/infographic style") 
    print("3. Minimal clean illustration")
    print("4. Semi-realistic educational style")
    print("5. Architectural focus style")
    
    input("\nPress Enter to start the test batch...")
    
    tester.run_test_batch()

if __name__ == "__main__":
    main()