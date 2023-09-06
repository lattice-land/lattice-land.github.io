# Shared Memory Allocator

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
