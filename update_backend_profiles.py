#!/usr/bin/env python3
"""
Update Backend with Comprehensive Advisor Profiles
Replaces basic profiles in app.py with detailed, rich profiles
"""

import json
from pathlib import Path

def update_backend_profiles():
    """Update the backend app.py with comprehensive advisor profiles"""

    # Load the detailed profiles
    with open("detailed_profiles.json", "r") as f:
        detailed_profiles = json.load(f)

    # Read the current app.py
    app_path = Path("backend/app.py")
    with open(app_path, "r") as f:
        app_content = f.read()

    # Find the ADVISOR_PROFILES section
    start_marker = "ADVISOR_PROFILES = {"
    end_marker = "}"

    start_idx = app_content.find(start_marker)
    if start_idx == -1:
        print("Could not find ADVISOR_PROFILES in app.py")
        return False

    # Find the end of the ADVISOR_PROFILES dict by counting braces
    brace_count = 0
    current_idx = start_idx + len(start_marker) - 1  # Start at the opening brace
    end_idx = current_idx

    for i, char in enumerate(app_content[current_idx:], current_idx):
        if char == '{':
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0:
                end_idx = i + 1
                break

    # Build the new ADVISOR_PROFILES section
    new_profiles_section = "ADVISOR_PROFILES = {\n"

    for advisor_id, profile in detailed_profiles.items():
        # Properly escape the personality string for Python
        personality_escaped = repr(profile["personality"])

        new_profiles_section += f'''    "{advisor_id}": {{
        "name": "{profile["name"]}",
        "description": "{profile["description"]}",
        "personality": {personality_escaped}
    }},

'''

    new_profiles_section = new_profiles_section.rstrip(",\n") + "\n}"

    # Replace the old section with the new one
    new_app_content = app_content[:start_idx] + new_profiles_section + app_content[end_idx:]

    # Write back to app.py
    with open(app_path, "w") as f:
        f.write(new_app_content)

    print("✅ Successfully updated backend/app.py with comprehensive advisor profiles")
    print(f"   - {len(detailed_profiles)} advisors updated")

    for advisor_id, profile in detailed_profiles.items():
        print(f"   - {advisor_id}: {profile['name']} ({len(profile['personality'])} characters)")

    return True

if __name__ == "__main__":
    print("Updating backend with comprehensive advisor profiles...")

    if update_backend_profiles():
        print("\n🎉 Backend successfully updated with your detailed advisor context!")
        print("The advisors now have their full personalities, frameworks, and knowledge.")
    else:
        print("\n❌ Failed to update backend")