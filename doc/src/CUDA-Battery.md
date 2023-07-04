# CUDA-Battery Library

## Quick Reference

* Namespace: `battery::*`.
* The documentation is not exhaustive (which is why we provide a link to the standard C++ STL documentation), but we document most of the main differences and the features without a standard counterpart.
* The table below is a quick reference to the most useful features, but it is not exhaustive.
* _The structures provided here are not thread-safe, this responsibility is delegated to the user of this library._

| Category | Main features | | | |
| --- | --- | --- | --- | --- |
| [Allocator](cuda-battery/allocator_8hpp.html)  | [`standard_allocator`](cuda-battery/classbattery_1_1standard__allocator.html) | [`global_allocator`](cuda-battery/classbattery_1_1global__allocator.html) | [`managed_allocator`](cuda-battery/classbattery_1_1managed__allocator.html) | [`pool_allocator`](cuda-battery/classbattery_1_1pool__allocator.html) |
| Pointers | [`shared_ptr`](cuda-battery/classbattery_1_1shared__ptr.html) ([`std`](https://en.cppreference.com/w/cpp/memory/shared_ptr)) | [`make_shared`](cuda-battery/namespacebattery.html#a51fbd102c2aef01adc744cee4bc35ea9) ([`std`](https://en.cppreference.com/w/cpp/memory/shared_ptr/make_shared)) | [`allocate_shared`](cuda-battery/namespacebattery.html#aee9241d882f78f0130435b46389ff9ac) ([`std`](https://en.cppreference.com/w/cpp/memory/shared_ptr/allocate_shared)) | |
| | [`unique_ptr`](cuda-battery/classbattery_1_1unique__ptr.html) ([`std`](https://en.cppreference.com/w/cpp/memory/unique_ptr)) | [`make_unique`](cuda-battery/namespacebattery.html#aa354aeb0995d495b2b9858a6ea2fb568) ([`std`](https://en.cppreference.com/w/cpp/memory/unique_ptr/make_unique)) | [`make_unique_block`](cuda-battery/namespacebattery.html#aa781d8577b63b6e7b789223e825f52c3) | [`make_unique_grid`](cuda-battery/namespacebattery.html#a5ba4adb6d7953ca7e8c6602b7e455b14) |
| Containers | [`vector`](cuda-battery/vector_8hpp.html) ([`std`](https://en.cppreference.com/w/cpp/container/vector)) | [`string`](cuda-battery/string_8hpp.html) ([`std`](https://en.cppreference.com/w/cpp/string/basic_string)) | | |
| | [`tuple`](https://en.cppreference.com/w/cpp/utility/tuple) | [`variant`](cuda-battery/variant_8hpp.html) ([`std`](https://en.cppreference.com/w/cpp/utility/variant)) | [`bitset`](cuda-battery/bitset_8hpp.html) ([`std`](https://en.cppreference.com/w/cpp/utility/bitset)) | |
| Utility | [`CUDA`](cuda-battery/utility_8hpp.html#a7b01e29f669d6beed251f1b2a547ca93) | [`INLINE`](cuda-battery/utility_8hpp.html#a2eb6f9e0395b47b8d5e3eeae4fe0c116) | [`CUDAE`](cuda-battery/utility_8hpp.html#a289596c1db721f82251de6902f9699db) | [`CUDAEX`](cuda-battery/utility_8hpp.html#af35c92d967acfadd086658422f631100) |
| | [`limits`](cuda-battery/structbattery_1_1limits.html) | [`ru_cast`](cuda-battery/namespacebattery.html#a7fdea425c76eab201a009ea09b8cbac0) | [`rd_cast`](cuda-battery/namespacebattery.html#aa2296c962277e71780bccf1ba9708f59) | |
| | [`popcount`](cuda-battery/namespacebattery.html#a2821ae67e8ea81b375f3fd6d70909fef) ([`std`](https://en.cppreference.com/w/cpp/numeric/popcount)) | [`countl_zero`](cuda-battery/namespacebattery.html#aa18a34122dc3e8b7e96c4a54eeffa9aa) ([`std`](https://en.cppreference.com/w/cpp/numeric/countl_zero)) | [`countl_one`](cuda-battery/namespacebattery.html#ae252a50e577d7b092eb368b7e0289772) ([`std`](https://en.cppreference.com/w/cpp/numeric/countl_one)) | [`countr_zero`](cuda-battery/namespacebattery.html#a7338f90fab224e49c3716c5eace58bee) ([`std`](https://en.cppreference.com/w/cpp/numeric/countr_zero)) |
| | [`countr_one`](cuda-battery/namespacebattery.html#a974d0a682d546e1185ae7dca29c272d6) ([`std`](https://en.cppreference.com/w/cpp/numeric/countr_one)) | [`signum`](cuda-battery/namespacebattery.html#a31b3f5ee3799a73d29c153ebd222cdea) | [`ipow`](cuda-battery/namespacebattery.html#a93472d80842253624e2436eef7b900b6) | |
| | [`add_up`](cuda-battery/namespacebattery.html#af3a4582a08267940dbdb5b39044aa4c6) | [`add_down`](cuda-battery/namespacebattery.html#a43d013f1db8f8b8c085c544859e24a7f) | [`sub_up`](cuda-battery/namespacebattery.html#a6d6340503a20225d569990c0044519bb) | [`sub_down`](cuda-battery/namespacebattery.html#a32ff1fe9f8d2eac8fd7a2d08b0110461) |
| | [`mul_up`](cuda-battery/namespacebattery.html#ae3edf2725aaea683aff7a100733b26f2) | [`mul_down`](cuda-battery/namespacebattery.html#a6dd3e5546b5286d98cb29c7560542759) | [`div_up`](cuda-battery/namespacebattery.html#a3ce4b4df0f80c5b19c7d3b401464f309) | [`div_down`](cuda-battery/namespacebattery.html#ac253a56f7fa54ade8f2eb762d3b317f9) |
| [Memory](cuda-battery/memory_8hpp.html)  | [`local_memory`](cuda-battery/namespacebattery.html#a09111ca968cc4d8defa60555963dd052) | [`read_only_memory`](cuda-battery/namespacebattery.html#a22ff3da8ce553868de9c2b8fe604fe3c) | [`atomic_memory`](cuda-battery/classbattery_1_1atomic__memory.html) | |
| | [`atomic_scoped_memory`](cuda-battery/classbattery_1_1atomic__memory__scoped.html) | [`atomic_memory_block`](cuda-battery/namespacebattery.html#afb485d8f961537d1ca590f78d16ac1c4) | [`atomic_memory_grid`](cuda-battery/namespacebattery.html#a2af42ce969d94b6b8bb1ed9a94b9cf49) | |

## Highlights

* [How to transfer data from the CPU to the GPU?](#transferring-data-from-the-cpu-to-the-gpu)
* [How to create a CMake project for CUDA project?](#cmake-cuda-project)
* [How to allocate a vector shared by all threads of a block inside a kernel?](#block-local-memory)
* [How to allocate a vector shared by all blocks inside a kernel?](#grid-local-memory)
* [CUDA runtime error an illegal memory access was encountered](#avoiding-obscure-cuda-runtime-errors)
* [How to allocate a vector in shared memory?](#shared-memory-allocator)

## Introduction

The main objective of this library is to make it easier to develop software fully executing on the GPU.
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

## Transferring data from the CPU to the GPU

([code of this section](https://github.com/lattice-land/cuda-battery/tree/v1.0.0/demo/src/demo.cpp))

One of the first tasks a CUDA programmer is facing is to transfer data from the CPU to the GPU.
Using this library, it is very straightforward, and it is always the same scheme.
To illustrate the concepts of this library, we implement a `map(v, f)` function which applies a function `f` to all elements of the sequence `v` in-place.

We firstly need to transfer the data `v` to the GPU using managed memory, and it is as simple as that:

```c++
int main() {
  std::vector<int> v(1000, 50);
  battery::vector<int, battery::managed_allocator> gpu_v(v);
  return 0;
}
```

Now we must pass `gpu_v` to a CUDA kernel.
However, there is a slight technical issue due to the weird parameters passing semantics of CUDA kernel (function with `__global__`): we must pass primitive types or pointers to the functions.
Indeed, trying to pass an object by reference or copy [is undefined behavior](https://docs.nvidia.com/cuda/cuda-c-programming-guide/#function-parameters).
This is only a restriction on `__global__` functions, and once inside the kernel, passing by reference or copy works well (when calling `__device__` functions).
You could simply pass the data as `kernel<<<1,1>>>(gpu_v.data(), gpu_v.size())`, but you lose all the advantages of vector when programming in the kernel.
The solution is to wrap `gpu_v` inside a pointer, which we can still do the C++ way using `unique_ptr`:

```c++
using mvector = battery::vector<int, battery::managed_allocator>;

__global__ void map_kernel(mvector* v_ptr) {
  mvector& v = *v_ptr;
  // ... Compute on `v` in parallel.
}

void map(std::vector<int>& v) {
  auto gpu_v = battery::make_unique<mvector, battery::managed_allocator>(v);
  map_kernel<<<256, 256>>>(gpu_v.get());
  // Transfering the new data to the initial vector.
  for(int i = 0; i < v.size(); ++i) {
    v[i] = (*gpu_v)[i];
  }
}
```

Due to the [C++ RAII idiom](https://en.cppreference.com/w/cpp/language/raii), the managed memory of both the GPU `unique_ptr` and `mvector` is automatically freed when leaving the scope of the function.
Importantly, the memory allocated on the CPU must be freed by the CPU, even if it is accessible by the GPU, and vice-versa.
But you should not encounter this issue if you use this idiom to pass data from the CPU to the GPU.

## CMake CUDA Project

([code of this section](https://github.com/lattice-land/cuda-battery/tree/v1.0.0/demo/CMakeLists.txt))

In order to compile and test the code presented above, you will need to add the headers of this library to `nvcc`.

```bash
nvcc -I cuda-battery/include demo.cu
```

We prefer to delegate the management of dependencies to [CMake](https://cmake.org/), a build automation tool.
However, creating a CMake project for hybrid CPU/GPU code is not an easy task, and we provide a demonstration CMake project in [cuda-battery/demo](https://github.com/lattice-land/cuda-battery/tree/v1.0.0/demo).
You can start your own project by copying this folder and modifying the name of the project inside the file `CMakeLists.txt`.
To compile and run this demo project, you can write:

```
cd cuda-battery/demo
mkdir -p build/gpu-debug
cmake -DCMAKE_BUILD_TYPE=Debug -Bbuild/gpu-debug
cmake --build build/gpu-debug
./build/gpu-debug/demo
```

It compiles the demo project in debug mode using the GPU compiler (`nvcc`), along with the unit tests (using the Google testing framework GTest).
You can also compile it in release mode by simply changing `debug` to `release` in the previous commands.
To run the tests, the command `ctest` can be used as follows:

```
ctest --test-dir build/gpu-debug/
```

Among the characteristics of this project:

* Files have the `.cpp` extension instead of the `.cu` extension.
* It compiles code for the native GPU architecture by default (so for the GPU of the computer you are compiling your code on).
This can easily be changed if you are cross-compiling by defining the flag `CMAKE_CUDA_ARCHITECTURES` at the configuration stage:
```
cmake -DCMAKE_CUDA_ARCHITECTURES=70 -DCMAKE_BUILD_TYPE=Release -Bbuild/gpu-release
```
* Several useful options inherited from cuda-battery (enabling C++20 and constexpr extension).
* A testing framework where you can write your CPU tests using Google Test framework (see `demo/tests/demo_test.cpp`) and your hand-made GPU tests (see `demo/tests/demo_test_gpu.cpp`).
* Moreover, when testing GPU code, we verify there is no memory leaks or some data races (using `compute-sanitizer`).

We have documented the [CMakeLists.txt](https://github.com/lattice-land/cuda-battery/tree/v1.0.0/demo/CMakeLists.txt) so you can adjust it to your own project.

## In-Kernel Memory Allocation

([code of this section](https://github.com/lattice-land/cuda-battery/tree/v1.0.0/demo/src/inkernel_allocation.cpp))

The typical way to allocate data structures shared by all threads or blocks in a CUDA kernel is to get all the memory allocations done before the kernel starts.
However, when developing a larger CUDA kernel, it is frequent to rely on intermediate structures that are only temporary and are deleted before the end of the kernel.
It might be difficult, or at best inconvenient, to allocate everything before the start of the kernel.
Moreover, to follow good software engineering practice, these temporary structures should be hidden from the user of the kernel.

### Thread-local Memory

Thread-local memory is a chunk of memory that is only accessed by a single thread.
This is the default allocation mode when declaring a variable in CUDA kernel, hence it does not need any support from this library.

### Block-local Memory

Block-local memory is a chunk of memory that is only accessed by the threads of a single block.
To avoid any ambiguity: "block-local memory" is conceptual and might reside in global memory; it is not necessarily in shared memory.

A simple use-case is when blocks need to work on different copies of an original array.
Suppose `*v_ptr` is an array shared by all blocks.
In the following kernel, we show how to use `battery::make_unique_block` to copy `*v_ptr` into a block-local vector `v_block`.

```c++
using gvector = battery::vector<int, battery::global_allocator>;
__global__ void block_vector_copy(mvector* v_ptr) {
  battery::unique_ptr<gvector, battery::global_allocator> v_block_ptr;
  gvector& v_block = battery::make_unique_block(v_block_ptr, *v_ptr);
  // Now each block has its own local copy of the vector `*v_ptr`.
  // ...
  // We must synchronize the threads at the end, in case the thread holding the pointer in `unique_ptr` terminates before the other.
  cooperative_groups::this_thread_block().sync(); // Alternatively, `__syncthreads();`
}
```

Without this facility, we would need to initialize `n` copies of the vector in the host code and pass them as parameters to the kernel.
Finally, the function `make_unique_block` synchronizes all threads of the current block before returning, therefore `v_block` is directly usable by all threads.
Before you use this technique, keep reading because you might need to increase the size of the heap and stack.

### Avoiding Obscure CUDA Runtime Errors

Developing an entire system within a single kernel can easily lead to CUDA runtime error due to overflow of the allowed heap and stack memory.
The heap memory is by-default limited to 8 MB for allocations taking place in the kernel.
If you allocate more than 8 MB, which is not very difficult, you will run into an error of the style "CUDA runtime error an illegal memory access was encountered".
In that case, you must increase the size of the heap, and this can be done as follows:

```c++
// Multiply by 10 the default value, so now we have 80MB.
void increase_heap_size() {
  size_t max_heap_size;
  cudaDeviceGetLimit(&max_heap_size, cudaLimitMallocHeapSize);
  CUDAE(cudaDeviceSetLimit(cudaLimitMallocHeapSize, max_heap_size*10));
  cudaDeviceGetLimit(&max_heap_size, cudaLimitMallocHeapSize);
  printf("%%GPU_max_heap_size=%zu (%zuMB)\n", max_heap_size, max_heap_size/1000/1000);
}

int main() {
  increase_heap_size();
  auto vptr = battery::make_unique<mvector, battery::managed_allocator>(100000, 42);
  auto ptr = vptr.get();

  block_vector_copy<<<256, 256>>>(ptr);
  CUDAEX(cudaDeviceSynchronize());
}
```

For the stack, which is allocated per-thread, the problem can quickly arrive if you have many function calls and local variables.
In that case you can increase the size of the stack as follows:

```c++
void increase_stack_size() {
  size_t max_stack_size = 1024;
  CUDAE(cudaDeviceSetLimit(cudaLimitStackSize, max_stack_size*10));
  cudaDeviceGetLimit(&max_stack_size, cudaLimitStackSize);
  printf("%%GPU_max_stack_size=%zu (%zuKB)\n", max_stack_size, max_stack_size/1000);
}
```

For information, the stack frames are stored in global memory, but the compiler will try its best to place them in the registers and caches when possible.

### Grid-local Memory

Similarly to the previous section, we sometimes wish to initialize, inside the kernel, data that is shared by all blocks.
Once again, we suppose to have an original array `*v_ptr` that we wish to copy, but per-grid and not per-block.

```c++
__global__ void grid_vector_copy(mvector* v_ptr) {
  battery::unique_ptr<gvector, battery::global_allocator> v_copy_ptr;
  gvector& v_copy = battery::make_unique_grid(v_copy_ptr, *v_ptr);
  // `v_copy` is now accessible by all blocks.
  // ...
  // Same as with block-local memory, we want to guard against destructing the pointer too early.
  cooperative_groups::this_grid().sync();
}
```

To synchronize among threads, both `make_unique_block` and `make_unique_grid` rely on [cooperative groups](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#cooperative-groups).
In the case of `make_unique_grid`, CUDA requires the kernel to be launched with a [different syntax](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#grid-synchronization):

```c++
int main() {
  increase_heap_size();
  auto vptr = battery::make_unique<mvector, battery::managed_allocator>(100000, 42);
  auto ptr = vptr.get();
  void *kernelArgs[] = { &ptr }; // be careful, we need to take the address of the parameter we wish to pass.
  dim3 dimBlock(256, 1, 1);
  dim3 dimGrid(256, 1, 1);
  cudaLaunchCooperativeKernel((void*)grid_vector_copy, dimGrid, dimBlock, kernelArgs);
  CUDAE(cudaDeviceSynchronize());
  return 0;
}
```

I am not sure why the syntax is different, but since it is a fairly recent feature, it might be improved in future releases.

### Multi-grid Memory

For now, we do not support multi-grid memory allocation.

## Shared Memory Allocator

([code of this section](https://github.com/lattice-land/cuda-battery/tree/v1.0.0/demo/src/demo.cpp))

We show how to use shared memory using a memory pool allocator.

```c++
using pvector = battery::vector<int, battery::pool_allocator>;

__global__ void map_kernel_shared(mvector* v_ptr, size_t shared_mem_capacity) {
  // I. Create a pool of shared memory.
  extern __shared__ unsigned char shared_mem[];
  battery::unique_ptr<battery::pool_allocator, battery::global_allocator> pool_ptr;
  // /!\ We must take a reference to the pool_allocator to avoid copying it, because its copy-constructor is not thread-safe! (It can only be used by one thread at a time).
  battery::pool_allocator& shared_mem_pool = battery::make_unique_block(pool_ptr, static_cast<unsigned char*>(shared_mem), shared_mem_capacity);

  // II. Transfer from global memory to shared memory.
  battery::unique_ptr<pvector, battery::global_allocator> shared_vector;
  size_t chunk_size = chunk_size_per_block(*v_ptr, gridDim.x);
  auto span = make_safe_span(*v_ptr, chunk_size * blockIdx.x, chunk_size);
  pvector& v = battery::make_unique_block(shared_vector, span.data(), span.size(), shared_mem_pool);

  // III. Run the algorithm on the shared memory.
  block_par_map(v, [](int x){ return x * 2; }, blockDim.x, threadIdx.x);
  __syncthreads();

  // IV. Transfer back from shared memory to global memory.
  for(int i = threadIdx.x; i < v.size(); i += blockDim.x) {
    (*v_ptr)[chunk_size * blockIdx.x + i] = v[i];
  }
}
```

We initialize one pool allocator per-block using the same technique as shown before.
However, we must be careful to take the `pool_allocator` by reference because its copy-constructor is not thread-safe; similarly to `shared_ptr` it maintains a shared counter to its memory pool.
Since memory allocation is done by only one thread anyway, it does not make sense to have multiple copies of this allocator.

The next step is to transfer the vector to the shared memory.
Each block works on a chunk of the initial array.
Therefore, we do not want to move the whole array in shared memory, but only the part of interest for that block.
To achieve that, we compute the size of the chunk using `chunk_size_per_block` and create a view of the vector covering only that chunks.
We use [std::span](https://en.cppreference.com/w/cpp/container/span) to model the view.
Note that we can use the STL `std::span` because all its methods are `constexpr`, and we have the NVCC flag `--expt-relaxed-constexpr` inherited from cuda-battery.
We then copy this span into the vector `v` which is in shared memory.

The algorithm `block_par_map` is then called on `v` for each block.
The last step is to transfer the memory from the shared memory to the global memory.
After each block finished computing, the `map` function has been applied to each element of the initial vector.

## A Word of Caution on Shared-state Parallelism

Developing a parallel algorithm is relatively easy as long as threads read and write independent memory chunks.
Such an algorithm is referred as [embarrassingly parallel](https://en.wikipedia.org/wiki/Embarrassingly_parallel).
As a rule of thumb, it is best if you can stay within this paradigm.
For instance using map-reduce operations, where all threads work on separate memory cells during the map operation, and then a single thread performs a reduction of all temporary results obtained.
Sometimes this is not possible, or you want to get to the next level to get better performance.
Beware, designing _correct and efficient_ parallel algorithms with threads communicating in a shared memory system is a whole new world.
We cannot even scratch the surface here, and this library does not provide much support for it.
Nevertheless, it is possible to write such algorithms in CUDA using [atomics and synchronization primitives](https://nvidia.github.io/libcudacxx/extended_api/synchronization_primitives.html).
To use them well, I would advise to take a class (or [read a book](https://arxiv.org/abs/1701.00854)) on parallel programming and memory consistency models.
