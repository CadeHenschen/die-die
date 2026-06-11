"""Core dice rolling logic for a DnD die roller."""

import random
import re
from dataclasses import dataclass, field
from typing import List

VALID_SIDES = {4, 6, 8, 10, 12, 20, 100}


@dataclass
class Die:
    """Represents a single die with a given number of sides."""

    sides: int

    def __post_init__(self) -> None:
        if self.sides not in VALID_SIDES:
            raise ValueError(
                f"Invalid die: d{self.sides}. "
                f"Valid dice are: {', '.join(f'd{s}' for s in sorted(VALID_SIDES))}"
            )

    def roll(self) -> int:
        """Roll this die and return the result."""
        return random.randint(1, self.sides)

    def __str__(self) -> str:
        return f"d{self.sides}"


@dataclass
class DiceSet:
    """A set of dice to roll together, potentially of different types."""

    entries: List[dict] = field(default_factory=list)

    def add(self, count: int, sides: int) -> None:
        """Add `count` dice of `sides` sides to this set."""
        if count < 1:
            raise ValueError("Count must be at least 1.")
        die = Die(sides)
        self.entries.append({"count": count, "die": die})

    def roll(self) -> dict:
        """
        Roll all dice in this set.

        Returns a dict with:
          - 'rolls': list of individual roll details
          - 'total': sum of all rolls
        """
        rolls = []
        total = 0
        for entry in self.entries:
            count = entry["count"]
            die = entry["die"]
            results = [die.roll() for _ in range(count)]
            subtotal = sum(results)
            rolls.append(
                {
                    "notation": f"{count}{die}",
                    "results": results,
                    "subtotal": subtotal,
                }
            )
            total += subtotal
        return {"rolls": rolls, "total": total}

    def to_list(self) -> List[dict]:
        """Serialize to a list of plain dicts (for preset storage)."""
        return [
            {"count": e["count"], "sides": e["die"].sides} for e in self.entries
        ]

    @classmethod
    def from_list(cls, data: List[dict]) -> "DiceSet":
        """Deserialize from the plain-dict format produced by to_list()."""
        ds = cls()
        for entry in data:
            ds.add(entry["count"], entry["sides"])
        return ds

    def __str__(self) -> str:
        if not self.entries:
            return "(empty)"
        return " + ".join(
            f"{e['count']}{e['die']}" for e in self.entries
        )


_NOTATION_RE = re.compile(r"^(\d+)d(\d+)$", re.IGNORECASE)


def roll_notation(notation: str) -> dict:
    """
    Parse and roll a dice notation string such as '2d6' or '1d20'.

    Returns the same dict shape as DiceSet.roll().
    Raises ValueError for unrecognised notation.
    """
    match = _NOTATION_RE.match(notation.strip())
    if not match:
        raise ValueError(
            f"Invalid notation '{notation}'. Expected format: <count>d<sides> (e.g. 2d6)."
        )
    count = int(match.group(1))
    sides = int(match.group(2))
    ds = DiceSet()
    ds.add(count, sides)
    return ds.roll()
