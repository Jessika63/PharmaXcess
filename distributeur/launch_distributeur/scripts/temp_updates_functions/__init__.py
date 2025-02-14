
import os
import importlib

# List all Python files in the current directory
module_files = [
    f for f in os.listdir(os.path.dirname(__file__))  # Iterate through files in the current directory
    if f.endswith(".py") and f != "__init__.py"  # Filter out non-Python files and __init__.py
]

# Dynamically import all modules and add their functions to the namespace
for module_file in module_files:
    module_name = module_file[:-3]  # Remove the ".py" suffix to get the module name
    module = importlib.import_module(f".{module_name}", package=__name__)  # Import the module dynamically
    globals().update({name: obj for name, obj in vars(module).items() if callable(obj)})  # Add callable functions to global namespace
