# Chapter 15: Technical Reference

## Overview

Technical reference for VEIN modding, including JSON schemas, property types, and guidelines.

## UAsset JSON Structure

VEIN assets exported to JSON follow UAssetAPI format:

```json
{
  "$type": "UAssetAPI.UAsset, UAssetAPI",
  "Info": "Serialized with UAssetAPI",
  "NameMap": [],
  "Imports": [],
  "Exports": []
}
```

## Common Property Types

### Basic Types
- **BoolProperty**: true/false values
- **IntProperty**: Integer numbers
- **FloatProperty**: Decimal numbers
- **StrProperty**: Text strings
- **NameProperty**: Asset names

### Complex Types
- **StructProperty**: Nested data structures
- **ArrayProperty**: Lists of values
- **ObjectProperty**: References to other assets
- **SoftObjectProperty**: Lazy-loaded asset references

## Asset References

Assets can reference each other via:
- **NameMap**: String table with asset paths
- **Imports**: External asset dependencies
- **ObjectProperty**: Direct references

## Modding Tools

### Essential Tools
1. **UAssetGUI** - JSON export/import
2. **UnrealPak** - Pak file management
3. **FModel** - Asset browsing
4. **UE5 Editor** - Advanced editing

### Tool Usage

#### UAssetGUI
```
UAssetGUI.exe tojson input.uasset output.json VER_UE5_1 Vein
UAssetGUI.exe fromjson input.json output.uasset VER_UE5_1 Vein
```

#### UnrealPak
```
UnrealPak.exe -Extract pakfile.pak outputdir
UnrealPak.exe newpak.pak -Create=filelist.txt
```

## Asset Naming Conventions

Follow VEIN naming conventions:
- BP_ItemName for blueprints
- DT_TableName for data tables
- IL_ListName for item lists
- CR_RecipeName for recipes
- M_MaterialName for materials
- T_TextureName for textures

## Best Practices

### Modding Guidelines
1. Always backup original files
2. Test changes incrementally
3. Use existing assets as templates
4. Maintain naming conventions
5. Document your changes
6. Test with clean game install

### Performance Considerations
- Optimize textures and meshes
- Limit particle effects
- Use LODs for complex models
- Minimize blueprint complexity
- Test on target hardware

### Compatibility
- Use same UE5 version as game
- Match property structures
- Preserve required properties
- Test with other mods
- Document dependencies

## Troubleshooting

### Common Issues
- **Asset not appearing**: Check spawn conditions and references
- **Crash on load**: Verify all asset references exist
- **Properties not applying**: Ensure correct property types
- **Visual issues**: Check material and texture references

### Debugging Tips
1. Check UE5 output log
2. Verify JSON structure
3. Test without other mods
4. Use FModel to inspect vanilla assets
5. Compare with working examples
