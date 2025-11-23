#!/usr/bin/env python3
"""
Example script showing how to use the generated illustration prompts.
This demonstrates how you could integrate the prompts with image generation services
like DALL-E, Midjourney, or Stable Diffusion.
"""

import json
import re
from typing import List, Dict

class IllustrationGenerator:
    def __init__(self, prompts_file: str = 'enhanced_illustration_prompts.json'):
        self.prompts_file = prompts_file
        self.prompts = []
        self.load_prompts()
    
    def load_prompts(self):
        """Load the generated illustration prompts"""
        try:
            with open(self.prompts_file, 'r', encoding='utf-8') as f:
                self.prompts = json.load(f)
            print(f"✓ Loaded {len(self.prompts)} illustration prompts from {self.prompts_file}")
        except FileNotFoundError:
            print(f"❌ Could not find {self.prompts_file}")
            print("Please run the enhanced prompt generator first.")
            return
    
    def get_prompts_by_topic(self, topic: str) -> List[Dict]:
        """Get prompts filtered by main topic"""
        filtered_prompts = [
            prompt for prompt in self.prompts 
            if prompt['content_analysis']['main_topic'] == topic
        ]
        return filtered_prompts
    
    def get_prompts_by_chapter(self, chapter_number: int) -> List[Dict]:
        """Get prompts filtered by chapter"""
        chapter_filter = f"Chapter {chapter_number}:"
        filtered_prompts = [
            prompt for prompt in self.prompts 
            if prompt['chapter'].startswith(chapter_filter)
        ]
        return filtered_prompts
    
    def optimize_prompt_for_ai_service(self, prompt: Dict, service: str = 'dall_e') -> str:
        """Optimize the prompt for specific AI image generation services"""
        base_prompt = prompt['illustration_prompt']
        
        # Service-specific optimizations
        if service.lower() == 'dall_e':
            # DALL-E works well with descriptive, detailed prompts
            optimized = base_prompt
            
        elif service.lower() == 'midjourney':
            # Midjourney prefers more concise, artistic direction
            # Extract key visual elements and style direction
            key_elements = self.extract_key_visual_elements(prompt)
            style_direction = "cartoon illustration, educational comic style, bright colors, Norwegian parliament setting"
            optimized = f"{key_elements}, {style_direction} --ar 16:9 --stylize 500"
            
        elif service.lower() == 'stable_diffusion':
            # Stable Diffusion works well with structured prompts
            main_subject = self.extract_main_subject(prompt)
            setting = prompt['content_analysis']['setting'].replace('_', ' ')
            style = "cartoon illustration, educational, bright colors, friendly"
            optimized = f"{main_subject} in {setting}, {style}, high quality, detailed"
            
        else:
            optimized = base_prompt
        
        return optimized
    
    def extract_key_visual_elements(self, prompt: Dict) -> str:
        """Extract key visual elements from the prompt"""
        analysis = prompt['content_analysis']
        actors = ', '.join(analysis['key_actors'])
        actions = ', '.join(analysis['key_actions'])
        elements = ', '.join(analysis.get('specific_elements', []))
        
        visual_description = f"{actors} {actions}"
        if elements:
            visual_description += f", with {elements}"
        
        return visual_description
    
    def extract_main_subject(self, prompt: Dict) -> str:
        """Extract the main subject for the illustration"""
        section_title = prompt['section']
        # Clean up the section title to be more readable
        clean_title = re.sub(r'^§\s*\d+[a-z]?:\s*', '', section_title)
        main_subject = clean_title[:100]  # Limit length
        return main_subject
    
    def generate_batch_prompts(self, topic: str = None, max_prompts: int = 10, service: str = 'dall_e') -> List[Dict]:
        """Generate a batch of optimized prompts for illustration creation"""
        if topic:
            selected_prompts = self.get_prompts_by_topic(topic)
        else:
            selected_prompts = self.prompts[:max_prompts]
        
        batch_prompts = []
        for i, prompt in enumerate(selected_prompts[:max_prompts], 1):
            optimized_prompt = self.optimize_prompt_for_ai_service(prompt, service)
            
            batch_item = {
                'id': f"illustration_{i:03d}",
                'section': prompt['section'],
                'topic': prompt['content_analysis']['main_topic'],
                'original_prompt': prompt['illustration_prompt'],
                'optimized_prompt': optimized_prompt,
                'suggested_filename': self.generate_filename(prompt),
                'metadata': {
                    'chapter': prompt['chapter'],
                    'word_count': prompt['word_count'],
                    'key_actors': prompt['content_analysis']['key_actors'],
                    'setting': prompt['content_analysis']['setting']
                }
            }
            batch_prompts.append(batch_item)
        
        return batch_prompts
    
    def generate_filename(self, prompt: Dict) -> str:
        """Generate a descriptive filename for the illustration"""
        section_match = re.match(r'§\s*(\d+[a-z]?)', prompt['section'])
        section_num = section_match.group(1) if section_match else 'unknown'
        topic = prompt['content_analysis']['main_topic'].replace('_', '-')
        filename = f"parliament-procedure-section-{section_num}-{topic}.png"
        return filename
    
    def create_illustration_brief(self, prompt: Dict) -> str:
        """Create a comprehensive brief for illustration creation"""
        brief = f"""
# Illustration Brief: {prompt['section']}

## Context
- **Chapter**: {prompt['chapter']}
- **Main Topic**: {prompt['content_analysis']['main_topic'].replace('_', ' ').title()}
- **Word Count**: {prompt['word_count']} words

## Visual Elements
- **Key Actors**: {', '.join(prompt['content_analysis']['key_actors'])}
- **Key Actions**: {', '.join(prompt['content_analysis']['key_actions'])}
- **Setting**: {prompt['content_analysis']['setting'].replace('_', ' ').title()}
- **Mood**: {prompt['content_analysis']['mood'].replace('_', ' ').title()}

## Special Elements
{', '.join(prompt['content_analysis'].get('specific_elements', ['None']))}

## Full Prompt
{prompt['illustration_prompt']}

## Summary
{prompt['summary']}

## Suggested Filename
{self.generate_filename(prompt)}
        """
        return brief.strip()
    
    def export_for_batch_generation(self, output_file: str = 'batch_illustration_prompts.json', 
                                   service: str = 'dall_e', max_prompts: int = 20):
        """Export prompts in a format suitable for batch image generation"""
        batch_prompts = self.generate_batch_prompts(service=service, max_prompts=max_prompts)
        
        export_data = {
            'metadata': {
                'total_prompts': len(batch_prompts),
                'service_optimized_for': service,
                'generated_from': self.prompts_file,
                'description': 'Norwegian Parliament procedure illustration prompts'
            },
            'prompts': batch_prompts
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Exported {len(batch_prompts)} optimized prompts to {output_file}")
        return output_file

def main():
    """Demonstrate the illustration prompt usage"""
    generator = IllustrationGenerator()
    
    if not generator.prompts:
        return
    
    print("\n📊 Prompt Statistics:")
    topics = {}
    for prompt in generator.prompts:
        topic = prompt['content_analysis']['main_topic']
        topics[topic] = topics.get(topic, 0) + 1
    
    for topic, count in sorted(topics.items(), key=lambda x: x[1], reverse=True):
        print(f"  {topic.replace('_', ' ').title()}: {count} sections")
    
    print("\n🎨 Example Usage:\n")
    
    # Show example for different services
    example_prompt = generator.prompts[0]
    print("1. Original Enhanced Prompt:")
    print(f"   Section: {example_prompt['section']}")
    print(f"   Length: {len(example_prompt['illustration_prompt'])} characters\n")
    
    print("2. Optimized for Different Services:")
    for service in ['dall_e', 'midjourney', 'stable_diffusion']:
        optimized = generator.optimize_prompt_for_ai_service(example_prompt, service)
        print(f"   {service.upper()}: {optimized[:100]}...\n")
    
    # Generate batch export
    print("3. Batch Export for AI Services:")
    generator.export_for_batch_generation(max_prompts=10, service='dall_e')
    
    # Show illustration brief example
    print("\n4. Detailed Illustration Brief:")
    brief = generator.create_illustration_brief(example_prompt)
    print(brief[:500] + "...\n")
    
    print("✨ Ready to create illustrations! Use the exported batch file with your preferred AI image generation service.")

if __name__ == "__main__":
    main()