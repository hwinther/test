import re

# The actual § 45 text you provided
test_text = """§ 45 Muntlig redegjørelse for Stortinget fra et regjeringsmedlem
Med samtykke av Stortingets presidentskap kan et regjeringsmedlem gi
en muntlig redegjørelse i et stortingsmøte. Så vidt mulig skal redegjørelsen
føres opp på dagsordenen. Presidenten kan beslutte at redegjørelsen umiddelbart skal følges av en debatt. Forsamlingen kan deretter avgjøre om redegjørelsen skal
a. føres opp til behandling i et senere møte,
b. sendes til en komité, eller
c. vedlegges protokollen.
I en debatt som følger umiddelbart etter redegjørelsen, kan en representant fra hver av partigruppene – og vedkommende regjeringsmedlem – få
ordet én gang i inntil fem minutter. Under en slik debatt kan detikke fremsettes forslag. Ved avslutningen av en slik debatt avgjør forsamlingen om redegjørelsen skal vedlegges protokollen eller behandles videre etter første ledd
bokstav a eller b.
Dersom forsamlingen ikke er enig om videre behandlingsmåte etter første eller andre ledd, avgjøres videre behandlingsmåte ved avstemning."""

print("Testing § 45 sub-item detection:")

# Test the new precise pattern
precise_items = re.findall(r'(?:^|\s)([a-e])\.\s+[a-zæøåA-ZÆØÅ]', test_text, re.MULTILINE)
print(f"New precise pattern found: {precise_items}")

# Test the bokstav pattern
bokstav_items = re.findall(r'bokstav\s+([a-e])', test_text, re.IGNORECASE)
print(f"Bokstav pattern found: {bokstav_items}")

# Combine and check
all_items = precise_items + bokstav_items
unique_items = sorted(set(all_items))
print(f"Combined unique items: {unique_items}")

# Apply the logic from the code
if len(unique_items) >= 2 and 'a' in unique_items and 'b' in unique_items and len(unique_items) <= 5:
    print(f"✅ § 45 should be detected with sub-items: {unique_items}")
else:
    print("❌ § 45 would not be detected")
    print(f"   - Length: {len(unique_items)}")
    print(f"   - Has 'a': {'a' in unique_items}")
    print(f"   - Has 'b': {'b' in unique_items}")
    print(f"   - <= 5 items: {len(unique_items) <= 5}")

# For comparison, show what the old simple pattern found
simple_items = re.findall(r'([a-e])\.\s', test_text)
print(f"Old simple pattern found: {sorted(set(simple_items))} (includes false positives)")