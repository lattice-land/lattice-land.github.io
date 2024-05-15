# Abstract Interpretation Workshop

Hello! During a full week in June, we gather to study together _abstract interpretation_ from its theoretical foundation (order theory) to its latest applications (constraint programming, neural network verification).
Abstract interpretation is a formal theory of software verification invented by Patrick Cousot in the seventies to detect bugs in programs statically ("at compile-time") and directly on the source code (not on a model of the program).
The main contribution of abstract interpretation is to overapproximate the semantics of a program: violations of properties are always discovered, but we sometimes obtain false-positive.
The mathematical framework of abstract interpretation is rich and the papers in the field are complicated for beginners.
During this week, we take our time to understand the main ingredients of abstract interpretation.
<!--
This framework of approximation turns out to be very general and goes beyond program verification.
It was recently applied to constraint reasoning and neural network verification, two topics we will introduce this week. -->

## Schedule

Week of the 17th June 2024.

* Monday:
  * 09:00-10:30 (MNO 1.050): _Introduction to Lattice Theory (part 1)_, Bruno Teheux.
  * 14:00-16:00 (MNO 1.010): Practice session.
* Tuesday:
  * 09:00-10:30 (MNO 1.020): _Introduction to Lattice Theory (part 2)_, Bruno Teheux.
  * 14:00-16:00 (MNO 1.010): Practice session.
* Wednesday (MNO 1.050):
  * 9:00-10:30: _Introduction to Abstract Interpretation_, Pierre Talbot.
  * 11:00-13:00: _Introduction to Constraint Programming_, Manuel Combarro.
* Thursday (MNO 1.040):
  * 9:00-10:30: _Abstract Constraint Programming_, Pierre Talbot.
  * 11:00-12:00: _Octagon Abstract Domain_, Thibault Falque.
* Friday (MNO 1.010):
  * 9:00-10:30: _Introduction to Neural Network Verification by Abstract Interpretation_, Yi-Nung Tsao.
  * 11:00-12:00: _Parallel Lattice Programming_, Pierre Talbot.

## Detailed sessions

### Introduction to Lattice Theory

Partial order ▪ Lattice ▪ Monotone functions ▪ Cartesian product ▪ Complete lattice ▪ Fixpoint ▪ Galois connection

The goal of these two lectures is to have a first grasp of the mathematical theory underlying abstract interpretation.
On the first day, we study partial order and lattices, properties of functions over lattices and several lattice constructions such as products and powerset.
On the second day, we overview more advanced concepts such as fixpoint and Galois connection which are particularly useful in abstract interpretation.

### Introduction to Abstract Interpretation

Syntax ▪ Reachability semantics ▪ Chaotic iterations ▪ Abstract domains ▪ Widening ▪ Reduced products

The goal is to understand how we can use lattice theory to overapproximate the semantics of program and certify the absence of bugs.
We start by reviewing existing verification techniques (e.g., model checking, theorem proving) and discuss the position of abstract interpretation in this landscape.
The talk will rely on the concepts learned in the two first days

### Introduction to Constraint Programming

### Abstract Constraint Programming

This talk presents a new research field!

Combinatorial optimization is a large field of research aiming at finding (best) solutions of logical formulas.
Although this goal is clearly defined, there are different approaches that are better on different problems (including linear programming, SAT, constraint programming, answer set programming).
The theoretical frameworks developed in each community is very different and makes solver cooperation hard to achieve.
Abstract interpretation can provide a unified theory of constraint reasoning by abstracting each solving technique in abstract domains.
It already has been applied to linear solvers, SAT and SMT solvers, although much work remains to be done to obtain efficient solvers.
In this talk, we will present our latest research on the abstract interpretation of constraint programming.

### Octagon Abstract Domain

### Introduction to Neural Network Verification by Abstract Interpretation

### Parallel Lattice Programming

## References

* Davey, Brian A., and Hilary A. Priestley. _Introduction to Lattices and Order_. Cambridge University Press, 2002.
* Cousot, Patrick. _Principles of Abstract Interpretation_. MIT Press, 2021.
