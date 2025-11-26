#!/usr/bin/env python3
"""
Interactive Prompt Builder for Parliamentary Illustrations
Build and test custom prompts interactively
"""

import requests
import base64
from PIL import Image
import io
from pathlib import Path
import time

class InteractivePromptBuilder:
    def __init__(self, webui_url="http://127.0.0.1:7860"):
        self.webui_url = webui_url
        self.output_dir = Path("interactive_tests")
        self.output_dir.mkdir(exist_ok=True)
        
        # Prompt building blocks
        self.styles = {
            "1": "Professional photorealistic photography",
            "2": "Clean technical diagram/infographic",
            "3": "Minimalist modern illustration", 
            "4": "Semi-realistic educational art",
            "5": "Architectural rendering style"
        }
        
        self.subjects = {
            "1": "Norwegian parliament chamber during formal session",
            "2": "Parliamentary seating arrangement and architecture", 
            "3": "Politicians in formal government meeting",
            "4": "Speaker at parliamentary podium addressing chamber",
            "5": "Committee meeting in formal government setting"
        }
        
        self.quality_modifiers = [
            "high quality", "professional", "well-lit", "sharp focus",
            "detailed", "architectural details", "formal setting",
            "government building interior", "clean composition"
        ]
        
        self.negative_templates = {
            "realistic": "cartoon, anime, sketch, childish, comic style, text, watermark, blurry, low quality",
            "technical": "cartoon, people focus, sketchy, messy, colorful, childish, text, watermark",
            "clean": "cartoon, busy, cluttered, bright colors, childish, text, comic style, messy"
        }
    
    def check_connection(self):
        """Check SD WebUI connection"""
        try:
            response = requests.get(f"{self.webui_url}/sdapi/v1/options", timeout=5)
            return response.status_code == 200
        except requests.RequestException:
            return False
    
    def build_prompt_interactive(self):
        """Interactive prompt builder"""
        print("🏛️ Parliamentary Illustration Prompt Builder")
        print("=" * 50)
        
        # Choose style
        print("\nSelect art style:")
        for key, value in self.styles.items():
            print(f"{key}. {value}")
        style_choice = input("\nEnter choice (1-5): ").strip()
        selected_style = self.styles.get(style_choice, self.styles["1"])
        
        # Choose subject
        print(f"\nSelected style: {selected_style}")
        print("\nSelect subject/scene:")
        for key, value in self.subjects.items():
            print(f"{key}. {value}")
        subject_choice = input("\nEnter choice (1-5): ").strip()
        selected_subject = self.subjects.get(subject_choice, self.subjects["1"])
        
        # Build prompt
        prompt_parts = [selected_style, "of", selected_subject]
        prompt_parts.extend(self.quality_modifiers)
        
        base_prompt = " ".join(prompt_parts) + "."
        
        print(f"\nSelected subject: {selected_subject}")
        print("\n📝 Generated base prompt:")
        print(f"{base_prompt}")
        
        # Allow custom additions
        custom_addition = input("\n➕ Add custom elements (or press Enter to skip): ").strip()
        if custom_addition:
            base_prompt += f" {custom_addition}"
        
        # Choose negative prompt template
        print("\nSelect negative prompt style:")
        for key, value in self.negative_templates.items():
            print(f"{key}: {value}")
        
        neg_choice = input("\nEnter negative style (realistic/technical/clean): ").strip()
        negative_prompt = self.negative_templates.get(neg_choice, self.negative_templates["realistic"])
        
        return base_prompt, negative_prompt
    
    def generate_test_image(self, prompt, negative_prompt):
        """Generate test image"""
        if not self.check_connection():
            print("❌ Cannot connect to SD WebUI. Make sure it's running with --api flag")
            return None
        
        payload = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "steps": 25,
            "cfg_scale": 7.5,
            "width": 768,
            "height": 512,
            "sampler_name": "Euler a",
            "seed": -1,
            "restore_faces": True
        }
        
        try:
            print("\n🎨 Generating image...")
            print("⏱️ This may take 30-60 seconds...")
            
            start_time = time.time()
            response = requests.post(f"{self.webui_url}/sdapi/v1/txt2img", json=payload, timeout=90)
            
            if response.status_code == 200:
                result = response.json()
                if 'images' in result and len(result['images']) > 0:
                    # Save image
                    image_data = base64.b64decode(result['images'][0])
                    image = Image.open(io.BytesIO(image_data))
                    
                    timestamp = int(time.time())
                    filename = f"interactive_test_{timestamp}.png"
                    image_path = self.output_dir / filename
                    image.save(image_path)
                    
                    duration = time.time() - start_time
                    print(f"✅ Generated in {duration:.1f} seconds")
                    print(f"💾 Saved: {image_path}")
                    
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
    
    def save_prompt_config(self, prompt, negative_prompt, image_path):
        """Save the prompt configuration"""
        config = {
            "timestamp": int(time.time()),
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "image_path": image_path,
            "success": image_path is not None
        }
        
        config_file = self.output_dir / f"config_{config['timestamp']}.json"
        import json
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        
        print(f"📄 Config saved: {config_file}")

def main():
    print("=== Interactive Parliamentary Illustration Prompt Builder ===")
    
    builder = InteractivePromptBuilder()
    
    while True:
        print("\n" + "="*60)
        
        # Build prompt interactively
        prompt, negative_prompt = builder.build_prompt_interactive()
        
        print("\n🎯 Final Prompt Configuration:")
        print(f"Positive: {prompt}")
        print(f"Negative: {negative_prompt}")
        
        # Confirm generation
        confirm = input("\n🚀 Generate image with this prompt? (y/n): ").strip().lower()
        if confirm == 'y':
            image_path = builder.generate_test_image(prompt, negative_prompt)
            builder.save_prompt_config(prompt, negative_prompt, image_path)
        
        # Continue?
        continue_choice = input("\n🔄 Test another prompt? (y/n): ").strip().lower()
        if continue_choice != 'y':
            break
    
    print(f"\n🎯 Session complete! Check results in: {builder.output_dir}")

if __name__ == "__main__":
    main()