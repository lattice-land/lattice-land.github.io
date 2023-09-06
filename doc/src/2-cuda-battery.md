# Transferring data from the CPU to the GPU

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
However, there is a slight technical issue due to the weird parameters passing semantics of CUDA kernel (`__global__` function): we must pass primitive types or pointers to the functions.
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
