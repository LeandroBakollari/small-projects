# Reflex Circles

Reflex Circles is a small reaction game built with HTML, CSS, and JavaScript.

The goal is to hit each circle before it disappears. Every circle shows a letter, so you can either click the circle with the mouse or press the matching key on the keyboard. The available keys are `q`, `w`, `e`, `a`, `s`, `d`, `z`, `x`, and `c`.

Each successful hit adds points and increases your combo. Higher combos give a small score bonus, and every 10 hits restores a little health. If a circle expires or you press a valid key that does not match any active circle, you lose health and your combo resets.

The game gets faster over time because circles spawn more often and stay on screen for less time. The round ends when your health reaches zero, then the game shows your final score and best combo.
