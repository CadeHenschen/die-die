"""Tests for die_roller.presets module."""

import json
import pytest
from pathlib import Path

from die_roller.dice import DiceSet
from die_roller.presets import PresetManager


@pytest.fixture
def preset_file(tmp_path):
    return tmp_path / "test_presets.json"


@pytest.fixture
def manager(preset_file):
    return PresetManager(path=preset_file)


class TestPresetManager:
    def _make_dice_set(self, *entries):
        ds = DiceSet()
        for count, sides in entries:
            ds.add(count, sides)
        return ds

    def test_save_and_load(self, manager):
        ds = self._make_dice_set((2, 6))
        manager.save("basic", ds)
        loaded = manager.load("basic")
        assert str(loaded) == str(ds)

    def test_load_missing_raises(self, manager):
        with pytest.raises(KeyError, match="No preset"):
            manager.load("nonexistent")

    def test_delete(self, manager):
        ds = self._make_dice_set((1, 20))
        manager.save("attack", ds)
        manager.delete("attack")
        assert "attack" not in manager

    def test_delete_missing_raises(self, manager):
        with pytest.raises(KeyError):
            manager.delete("ghost")

    def test_overwrite_existing_preset(self, manager):
        ds1 = self._make_dice_set((1, 6))
        ds2 = self._make_dice_set((2, 6))
        manager.save("test", ds1)
        manager.save("test", ds2)
        loaded = manager.load("test")
        assert str(loaded) == str(ds2)

    def test_list_presets_empty(self, manager):
        assert manager.list_presets() == {}

    def test_list_presets(self, manager):
        manager.save("fireball", self._make_dice_set((8, 6)))
        manager.save("attack", self._make_dice_set((1, 20), (2, 4)))
        listing = manager.list_presets()
        assert listing["fireball"] == "8d6"
        assert listing["attack"] == "1d20 + 2d4"

    def test_persistence(self, preset_file):
        mgr1 = PresetManager(path=preset_file)
        mgr1.save("saved", self._make_dice_set((3, 8)))
        mgr2 = PresetManager(path=preset_file)
        assert "saved" in mgr2
        assert str(mgr2.load("saved")) == "3d8"

    def test_contains(self, manager):
        ds = self._make_dice_set((1, 4))
        manager.save("tiny", ds)
        assert "tiny" in manager
        assert "missing" not in manager

    def test_empty_name_raises(self, manager):
        with pytest.raises(ValueError, match="empty"):
            manager.save("", self._make_dice_set((1, 6)))

    def test_roll_loaded_preset(self, manager):
        manager.save("fireball", self._make_dice_set((8, 6)))
        ds = manager.load("fireball")
        result = ds.roll()
        assert result["total"] >= 8
        assert result["total"] <= 48

    def test_mixed_dice_preset(self, manager):
        ds = self._make_dice_set((1, 20), (2, 6), (1, 4))
        manager.save("combo", ds)
        loaded = manager.load("combo")
        result = loaded.roll()
        assert len(result["rolls"]) == 3
