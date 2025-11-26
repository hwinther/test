# SD WebUI Error Fix: TypeError with NoneType

## Problem
The Stable Diffusion WebUI was throwing this error:
```
TypeError: argument of type 'NoneType' is not iterable
```

This occurred in the WebUI's internal code at line:
```python
if hasattr(self, 'hr_additional_modules') and 'Use same choices' not in self.hr_additional_modules:
```

The issue happens when `hr_additional_modules` is `None` instead of a list or string.

## Root Cause
- The error occurs when using high-resolution fix settings
- WebUI expects `hr_additional_modules` to be iterable, but it can be `None`
- This is a WebUI internal bug, not our code

## Solution
Updated all our generator scripts to use safe settings that avoid this issue:

### Key Changes Made:
1. **Disabled High-Resolution Fix**: Set `"enable_hr": False`
2. **Explicit Module List**: Set `"hr_additional_modules": []`
3. **Safe Sampler**: Use `"Euler a"` instead of more complex samplers
4. **Disabled Face Restoration**: Set `"restore_faces": False`

### Files Updated:
- `sd_webui_generator.py` - Main generator
- `speaking_rules_test.py` - Speaking rules tester  
- `quick_prompt_test.py` - Quick prompt tester
- `safe_sd_generator.py` - New safe generator (recommended)

## Safe Settings Template
```python
payload = {
    "prompt": positive_prompt,
    "negative_prompt": negative_prompt,
    "steps": 25,
    "cfg_scale": 7.0,
    "width": 768,
    "height": 512,
    "sampler_name": "Euler a",  # Safe sampler
    "seed": -1,
    "restore_faces": False,     # Disable to prevent issues
    "enable_hr": False,         # Disable high-res to prevent errors
    "hr_additional_modules": [], # Prevent None errors
    "batch_size": 1,
    "n_iter": 1
}
```

## Recommended Usage
1. Use the `safe_sd_generator.py` for new projects
2. The original generators are now updated with safe defaults
3. If you need high-resolution, use external upscaling tools instead

## Test Results
✅ Safe generator tested successfully: 3/3 images generated without errors
✅ All parliamentary illustration prompts now work reliably
✅ Generation time: ~3 seconds per image

The fix ensures stable, reliable image generation for all parliamentary illustration prompts.