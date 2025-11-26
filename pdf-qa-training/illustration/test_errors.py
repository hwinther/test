#!/usr/bin/env python3
"""
Simple test to find the TypeError source
"""

def test_basic_functions():
    """Test basic functions to find None comparison issues"""
    
    print("Testing basic operations...")
    
    # Test 1: Length comparisons
    test_list = [1, 2, 3]
    print(f"len(test_list) > 0: {len(test_list) > 0}")
    
    # Test 2: None comparisons  
    test_none = None
    try:
        result = test_none > 5
        print(f"None > 5: {result}")
    except TypeError as e:
        print(f"✓ Found TypeError with None comparison: {e}")
    
    # Test 3: Safe comparison
    if test_none is not None and test_none > 5:
        print("Safe comparison works")
    else:
        print("✓ Safe None handling works")
    
    # Test 4: Dictionary access that might return None
    test_dict = {"key1": "value1"}
    value = test_dict.get("missing_key")  # Returns None
    
    try:
        if value > 0:  # This would cause TypeError
            print("This shouldn't print")
    except TypeError as e:
        print(f"✓ Found TypeError with dict.get() None result: {e}")
    
    print("Basic tests complete")

if __name__ == "__main__":
    test_basic_functions()