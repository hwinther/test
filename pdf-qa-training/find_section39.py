import json

with open('improved_chunks.json', 'r', encoding='utf-8') as f:
    chunks = json.load(f)

print("Searching for actual § 39 with sub-items:")
found = False
for i, chunk in enumerate(chunks):
    text = chunk['text'].lower()
    # Look for the specific pattern you mentioned
    if '39 behandlingen' in text or ('§ 39' in chunk['text'] and 'presidentskapet foreslår' in text):
        print(f"Chunk {i} (Page {chunk.get('page', '?')}):")
        print(f"Text: {chunk['text']}")
        print(f"Keywords: {chunk.get('keywords', [])}")
        print("=" * 80)
        found = True

if not found:
    print("Looking for chunks with 'presidentskapet foreslår behandlingsmåten':")
    for i, chunk in enumerate(chunks):
        if 'presidentskapet foreslår behandlingsmåten' in chunk['text'].lower():
            print(f"Chunk {i} (Page {chunk.get('page', '?')}):")
            print(f"Text: {chunk['text']}")
            print(f"Keywords: {chunk.get('keywords', [])}")
            print("=" * 80)
            break