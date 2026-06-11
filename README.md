# die-die

A DnD die roller written in Python.

## Features

- Roll any standard DnD die: **d4, d6, d8, d10, d12, d20, d100**
- Roll **multiple dice** of the same type at once (e.g. `3d6`)
- Roll **mixed sets** of different dice in one command (e.g. `1d20 2d4`)
- **Save presets** — store named sets of dice for common rolls (e.g. a fireball or an attack roll)

## Requirements

- Python 3.9+

## Usage

```
python main.py <command> [options]
```

### Roll dice

```
python main.py roll <NdS> [<NdS> ...]
```

| Example | Description |
|---|---|
| `python main.py roll 1d20` | Roll one d20 |
| `python main.py roll 3d6` | Roll three d6 dice |
| `python main.py roll 1d20 2d6` | Roll 1d20 and 2d6 in one shot |

### Manage presets

Save a named preset of one or more dice groups:

```
python main.py preset save <name> <NdS> [<NdS> ...]
```

```
python main.py preset save fireball 8d6
python main.py preset save attack 1d20 2d6
python main.py preset save stats 4d6
```

List all saved presets:

```
python main.py preset list
```

Roll a saved preset:

```
python main.py preset roll fireball
```

Delete a preset:

```
python main.py preset delete fireball
```

## Example session

```
$ python main.py roll 3d6
       3d6  →  [4, 2, 6]  subtotal: 12
     TOTAL  =  12

$ python main.py roll 1d20 2d4
      1d20  →  [17]  subtotal: 17
       2d4  →  [3, 1]  subtotal: 4
     TOTAL  =  21

$ python main.py preset save fireball 8d6
Preset 'fireball' saved: 8d6

$ python main.py preset roll fireball
Rolling preset 'fireball' (8d6):
       8d6  →  [5, 3, 6, 2, 4, 1, 6, 4]  subtotal: 31
     TOTAL  =  31

$ python main.py preset list
  fireball  8d6
```

## Running tests

```
python -m pytest tests/ -v
```

## Project structure

```
die_roller/
  __init__.py    – package exports
  dice.py        – Die, DiceSet and roll_notation() logic
  presets.py     – PresetManager (save / load / delete named dice sets)
tests/
  test_dice.py
  test_presets.py
  test_cli.py
main.py          – CLI entry point
```
