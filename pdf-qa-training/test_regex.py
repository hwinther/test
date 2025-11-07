import re

# The actual text from Chunk 128
test_text = """130 Stortingets forretningsorden med kommentarer § 39 Utbyttingsordningen, jf. kommentarer til § 5, tillater at partiene avtaler seg imellom at et fravær i et parti kan møtes av et fravær i et annet parti med motsatt standpunkt, slik at resultatet uansett reflekterer flertallet i plenum. Ved feil i utbyttingen som har ledet til et annet resultat enn det som ellers ville ha flertall i plenum, er det praksis for at presidentskapet foreslår at saken ikke tas opp til ny behandling på bakgrunn av § 38 siste ledd. I enkelte tilfeller er det likevel blitt flertall for å sende et slikt forslag til ny komitebehandling.1 Stortinget står etter Grunnloven ikke fritt til å omgjøre sine beslutninger dersom beslutningen har medført at det er stiftet rettigheter mot staten som ville bli krenket ved en omgjøring av Stortingets beslutning. For eksempel gir Grunnloven § 97 et forbud mot at nye lover gis tilbakevirkende kraft. Derimot er det fra Grunnlovens side ikke noe til hinder for at Stortinget omgjør en beslutning som ikke har hatt andre rettsvirkninger enn slike som Stortinget selv har det fulle herredømme over.2 § 39 Behandlingen av proposisjoner og forslag Presidentskapet foreslår behandlingsmåten for de kongelige proposisjo- ner og meldinger samt representantforslag og søknader når de er kommet inn til Stortinget. Når nye saker, herunder forslag, henstillinger og søknader, er referert, avgjør Stortinget om saken skal a. sendes til regjeringen uten realitetsvotering, b. sendes til en komité, c. legges ut til gjennomsyn for representantene i minst én dag og deret - ter føres opp på dagsordenen til behandling, d. tas opp til avgjørelse straks hvis ikke presidenten eller en femtedel av de representantene som er til stede, motsetter seg dette, e. avvises eller ikke tas under behandling. Finner presidenten at bestemte saker som skal refereres egner seg for avgjørelse i samme møte, bør presidenten føre dem opp særskilt på dagsorde - nen, med opplysning om at de vil bli foreslått behandlet straks."""

print("Testing the sub-item extraction:")
keywords = []

# Extract main section references
section_refs = re.findall(r'§\s*(\d+)', test_text)
keywords.extend([f"paragraf_{ref}" for ref in section_refs])
print(f"Main sections found: {section_refs}")

# Extract sub-section references
for section_match in re.finditer(r'§\s*(\d+)', test_text):
    section_num = section_match.group(1)
    # Look for lettered items after this section
    section_start = section_match.end()
    # Find next section or end of text
    next_section = re.search(r'§\s*\d+', test_text[section_start:])
    if next_section:
        section_text = test_text[section_start:section_start + next_section.start()]
    else:
        section_text = test_text[section_start:]
    
    print(f"\nSection {section_num}:")
    print(f"Text after section: {section_text[:200]}...")
    
    # Find lettered sub-items within this section text
    sub_items = re.findall(r'(?:^|\n)([a-e])\.\s', section_text)
    print(f"Sub-items found with original pattern: {sub_items}")
    
    # Try different patterns
    sub_items2 = re.findall(r'([a-e])\.\s', section_text)
    print(f"Sub-items found with simple pattern: {sub_items2}")
    
    for letter in sub_items2:
        keywords.append(f"paragraf_{section_num}{letter}")

print(f"\nAll keywords: {keywords}")