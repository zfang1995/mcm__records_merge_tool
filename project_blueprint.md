
我想要一个脚本，用于合并特定目录中的所有JSON文件。
这些文件都是由“skyrim MCM Recorder”生成的，用于记录MCM settings，我喜欢将它们称为"MCM_Records"。
所有 MCM_record 文件的filename都遵循相同的命名规则：
```javascript
filename = 4DigitOrderedNumber + '_'  + modName
```
所有 MCM_record 文件的内容结构都遵循相同的JSON schema：
```javascript
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "MCM_Record",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "Mod": {
        "type": "string",
        "description": "The name of the mod."
      },
      "page": {
        "type": "string",
        "description": "The page within the mod's MCM menu."
      },
      "click": {
        "type": "string",
        "description": "activing state of some function of the mod, if applicable."
      },
      "option": {
        "type": "string",
        "description": "The option within the mod."
      },
      "toggle": {
        "type": "string",
        "enum": ["On", "off"],
        "description": "The toggle state for the option, if applicable."
      },
      "slider": {
        "type": "number",
        "description": "The slider value for the option, if applicable."
      }
    },
    "required": ["Mod", "page"],
    "additionalProperties": true
  }
}
```

合并规则：
1. 你需要把所有modname相同的文件合并为一个文件，新文件的filename依旧遵循上述命名规则且4DigitOrderedNumber取最大值。
2. 每个MCM_record文件内可以存在多个 record_item.mod与record_item.page 的值都相同的 record_item。
3. 其余的record_item的property的值都应该是唯一且独特的，如果存在冲突，就选用最新的那个值。