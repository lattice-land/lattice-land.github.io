# Roadmap 2026

_30 March 2026._ The year 2025 marks the end of the FNR-funded project COMOC.

Over the course of the project, we developed Turbo, a general-purpose, exact, discrete constraint programming solver that runs entirely on GPU architectures.
Turbo supports the discrete subset of MiniZinc and can solve instances from the [MiniZinc Challenge](https://www.minizinc.org/challenge/) benchmark suite.
It is already competitive with sequential CP solvers such as Choco, and on some problems it can even outperform OR-Tools.

The algorithms behind the current version of the solver (v1.2.8) were published at [AAAI 2026](https://ptal.github.io/research#aaai2026).
This paper is the final scientific deliverable of the COMOC project.

The foundations are now in place, and in 2026 we will build a new set of projects on top of them.

This year also marks the start of a new FNR-funded project, NEURESA, in collaboration with  [Cognifyer](https://cognifyer.ai/).
NEURESA stands for _Neuro-Symbolic Reasoning for Embedded System Architectures Design_.
In this project, we investigate how LLMs can support both the modelling stage—specialized here to the design of embedded system architectures—and the solving stage, where they may help improve Turbo’s decisions.

The team is also growing:
* *Clément Poncelet* joins the NEURESA team as a postdoctoral researcher.
* *Yi-Nung Tsao* (PhD candidate) is investigating Turbo for continuous problems and neural network verification (NNV).
* *Hakan Hasan* begins a PhD on distributed constraint solving, and just got his first paper at the [PaPoc workshop 2026](https://ptal.github.io/research.html#papoc2026).
* *Anisa Meta* joins us to explore GPU-based preprocessing algorithms in the context of her Master's thesis.
* *Wei Huang* continues his work on reducing the number of iterations in fixpoint computation, also as part of his Master's thesis.
* A team of motivated first-year students–*Wenbo Han*, *Eduardo Rodrigez* and *Ching-Yao Tang*–is working on reducing the number of memory transactions during fixpoint computation.

We have an exciting research agenda for 2026.
In this post, I discuss some directions we plan to explore.

### Continuous Constraint Problems

In recent years, NVIDIA GPUs have tended to include more floating-point cores (FP32) than integer cores (INT32), largely because of their heavy use in machine learning workloads.
On Hopper H100 architectures, there are [twice as many](https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/).
For Turbo, this opens two research directions:

1. extending Turbo to continuous constraint solving;
2. solving discrete constraint problems using floating-point representations (FP32, or even FP4, FP8, FP16, FP64).

The first direction is not trivial, because floating-point arithmetic introduces many subtle difficulties.
Fortunately, there is already a rich body of work in this area.
The following survey papers and references provide a strong starting point:

* Interval arithmetic: [Hickey et al., Interval Arithmetic: from Principles to Implementation, 2003](https://fab.cba.mit.edu/classes/S62.12/docs/Hickey_interval.pdf) and [Kulisch U., Mathematics and Speed for Interval Arithmetic: A Complement to IEEE 1788](https://dl.acm.org/doi/pdf/10.1145/3264448)
* Inverse interval functions: [Goualard F., Interval Extensions of Multivalued Inverse Functions, 2008](https://hal.science/hal-00288457v1/document)
* Midpoint of an interval: [Goualard F., How do you compute the midpoint of an interval?, 2014](https://hal.science/hal-00576641v2/document)
* Computing an over-approximation (branch-and-prune): [Granvilliers L., Algorithm 852: RealPaver: an interval solver using constraint satisfaction techniques, 2006](https://dl.acm.org/doi/pdf/10.1145/1132973.1132980) and [Chabert et al., Contractor Programming, 2009](https://hal.science/file/index/docid/428957/filename/quimper.pdf)
* Optimization problems (brand-and-bound): [Araya I. et al, Interval Branch-and-Bound algorithms for optimization and constraint satisfaction: a survey and prospects, 2016](https://link.springer.com/article/10.1007/s10898-015-0390-4)
* Computing an under-approximation: [Araya I. et al., Upper Bounding in Inner Regions for Global Optimization under Inequality Constraints, 2014](https://link.springer.com/article/10.1007/s10898-014-0145-7)

The second extension—solving discrete problems with floating-point domains—is not new.
It was introduced in [CLP(BNR)](https://www.sciencedirect.com/science/article/pii/S0743106696001422) as a way to unify the representation of Boolean, natural and real-valued domains.
An integer domain can be represented by carefully rounding the bounds of a real interval.
The same strategy is implemented in IC, the [Hybrid Finite Domain / Real Number Interval Constraint Solver](https://eclipseclp.org/doc/libman/libman016.html) of the ECLiPSe constraint logic programming system.

The key intuition is to observe that a 32-bits floating-point number can _exactly represent_ integer in the range [-2^24, 2^24].

There are then two possible ways to propagate constraints over such domains.
As in CLP(BNR) and ECLiPSe, one can apply standard floating-point propagators and then round the result back to an integer domain.
However, this may produce weaker propagation.
For example, `[1,1] * [0,1]` yields `[0,+oo]` with a continuous propagator, whereas an integer propagator would infer the tighter domain `[0,1]`.

This suggests an interesting research direction: using integer propagators over floating-point domains.
That could lead to a novel contribution.
Additional speedups may also be possible by using lower-precision floating-point formats whenever the domains fit safely within the available representation.

### Towards Efficient Search Strategy

So far, we have compared Turbo against Choco and OR-Tools using a fixed search strategy–the one specified the MiniZinc model.
In practice, however, _adaptive search strategy_ such as *wdom/deg*, *FRBA* or *pick/dom* are often much more effective.

As highlighted in [this paper](https://hal.science/hal-04220560/document), there are three main ingredients behind the success of modern CP solvers:

1. *adaptative search strategy*;
2. *solution-based phase saving*;
3. *restarts*.

The ACE solver has recently shown strong performances in the XCSP3 competition, including against hybrid SAT+CP solvers based on lazy clause generation.

At the moment, it remains unclear how to parallelize the learning component of SAT solvers effectively on GPUs, so this is not a direction we plan to pursue yet.
By contrast, the three components listed above appear much more amenable to efficient GPU implementation.

This extension could become a major milestone for Turbo: it should allow the solver to handle a broader class of problems, and begin competing more seriously in the open category of constraint solving competitions.

### Fixpoint Computation Improvement

Turbo’s current fixpoint loop is deliberately simple.
Each warp iterates over all constraints, synchronizes with the others, and, if anything changed, starts another pass.
This mode is exposed as `-fp ac1`.
A small improvement is available with `-fp wac1`, where each warp computes a local fixpoint over groups of 32 constraints before synchronizing globally.

We are currently exploring two orthogonal optimization directions:

1. *converging faster*, by reducing the number of fixpoint iterations;
2. *reducing memory transactions*, by improving memory access patterns.

The first direction is primarily algorithmic: it aims to *statically schedule* constraints in a way that accelerates convergence to the fixpoint.

The second direction is more hardware-oriented: it aims to improve memory coalescing and reduce memory traffic by reordering variables and constraints appropriately.

From preliminary experiments, we expect each of these optimizations to provide a speedup of at least *2x*.
It is still unclear, however, how strongly they interact, and whether their gains will combine cleanly in practice.

### Bounded Existential and Universal Quantifiers



<!-- ### Array and Bounded Existential and Universal Quantifiers

The decomposition of a constraint network into ternary constraint network can be expensive. -->
