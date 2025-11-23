#!/usr/bin/env python3
"""
Generate cartoon/caricature illustration prompts for each section of the Norwegian Parliament procedures document.
This script processes the structured PDF chunks and creates prompts for generating illustrations
that summarize the content of each section in a humorous, cartoon-like style.
"""

import json
import re
from typing import List, Dict, Set
from collections import defaultdict

class IllustrationPromptGenerator:
    def __init__(self, chunks_file: str = '../improved_chunks.json'):
        self.chunks_file = chunks_file
        self.chunks = []
        self.sections = defaultdict(list)
        self.load_chunks()
        self.organize_by_sections()
    
    def load_chunks(self):
        """Load the processed PDF chunks"""
        try:
            with open(self.chunks_file, 'r', encoding='utf-8') as f:
                self.chunks = json.load(f)
            print(f"✓ Loaded {len(self.chunks)} chunks from {self.chunks_file}")
        except FileNotFoundError:
            print(f"❌ Could not find {self.chunks_file}")
            print("Please run the PDF processing first to generate the chunks.")
            return
    
    def organize_by_sections(self):
        """Organize chunks by sections and chapters"""
        current_chapter = "Introduction"
        current_section = "general"
        
        for chunk in self.chunks:
            text = chunk['text']
            chunk_type = chunk.get('chunk_type', 'regular')
            
            # Detect chapter headers
            chapter_match = re.search(r'Kapittel\s+(\d+)\s+(.+?)(?:\s+\.{3,}|\n|$)', text, re.IGNORECASE)
            if chapter_match:
                chapter_num = chapter_match.group(1)
                chapter_title = chapter_match.group(2).strip()
                current_chapter = f"Chapter {chapter_num}: {chapter_title}"
                current_section = f"chapter_{chapter_num}_intro"
            
            # Detect section headers (§)
            section_matches = re.findall(r'§\s*(\d+(?:[a-z])?)\s+([^\.]+?)(?:\s+\.{3,}|\n|(?=§))', text)
            if section_matches:
                for section_num, section_title in section_matches:
                    section_key = f"section_{section_num}"
                    section_title_clean = section_title.strip()
                    if section_key not in self.sections:
                        self.sections[section_key] = {
                            'title': f"§ {section_num}: {section_title_clean}",
                            'chapter': current_chapter,
                            'chunks': [],
                            'section_number': section_num
                        }
                    current_section = section_key
            
            # Add chunk to current section
            if current_section not in self.sections:
                self.sections[current_section] = {
                    'title': current_chapter,
                    'chapter': current_chapter,
                    'chunks': [],
                    'section_number': current_section
                }
            
            self.sections[current_section]['chunks'].append(chunk)
        
        print(f"✓ Organized into {len(self.sections)} sections")
    
    def extract_key_themes(self, text: str) -> List[str]:
        """Extract key themes and concepts from section text"""
        themes = []
        text_lower = text.lower()
        
        # Parliamentary procedures
        if any(word in text_lower for word in ['konstituering', 'valg', 'stortingsvalg']):
            themes.append('elections_constitution')
        
        if any(word in text_lower for word in ['presidenten', 'president', 'leder']):
            themes.append('leadership')
        
        if any(word in text_lower for word in ['komité', 'komiteer', 'utvalg']):
            themes.append('committees')
        
        if any(word in text_lower for word in ['votering', 'avstemning', 'stemme']):
            themes.append('voting')
        
        if any(word in text_lower for word in ['debatt', 'tale', 'diskusjon', 'forhandling']):
            themes.append('debate')
        
        if any(word in text_lower for word in ['møte', 'samling', 'innkalling']):
            themes.append('meetings')
        
        if any(word in text_lower for word in ['forslag', 'proposisjon', 'innstilling']):
            themes.append('proposals')
        
        if any(word in text_lower for word in ['budsjett', 'økonomi', 'finans']):
            themes.append('budget_finance')
        
        if any(word in text_lower for word in ['kontroll', 'tilsyn', 'gransking']):
            themes.append('oversight')
        
        if any(word in text_lower for word in ['regel', 'prosedyre', 'orden']):
            themes.append('rules_procedures')
        
        if any(word in text_lower for word in ['regjering', 'minister', 'statsråd']):
            themes.append('government')
        
        if any(word in text_lower for word in ['dokument', 'rapport', 'innstilling']):
            themes.append('documentation')
        
        return themes if themes else ['general_procedures']
    
    def generate_illustration_prompt(self, section_data: Dict) -> str:
        """Generate a cartoon/caricature illustration prompt for a section"""
        title = section_data['title']
        chapter = section_data['chapter']
        chunks = section_data['chunks']
        
        # Combine all text from chunks in this section
        full_text = ' '.join([chunk['text'] for chunk in chunks])
        themes = self.extract_key_themes(full_text)
        
        # Create section summary
        summary = self.create_section_summary(full_text, themes)
        
        # Generate the illustration prompt based on themes and content
        base_prompt = "Create a colorful cartoon illustration in the style of a political cartoon or caricature. "
        
        # Theme-specific prompt elements
        theme_prompts = {
            'elections_constitution': "Show politicians in formal suits dramatically gesturing while setting up parliament, with ballot boxes and official documents flying around. ",
            'leadership': "Depict a pompous figure with a ceremonial gavel or speaker's hammer, sitting on an oversized parliamentary chair with other politicians bowing or applauding. ",
            'committees': "Illustrate people sitting around an enormous round table with stacks of papers, some sleeping, others frantically taking notes, with thought bubbles showing different ideas. ",
            'voting': "Show hands dramatically raised in the air, with some politicians looking confused about which way to vote, ballot boxes, and a large scoreboard. ",
            'debate': "Capture politicians passionately arguing with exaggerated expressions, speech bubbles with exclamation marks, and a referee-like figure trying to maintain order. ",
            'meetings': "Depict a grand meeting hall with politicians rushing in late with briefcases, some looking bored, others frantically checking their watches. ",
            'proposals': "Show politicians holding oversized documents and bills, with some proposals literally floating in the air as paper airplanes. ",
            'budget_finance': "Illustrate giant calculators, money symbols floating around, and politicians juggling coins and bills with worried expressions. ",
            'oversight': "Draw a detective-like figure with a magnifying glass examining documents while other politicians try to hide behind desks or newspapers. ",
            'rules_procedures': "Show a judge-like figure with a huge rule book while politicians are tangled in red tape or procedural chains. ",
            'government': "Depict the formal interaction between parliament and government with exaggerated handshakes, official seals, and ceremonial elements. ",
            'documentation': "Illustrate mountains of paperwork, filing cabinets reaching the ceiling, and politicians buried under documents with only their heads visible. ",
            'general_procedures': "Show the general hustle and bustle of parliamentary life with politicians in various animated poses around the parliament building. "
        }
        
        # Select the most relevant theme prompt
        main_theme = themes[0] if themes else 'general_procedures'
        scene_description = theme_prompts.get(main_theme, theme_prompts['general_procedures'])
        
        # Add Norwegian parliament setting
        setting_prompt = "Set the scene in the Norwegian Parliament (Stortinget) with its distinctive architecture. "
        
        # Add specific section context
        section_context = f"The illustration should humorously represent the topic: '{title}'. "
        
        # Add style specifications
        style_prompt = ("Use a warm, friendly cartoon style with exaggerated facial expressions and body language. "
                       "Make it educational but entertaining, suitable for explaining parliamentary procedures to the general public. "
                       "Include Norwegian cultural elements and make the politicians look like friendly, approachable cartoon characters rather than realistic portraits. "
                       "Use bright, engaging colors and add small humorous details that make the democratic process seem accessible and interesting.")
        
        full_prompt = base_prompt + scene_description + setting_prompt + section_context + style_prompt
        
        return {
            'section': title,
            'chapter': chapter,
            'themes': themes,
            'summary': summary,
            'illustration_prompt': full_prompt,
            'word_count': len(full_text.split()),
            'chunk_count': len(chunks)
        }
    
    def create_section_summary(self, text: str, themes: List[str]) -> str:
        """Create a brief summary of what the section covers"""
        # Extract key sentences and concepts
        sentences = re.split(r'[.!?]+', text)
        
        # Look for sentences that contain important concepts
        key_sentences = []
        for sentence in sentences[:10]:  # Look at first 10 sentences
            sentence = sentence.strip()
            if len(sentence) > 20 and any(theme in sentence.lower() for theme in ['stortinget', 'president', 'komité', 'votering', '§']):
                key_sentences.append(sentence)
        
        if key_sentences:
            return ' '.join(key_sentences[:2])  # Take first 2 key sentences
        else:
            # Fallback: take first meaningful sentence
            for sentence in sentences:
                if len(sentence.strip()) > 50:
                    return sentence.strip()
        
        return "Parliamentary procedure and governance rules."
    
    def generate_all_prompts(self) -> List[Dict]:
        """Generate illustration prompts for all sections"""
        all_prompts = []
        
        print("Generating illustration prompts...")
        
        # Sort sections by section number for logical order
        sorted_sections = sorted(
            [(k, v) for k, v in self.sections.items() if k.startswith('section_')], 
            key=lambda x: self.extract_section_number(x[1]['section_number'])
        )
        
        # Add non-section content (chapters, introductions)
        other_sections = [(k, v) for k, v in self.sections.items() if not k.startswith('section_')]
        
        for section_key, section_data in sorted_sections + other_sections:
            if section_data['chunks']:  # Only process sections with content
                prompt_data = self.generate_illustration_prompt(section_data)
                all_prompts.append(prompt_data)
                print(f"✓ Generated prompt for: {prompt_data['section']}")
        
        return all_prompts
    
    def extract_section_number(self, section_num: str) -> int:
        """Extract numeric part of section number for sorting"""
        match = re.search(r'(\d+)', str(section_num))
        return int(match.group(1)) if match else 999
    
    def save_prompts(self, prompts: List[Dict], output_file: str = 'illustration_prompts.json'):
        """Save the generated prompts to a file"""
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(prompts, f, indent=2, ensure_ascii=False)
        print(f"✓ Saved {len(prompts)} illustration prompts to {output_file}")
    
    def create_prompt_summary(self, prompts: List[Dict], summary_file: str = 'illustration_prompts_summary.md'):
        """Create a markdown summary of all the prompts"""
        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write("# Norwegian Parliament Procedure Illustrations\n\n")
            f.write("This document contains illustration prompts for creating cartoon-style educational images "
                   "about Norwegian parliamentary procedures based on 'Stortingets forretningsorden'.\n\n")
            
            f.write("## Summary Statistics\n\n")
            f.write(f"- **Total sections**: {len(prompts)}\n")
            f.write(f"- **Total word count**: {sum(p['word_count'] for p in prompts):,}\n")
            f.write(f"- **Average words per section**: {sum(p['word_count'] for p in prompts) // len(prompts)}\n\n")
            
            # Theme distribution
            all_themes = []
            for p in prompts:
                all_themes.extend(p['themes'])
            theme_counts = {}
            for theme in all_themes:
                theme_counts[theme] = theme_counts.get(theme, 0) + 1
            
            f.write("## Theme Distribution\n\n")
            for theme, count in sorted(theme_counts.items(), key=lambda x: x[1], reverse=True):
                f.write(f"- **{theme.replace('_', ' ').title()}**: {count} sections\n")
            
            f.write("\n## Illustration Prompts by Section\n\n")
            
            for i, prompt in enumerate(prompts, 1):
                f.write(f"### {i}. {prompt['section']}\n\n")
                f.write(f"**Chapter**: {prompt['chapter']}\n\n")
                f.write(f"**Themes**: {', '.join(prompt['themes'])}\n\n")
                f.write(f"**Summary**: {prompt['summary']}\n\n")
                f.write("**Illustration Prompt**:\n")
                f.write(f"> {prompt['illustration_prompt']}\n\n")
                f.write(f"*Word count: {prompt['word_count']}, Chunks: {prompt['chunk_count']}*\n\n")
                f.write("---\n\n")
        
        print(f"✓ Created summary document: {summary_file}")

def main():
    generator = IllustrationPromptGenerator()
    
    if not generator.chunks:
        return
    
    # Generate all prompts
    prompts = generator.generate_all_prompts()
    
    if prompts:
        # Save prompts
        generator.save_prompts(prompts)
        
        # Create summary document
        generator.create_prompt_summary(prompts)
        
        print(f"\n🎨 Successfully generated {len(prompts)} illustration prompts!")
        print("\nFiles created:")
        print("- illustration_prompts.json (machine-readable prompts)")
        print("- illustration_prompts_summary.md (human-readable summary)")
        
        print("\nTop 5 most common themes:")
        all_themes = []
        for p in prompts:
            all_themes.extend(p['themes'])
        theme_counts = {}
        for theme in all_themes:
            theme_counts[theme] = theme_counts.get(theme, 0) + 1
        
        for theme, count in sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
            print(f"  {theme.replace('_', ' ').title()}: {count} sections")
    
    else:
        print("❌ No prompts were generated. Check the input data.")

if __name__ == "__main__":
    main()