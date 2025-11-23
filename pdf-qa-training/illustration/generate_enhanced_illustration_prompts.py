#!/usr/bin/env python3
"""
Enhanced illustration prompt generator with more specific, content-aware prompts.
This creates better tailored cartoon prompts based on the actual content of each section.
"""

import json
import re
from typing import List, Dict, Set
from collections import defaultdict

class EnhancedIllustrationPromptGenerator:
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
        """Organize chunks by sections and chapters with better parsing"""
        current_chapter = "Introduction"
        
        for chunk in self.chunks:
            text = chunk['text']
            chunk_type = chunk.get('chunk_type', 'regular')
            
            # Detect chapter headers with more precision
            chapter_match = re.search(r'Kapittel\s+(\d+)\s+(.+?)(?:\s+\.{3,}|\d+\s*$|\n|$)', text, re.IGNORECASE)
            if chapter_match:
                chapter_num = chapter_match.group(1)
                chapter_title = chapter_match.group(2).strip()
                current_chapter = f"Chapter {chapter_num}: {chapter_title}"
            
            # Better section detection - look for specific § patterns
            section_matches = re.findall(r'§\s*(\d+[a-z]?)\s+([^§]+?)(?=\s+§|\s+Kapittel|\s+\d+\s*$|$)', text, re.DOTALL)
            
            if section_matches:
                for section_num, section_content in section_matches:
                    # Extract a clean title from the content
                    title_match = re.search(r'^([^\.]+)', section_content.strip())
                    section_title = title_match.group(1).strip() if title_match else section_content[:50]
                    
                    section_key = f"section_{section_num}"
                    if section_key not in self.sections:
                        self.sections[section_key] = {
                            'title': f"§ {section_num}: {section_title}",
                            'chapter': current_chapter,
                            'chunks': [],
                            'section_number': section_num,
                            'full_content': section_content.strip()
                        }
                    else:
                        # Append content if section already exists
                        self.sections[section_key]['full_content'] += " " + section_content.strip()
            
            # Find the most relevant section for this chunk
            section_refs = re.findall(r'§\s*(\d+[a-z]?)', text)
            if section_refs:
                # Use the first section reference found
                section_key = f"section_{section_refs[0]}"
                if section_key in self.sections:
                    self.sections[section_key]['chunks'].append(chunk)
            else:
                # Add to a general section
                general_key = "general"
                if general_key not in self.sections:
                    self.sections[general_key] = {
                        'title': current_chapter,
                        'chapter': current_chapter,
                        'chunks': [],
                        'section_number': 'general',
                        'full_content': text
                    }
                self.sections[general_key]['chunks'].append(chunk)
        
        print(f"✓ Organized into {len(self.sections)} sections")
    
    def analyze_section_content(self, section_data: Dict) -> Dict:
        """Analyze section content to create more specific illustration prompts"""
        full_text = section_data.get('full_content', '')
        if not full_text and section_data['chunks']:
            full_text = ' '.join([chunk['text'] for chunk in section_data['chunks']])
        
        analysis = {
            'main_topic': 'general_procedures',
            'key_actors': [],
            'key_actions': [],
            'setting': 'parliament_general',
            'mood': 'formal',
            'specific_elements': []
        }
        
        text_lower = full_text.lower()
        
        # Identify main topic
        if any(word in text_lower for word in ['konstituering', 'valg', 'stortingsvalg']):
            analysis['main_topic'] = 'parliamentary_constitution'
            analysis['key_actors'] = ['new_parliamentarians', 'election_officials']
            analysis['key_actions'] = ['taking_oath', 'checking_credentials', 'formal_setup']
            analysis['setting'] = 'parliament_chamber'
            analysis['mood'] = 'ceremonial'
            
        elif any(word in text_lower for word in ['presidenten', 'president', 'leder', 'ledelse']):
            analysis['main_topic'] = 'parliamentary_leadership'
            analysis['key_actors'] = ['parliament_president', 'vice_presidents', 'secretaries']
            analysis['key_actions'] = ['leading_session', 'managing_procedures', 'ceremonial_duties']
            analysis['setting'] = 'speakers_podium'
            analysis['mood'] = 'authoritative'
            
        elif any(word in text_lower for word in ['komité', 'komiteer', 'utvalg']):
            analysis['main_topic'] = 'committee_work'
            analysis['key_actors'] = ['committee_members', 'committee_chair', 'experts']
            analysis['key_actions'] = ['reviewing_documents', 'hearing_witnesses', 'deliberating']
            analysis['setting'] = 'committee_room'
            analysis['mood'] = 'collaborative'
            
        elif any(word in text_lower for word in ['votering', 'avstemning', 'stemme']):
            analysis['main_topic'] = 'voting_procedures'
            analysis['key_actors'] = ['all_parliamentarians', 'vote_counters']
            analysis['key_actions'] = ['raising_hands', 'counting_votes', 'announcing_results']
            analysis['setting'] = 'parliament_chamber'
            analysis['mood'] = 'decisive'
            
        elif any(word in text_lower for word in ['debatt', 'tale', 'diskusjon', 'forhandling']):
            analysis['main_topic'] = 'parliamentary_debate'
            analysis['key_actors'] = ['speakers', 'opposition_members', 'government_members']
            analysis['key_actions'] = ['giving_speeches', 'interrupting', 'gesticulating']
            analysis['setting'] = 'parliament_chamber'
            analysis['mood'] = 'animated'
            
        elif any(word in text_lower for word in ['budsjett', 'økonomi', 'finans', 'bevilg']):
            analysis['main_topic'] = 'budget_finance'
            analysis['key_actors'] = ['finance_minister', 'budget_committee', 'economists']
            analysis['key_actions'] = ['calculating', 'presenting_charts', 'discussing_numbers']
            analysis['setting'] = 'committee_room'
            analysis['mood'] = 'serious'
            analysis['specific_elements'] = ['charts', 'calculators', 'money_symbols']
            
        elif any(word in text_lower for word in ['kontroll', 'tilsyn', 'gransking']):
            analysis['main_topic'] = 'oversight_control'
            analysis['key_actors'] = ['investigators', 'oversight_committee', 'witnesses']
            analysis['key_actions'] = ['examining_documents', 'asking_questions', 'taking_notes']
            analysis['setting'] = 'hearing_room'
            analysis['mood'] = 'investigative'
            analysis['specific_elements'] = ['magnifying_glass', 'documents', 'question_marks']
            
        elif any(word in text_lower for word in ['permisjon', 'fravær', 'møteplikt']):
            analysis['main_topic'] = 'attendance_rules'
            analysis['key_actors'] = ['absent_member', 'present_members', 'attendance_clerk']
            analysis['key_actions'] = ['checking_attendance', 'noting_absences', 'granting_leave']
            analysis['setting'] = 'parliament_chamber'
            analysis['mood'] = 'administrative'
            analysis['specific_elements'] = ['attendance_sheet', 'empty_seats', 'clock']
            
        # Add specific Norwegian elements
        if 'europautvalg' in text_lower or 'eu' in text_lower or 'eøs' in text_lower:
            analysis['specific_elements'].extend(['EU_flag', 'Norway_flag', 'European_map'])
        
        if 'samiske' in text_lower or 'sami' in text_lower:
            analysis['specific_elements'].extend(['Sami_flag', 'traditional_elements'])
        
        return analysis
    
    def create_specific_illustration_prompt(self, section_data: Dict, analysis: Dict) -> str:
        """Create a specific illustration prompt based on content analysis"""
        title = section_data['title']
        
        # Base prompt structure
        base_prompt = "Create a colorful cartoon illustration in the style of a friendly educational comic. "
        
        # Topic-specific scene descriptions
        scene_prompts = {
            'parliamentary_constitution': "Show new parliamentarians in formal attire being sworn in, with some looking nervous and others confident. Include ceremonial elements like official seals, flags, and documents being verified. ",
            
            'parliamentary_leadership': "Depict the parliament president with a ceremonial gavel or speaker's hammer, sitting in an elevated chair. Show other members looking up respectfully, with some whispering among themselves. ",
            
            'committee_work': "Illustrate a smaller group around a conference table covered with papers and reports. Some members are actively discussing while others are reading intently. Include name plates and water glasses. ",
            
            'voting_procedures': "Show the dramatic moment of voting with hands raised high in the air, some members looking uncertain about which way to vote, and vote counters frantically keeping track. Include a large vote tally board. ",
            
            'parliamentary_debate': "Capture the energy of debate with speakers gesturing passionately from the podium while other members react with various expressions - some nodding, others shaking heads, some taking notes. ",
            
            'budget_finance': "Show members surrounded by calculators, charts, and spreadsheets, with money symbols and numbers floating in thought bubbles. Some look overwhelmed by the complexity while others appear confident. ",
            
            'oversight_control': "Depict members with magnifying glasses examining documents, with question marks floating above their heads. Include filing cabinets and evidence boards in the background. ",
            
            'attendance_rules': "Show an attendance clerk checking off names while some seats are empty, with clock showing time and maybe a member rushing in late with briefcase in hand. ",
            
            'general_procedures': "Illustrate the general atmosphere of parliamentary work with members in various typical activities around the parliament building. "
        }
        
        # Get the appropriate scene
        scene_description = scene_prompts.get(analysis['main_topic'], scene_prompts['general_procedures'])
        
        # Add specific elements
        if analysis['specific_elements']:
            elements_text = f"Include these specific visual elements: {', '.join(analysis['specific_elements'])}. "
        else:
            elements_text = ""
        
        # Setting description
        setting_prompts = {
            'parliament_chamber': "Set in the main parliament chamber with its distinctive semicircular seating arrangement and elevated speaker's podium. ",
            'committee_room': "Set in a smaller committee meeting room with a conference table and formal but intimate atmosphere. ",
            'speakers_podium': "Focus on the speaker's area with the official podium and ceremonial elements of the parliament. ",
            'hearing_room': "Set in a formal hearing room with witness stand and panel of questioners. "
        }
        
        setting_description = setting_prompts.get(analysis['setting'], setting_prompts['parliament_chamber'])
        
        # Mood and style
        mood_descriptions = {
            'ceremonial': "Use dignified colors and formal postures while keeping the cartoon style friendly and approachable. ",
            'authoritative': "Show leadership and respect through posture and positioning, but maintain warmth in the expressions. ",
            'collaborative': "Emphasize teamwork and discussion through interactive poses and engaged expressions. ",
            'decisive': "Create tension and importance through dramatic gestures and focused expressions. ",
            'animated': "Use dynamic poses and exaggerated expressions to show the energy of debate. ",
            'serious': "Use more subdued colors and concentrated expressions while keeping it visually engaging. ",
            'investigative': "Add elements of mystery and curiosity through questioning poses and searching expressions. ",
            'administrative': "Show the routine but important nature of parliamentary administration. "
        }
        
        mood_description = mood_descriptions.get(analysis['mood'], mood_descriptions['collaborative'])
        
        # Context
        section_context = f"This illustration specifically represents '{title}' from Norwegian parliamentary procedures. "
        
        # Norwegian elements
        norwegian_elements = ("Include Norwegian cultural elements such as the distinctive architecture of the Stortinget building, "
                            "Norwegian flags, and make sure all politicians look like friendly, diverse cartoon characters "
                            "representing modern Norwegian society. ")
        
        # Style specifications
        style_prompt = ("Use bright, engaging colors with a warm and educational tone. The style should be similar to "
                       "educational comics or children's book illustrations that explain government to citizens. "
                       "Make sure the illustration is informative yet entertaining, helping people understand "
                       "democratic processes in an accessible way.")
        
        # Combine all parts
        full_prompt = (base_prompt + scene_description + setting_description + elements_text + 
                      section_context + mood_description + norwegian_elements + style_prompt)
        
        return full_prompt
    
    def generate_enhanced_prompts(self) -> List[Dict]:
        """Generate enhanced, content-aware illustration prompts"""
        all_prompts = []
        
        print("Generating enhanced illustration prompts...")
        
        # Sort sections by section number for logical order
        sorted_sections = []
        for section_key, section_data in self.sections.items():
            if section_key.startswith('section_'):
                try:
                    section_num = int(re.search(r'(\d+)', section_data['section_number']).group(1))
                    sorted_sections.append((section_num, section_key, section_data))
                except:
                    sorted_sections.append((999, section_key, section_data))
        
        sorted_sections.sort(key=lambda x: x[0])
        
        for _, section_key, section_data in sorted_sections:
            if section_data['chunks']:  # Only process sections with content
                analysis = self.analyze_section_content(section_data)
                illustration_prompt = self.create_specific_illustration_prompt(section_data, analysis)
                
                # Combine chunks text for summary
                full_text = ' '.join([chunk['text'] for chunk in section_data['chunks']])
                
                prompt_data = {
                    'section': section_data['title'],
                    'chapter': section_data['chapter'],
                    'section_number': section_data['section_number'],
                    'content_analysis': analysis,
                    'summary': self.create_section_summary(full_text),
                    'illustration_prompt': illustration_prompt,
                    'word_count': len(full_text.split()),
                    'chunk_count': len(section_data['chunks'])
                }
                
                all_prompts.append(prompt_data)
                print(f"✓ Enhanced prompt for: {prompt_data['section']}")
        
        return all_prompts
    
    def create_section_summary(self, text: str) -> str:
        """Create a more focused summary"""
        # Get first meaningful sentence that contains key information
        sentences = [s.strip() for s in re.split(r'[.!?]+', text) if len(s.strip()) > 30]
        
        for sentence in sentences[:5]:
            if any(word in sentence.lower() for word in ['§', 'stortinget', 'komité', 'president']):
                return sentence[:200] + "..." if len(sentence) > 200 else sentence
        
        return sentences[0][:200] + "..." if sentences and len(sentences[0]) > 200 else sentences[0] if sentences else "Parliamentary procedure section."
    
    def save_enhanced_prompts(self, prompts: List[Dict], output_file: str = 'enhanced_illustration_prompts.json'):
        """Save the enhanced prompts"""
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(prompts, f, indent=2, ensure_ascii=False)
        print(f"✓ Saved {len(prompts)} enhanced prompts to {output_file}")
    
    def create_enhanced_summary(self, prompts: List[Dict], summary_file: str = 'enhanced_illustration_prompts_summary.md'):
        """Create an enhanced markdown summary"""
        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write("# Enhanced Norwegian Parliament Procedure Illustrations\n\n")
            f.write("This document contains enhanced, content-aware illustration prompts for creating "
                   "cartoon-style educational images about Norwegian parliamentary procedures.\n\n")
            
            f.write("## Summary Statistics\n\n")
            f.write(f"- **Total sections**: {len(prompts)}\n")
            f.write(f"- **Total word count**: {sum(p['word_count'] for p in prompts):,}\n")
            f.write(f"- **Average words per section**: {sum(p['word_count'] for p in prompts) // len(prompts) if prompts else 0}\n\n")
            
            # Topic analysis
            topic_counts = {}
            for p in prompts:
                topic = p['content_analysis']['main_topic']
                topic_counts[topic] = topic_counts.get(topic, 0) + 1
            
            f.write("## Topic Distribution\n\n")
            for topic, count in sorted(topic_counts.items(), key=lambda x: x[1], reverse=True):
                f.write(f"- **{topic.replace('_', ' ').title()}**: {count} sections\n")
            
            f.write("\n## Enhanced Illustration Prompts by Section\n\n")
            
            for i, prompt in enumerate(prompts, 1):
                f.write(f"### {i}. {prompt['section']}\n\n")
                f.write(f"**Chapter**: {prompt['chapter']}\n\n")
                f.write(f"**Main Topic**: {prompt['content_analysis']['main_topic'].replace('_', ' ').title()}\n\n")
                f.write(f"**Key Actors**: {', '.join(prompt['content_analysis']['key_actors'])}\n\n")
                f.write(f"**Setting**: {prompt['content_analysis']['setting'].replace('_', ' ').title()}\n\n")
                f.write(f"**Summary**: {prompt['summary']}\n\n")
                
                f.write("**Enhanced Illustration Prompt**:\n")
                f.write(f"> {prompt['illustration_prompt']}\n\n")
                
                if prompt['content_analysis']['specific_elements']:
                    f.write(f"**Special Elements**: {', '.join(prompt['content_analysis']['specific_elements'])}\n\n")
                
                f.write(f"*Word count: {prompt['word_count']}, Chunks: {prompt['chunk_count']}*\n\n")
                f.write("---\n\n")
        
        print(f"✓ Created enhanced summary document: {summary_file}")

def main():
    generator = EnhancedIllustrationPromptGenerator()
    
    if not generator.chunks:
        return
    
    # Generate enhanced prompts
    prompts = generator.generate_enhanced_prompts()
    
    if prompts:
        # Save prompts
        generator.save_enhanced_prompts(prompts)
        
        # Create enhanced summary
        generator.create_enhanced_summary(prompts)
        
        print(f"\n🎨 Successfully generated {len(prompts)} enhanced illustration prompts!")
        print("\nFiles created:")
        print("- enhanced_illustration_prompts.json (machine-readable prompts)")
        print("- enhanced_illustration_prompts_summary.md (human-readable summary)")
        
        # Show topic distribution
        topic_counts = {}
        for p in prompts:
            topic = p['content_analysis']['main_topic']
            topic_counts[topic] = topic_counts.get(topic, 0) + 1
        
        print("\nTop illustration topics:")
        for topic, count in sorted(topic_counts.items(), key=lambda x: x[1], reverse=True):
            print(f"  {topic.replace('_', ' ').title()}: {count} sections")
    
    else:
        print("❌ No enhanced prompts were generated.")

if __name__ == "__main__":
    main()