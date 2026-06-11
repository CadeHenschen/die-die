"""Tests for the CLI (main.py)."""

import json
import pytest
from pathlib import Path
from unittest.mock import patch

from main import main
from die_roller.presets import PresetManager


@pytest.fixture
def preset_file(tmp_path):
    return tmp_path / "cli_presets.json"


@pytest.fixture
def manager(preset_file):
    return PresetManager(path=preset_file)


def run_main(args, preset_file=None, capsys=None):
    """Run main() with optional preset file override and return (exit_code, stdout, stderr)."""

    def make_manager():
        return PresetManager(path=preset_file)

    with patch("main.PresetManager", side_effect=make_manager if preset_file else PresetManager):
        exit_code = main(args)

    if capsys:
        captured = capsys.readouterr()
        return exit_code, captured.out, captured.err
    return exit_code, "", ""


class TestRollCommand:
    def test_roll_single_notation(self, capsys):
        code = main(["roll", "2d6"])
        captured = capsys.readouterr()
        assert code == 0
        assert "2d6" in captured.out

    def test_roll_multiple_notations(self, capsys):
        code = main(["roll", "1d20", "2d4"])
        captured = capsys.readouterr()
        assert code == 0
        assert "1d20" in captured.out
        assert "2d4" in captured.out

    def test_roll_invalid_notation(self, capsys):
        code = main(["roll", "bad"])
        captured = capsys.readouterr()
        assert code == 1
        assert "Error" in captured.err

    def test_roll_invalid_sides(self, capsys):
        code = main(["roll", "2d7"])
        captured = capsys.readouterr()
        assert code == 1
        assert "Error" in captured.err


class TestPresetCommands:
    def test_preset_save_and_list(self, capsys, preset_file):
        with patch("main.PresetManager", return_value=PresetManager(path=preset_file)):
            main(["preset", "save", "fireball", "8d6"])
            captured = capsys.readouterr()
            assert "fireball" in captured.out

        with patch("main.PresetManager", return_value=PresetManager(path=preset_file)):
            main(["preset", "list"])
            captured = capsys.readouterr()
            assert "fireball" in captured.out
            assert "8d6" in captured.out

    def test_preset_list_empty(self, capsys, preset_file):
        with patch("main.PresetManager", return_value=PresetManager(path=preset_file)):
            code = main(["preset", "list"])
            captured = capsys.readouterr()
            assert code == 0
            assert "No presets" in captured.out

    def test_preset_roll(self, capsys, preset_file):
        mgr = PresetManager(path=preset_file)
        from die_roller.dice import DiceSet
        ds = DiceSet()
        ds.add(2, 6)
        mgr.save("test", ds)

        with patch("main.PresetManager", return_value=PresetManager(path=preset_file)):
            code = main(["preset", "roll", "test"])
            captured = capsys.readouterr()
            assert code == 0
            assert "test" in captured.out

    def test_preset_roll_missing(self, capsys, preset_file):
        with patch("main.PresetManager", return_value=PresetManager(path=preset_file)):
            code = main(["preset", "roll", "ghost"])
            captured = capsys.readouterr()
            assert code == 1
            assert "Error" in captured.err

    def test_preset_delete(self, capsys, preset_file):
        mgr = PresetManager(path=preset_file)
        from die_roller.dice import DiceSet
        ds = DiceSet()
        ds.add(1, 20)
        mgr.save("attack", ds)

        with patch("main.PresetManager", return_value=PresetManager(path=preset_file)):
            code = main(["preset", "delete", "attack"])
            captured = capsys.readouterr()
            assert code == 0
            assert "attack" in captured.out

    def test_preset_delete_missing(self, capsys, preset_file):
        with patch("main.PresetManager", return_value=PresetManager(path=preset_file)):
            code = main(["preset", "delete", "nope"])
            captured = capsys.readouterr()
            assert code == 1
            assert "Error" in captured.err

    def test_no_command_returns_nonzero(self, capsys):
        code = main([])
        assert code == 1
