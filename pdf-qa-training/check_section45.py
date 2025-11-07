import json

with open('improved_chunks.json', 'r', encoding='utf-8') as f:
    chunks = json.load(f)

print('Looking for actual § 45 heading:')
for i, chunk in enumerate(chunks):
    text = chunk['text']
    if '§ 45' in text and ('Muntlig redegjørelse' in text or 'redegjørelse' in text.lower()):
        print(f'Chunk {i} (Page {chunk.get("page", "?")}):\n')
        print(f'Text: {text[:1000]}')
        print('\nKeywords:', chunk.get('keywords', []))
        print('=' * 80)

print('\nAlso checking for chunks with "redegjørelse" (which might be § 45 content):')
for i, chunk in enumerate(chunks):
    if 'redegjørelse' in chunk['text'].lower() and len(chunk['text']) > 500:
        print(f'Chunk {i} (Page {chunk.get("page", "?")}) - has "redegjørelse"')
        if 'a.' in chunk['text'] and 'b.' in chunk['text']:
            print(f'  -> Also has a. and b. patterns')
            print(f'  Text sample: {chunk["text"][:300]}...')
            print()