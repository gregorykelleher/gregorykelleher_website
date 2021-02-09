---
title: The merits of Static Paradigms versus Duck Typing
date: 13:08 02/07/2021
highlight:
    theme: monokai
taxonomy:
    category: blog
    tag: [Typing, Programming, Dynamic, Static]
---

Having recently returned to dynamically-typed languages, I've found myself stumbling a little without the safety net of type-checking. Yet, I'm not convinced on the principles of duck-typing either.

![duck_typing.svg](duck_typing.svg)

===

###What is Duck-Typing anyways?

Python is an example of a strongly, dynamically typed language. Type _constraints_ are not checked at compile time, however poorly-defined _operations_ (e.g. conversions) are caught at run-time.

Duck-typing leverages this property of Python; determining the "suitability" of an object by its operations.

Hence the example of the "Duck" object and its associated `quack()` and `fly()` operations. Any object bearing the same operations or properties of a duck, must surely then be a duck,

> "If it walks like a duck and it quacks like a duck, then it must be a duck"

To borrow the example from [Wikipedia](https://en.wikipedia.org/wiki/Duck_typing):

```Python
class Duck:
    def fly(self):
        print("Duck flying")

class Sparrow:
    def fly(self):
        print("Sparrow flying")

class Whale:
    def swim(self):
        print("Whale swimming")

for animal in Duck(), Sparrow(), Whale():
    animal.fly()
```

Since the `Whale` class does not share the same method as the `Duck` class, it fails the [duck test](https://en.wikipedia.org/wiki/Duck_test) and cannot be reasoned to have the necessary characteristics:

```Bash
Duck flying
Sparrow flying
AttributeError: 'Whale' object has no attribute 'fly'
```

!!! As I'd describe it, it's _"validation by observation"_ occurring at run-time, with an emphasis on behaviour. Versus my familiarity of _validation by compilation_ with an emphasis on type constraints

My gripe with duck-tying is that it's a guideline principle. Albeit a simple one, that isn't a guarantee that the programmer will always follow it. It's harder to circumvent a compiler than a code-reviewer.

###LBYL vs EAFP

A naïve programmer like myself unfamiliar with idiomatic Python, is likely to lean on the principles of LBYL, _"Look before you leap"_ to manually catch any run-time errors. This usually results in code that looks like the following:

```Python
if "key" in my_dictionary:
    print(my_dictionary["key"])
```

However, this isn't said to be "pythonic". The preferable way of writing this would be to use EAFP, _"Easier to ask for forgiveness than permission"_ instead:

```Python
try:
    print(my_dictionary["key"])
except KeyError:
    pass
```

Coming from C/C++, exceptions are well, exceptional. C doesn't even have them.

It follows then, that I wouldn't be predisposed to using exception-handling in the above manner. On the contrary, my familiarity would be in minimising potential runtime errors to the fullest extent possible. So the use of try/catch blocks would be a careful consideration in my experience.

Of course, it's never possible to fully ensure complete runtime correctness. But from my background writing embedded software, there was always a stricter emphasis for using pre/post condition assertions (i.e. GSL `Expects()` and `Ensures()`) rather than exceptions.

Moreover, there were never many opportunities to recover from a failed condition at runtime anyways. So it wasn't always possible to use an exception to continue program execution from a catch handler.

To reinterpret the above Python example in C++:

```cpp
auto is_key_found = [](std::string str) -> bool { return (my_dictionary.find(str) == my_dictionary.end() ? false : true); };

gsl::Expects(is_key_found("key"));

std::cout << my_dictionary["key"] << std::endl;
```

Yes, it's probably a bit overkill to terminate if the `gsl::Expects()` fails, but this is just for the sake of example. Using assertions in this manner is semantically better than the common LBYL approach for using `if` statements ([I.6.](https://github.com/isocpp/CppCoreGuidelines/blob/master/CppCoreGuidelines.md#i6-prefer-expects-for-expressing-preconditions)) anyhow.

This coincidentally also satisfies Python's own mantra of _"explicit is better than implicit"_ ([PEP20](https://www.python.org/dev/peps/pep-0020/#id2)). It conveys to the reader that the key is _expected_ to be in the dictionary.

!!! As a note on performance, LBYL means an extra operation will _always_ occur to validate the condition. However, with EAFP an extra operation will only _sometimes_ occur, i.e. on failure of the condition

###Duck Typing vs Static Paradigms

Revisiting the Duck example from earlier:

```Python
def quack_and_fly(duck):
    if hasattr(duck, "quack"):
		if callable(duck.quack):
			duck.quack()
	
    if hasattr(duck, "fly"):
		if callable(duck.fly):
			duck.fly()
```

It should be obvious by now that this is non-pythonic. Rather it should instead look like:

```Python
def quack_and_fly(duck):
	try:
		duck.quack()
		duck.fly()
	except AttributeError as e:
		print(e)
```

The above example got me wondering how this could be best translated into a static context.

The first thing that came to mind was using a function template to implement a generic interface for `quack_and_fly()`. This would be an example of compile-time polymorphism.

So for example, defining two classes that both pass the duck test:

```cpp
struct Duck
{
    auto quack() -> void { std::cout << "duck quacking" << std::endl; };
    auto fly() -> void { std::cout << "duck flying" << std::endl; };
};

struct Goose
{
    auto quack() -> void { std::cout << "goose quacking" << std::endl; };
    auto fly() -> void { std::cout << "goose flying" << std::endl; };
};
```

Then we can define the function template that can take an object of either type:

```cpp
template<typename Bird>
auto quack_and_fly(Bird bird) -> void {
  bird.quack();
  bird.fly();
}
```

We can actually go one further and define a variadic template to take in an arbitary number of arguments:

```cpp
template<typename Bird, typename... Args>
auto quack_and_fly(Bird bird, Args&& ...args) -> void {
  bird.quack();
  bird.fly();
  quack_and_fly(std::forward<Args>(args)...);
}
```

And so then in `main()` you could use the interface like so:

```cpp
int main()
{
    quack_and_fly(Duck(), Goose());
}
```

Which naturally results with:

```bash
duck quacking
duck flying
goose quacking
goose flying
```

It's worth mentioning that we could also introduce a new C++20 feature, called a `concept` to our template. A `concept` is a compile-time predicate for our template arguments.

It's ideal for this scenario, if we consider `quack_and_fly()` to be our interface ([I.9](https://github.com/isocpp/CppCoreGuidelines/blob/master/CppCoreGuidelines.md#i9-if-an-interface-is-a-template-document-its-parameters-using-concepts)). Using a `concept` we can also express and evaluate our interface's requirements at compile-time.

Somewhat homologous to how a try/catch block is used for dynamic evaluation of requirements at runtime in the earlier Python duck-typing example.

Of course, for this example we'd like to place constraints on our interface, namely only allowing argument types that provide `quack()` and `fly()` member functions.

So if say we had a hypothetical `Penguin` type that didn't implement a `fly()` function, the compiler will enforce the `concept` using the `static_assert()` and return an error:

```cpp
struct Penguin
{
    auto quack() -> void { std::cout << "penguin quacking" << std::endl; };
    // missing fly() function
};

template<typename Bird>
concept isBirdLike = requires (Bird bird) {
    { bird.quack(), bird.fly() } -> std::convertible_to<void>;
};

template<isBirdLike Bird, typename... Args>
auto quack_and_fly(Bird bird, Args&& ...args) -> void {
  bird.quack();
  bird.fly();
  quack_and_fly(std::forward<Args>(args)...);
}

static_assert(isBirdLike<Penguin>);
```

Yes, unfortunately `Penguin` is not deemed to be a bird for this example:

```bash
error: static assertion failed
    static_assert(isBirdLike<Penguin>);

constraints not satisfied
in requirements with 'Bird bird' [with Bird = Penguin]
    note: the required expression 'bird.fly()' is invalid

...
```

Finally, for the last example you can keep things a little simpler by just using an [abbreviated function template](https://en.cppreference.com/w/cpp/language/function_template#Abbreviated_function_template) with `auto` as the placeholder type.

With C++20 we can avoid any explicit template boilerplating, by instead leveraging `auto` as a _"non-constraining type-constraint"_ like this:

```cpp
template<typename Bird>
concept isBirdLike = requires (Bird bird) {
    { bird.quack(), bird.fly() } -> std::convertible_to<void>;
};

auto quack_and_fly(isBirdLike auto bird) -> void {
  bird.quack();
  bird.fly();
}

auto quack_and_fly(isBirdLike auto bird, isBirdLike auto&& ...args) -> void {
  bird.quack();
  bird.fly();
  quack_and_fly(std::forward<decltype(args)>(args)...);
}
```

I feel the above example demonstrates that you can have your cake and eat it too. It achieves the same goals as dynamic duck-typing, with negligible verbosity and all the benefits of `concept` constraints and type-safety.

> The compiler is a seatbelt, not a straightjacket

I'd rather it did the heavy lifting of resolving bindings at compile time. Rather than burden myself with the cognitive load of manually validating object runtime behaviour.

That all said, from my own subjective standpoint, I feel neither the static abbreviated function template technique, nor the dynamic duck-typing approach is intrinsically self-documenting though. Rather it feels as though I'm intentionally concealing the types for the sake of brevity.

Yes, in an idealised world with rigorous code reviews, disciplined test-driven development and meticulous pipeline automation, maybe that wouldn't be such a problem. 

Despite its flexibility and convenience though, I can't feel convinced that duck-typing is advantageous where scalability and maintainability is a priority. Yet I also feel I've demonstrated readily enough how C++ can accomplish much the same using compile-time polymorphism with the express advantage that type-checking affords.