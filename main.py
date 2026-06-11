"""CLI entry point for the DnD die roller."""

import argparse
import sys
from typing import List

from die_roller.dice import DiceSet
from die_roller.presets import PresetManager


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="die-die",
        description="DnD die roller — roll dice and manage presets.",
    )
    sub = parser.add_subparsers(dest="command", metavar="<command>")

    # ── roll ──────────────────────────────────────────────────────────
    roll_parser = sub.add_parser(
        "roll",
        help="Roll one or more dice (e.g. 2d6, 1d20 2d4).",
    )
    roll_parser.add_argument(
        "notations",
        nargs="+",
        metavar="NdS",
        help="Dice notation(s), e.g. 2d6 or 1d20 2d4.",
    )

    # ── preset ────────────────────────────────────────────────────────
    preset_parser = sub.add_parser("preset", help="Manage and roll presets.")
    preset_sub = preset_parser.add_subparsers(
        dest="preset_command", metavar="<action>"
    )

    # preset save
    save_p = preset_sub.add_parser(
        "save", help="Save a named preset (e.g. preset save fireball 8d6)."
    )
    save_p.add_argument("name", help="Name for the preset.")
    save_p.add_argument(
        "notations",
        nargs="+",
        metavar="NdS",
        help="Dice notation(s) to include in the preset.",
    )

    # preset list
    preset_sub.add_parser("list", help="List all saved presets.")

    # preset roll
    roll_p = preset_sub.add_parser("roll", help="Roll a saved preset.")
    roll_p.add_argument("name", help="Name of the preset to roll.")

    # preset delete
    del_p = preset_sub.add_parser("delete", help="Delete a saved preset.")
    del_p.add_argument("name", help="Name of the preset to delete.")

    return parser


def _parse_dice_set(notations: List[str]) -> DiceSet:
    """Parse a list of notation strings into a DiceSet."""
    from die_roller.dice import _NOTATION_RE

    ds = DiceSet()
    for notation in notations:
        match = _NOTATION_RE.match(notation.strip())
        if not match:
            raise ValueError(
                f"Invalid notation '{notation}'. Expected format: <count>d<sides> (e.g. 2d6)."
            )
        ds.add(int(match.group(1)), int(match.group(2)))
    return ds


def _print_roll_result(result: dict) -> None:
    for entry in result["rolls"]:
        per_die = ", ".join(str(r) for r in entry["results"])
        print(f"  {entry['notation']:>8}  →  [{per_die}]  subtotal: {entry['subtotal']}")
    print(f"  {'TOTAL':>8}  =  {result['total']}")


def cmd_roll(args: argparse.Namespace, _manager: PresetManager) -> int:
    try:
        ds = _parse_dice_set(args.notations)
    except ValueError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    result = ds.roll()
    _print_roll_result(result)
    return 0


def cmd_preset_save(args: argparse.Namespace, manager: PresetManager) -> int:
    try:
        ds = _parse_dice_set(args.notations)
    except ValueError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    manager.save(args.name, ds)
    print(f"Preset '{args.name}' saved: {ds}")
    return 0


def cmd_preset_list(_args: argparse.Namespace, manager: PresetManager) -> int:
    presets = manager.list_presets()
    if not presets:
        print("No presets saved yet.")
        return 0
    width = max(len(n) for n in presets)
    for name, notation in sorted(presets.items()):
        print(f"  {name:<{width}}  {notation}")
    return 0


def cmd_preset_roll(args: argparse.Namespace, manager: PresetManager) -> int:
    try:
        ds = manager.load(args.name)
    except KeyError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    print(f"Rolling preset '{args.name}' ({ds}):")
    result = ds.roll()
    _print_roll_result(result)
    return 0


def cmd_preset_delete(args: argparse.Namespace, manager: PresetManager) -> int:
    try:
        manager.delete(args.name)
    except KeyError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    print(f"Preset '{args.name}' deleted.")
    return 0


def main(argv: List[str] = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)
    manager = PresetManager()

    if args.command == "roll":
        return cmd_roll(args, manager)

    if args.command == "preset":
        dispatch = {
            "save": cmd_preset_save,
            "list": cmd_preset_list,
            "roll": cmd_preset_roll,
            "delete": cmd_preset_delete,
        }
        if args.preset_command not in dispatch:
            parser.parse_args(["preset", "--help"])
            return 1
        return dispatch[args.preset_command](args, manager)

    parser.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
