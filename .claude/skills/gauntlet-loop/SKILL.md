---
name: gauntlet-loop
description: Turn a goal into a prompt that sets a real quality bar, runs builder/critic pairs, compares blind against a named reference, and loops until the work wins. Use when output needs to be genuinely good, not "good enough".
---

# Gauntlet Loop

Agents stop at "good enough" because nothing forces them past it. A rubric doesn't
help — it asks the agent to grade itself against words it wrote. A **bar** works,
because it makes the agent compare against something that already exists and is
undeniably good.

Technique originally from Matt Shumer's *Claude of Duty*; packaged as a skill by
robonuggets (CC BY 4.0). This copy is adapted for this repository.

## The bar is the whole trick

A bar must be three things. If it fails any one of them, stop and fix the bar
before writing a line of code:

- **Named** — a specific thing, not a category. `eladiodieste.com`, not
  "good architecture sites".
- **Fetchable** — you can actually get at it. Screenshot it, read it, run it.
  If the critic cannot open it, it cannot compare against it.
- **Comparable** — it can sit side by side with your work at the same viewport,
  the same length, the same format.

Reference types by domain:

| Domain | Bar |
|---|---|
| UI / UX | Live site, screenshotted at matching viewport |
| Writing | Published piece by a named author, matching length |
| Code | A named repository, plus a benchmark suite |
| Research | A real analyst report or methods section |
| Documents | A real artifact from a reputable firm |

## Flow

1. **Restate the goal** to yourself. Do not show this.
2. **Propose 2–3 candidate bars** if the user gave none. Wait for a choice.
   The bar determines everything downstream — it is the user's call, not yours.
3. **Extract the bar's actual numbers.** Do not describe it in adjectives.
   Open it and measure: type scale, weights, tracking, leading, ground colour,
   palette size, grid, scroll length. Adjectives are unfalsifiable; numbers are
   not. This is the step most people skip and it is why their loops fail.
4. **Split the work into the smallest judgeable pieces.** A piece is judgeable
   if a stranger can look at yours and the bar's and say which is better without
   reading either. "The hero" is judgeable. "The site" is not.
5. **For each piece: builder, then a separate critic.**
6. **Loop until the critic picks your work blind.** Not until round N.

## The critic

The critic is the entire mechanism. Get it wrong and this is just a slow way to
write the same code.

- **Fresh context.** A critic that watched you build it is not blind. Spawn it
  new, every round.
- **Blind.** Strip the labels. Present the two as A and B, in random order, and
  ask which is better and why. Never "is my work good?"
- **Harsh by construction.** Ask it to name **the single largest gap**, not a
  list. A list gets you five shallow fixes; one gap gets you the real one.
- **It must fetch the bar itself.** A critic reasoning from your summary of the
  reference is grading your summary.

Hand the critic's single gap back to the builder. Repeat.

## Failure modes

| Failure | What it looks like |
|---|---|
| Vague bar | "make it look like a premium agency site" |
| Builder self-judging | the same context writes and grades |
| Soft critic | "this is quite strong overall, though you might consider…" |
| Round-count exit | "after 3 rounds, done" |
| Over-specification | the prompt dictates the answer, so the loop finds nothing |
| Adjective bar | you never opened the reference and measured it |

## Blind comparison harness

The critic must not be able to tell which is which. Two rules:

1. Randomise order per round, and record which was which **outside** the
   critic's context.
2. Strip every identifying cue — filenames, URLs, brand names, watermarks.
   For a site, screenshot both at the same viewport and pass them as `A.png` and
   `B.png`.

If the critic can guess which is yours, the round is void.

## Stopping

Exit on **winning, or the user calling it.** Nothing else.

When the critic picks your work blind, record what the final gap was and stop —
further rounds past a win tend to sand off the thing that won.
