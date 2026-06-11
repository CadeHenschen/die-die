"""Preset management: save and load named sets of dice."""

import json
from pathlib import Path
from typing import Dict, List, Optional

from .dice import DiceSet

DEFAULT_PRESETS_FILE = Path.home() / ".die_die_presets.json"


class PresetManager:
    """Load, save, list, and delete named DiceSet presets."""

    def __init__(self, path: Optional[Path] = None) -> None:
        self._path = Path(path) if path else DEFAULT_PRESETS_FILE
        self._presets: Dict[str, List[dict]] = {}
        self._load()

    # ------------------------------------------------------------------
    # Persistence helpers
    # ------------------------------------------------------------------

    def _load(self) -> None:
        if self._path.exists():
            try:
                with self._path.open("r", encoding="utf-8") as fh:
                    data = json.load(fh)
                if isinstance(data, dict):
                    self._presets = data
            except (json.JSONDecodeError, OSError):
                self._presets = {}

    def _save(self) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        with self._path.open("w", encoding="utf-8") as fh:
            json.dump(self._presets, fh, indent=2)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def save(self, name: str, dice_set: DiceSet) -> None:
        """Save (or overwrite) a named preset."""
        if not name.strip():
            raise ValueError("Preset name must not be empty.")
        self._presets[name] = dice_set.to_list()
        self._save()

    def load(self, name: str) -> DiceSet:
        """Load a named preset and return a DiceSet ready to roll."""
        if name not in self._presets:
            raise KeyError(f"No preset named '{name}'.")
        return DiceSet.from_list(self._presets[name])

    def delete(self, name: str) -> None:
        """Delete a named preset."""
        if name not in self._presets:
            raise KeyError(f"No preset named '{name}'.")
        del self._presets[name]
        self._save()

    def list_presets(self) -> Dict[str, str]:
        """Return a dict of {name: notation_string} for all saved presets."""
        return {
            name: str(DiceSet.from_list(entries))
            for name, entries in self._presets.items()
        }

    def __contains__(self, name: str) -> bool:
        return name in self._presets
