
import os
import importlib

# Liste tous les fichiers Python du dossier
module_files = [
    f for f in os.listdir(os.path.dirname(__file__))
    if f.endswith(".py") and f != "__init__.py"
]

# Import dynamique de tous les modules et ajout des fonctions dans le namespace
for module_file in module_files:
    module_name = module_file[:-3]  # Retirer le ".py"
    module = importlib.import_module(f".{module_name}", package=__name__)
    globals().update({name: obj for name, obj in vars(module).items() if callable(obj)})
