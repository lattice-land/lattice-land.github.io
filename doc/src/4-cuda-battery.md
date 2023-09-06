# In-Kernel Memory Allocation

([code of this section](https://github.com/lattice-land/cuda-battery/tree/v1.0.0/demo/src/inkernel_allocation.cpp))

The typical way to allocate data structures shared by all threads or blocks in a CUDA kernel is to get all the memory allocations done before the kernel starts.
However, when developing a larger CUDA kernel, it is frequent to rely on intermediate structures that are only temporary and are deleted before the end of the kernel.
It might be difficult, or at best inconvenient, to allocate everything before the start of the kernel.
Moreover, to follow good software engineering practice, these temporary structures should be hidden from the user of the kernel.

## Thread-local Memory

Thread-local memory is a chunk of memory that is only accessed by a single thread.
This is the default allocation mode when declaring a variable in CUDA kernel, hence it does not need any support from this library.

## Block-local Memory

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

## Avoiding Obscure CUDA Runtime Errors

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

## Grid-local Memory

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

## Multi-grid Memory

For now, we do not support multi-grid memory allocation.
