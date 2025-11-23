#!/usr/bin/env python3
"""
Generate illustrations using local Stable Diffusion WebUI (AUTOMATIC1111) API.
This script connects to your local SD WebUI and generates images from the illustration prompts.
"""

import json
import requests
import base64
import io
from PIL import Image
import os
import time
from typing import List, Dict, Optional
import re

class SDWebUIGenerator:
    def __init__(self, 
                 webui_url: str = "http://127.0.0.1:7860",
                 prompts_file: str = 'enhanced_illustration_prompts.json',
                 output_dir: str = 'generated_illustrations'):
        self.webui_url = webui_url
        self.prompts_file = prompts_file
        self.output_dir = output_dir
        self.prompts = []
        self.session = requests.Session()
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Load prompts
        self.load_prompts()
    
    def load_prompts(self):
        """Load the generated illustration prompts"""
        try:
            with open(self.prompts_file, 'r', encoding='utf-8') as f:
                self.prompts = json.load(f)
            print(f"✓ Loaded {len(self.prompts)} illustration prompts")
        except FileNotFoundError:
            print(f"❌ Could not find {self.prompts_file}")
            return
    
    def check_webui_connection(self) -> bool:
        """Check if SD WebUI is running and accessible"""
        try:
            response = self.session.get(f"{self.webui_url}/sdapi/v1/options", timeout=10)
            if response.status_code == 200:
                print("✓ Connected to Stable Diffusion WebUI")
                return True
            else:
                print(f"❌ WebUI returned status code: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ Could not connect to SD WebUI at {self.webui_url}")
            print(f"   Error: {e}")
            print("   Make sure SD WebUI is running with --api flag")
            return False
    
    def get_available_models(self) -> List[str]:
        """Get list of available models in SD WebUI"""
        try:
            response = self.session.get(f"{self.webui_url}/sdapi/v1/sd-models")
            if response.status_code == 200:
                models = response.json()
                return [model['title'] for model in models]
            return []
        except:
            return []
    
    def optimize_prompt_for_sd(self, prompt: Dict) -> Dict[str, str]:
        """Optimize prompts specifically for Stable Diffusion"""
        base_prompt = prompt['illustration_prompt']
        
        # Extract key elements for SD optimization
        analysis = prompt['content_analysis']
        
        # Build SD-optimized prompt
        main_subject = self.extract_main_subject(prompt)
        actors = ', '.join(analysis['key_actors']) if analysis['key_actors'] else 'politicians'
        actions = ', '.join(analysis['key_actions']) if analysis['key_actions'] else 'meeting'
        setting = analysis['setting'].replace('_', ' ')
        
        # SD works well with structured prompts
        positive_prompt = f"""
{main_subject}, {actors} {actions} in {setting},
cartoon illustration, educational comic style, Norwegian parliament building,
bright cheerful colors, friendly atmosphere, detailed background,
high quality, masterpiece, best quality, 8k resolution,
professional illustration, clean art style, vector art style
        """.strip().replace('\n', ' ')
        
        # Negative prompt to avoid unwanted elements
        negative_prompt = """
low quality, blurry, dark, scary, violent, inappropriate, 
nude, nsfw, ugly, distorted, bad anatomy, bad hands, 
text, watermark, signature, cropped, out of frame,
poorly drawn, amateur, sketch, draft
        """.strip().replace('\n', ' ')
        
        return {
            'positive': positive_prompt,
            'negative': negative_prompt,
            'original': base_prompt
        }
    
    def extract_main_subject(self, prompt: Dict) -> str:
        """Extract main subject from prompt"""
        section_title = prompt['section']
        clean_title = re.sub(r'^§\s*\d+[a-z]?:\s*', '', section_title)
        return clean_title[:80]  # Limit length for SD
    
    def generate_filename(self, prompt: Dict, index: int) -> str:
        """Generate filename for the illustration"""
        section_match = re.match(r'§\s*(\d+[a-z]?)', prompt['section'])
        section_num = section_match.group(1) if section_match else f'section{index:03d}'
        topic = prompt['content_analysis']['main_topic'].replace('_', '-')
        return f"parliament-s{section_num}-{topic}"
    
    def generate_image(self, 
                      positive_prompt: str, 
                      negative_prompt: str,
                      filename: str,
                      width: int = 768,
                      height: int = 512,
                      steps: int = 20,
                      cfg_scale: float = 7.0,
                      sampler: str = "DPM++ 2M Karras") -> Optional[str]:
        """Generate single image using SD WebUI API"""
        
        payload = {
            "prompt": positive_prompt,
            "negative_prompt": negative_prompt,
            "width": width,
            "height": height,
            "steps": steps,
            "cfg_scale": cfg_scale,
            "sampler_name": sampler,
            "batch_size": 1,
            "n_iter": 1,
            "seed": -1,
            "restore_faces": False,
            "tiling": False,
            "do_not_save_samples": True,
            "do_not_save_grid": True
        }
        
        try:
            print(f"   Generating: {filename}...")
            response = self.session.post(f"{self.webui_url}/sdapi/v1/txt2img", json=payload, timeout=120)
            
            if response.status_code == 200:
                result = response.json()
                
                # Decode and save image
                image_data = base64.b64decode(result['images'][0])
                image = Image.open(io.BytesIO(image_data))
                
                # Save with both PNG and JPG formats
                png_path = os.path.join(self.output_dir, f"{filename}.png")
                jpg_path = os.path.join(self.output_dir, f"{filename}.jpg")
                
                image.save(png_path, "PNG")
                image.save(jpg_path, "JPEG", quality=95)
                
                print(f"   ✓ Saved: {png_path}")
                return png_path
            else:
                print(f"   ❌ Generation failed: {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return None
                
        except Exception as e:
            print(f"   ❌ Error generating {filename}: {e}")
            return None
    
    def generate_batch(self, 
                      max_images: int = 10,
                      topic_filter: Optional[str] = None,
                      width: int = 768,
                      height: int = 512,
                      steps: int = 20,
                      cfg_scale: float = 7.0) -> List[str]:
        """Generate a batch of illustrations"""
        
        if not self.check_webui_connection():
            return []
        
        # Filter prompts if needed
        if topic_filter:
            filtered_prompts = [
                p for p in self.prompts 
                if p['content_analysis']['main_topic'] == topic_filter
            ]
        else:
            filtered_prompts = self.prompts
        
        # Limit number of images
        selected_prompts = filtered_prompts[:max_images]
        generated_files = []
        
        print(f"\n🎨 Starting batch generation of {len(selected_prompts)} images...")
        print(f"   Output directory: {os.path.abspath(self.output_dir)}")
        print(f"   Settings: {width}x{height}, {steps} steps, CFG {cfg_scale}")
        
        # Generate metadata file
        metadata = {
            'generation_info': {
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                'total_images': len(selected_prompts),
                'settings': {
                    'width': width, 'height': height,
                    'steps': steps, 'cfg_scale': cfg_scale
                },
                'topic_filter': topic_filter
            },
            'images': []
        }
        
        for i, prompt in enumerate(selected_prompts, 1):
            print(f"\n📸 Image {i}/{len(selected_prompts)}")
            print(f"   Section: {prompt['section']}")
            
            # Optimize prompt for SD
            optimized = self.optimize_prompt_for_sd(prompt)
            filename = self.generate_filename(prompt, i)
            
            print(f"   Prompt: {optimized['positive'][:100]}...")
            
            # Generate image
            image_path = self.generate_image(
                positive_prompt=optimized['positive'],
                negative_prompt=optimized['negative'],
                filename=filename,
                width=width,
                height=height,
                steps=steps,
                cfg_scale=cfg_scale
            )
            
            if image_path:
                generated_files.append(image_path)
                
                # Add to metadata
                metadata['images'].append({
                    'filename': os.path.basename(image_path),
                    'section': prompt['section'],
                    'topic': prompt['content_analysis']['main_topic'],
                    'positive_prompt': optimized['positive'],
                    'negative_prompt': optimized['negative'],
                    'original_prompt': optimized['original'],
                    'word_count': prompt['word_count']
                })
            
            # Small delay to avoid overwhelming the API
            time.sleep(2)
        
        # Save metadata
        metadata_file = os.path.join(self.output_dir, 'generation_metadata.json')
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        print(f"\n✨ Batch generation complete!")
        print(f"   Generated: {len(generated_files)} images")
        print(f"   Metadata saved: {metadata_file}")
        
        return generated_files
    
    def generate_single(self, section_number: str) -> Optional[str]:
        """Generate illustration for a specific section"""
        
        if not self.check_webui_connection():
            return None
        
        # Find the section
        target_prompt = None
        for prompt in self.prompts:
            if section_number in prompt['section']:
                target_prompt = prompt
                break
        
        if not target_prompt:
            print(f"❌ Section {section_number} not found")
            return None
        
        print(f"\n🎨 Generating illustration for {target_prompt['section']}")
        
        # Optimize and generate
        optimized = self.optimize_prompt_for_sd(target_prompt)
        filename = self.generate_filename(target_prompt, 1)
        
        print(f"   Prompt: {optimized['positive'][:100]}...")
        
        return self.generate_image(
            positive_prompt=optimized['positive'],
            negative_prompt=optimized['negative'],
            filename=filename
        )
    
    def list_available_topics(self):
        """List all available topics for filtering"""
        topics = {}
        for prompt in self.prompts:
            topic = prompt['content_analysis']['main_topic']
            topics[topic] = topics.get(topic, 0) + 1
        
        print("\n📋 Available Topics:")
        for topic, count in sorted(topics.items(), key=lambda x: x[1], reverse=True):
            print(f"   {topic.replace('_', ' ').title()}: {count} sections")
        
        return list(topics.keys())
    
    def show_sections(self, max_show: int = 10):
        """Show available sections"""
        print(f"\n📋 Available Sections (showing first {max_show}):")
        for i, prompt in enumerate(self.prompts[:max_show], 1):
            section_num = re.match(r'§\s*(\d+[a-z]?)', prompt['section'])
            section_id = section_num.group(1) if section_num else str(i)
            print(f"   {section_id}: {prompt['section']}")
        
        if len(self.prompts) > max_show:
            print(f"   ... and {len(self.prompts) - max_show} more sections")

def main():
    """Main function with interactive options"""
    generator = SDWebUIGenerator()
    
    if not generator.prompts:
        print("❌ No prompts loaded. Please check the prompts file.")
        return
    
    print("🎨 Stable Diffusion WebUI Illustration Generator")
    print("=" * 50)
    
    # Check connection
    if not generator.check_webui_connection():
        print("\n💡 To start SD WebUI with API access:")
        print("   Add --api flag when starting webui")
        print("   Example: webui-user.bat --api")
        return
    
    # Show available models
    models = generator.get_available_models()
    if models:
        print(f"\n📦 Available Models: {len(models)}")
        for model in models[:3]:  # Show first 3
            print(f"   • {model}")
        if len(models) > 3:
            print(f"   ... and {len(models) - 3} more")
    
    # Show topics and sections
    topics = generator.list_available_topics()
    generator.show_sections()
    
    print(f"\n📊 Total sections available: {len(generator.prompts)}")
    
    # Interactive menu
    print("\n🎯 Quick Start Options:")
    print("1. Generate 5 images (quick test)")
    print("2. Generate 10 images (small batch)")
    print("3. Generate all images")
    print("4. Generate single image by section number")
    print("5. Custom batch with topic filter")
    
    choice = input("\nEnter your choice (1-5) or 'q' to quit: ").strip()
    
    if choice == '1':
        print("Generating 5 test images...")
        generator.generate_batch(max_images=5)
    
    elif choice == '2':
        print("Generating 10 images...")
        generator.generate_batch(max_images=10)
    
    elif choice == '3':
        confirm = input(f"Generate ALL {len(generator.prompts)} images? This may take a while. (y/N): ")
        if confirm.lower() == 'y':
            generator.generate_batch(max_images=len(generator.prompts))
        else:
            print("Cancelled.")
    
    elif choice == '4':
        section = input("Enter section number (e.g., '1', '25', etc.): ").strip()
        if section:
            generator.generate_single(section)
    
    elif choice == '5':
        print("Available topics:")
        for i, topic in enumerate(topics, 1):
            print(f"   {i}. {topic.replace('_', ' ').title()}")
        
        topic_choice = input("Enter topic number: ").strip()
        if topic_choice.isdigit() and 1 <= int(topic_choice) <= len(topics):
            selected_topic = topics[int(topic_choice) - 1]
            max_imgs = input("Max images to generate (default 10): ").strip()
            max_imgs = int(max_imgs) if max_imgs.isdigit() else 10
            
            print(f"Generating up to {max_imgs} images for topic: {selected_topic}")
            generator.generate_batch(max_images=max_imgs, topic_filter=selected_topic)
    
    elif choice.lower() == 'q':
        print("Goodbye!")
    
    else:
        print("Invalid choice. Please run the script again.")

if __name__ == "__main__":
    main()