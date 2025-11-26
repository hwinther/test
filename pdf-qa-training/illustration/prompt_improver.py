#!/usr/bin/env python3
"""
Prompt Improvement Tool
Helps refine and improve prompts based on results
"""

def analyze_prompt_issues():
    """Common issues and solutions for SD prompts"""
    
    issues_and_solutions = {
        "Images too diffuse/blurry": [
            "Add: 'sharp focus, high detail, professional photography'",
            "Add: 'crisp, clear, high resolution'", 
            "Remove vague terms, be more specific",
            "Use: 'detailed, well-defined, precise'"
        ],
        
        "Text appears in images": [
            "Add to negative: 'text, letters, words, signage, logos'",
            "Add to negative: 'writing, typography, labels'",
            "Be specific about avoiding text elements"
        ],
        
        "Wrong style (too cartoon/anime)": [
            "Add to negative: 'cartoon, anime, comic book, illustrated'",
            "Emphasize: 'photorealistic, professional photography'",
            "Use: 'documentary style, realistic, natural'"
        ],
        
        "People look unrealistic": [
            "Add: 'professional business attire, formal clothing'",
            "Add: 'realistic faces, natural expressions'",
            "Add: 'documentary photography, photojournalistic'"
        ],
        
        "Architecture looks wrong": [
            "Be specific: 'Norwegian parliament building interior'",
            "Add: 'classical government architecture, formal chamber'",
            "Use: 'traditional parliamentary design, official building'"
        ]
    }
    
    return issues_and_solutions

def suggest_prompt_improvements():
    """Interactive prompt improvement suggestions"""
    
    print("🔧 Prompt Improvement Helper")
    print("=" * 40)
    
    print("\nCommon issues and solutions:")
    issues = analyze_prompt_issues()
    
    for issue, solutions in issues.items():
        print(f"\n❓ {issue}:")
        for i, solution in enumerate(solutions, 1):
            print(f"   {i}. {solution}")
    
    print("\n" + "="*40)
    print("💡 General Prompt Writing Tips:")
    print("1. Be specific about what you want")
    print("2. Use professional, descriptive language")
    print("3. Mention the setting clearly (Norwegian parliament)")
    print("4. Specify the style (photorealistic, diagram, etc.)")
    print("5. Add quality terms (professional, high detail, etc.)")
    print("6. Use strong negative prompts to avoid unwanted elements")

def build_improved_prompt():
    """Interactive prompt builder with improvements"""
    
    print("\n🎯 Build Improved Parliamentary Prompt")
    print("=" * 45)
    
    # Base elements
    base_elements = {
        "subject": [
            "Norwegian parliament chamber",
            "Parliamentary debate session", 
            "Speaker at parliament podium",
            "Parliamentary seating arrangement",
            "Committee meeting room"
        ],
        "style": [
            "Professional photorealistic photography",
            "Documentary style photograph", 
            "Architectural interior photography",
            "Educational diagram illustration",
            "Technical infographic style"
        ],
        "quality": [
            "high detail", "professional quality", "sharp focus",
            "well-lit", "crisp", "clear composition", "high resolution"
        ],
        "setting_details": [
            "formal government setting", "classical architecture",
            "traditional parliamentary design", "official chamber",
            "Norwegian Stortinget building interior"
        ]
    }
    
    print("Select elements for your prompt:")
    
    # Subject selection
    print("\n📍 Subject/Scene:")
    for i, subject in enumerate(base_elements["subject"], 1):
        print(f"{i}. {subject}")
    subject_idx = int(input("Choose subject (1-5): ")) - 1
    selected_subject = base_elements["subject"][subject_idx]
    
    # Style selection  
    print("\n🎨 Art Style:")
    for i, style in enumerate(base_elements["style"], 1):
        print(f"{i}. {style}")
    style_idx = int(input("Choose style (1-5): ")) - 1
    selected_style = base_elements["style"][style_idx]
    
    # Build prompt
    prompt_parts = [
        selected_style,
        "of",
        selected_subject + ".",
        " ".join(base_elements["quality"]) + ".",
        " ".join(base_elements["setting_details"]) + "."
    ]
    
    improved_prompt = " ".join(prompt_parts)
    
    # Suggest negative prompt
    negative_suggestions = [
        "cartoon, anime, comic book, illustrated",
        "text, letters, words, signage, logos, writing", 
        "blurry, low quality, distorted, unclear",
        "casual clothing, informal, modern furniture",
        "bright colors, childish, decorative"
    ]
    
    suggested_negative = ", ".join(negative_suggestions)
    
    print("\n✨ Improved Prompt:")
    print(f"Positive: {improved_prompt}")
    print(f"\nNegative: {suggested_negative}")
    
    # Save to file
    save_choice = input("\n💾 Save this prompt to file? (y/n): ").lower()
    if save_choice == 'y':
        with open("improved_prompt.txt", "w", encoding="utf-8") as f:
            f.write("IMPROVED PARLIAMENTARY PROMPT\n")
            f.write(f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(f"Positive prompt:\n{improved_prompt}\n\n")
            f.write(f"Negative prompt:\n{suggested_negative}\n")
        print("✅ Saved to improved_prompt.txt")

def main():
    import time
    
    print("=== Parliamentary Illustration Prompt Improver ===")
    
    while True:
        print("\n🛠️ Choose an option:")
        print("1. View common issues and solutions")
        print("2. Build improved prompt interactively") 
        print("3. Exit")
        
        choice = input("\nEnter choice (1-3): ").strip()
        
        if choice == "1":
            suggest_prompt_improvements()
        elif choice == "2":
            build_improved_prompt()
        elif choice == "3":
            break
        else:
            print("❌ Invalid choice")
    
    print("👋 Goodbye!")

if __name__ == "__main__":
    main()