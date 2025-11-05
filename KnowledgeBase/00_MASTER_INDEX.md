# VEIN Modding Knowledge Base - Master Index

Generated: 2025-11-04T22:35:48.064706

## Overview

This comprehensive knowledge base documents all VEIN game assets extracted from 31 pakchunks, covering both ExportedJson and OutputPaks directories.

## Statistics

- Total Files Analyzed: 28451
- ExportedJson Files: 28451
- Pakchunks Scanned: 31

## Chapter Navigation

### Core Game Systems
- [Chapter 1: Items System](#KnowledgeBase/01_Items_System.md) - All item types, categories, and properties
- [Chapter 2: Recipes and Crafting](#KnowledgeBase/02_Recipes_And_Crafting.md) - Recipe system, workbenches, requirements
- [Chapter 3: Weapons and Combat](#KnowledgeBase/03_Weapons_And_Combat.md) - Weapons, damage types, bullet types

### Survival and Character
- [Chapter 4: Medical and Survival](#KnowledgeBase/04_Medical_And_Survival.md) - Medical items, conditions, addictions, stats
- [Chapter 6: Consumables and Food](#KnowledgeBase/06_Consumables_And_Food.md) - Food, drinks, cooking, nutrition

### World Building
- [Chapter 5: Architecture and Buildings](#KnowledgeBase/05_Architecture_And_Buildings.md) - Buildings, doors, furniture
- [Chapter 7: Animals and Creatures](#KnowledgeBase/07_Animals_And_Creatures.md) - Animal types, hunting, spawning
- [Chapter 8: Vehicles and Transportation](#KnowledgeBase/08_Vehicles_And_Transportation.md) - Vehicle types, parts, fuel
- [Chapter 9: World and Environment](#KnowledgeBase/09_World_And_Environment.md) - Geography, weather, foliage

### Technical Assets
- [Chapter 10: Audio System](#KnowledgeBase/10_Audio_System.md) - Sounds, music, audio cues
- [Chapter 11: Materials and Meshes](#KnowledgeBase/11_Materials_And_Meshes.md) - Visual assets, textures
- [Chapter 12: Effects and VFX](#KnowledgeBase/12_Effects_And_VFX.md) - Visual effects, particles

### Game Infrastructure
- [Chapter 13: Game Systems](#KnowledgeBase/13_Game_Systems.md) - Electricity, elevators, minigames, etc.
- [Chapter 14: Spawning and Loot](#KnowledgeBase/14_Spawning_And_Loot.md) - Spawner system, spawnlists, loot tables

### Reference Material
- [Chapter 15: Technical Reference](#KnowledgeBase/15_Technical_Reference.md) - JSON schemas, property types, modding guidelines
- [Chapter 16: Pakchunk Structure](#KnowledgeBase/16_Pakchunk_Structure.md) - Pakchunk breakdown, file organization

## Quick Start for Modders

### Understanding VEIN Assets

VEIN uses Unreal Engine 5.1 with custom game systems. Assets are stored in pakchunks and can be exported to JSON format for modding.

### Key Asset Types

- **Items (BP_)**: Blueprint-based items (weapons, tools, consumables)
- **Recipes (CR_/RP_)**: Crafting and cooking recipes
- **Data Tables (DT_)**: Structured data for various systems
- **Item Lists (IL_)**: Collections of items for spawning

### Modding Workflow

1. Extract pakchunk files using UnrealPak
2. Export .uasset files to JSON using UAssetGUI with VEIN mappings
3. Modify JSON files as needed
4. Convert back to .uasset format
5. Repack into mod pakchunk
6. Test in game

### Essential Tools

- UAssetGUI - For exporting/importing assets
- UnrealPak - For extracting/packing pakchunks
- FModel - For browsing game assets
- UE5 Editor - For advanced modding

## Property Schema Reference

Common property types found across VEIN assets:

- **StructProperty**: Complex data structures
- **ArrayProperty**: Lists of items or values
- **ObjectProperty**: References to other assets
- **StrProperty**: Text strings
- **IntProperty**: Integer numbers
- **FloatProperty**: Decimal numbers
- **BoolProperty**: True/false values

## Asset Naming Conventions

- **BP_**: Blueprint class
- **DT_**: Data Table
- **IL_**: Item List
- **CR_**: Crafting Recipe
- **RP_**: Recipe (generic)
- **M_**: Material
- **MI_**: Material Instance
- **T_**: Texture
- **SM_**: Static Mesh
- **SK_**: Skeletal Mesh
- **SC_**: Sound Cue
- **ST_**: Stat

## Support and Resources

This knowledge base is a comprehensive reference for VEIN modding. Each chapter provides detailed information about specific game systems, including file locations, property schemas, and modding guidance.

For best results, use the chapter navigation above to explore the system you want to mod.
