# Welcome to the simulation!

[ALife simulation](https://lab.zvonimirfras.com/alife/) enables you to experiment with starting parameters of the artificial world
and see how they influence development of its inhabitants and the stability of the system.

Initial parameters for a cohort (Plants, Herbivores, or Predators) are randomized around
the values you put in the boxes. Spread depends on the mutation rate. This makes a more
natural, diverse, world to start with.

Their decision making is entirely instinctual and pre-coded. Behaviour changes with the
environment they are in and their immediate surroundings. They inherit their parents'
genetics with mutation rate dependant on the mutation rate.

## Plants

Plants provide source of energy into the world. They grow with time and increase the energy
with their size. When eaten, they decrease in size and energy transfers to the inhabitant
that ate it. They periodically try to reproduce.

## Herbivores

Herbivores consume plants for energy and will go after them if they are low on energy. They
use energy to move around and to reproduce. If there are predators near by, they try to run
away. If they are capable, they look for a partner and try to reproduce.

## Predators

Predators chase and consume herbivores for energy. When they catch a herbivore, they stun
them and make them paralized for a little while. That helps them feed. They use energy to
move around and to reproduce. If they are capable, they look for a partner and try to reproduce.

[See it in action](https://lab.zvonimirfras.com/alife/)
