"""Tests for die_roller.dice module."""

import pytest

from die_roller.dice import Die, DiceSet, VALID_SIDES, roll_notation


class TestDie:
    def test_valid_sides(self):
        for sides in VALID_SIDES:
            die = Die(sides)
            assert die.sides == sides

    def test_invalid_sides_raises(self):
        for bad in [0, 1, 2, 3, 5, 7, 9, 11, 13, 15, 99]:
            with pytest.raises(ValueError, match="Invalid die"):
                Die(bad)

    def test_roll_in_range(self):
        die = Die(6)
        for _ in range(200):
            result = die.roll()
            assert 1 <= result <= 6

    def test_str(self):
        assert str(Die(20)) == "d20"
        assert str(Die(4)) == "d4"

    def test_d100_roll_in_range(self):
        die = Die(100)
        for _ in range(200):
            assert 1 <= die.roll() <= 100


class TestDiceSet:
    def test_single_entry_roll(self):
        ds = DiceSet()
        ds.add(3, 6)
        result = ds.roll()
        assert len(result["rolls"]) == 1
        assert result["rolls"][0]["notation"] == "3d6"
        assert len(result["rolls"][0]["results"]) == 3
        for r in result["rolls"][0]["results"]:
            assert 1 <= r <= 6
        assert result["total"] == result["rolls"][0]["subtotal"]

    def test_multiple_entries_roll(self):
        ds = DiceSet()
        ds.add(1, 20)
        ds.add(2, 6)
        result = ds.roll()
        assert len(result["rolls"]) == 2
        assert result["total"] == sum(e["subtotal"] for e in result["rolls"])

    def test_add_invalid_count_raises(self):
        ds = DiceSet()
        with pytest.raises(ValueError):
            ds.add(0, 6)

    def test_add_invalid_sides_raises(self):
        ds = DiceSet()
        with pytest.raises(ValueError):
            ds.add(1, 7)

    def test_serialisation_roundtrip(self):
        ds = DiceSet()
        ds.add(2, 8)
        ds.add(1, 20)
        data = ds.to_list()
        ds2 = DiceSet.from_list(data)
        assert str(ds) == str(ds2)

    def test_str_empty(self):
        assert str(DiceSet()) == "(empty)"

    def test_str_single(self):
        ds = DiceSet()
        ds.add(4, 6)
        assert str(ds) == "4d6"

    def test_str_multiple(self):
        ds = DiceSet()
        ds.add(1, 20)
        ds.add(2, 4)
        assert str(ds) == "1d20 + 2d4"


class TestRollNotation:
    def test_basic_notation(self):
        result = roll_notation("2d6")
        assert result["rolls"][0]["notation"] == "2d6"
        assert len(result["rolls"][0]["results"]) == 2

    def test_case_insensitive(self):
        result = roll_notation("1D20")
        assert result["rolls"][0]["notation"] == "1d20"

    def test_invalid_notation_raises(self):
        for bad in ["d6", "2x6", "abc", "6", ""]:
            with pytest.raises(ValueError):
                roll_notation(bad)

    def test_invalid_sides_raises(self):
        with pytest.raises(ValueError):
            roll_notation("2d7")

    def test_total_equals_sum_of_results(self):
        result = roll_notation("5d6")
        assert result["total"] == sum(result["rolls"][0]["results"])
