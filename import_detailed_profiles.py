#!/usr/bin/env python3
"""
Import Detailed Advisor Profiles
Consolidates all advisor context from Advisor_Profiles directory
"""

import os
import json
from pathlib import Path

def load_advisor_profiles():
    """Load comprehensive advisor profiles from all available sources"""

    advisor_profiles_dir = Path("/Volumes/Working_6/Virtiual_Advisory_Board/Advisor_Profiles")
    advisors_dir = Path("/Volumes/Working_6/Virtiual_Advisory_Board/Advisors")

    profiles = {}

    # Advisor ID mappings
    advisor_mappings = {
        "alex_hormozi": "alex",
        "tony_robbins": "tony",
        "mark_cuban": "mark",
        "sara_blakely": "sara",
        "seth_godin": "seth",
        "robert_kiyosaki": "robert"
    }

    for full_name, short_id in advisor_mappings.items():
        profile_data = {
            "name": "",
            "description": "",
            "personality": ""
        }

        # Load main profile text file
        profile_file = advisor_profiles_dir / f"{full_name.replace('_', '_').title().replace('_', '_')}_Profile.txt"
        alt_profile_file = advisor_profiles_dir / f"{full_name.title().replace('_', ' ')}_Profile.txt"

        profile_text = ""

        # Try different naming patterns
        for pf in [profile_file, alt_profile_file]:
            if pf.exists():
                try:
                    with open(pf, 'r', encoding='utf-8') as f:
                        profile_text = f.read().strip()
                        break
                except Exception as e:
                    print(f"Error reading {pf}: {e}")

        # Load structured data from directory
        advisor_dir = advisor_profiles_dir / full_name
        if advisor_dir.exists():
            print(f"Loading structured data for {full_name}")

            # Load core profile
            core_file = advisor_dir / "core_profile.json"
            if core_file.exists():
                try:
                    with open(core_file, 'r') as f:
                        core_data = json.load(f)
                        if 'name' in core_data:
                            profile_data['name'] = core_data['name']
                        if 'description' in core_data:
                            profile_data['description'] = core_data['description']
                except Exception as e:
                    print(f"Error loading core profile for {full_name}: {e}")

            # Load frameworks
            frameworks_file = advisor_dir / "frameworks.json"
            frameworks_text = ""
            if frameworks_file.exists():
                try:
                    with open(frameworks_file, 'r') as f:
                        frameworks_data = json.load(f)
                        frameworks_text = "\n\n=== KEY FRAMEWORKS ===\n"
                        if isinstance(frameworks_data, dict):
                            for key, value in frameworks_data.items():
                                frameworks_text += f"\n{key.upper()}:\n"
                                if isinstance(value, list):
                                    for item in value:
                                        frameworks_text += f"- {item}\n"
                                else:
                                    frameworks_text += f"{value}\n"
                        elif isinstance(frameworks_data, list):
                            for framework in frameworks_data:
                                if isinstance(framework, dict):
                                    frameworks_text += f"\n{framework.get('name', 'Framework')}:\n{framework.get('description', '')}\n"
                                else:
                                    frameworks_text += f"- {framework}\n"
                except Exception as e:
                    print(f"Error loading frameworks for {full_name}: {e}")

            # Load speech patterns
            speech_file = advisor_dir / "speech_patterns.json"
            speech_text = ""
            if speech_file.exists():
                try:
                    with open(speech_file, 'r') as f:
                        speech_data = json.load(f)
                        speech_text = "\n\n=== COMMUNICATION STYLE ===\n"
                        if isinstance(speech_data, dict):
                            for key, value in speech_data.items():
                                speech_text += f"\n{key.replace('_', ' ').title()}:\n"
                                if isinstance(value, list):
                                    for item in value:
                                        speech_text += f"- {item}\n"
                                else:
                                    speech_text += f"{value}\n"
                except Exception as e:
                    print(f"Error loading speech patterns for {full_name}: {e}")

            # Load conversation starters
            conversation_file = advisor_dir / "conversation_starters.json"
            conversation_text = ""
            if conversation_file.exists():
                try:
                    with open(conversation_file, 'r') as f:
                        conversation_data = json.load(f)
                        conversation_text = "\n\n=== CONVERSATION APPROACH ===\n"
                        if isinstance(conversation_data, dict):
                            for key, value in conversation_data.items():
                                conversation_text += f"\n{key.replace('_', ' ').title()}:\n"
                                if isinstance(value, list):
                                    for item in value:
                                        conversation_text += f"- {item}\n"
                                else:
                                    conversation_text += f"{value}\n"
                        elif isinstance(conversation_data, list):
                            for starter in conversation_data:
                                conversation_text += f"- {starter}\n"
                except Exception as e:
                    print(f"Error loading conversation starters for {full_name}: {e}")

            # Combine all text
            combined_text = profile_text + frameworks_text + speech_text + conversation_text

        else:
            # Fallback to just profile text
            combined_text = profile_text

        if not profile_data['name']:
            # Extract name from text or use default
            name_map = {
                'alex': 'Alex Hormozi',
                'tony': 'Tony Robbins',
                'mark': 'Mark Cuban',
                'sara': 'Sara Blakely',
                'seth': 'Seth Godin',
                'robert': 'Robert Kiyosaki'
            }
            profile_data['name'] = name_map.get(short_id, short_id.title())

        if not profile_data['description']:
            # Extract description from text or use default
            desc_map = {
                'alex': 'Business scaling expert focused on offers and growth',
                'tony': 'Peak performance coach and strategic advisor',
                'mark': 'Entrepreneur, investor, and business strategist',
                'sara': 'Entrepreneur and founder of Spanx',
                'seth': 'Marketing expert and author',
                'robert': 'Real estate investor and financial educator'
            }
            profile_data['description'] = desc_map.get(short_id, 'Business advisor')

        # Set the comprehensive personality
        if combined_text.strip():
            profile_data['personality'] = f"""You are {profile_data['name']}.

{combined_text.strip()}

CRITICAL INSTRUCTIONS:
- Stay completely in character as {profile_data['name']}
- Use their authentic voice, language patterns, and communication style
- Apply their specific frameworks, methodologies, and decision-making processes
- Reference their actual experiences, stories, and knowledge base
- Be conversational and engaging, not generic
- Provide specific, actionable insights based on their expertise
- Ask follow-up questions in their style
- Challenge assumptions as they would
- Share relevant personal anecdotes and examples from their background"""
        else:
            print(f"WARNING: No detailed content found for {full_name}")
            profile_data['personality'] = f"You are {profile_data['name']}, a business advisor."

        profiles[short_id] = profile_data
        print(f"✅ Loaded comprehensive profile for {profile_data['name']} ({len(profile_data['personality'])} characters)")

    return profiles

if __name__ == "__main__":
    print("Loading detailed advisor profiles...")
    profiles = load_advisor_profiles()

    print(f"\nLoaded {len(profiles)} comprehensive advisor profiles:")
    for advisor_id, profile in profiles.items():
        print(f"  {advisor_id}: {profile['name']} - {len(profile['personality'])} characters of context")

    # Save to JSON for inspection
    with open("detailed_profiles.json", "w") as f:
        json.dump(profiles, f, indent=2)

    print("\nDetailed profiles saved to detailed_profiles.json")