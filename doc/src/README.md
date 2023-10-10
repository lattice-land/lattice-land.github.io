# Lattice Land

Hello! You just arrived in lattice land!
Lattice land is a collection of C++ libraries compatible with NVIDIA CUDA framework.
Most of the libraries implement _abstract domains for constraint reasoning_ a new kind of data structure based on [abstract interpretation](https://en.wikipedia.org/wiki/Abstract_interpretation), [lattice theory](https://en.wikipedia.org/wiki/Lattice_(order)) and [constraint reasoning](https://en.wikipedia.org/wiki/Constraint_satisfaction).
This is a book presenting our research project, the involved research papers and the code documentation.

This project is available on [github](https://github.com/lattice-land).

## API Documentation

* [cuda-battery](https://lattice-land.github.io/cuda-battery): Memory allocators, vector, utilities and more which run on both CPU and GPU (CUDA).
See also the chapter [CUDA-Battery Library](1-cuda-battery.md).
* [lala-core](https://lattice-land.github.io/lala-core): Core definitions of the formula AST and abstract domain.
* [lala-parsing](https://lattice-land.github.io/lala-parsing): Utilities to parse combinatorial formats include flatzinc and XCSP3.
* [lala-pc](https://lattice-land.github.io/lala-pc): _Propagator completion abstract domain_ representing a collection of refinement functions. It implements propagators, an essential component of constraint solver.
* [lala-power](https://lattice-land.github.io/lala-power): Abstract domains representing disjunctive collections of information. It includes the search tree and branch-and-bound.
* [turbo](https://lattice-land.github.io/turbo): Abstract constraint solver building on all other libraries.
* [lattice-land.github.io](https://github.com/lattice-land/lattice-land.github.io): The repository hosting this book and the libraries documentation.
