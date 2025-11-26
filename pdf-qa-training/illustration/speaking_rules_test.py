#!/usr/bin/env python3
"""
Focused prompt testing for Norwegian parliamentary speaking rules (§ 55: Taleregler)
Tests specific prompts for parliamentary debate and speaking procedures
"""

import requests
import base64
from PIL import Image
import io
from pathlib import Path
import time
import json

class SpeakingRulesPromptTester:
    def __init__(self, webui_url="http://127.0.0.1:7860"):
        self.webui_url = webui_url
        self.output_dir = Path("speaking_rules_tests")
        self.output_dir.mkdir(exist_ok=True)
        
    def check_connection(self):
        try:
            response = requests.get(f"{self.webui_url}/sdapi/v1/options", timeout=5)
            return response.status_code == 200
        except requests.RequestException:
            return False
    
    def get_focused_prompts(self):
        """Get prompts specifically for parliamentary speaking rules illustration"""
        
        return {
            "professional_debate": {
                "prompt": "Professional photograph of Norwegian parliament chamber during formal debate. Speaker at central podium addressing seated parliamentarians in formal business attire. Classical parliamentary architecture with wooden benches arranged in semicircle. Serious, dignified atmosphere of formal government proceedings.",
                "negative": "cartoon, comic, anime, casual clothing, modern furniture, text, logos, watermarks, blurry, low quality",
                "description": "Professional parliamentary debate photography"
            },
            
            "architectural_chamber": {
                "prompt": "Architectural interior photograph of Norwegian Stortinget parliament chamber. Focus on formal seating arrangement, speaker's podium, and classical government building architecture. Empty chamber showing formal parliamentary layout and traditional Norwegian government design elements.",
                "negative": "people, cartoon, modern design, casual, text, signage, colorful, childish",
                "description": "Architectural focus on chamber design"
            },
            
            "formal_speaker_focus": {
                "prompt": "Professional portrait of parliamentarian speaking from official podium in Norwegian parliament. Formal government setting, traditional parliamentary architecture, speaker in business suit addressing chamber. Documentary style photography of formal government proceedings.",
                "negative": "cartoon, casual, informal, modern, text, logos, comic style, bright colors",
                "description": "Formal speaker at podium focus"
            },
            
            "wide_chamber_view": {
                "prompt": "Wide angle professional photograph of full Norwegian parliament chamber during formal session. Classical semicircular seating arrangement filled with parliamentarians in dark business suits. Traditional government architecture, formal parliamentary procedure in progress, dignified atmosphere.",
                "negative": "cartoon, empty chamber, casual clothing, modern design, text, watermarks, comic style",
                "description": "Wide parliamentary chamber view"
            },
            
            "procedural_diagram": {
                "prompt": "Clean educational diagram showing Norwegian parliamentary speaking procedures. Professional infographic style showing formal chamber layout, speaker positions, and procedural flow. Technical illustration for government education, clean lines, professional color scheme.",
                "negative": "cartoon, people, photographs, decorative, childish, bright colors, text overlays",
                "description": "Educational procedural diagram"
            },
            
            "documentary_style": {
                "prompt": "Documentary style photograph of Norwegian parliament in session. Natural lighting, authentic government proceedings, parliamentarians engaged in formal debate. Photojournalistic approach to parliamentary procedure, serious and professional tone.",
                "negative": "staged, cartoon, comic, artificial lighting, casual, text, logos, comic book style",
                "description": "Documentary parliamentary photography"
            }
        }
    
    def generate_image(self, prompt, negative_prompt, filename_prefix):
        """Generate single test image"""
        
        payload = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "steps": 25,  # Good quality but safe
            "cfg_scale": 7.0,
            "width": 768,
            "height": 512,
            "sampler_name": "Euler a",  # Safe, reliable sampler
            "seed": -1,
            "restore_faces": False,  # Disable to prevent issues
            "enable_hr": False,  # Disable high-res to prevent the WebUI error
            "hr_additional_modules": [],  # Explicitly prevent None error
            "batch_size": 1,
            "n_iter": 1
        }
        
        try:
            print(f"🎨 Generating: {filename_prefix}")
            
            start_time = time.time()
            response = requests.post(f"{self.webui_url}/sdapi/v1/txt2img", json=payload, timeout=120)
            
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
                    print(f"✅ Generated in {duration:.1f}s - {image_path.name}")
                    return str(image_path)
                else:
                    print("❌ No image data received")
                    return None
            else:
                print(f"❌ API error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error: {e}")
            return None
    
    def run_focused_test(self):
        """Run focused test for speaking rules prompts"""
        
        if not self.check_connection():
            print("❌ Cannot connect to SD WebUI. Make sure it's running with --api flag")
            return
        
        print("🏛️ Testing Speaking Rules (§ 55: Taleregler) Prompts")
        print("=" * 60)
        
        prompts = self.get_focused_prompts()
        results = {}
        
        for name, data in prompts.items():
            print(f"\n--- {data['description']} ---")
            print(f"Prompt: {data['prompt'][:80]}...")
            
            image_path = self.generate_image(
                data['prompt'],
                data['negative'],
                name
            )
            
            results[name] = {
                'description': data['description'],
                'prompt': data['prompt'],
                'negative': data['negative'],
                'image_path': image_path,
                'success': image_path is not None
            }
            
            time.sleep(2)  # Brief pause between generations
        
        # Save results
        results_file = self.output_dir / "speaking_rules_test_results.json"
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        # Summary
        successful = sum(1 for r in results.values() if r['success'])
        print(f"\n🎯 Test Complete: {successful}/{len(results)} successful")
        print(f"📁 Images saved to: {self.output_dir}")
        print(f"📊 Results: {results_file}")
        
        return results

def main():
    print("=== Parliamentary Speaking Rules Prompt Tester ===")
    
    tester = SpeakingRulesPromptTester()
    
    print("\nThis will test 6 different approaches for illustrating")
    print("Norwegian parliamentary speaking rules (§ 55: Taleregler)")
    print("focusing on realistic, professional, and educational styles.\n")
    
    input("Press Enter to start testing...")
    
    results = tester.run_focused_test()
    
    if results:
        print(f"\n📋 Review the generated images in: {tester.output_dir}")
        print("Compare the different styles to see which works best for your needs.")

if __name__ == "__main__":
    main()