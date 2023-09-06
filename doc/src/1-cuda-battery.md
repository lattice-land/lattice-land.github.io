# Introduction

The main objective of the CUDA battery library is to make it easier to develop software fully executing on the GPU.
This is in contrast to applications where the CPU is the "director", and the GPU is only there to execute small kernels performing specific parallel tasks.
We want to have the whole computation on the GPU when possible.
Why you asked?
Because it is more efficient as we avoid round-trips between CPU and GPU; although calling a kernel is very fast, the memory transfers are still costly.
In the research project [lattice-land](https://github.com/lattice-land), we also explore pure GPU computation as a new paradigm where many small functions collaborate in parallel to reach a common goal.

Developing systems in CUDA is a daunting task because the CUDA API is reminiscent of C programming, and it lacks modern C++ idioms and data structures.
For instance, memory allocations and deallocations are managed by malloc/free variants, arrays are pointers and we do not have access to the C++ STL.
Moreover, due to the specificities of the CUDA API, it is usually difficult to program a single function working on both the CPU and the GPU.
Although it is rarely possible to have the exact same algorithm on both CPU and GPU, there are often algorithmic components that are shared.
Having them both on CPU and GPU can help to verify the parallel version produces the same result as the sequential version, and it also allows us to benchmark CPU vs GPU.

The [cuda-battery](https://github.com/lattice-land/cuda-battery) library reimplements basic data structures from the STL in a way such that the same code runs on both CPU and GPU.
One of the only technical differences between CPU and GPU is memory allocation.
To overcome this difference, we provide various allocators that allocate memory in the CPU memory, unified memory, and GPU global and shared memory.
The idea is then to parametrize your classes (through a C++ template) with an allocator type and, depending on whether you run your algorithm on the CPU or GPU, to instantiate it with a suited allocator type.
Among the supported data structures, we have `vector`, `string`, `variant`, `tuple`, `unique_ptr`, `shared_ptr`, a variant of `bitset` and many utility functions.
In addition to the STL, we provide an abstraction of the memory accesses to enable non-atomic (sequential) and atomic (parallel) read and write operations.
The memory abstraction is necessary when writing code working on both GPU and CPU, but also when writing GPU parallel code that can work in global and shared memory, and at the thread, block, grid and multi-grid level.

This library aims to be generic and usable in different kind of projects, but when a design decision needs to be made, it will be influenced by the needs of the project [lattice-land](https://github.com/lattice-land).

Everything is under the namespace `battery::`.
The Doxygen documentation is available [here](cuda-battery/index.html).
Due to lack of time, these are often partial implementation of their STL counterpart, and there are sometimes (documented) differences.

NVIDIA is developing [libcudacxx](https://nvidia.github.io/libcudacxx/), a version of the standard C++ library compatible with GPU, and with extensions specific to CUDA.
_cuda-battery_ can be seen as an extension of _libcudacxx_, and we intend to remove the data structures proposed here as soon as they become available in _libcudacxx_.
Another well-known library is [thrust](https://github.com/NVIDIA/thrust), but it does not share the same goal since it hides the parallel computation inside the data structure, e.g. `reduce` on a `vector` is automatically parallelized on the GPU.

Note that this tutorial does not introduce basic CUDA concepts: it is for (possibly beginners) CUDA programmers who want to simplify their code.
For an introduction to CUDA, you can first refer to [this tutorial](https://ulhpc-tutorials.readthedocs.io/en/latest/gpu/cuda2023/).
Finally, the full code of all examples given here is available in a [demo project](https://github.com/lattice-land/cuda-battery/tree/v1.0.0/demo).
